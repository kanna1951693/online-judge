import os
import shutil
import time
import logging
import uuid
import docker
from docker.errors import ContainerError, ImageNotFound
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class SandboxExecutor:
    def __init__(self, problem_id: str, language: str, source_code: str, time_limit: float, memory_limit_mb: int):
        self.problem_id = problem_id
        self.language = language.lower().strip()
        self.source_code = source_code
        self.time_limit = time_limit
        self.memory_limit_mb = memory_limit_mb
        
        # Unique ID for this sandboxed run
        self.run_id = str(uuid.uuid4())
        self.host_dir = f"/Users/kunalb/online-judge/backend/temp/submissions/{self.run_id}"
        os.makedirs(self.host_dir, exist_ok=True)
        
        # Initialize Docker client
        try:
            self.docker_client = docker.from_env()
        except Exception as e:
            logger.error(f"Failed to connect to Docker daemon: {e}")
            self.docker_client = None

        # Write code to file
        self.code_filename = "solution.py" if self.language == "python" else "solution.cpp"
        self.code_path = os.path.join(self.host_dir, self.code_filename)
        with open(self.code_path, "w") as f:
            f.write(self.source_code)

        self.compiled = False
        self.compile_error_msg = None

    def compile(self) -> bool:
        """
        Compiles C++ source code inside a Docker container.
        """
        if self.language != "cpp":
            self.compiled = True
            return True

        if not self.docker_client:
            self.compile_error_msg = "Docker client not initialized"
            return False

        # Image for compilation
        compiler_image = "frolvlad/alpine-gxx"
        try:
            # Check if image exists, pull if not
            try:
                self.docker_client.images.get(compiler_image)
            except ImageNotFound:
                logger.info(f"Pulling compiler image: {compiler_image}")
                self.docker_client.images.pull(compiler_image)

            # Run compilation container
            # Mounting host_dir to /app inside container
            container = self.docker_client.containers.run(
                image=compiler_image,
                command=f"g++ -O3 -static /app/solution.cpp -o /app/solution",
                volumes={self.host_dir: {"bind": "/app", "mode": "rw"}},
                network_mode="none",
                detach=True
            )

            # Wait for compilation to finish (with a timeout of 10s for compiler)
            start_time = time.time()
            while time.time() - start_time < 10.0:
                container.reload()
                if container.status == "exited":
                    break
                time.sleep(0.1)
            else:
                try:
                    container.kill()
                except Exception:
                    pass
                self.compile_error_msg = "Compilation timed out (max 10s)"
                return False

            state = container.attrs.get("State", {})
            exit_code = state.get("ExitCode", 0)
            
            # Retrieve stderr logs
            stderr_output = container.logs(stdout=False, stderr=True).decode("utf-8")
            container.remove()

            if exit_code != 0:
                self.compile_error_msg = stderr_output
                self.compiled = False
                return False

            self.compiled = True
            return True

        except Exception as e:
            self.compile_error_msg = f"Internal sandbox compiler error: {str(e)}"
            logger.error(self.compile_error_msg)
            return False

    def run_test_case(self, input_data: str, expected_output: str) -> Dict[str, Any]:
        """
        Runs the compiled binary or Python script inside a resource-constrained container.
        """
        result = {
            "verdict": "RE",
            "time_ms": 0,
            "memory_kb": 0,
            "stdout": "",
            "error_message": None
        }

        if not self.docker_client:
            result["error_message"] = "Docker client not available"
            return result

        if self.language == "cpp" and not self.compiled:
            result["verdict"] = "CE"
            result["error_message"] = self.compile_error_msg or "Not compiled"
            return result

        # Setup input file
        input_file_path = os.path.join(self.host_dir, "input.txt")
        with open(input_file_path, "w") as f:
            f.write(input_data)

        # Decide image and command based on language
        if self.language == "python":
            image_name = "python:3.10-alpine"
            run_cmd = "sh -c 'python3 /app/solution.py < /app/input.txt'"
        elif self.language == "cpp":
            image_name = "alpine:3.18"
            run_cmd = "sh -c '/app/solution < /app/input.txt'"
        else:
            result["error_message"] = f"Unsupported language: {self.language}"
            return result

        # Pull execution image if not cached
        try:
            try:
                self.docker_client.images.get(image_name)
            except ImageNotFound:
                logger.info(f"Pulling execution image: {image_name}")
                self.docker_client.images.pull(image_name)
        except Exception as e:
            result["error_message"] = f"Failed to pull runner image: {str(e)}"
            return result

        container = None
        try:
            # Mount directory read-only
            # Apply resource limits:
            # Memory: memory_limit_mb -> e.g. 256m
            # CPUs: cpus=0.5 -> nano_cpus = 500,000,000
            # PID limit: pids-limit = 64
            # Network: none
            # Read-only rootfs: True (only /app is mounted and it's ro, /tmp can be tmpfs if needed)
            container = self.docker_client.containers.run(
                image=image_name,
                command=run_cmd,
                volumes={self.host_dir: {"bind": "/app", "mode": "ro"}},
                network_mode="none",
                mem_limit=f"{self.memory_limit_mb}m",
                nano_cpus=500000000,  # 0.5 CPU
                pids_limit=64,
                read_only=True,
                detach=True
            )

            # Asynchronous external watchdog execution (TLE monitor)
            start_time = time.time()
            timeout = self.time_limit
            elapsed = 0.0
            verdict = None

            while elapsed < timeout:
                container.reload()
                if container.status == "exited":
                    break
                time.sleep(0.02)
                elapsed = time.time() - start_time
            else:
                # Watchdog fires! Timeout exceeded
                try:
                    container.kill()
                except Exception:
                    pass
                verdict = "TLE"

            # Re-read final stats
            container.reload()
            state = container.attrs.get("State", {})
            exit_code = state.get("ExitCode", 0)
            oom_killed = state.get("OOMKilled", False)
            
            # Time calculation
            duration_ms = int(elapsed * 1000)

            # Memory calculation
            # Try to fetch max memory usage from container stats if possible, or fallback
            memory_kb = 0
            try:
                # Docker keeps track of max memory in docker stats, or we can use container.stats(stream=False)
                # But since the container is exited, stats stream may fail or be empty.
                # If OOM killed, memory_kb should be around self.memory_limit_mb * 1024
                if oom_killed:
                    memory_kb = self.memory_limit_mb * 1024
            except Exception:
                pass

            # Gather logs
            stdout_output = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace")
            stderr_output = container.logs(stdout=False, stderr=True).decode("utf-8", errors="replace")

            # Clean up container
            container.remove()

            # Verdict determination
            if verdict == "TLE":
                result["verdict"] = "TLE"
                result["time_ms"] = int(timeout * 1000)
            elif oom_killed or exit_code == 137: # Docker kills with 137 on OOM or manual kill
                # If it was manual kill from our watchdog, verdict is already set to "TLE".
                # If it wasn't watchdog and exited with 137/OOM, it is MLE.
                if result.get("verdict") == "TLE":
                    pass
                elif oom_killed:
                    result["verdict"] = "MLE"
                    result["memory_kb"] = self.memory_limit_mb * 1024
                else:
                    # Let's double check if it was memory related. In case of exit_code == 137 without OOMKilled flag set (sometimes happens), we check memory limits
                    result["verdict"] = "MLE"
                    result["memory_kb"] = self.memory_limit_mb * 1024
            elif exit_code != 0:
                result["verdict"] = "RE"
                result["error_message"] = stderr_output or f"Exit code: {exit_code}"
            else:
                # Normalize newlines and whitespace for exact output diffing
                norm_out = "\n".join(line.rstrip() for line in stdout_output.strip().splitlines())
                norm_exp = "\n".join(line.rstrip() for line in expected_output.strip().splitlines())
                
                if norm_out == norm_exp:
                    result["verdict"] = "AC"
                else:
                    result["verdict"] = "WA"
                    result["stdout"] = stdout_output
                    result["expected_output"] = expected_output

            result["time_ms"] = duration_ms

        except Exception as e:
            result["verdict"] = "RE"
            result["error_message"] = f"Runtime sandbox execution exception: {str(e)}"
            logger.error(f"Sandbox run exception: {e}")
            if container:
                try:
                    container.remove(force=True)
                except Exception:
                    pass

        return result

    def cleanup(self):
        """
        Removes the host temporary execution directory.
        """
        if os.path.exists(self.host_dir):
            try:
                shutil.rmtree(self.host_dir)
            except Exception as e:
                logger.error(f"Failed to cleanup sandbox host dir {self.host_dir}: {e}")
