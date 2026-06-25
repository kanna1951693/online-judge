import os
import json
import logging
import time
import redis
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.core.config import settings
from backend.app.core.database import SessionLocal
from backend.app.core.sandbox import SandboxExecutor
from backend.app.db.models import Problem, TestCase, Submission, SubmissionResult, Verdict, ProblemMode
from backend.app.judge.drivers import get_driver_generator

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

r = redis.from_url(settings.REDIS_URL)

def process_submission(payload_str: str):
    try:
        payload = json.loads(payload_str)
        submission_id = payload["submission_id"]
    except Exception as e:
        logger.error(f"Failed to parse submission queue payload: {e}")
        return

    logger.info(f"Worker processing submission: {submission_id}")

    db = SessionLocal()
    try:
        # 1. Fetch submission from DB
        sub_uuid = uuid.UUID(submission_id)
        submission = db.scalar(select(Submission).where(Submission.id == sub_uuid))
        if not submission:
            logger.error(f"Submission {submission_id} not found in database")
            return

        problem = submission.problem
        logger.info(f"Grading submission {submission.id} for problem {problem.title} ({submission.language.value})")

        # Update Redis status to RUNNING for compatibility
        redis_state = {
            "submission_id": str(submission.id),
            "problem_id": str(problem.id),
            "language": submission.language.value,
            "status": "RUNNING",
            "verdict": None,
            "error_message": None,
            "test_cases": []
        }
        r.set(f"submission:{submission.id}", json.dumps(redis_state))

        # 2. Setup Sandbox Code (wrapping with driver if in function mode)
        source_code = submission.source_code
        if problem.mode == ProblemMode.function:
            try:
                generator = get_driver_generator(submission.language.value)
                source_code = generator.generate(
                    user_code=submission.source_code,
                    signature=problem.function_signature,
                    test_input_json=""
                )
            except Exception as e:
                logger.error(f"Driver generator error for {submission.id}: {e}")
                submission.verdict = Verdict.CE
                db.commit()
                
                redis_state["status"] = "COMPLETED"
                redis_state["verdict"] = "CE"
                redis_state["error_message"] = f"Driver generation failed: {e}"
                r.set(f"submission:{submission.id}", json.dumps(redis_state))
                return

        time_limit_sec = problem.time_limit_ms / 1000.0
        memory_limit_mb = max(16, problem.memory_limit_kb // 1024)

        sandbox = SandboxExecutor(
            problem_id=str(problem.id),
            language=submission.language.value,
            source_code=source_code,
            time_limit=time_limit_sec,
            memory_limit_mb=memory_limit_mb
        )

        try:
            # 3. Compile code if needed
            compiled = sandbox.compile()
            if not compiled:
                submission.verdict = Verdict.CE
                db.commit()

                redis_state["status"] = "COMPLETED"
                redis_state["verdict"] = "CE"
                redis_state["error_message"] = sandbox.compile_error_msg
                r.set(f"submission:{submission.id}", json.dumps(redis_state))
                return

            # 4. Evaluate against all test cases
            overall_verdict = Verdict.AC
            redis_testcase_results = []

            for tc in problem.test_cases:
                logger.info(f"Running submission {submission.id} against test case {tc.id}")
                case_res = sandbox.run_test_case(tc.input, tc.expected_output)

                # Add result record
                res_verdict = case_res["verdict"]
                passed = (res_verdict == "AC")

                db_result = SubmissionResult(
                    submission_id=submission.id,
                    test_case_id=tc.id,
                    passed=passed,
                    actual_output=case_res.get("stdout"),
                    runtime_ms=case_res.get("time_ms"),
                    memory_kb=case_res.get("memory_kb"),
                    error_message=case_res.get("error_message")
                )
                db.add(db_result)
                db.commit()

                redis_testcase_results.append({
                    "case_id": str(tc.id),
                    "verdict": res_verdict,
                    "time_ms": case_res.get("time_ms", 0),
                    "memory_kb": case_res.get("memory_kb", 0),
                    "stdout": case_res.get("stdout"),
                    "expected_output": tc.expected_output,
                    "error_message": case_res.get("error_message")
                })

                # Verdict priority logic: TLE / MLE / RE / WA overrides AC
                if res_verdict != "AC":
                    if overall_verdict == Verdict.AC:
                        overall_verdict = Verdict[res_verdict]
                    elif overall_verdict == Verdict.WA and res_verdict in ["TLE", "MLE", "RE"]:
                        overall_verdict = Verdict[res_verdict]

            # 5. Finalize submission in DB
            submission.verdict = overall_verdict
            db.commit()

            # Finalize Redis state
            redis_state["status"] = "COMPLETED"
            redis_state["verdict"] = overall_verdict.value
            redis_state["test_cases"] = redis_testcase_results
            r.set(f"submission:{submission.id}", json.dumps(redis_state))
            logger.info(f"Grading completed for {submission.id}. Verdict: {overall_verdict.value}")

        finally:
            sandbox.cleanup()

    except Exception as e:
        logger.error(f"Error processing submission {submission_id}: {e}", exc_info=True)
    finally:
        db.close()

def start_worker():
    logger.info("ApexJudge DB-coupled Worker started. Listening for submissions...")
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
