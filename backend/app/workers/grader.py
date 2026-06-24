import os
import json
import logging
import time
import redis
from typing import Dict, Any, Optional
from backend.app.core.config import settings
from backend.app.core.sandbox import SandboxExecutor

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Initialize Redis
r = redis.from_url(settings.REDIS_URL)

def get_problem_metadata(problem_id: str) -> Optional[Dict[str, Any]]:
    try:
        with open(settings.PROBLEMS_JSON_PATH, "r") as f:
            problems = json.load(f)
        for p in problems:
            if p["id"] == problem_id:
                return p
    except Exception as e:
        logger.error(f"Error reading problems.json: {e}")
    return None

def process_submission(payload_str: str):
    try:
        payload = json.loads(payload_str)
        submission_id = payload["submission_id"]
        problem_id = payload["problem_id"]
        language = payload["language"]
        source_code = payload["source_code"]
    except Exception as e:
        logger.error(f"Failed to parse submission queue payload: {e}")
        return

    logger.info(f"Grading submission {submission_id} for problem {problem_id} ({language})")

    # Mark as RUNNING
    state = {
        "submission_id": submission_id,
        "problem_id": problem_id,
        "language": language,
        "status": "RUNNING",
        "verdict": None,
        "error_message": None,
        "test_cases": []
    }
    r.set(f"submission:{submission_id}", json.dumps(state))

    # Fetch problem metadata
    problem = get_problem_metadata(problem_id)
    if not problem:
        state["status"] = "FAILED"
        state["error_message"] = f"Problem {problem_id} not found in database"
        r.set(f"submission:{submission_id}", json.dumps(state))
        return

    time_limit = problem.get("time_limit", 2.0)
    memory_limit = problem.get("memory_limit", 256)

    # Initialize Sandbox
    sandbox = SandboxExecutor(
        problem_id=problem_id,
        language=language,
        source_code=source_code,
        time_limit=time_limit,
        memory_limit_mb=memory_limit
    )

    # Compile if C++
    if language.lower() == "cpp":
        logger.info(f"Compiling C++ code for submission {submission_id}")
        compile_success = sandbox.compile()
        if not compile_success:
            logger.info(f"Compilation failed for submission {submission_id}")
            state["status"] = "COMPLETED"
            state["verdict"] = "CE"
            state["error_message"] = sandbox.compile_error_msg
            r.set(f"submission:{submission_id}", json.dumps(state))
            sandbox.cleanup()
            return

    # Find test cases on disk
    tests_dir = os.path.join(settings.PROBLEMS_DIR, problem_id, "tests")
    if not os.path.exists(tests_dir):
        state["status"] = "FAILED"
        state["error_message"] = f"Test cases directory not found on host for problem {problem_id}"
        r.set(f"submission:{submission_id}", json.dumps(state))
        sandbox.cleanup()
        return

    # Gather case folders (sorted numerically)
    case_folders = []
    for entry in os.listdir(tests_dir):
        entry_path = os.path.join(tests_dir, entry)
        if os.path.isdir(entry_path) and entry.isdigit():
            case_folders.append(entry)
    case_folders.sort(key=int)

    if not case_folders:
        state["status"] = "FAILED"
        state["error_message"] = f"No valid test cases found for problem {problem_id}"
        r.set(f"submission:{submission_id}", json.dumps(state))
        sandbox.cleanup()
        return

    test_case_results = []
    overall_verdict = "AC"

    # Evaluate cases sequentially
    for case_str in case_folders:
        case_id = int(case_str)
        case_path = os.path.join(tests_dir, case_str)
        
        input_file = os.path.join(case_path, "input.txt")
        output_file = os.path.join(case_path, "expected_output.txt")
        
        if not os.path.exists(input_file) or not os.path.exists(output_file):
            logger.warning(f"Missing input/output files for test case {case_id} in {case_path}")
            continue

        with open(input_file, "r") as f:
            input_data = f.read()
        with open(output_file, "r") as f:
            expected_output = f.read()

        logger.info(f"Running submission {submission_id} against test case {case_id}")
        case_res = sandbox.run_test_case(input_data, expected_output)

        test_case_results.append({
            "case_id": case_id,
            "verdict": case_res["verdict"],
            "time_ms": case_res["time_ms"],
            "memory_kb": case_res["memory_kb"],
            "stdout": case_res.get("stdout"),
            "expected_output": case_res.get("expected_output"),
            "error_message": case_res.get("error_message")
        })

        # Update overall verdict based on priority: TLE/MLE/RE/WA override AC
        current_verdict = case_res["verdict"]
        if current_verdict != "AC":
            # If we don't have a failure yet, or we want to bubble up the worst failure
            if overall_verdict == "AC":
                overall_verdict = current_verdict
            elif overall_verdict == "WA" and current_verdict in ["TLE", "MLE", "RE"]:
                overall_verdict = current_verdict

    # Finalize state
    state["status"] = "COMPLETED"
    state["verdict"] = overall_verdict
    state["test_cases"] = test_case_results

    r.set(f"submission:{submission_id}", json.dumps(state))
    logger.info(f"Finished grading submission {submission_id}. Verdict: {overall_verdict}")
    
    # Cleanup sandbox files
    sandbox.cleanup()

def start_worker():
    logger.info("ApexJudge Worker started. Listening for submissions queue...")
    while True:
        try:
            # Blocking pop from submission queue
            job = r.blpop(settings.SUBMISSION_QUEUE_NAME, timeout=2)
            if job:
                # job is a tuple: (queue_name, payload_str)
                _, payload_str = job
                process_submission(payload_str.decode("utf-8"))
        except redis.ConnectionError:
            logger.error("Redis connection error, retrying in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            logger.error(f"Worker runtime exception: {e}", exc_info=True)
            time.sleep(1)

if __name__ == "__main__":
    start_worker()
