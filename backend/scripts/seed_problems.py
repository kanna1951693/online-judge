import os
import json
import uuid
import sys

# Ensure repository root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from sqlalchemy import delete
from backend.app.core.database import SessionLocal, engine
from backend.app.db.models import Problem, TestCase, FunctionSignature, Difficulty, ProblemMode

def parse_two_sum_input(raw_input: str) -> str:
    # input.txt for two-sum has format:
    # [2,7,11,15]
    # 9
    lines = [line.strip() for line in raw_input.strip().splitlines() if line.strip()]
    if len(lines) < 2:
        raise ValueError(f"Invalid two-sum input format: {raw_input}")
    
    nums = json.loads(lines[0])
    target = int(lines[1])
    return json.dumps({"nums": nums, "target": target})

def parse_two_sum_output(raw_output: str) -> str:
    # expected_output.txt has format: [0, 1] or [0,1]
    val = json.loads(raw_output.strip())
    return json.dumps(val)

def seed():
    print("Connecting to database...")
    db = SessionLocal()
    try:
        # Clear tables in order of dependencies
        print("Clearing tables...")
        db.execute(delete(TestCase))
        db.execute(delete(FunctionSignature))
        db.execute(delete(Problem))
        db.commit()

        problems_json_path = "/app/backend/app/problems.json"
        if not os.path.exists(problems_json_path):
            problems_json_path = "../backend/app/problems.json" # local host fallback
        
        with open(problems_json_path, "r") as f:
            problems_data = json.load(f)

        problems_dir = "/app/backend/problems"
        if not os.path.exists(problems_dir):
            problems_dir = "../backend/problems"

        for p_data in problems_data:
            p_id = p_data["id"]
            print(f"Seeding problem: {p_id}")
            
            # Map difficulty
            diff = Difficulty[p_data["difficulty"].lower()]

            # Determine mode
            mode = ProblemMode.function if p_id == "two-sum" else ProblemMode.stdin

            # Create Problem
            prob = Problem(
                slug=p_id,
                title=p_data["title"],
                statement=p_data["description"],
                difficulty=diff,
                mode=mode,
                time_limit_ms=int(p_data["time_limit"] * 1000),
                memory_limit_kb=int(p_data["memory_limit"] * 1024),
                tags=p_data.get("tags", []),
                programs=p_data.get("programs", []),
                hints=p_data.get("hints", []),
                similar_questions=p_data.get("similar_questions", [])
            )
            db.add(prob)
            db.commit()
            db.refresh(prob)

            # Insert Function Signature if needed
            if mode == ProblemMode.function and p_id == "two-sum":
                sig = FunctionSignature(
                    problem_id=prob.id,
                    function_name="twoSum",
                    params=[
                        {"name": "nums", "type": "List[int]"},
                        {"name": "target", "type": "int"}
                    ],
                    return_type="List[int]"
                )
                db.add(sig)
                db.commit()

            # Find testcases
            p_tests_dir = os.path.join(problems_dir, p_id, "tests")
            if os.path.exists(p_tests_dir):
                for case_str in sorted(os.listdir(p_tests_dir), key=lambda x: int(x) if x.isdigit() else 999):
                    case_path = os.path.join(p_tests_dir, case_str)
                    if os.path.isdir(case_path) and case_str.isdigit():
                        case_id = int(case_str)
                        input_file = os.path.join(case_path, "input.txt")
                        output_file = os.path.join(case_path, "expected_output.txt")
                        
                        if os.path.exists(input_file) and os.path.exists(output_file):
                            with open(input_file, "r") as inf:
                                inp = inf.read()
                            with open(output_file, "r") as outf:
                                out = outf.read()
                            
                            # Perform conversion if needed
                            if p_id == "two-sum":
                                try:
                                    inp = parse_two_sum_input(inp)
                                    out = parse_two_sum_output(out)
                                except Exception as e:
                                    print(f"Error parsing test case {case_id} for two-sum: {e}")
                                    continue
                            
                            # Set is_sample (default: first test case is sample)
                            is_sample = (case_id == 1 or case_id == 2)

                            tc = TestCase(
                                problem_id=prob.id,
                                input=inp.strip(),
                                expected_output=out.strip(),
                                is_sample=is_sample,
                                display_order=case_id
                            )
                            db.add(tc)
                            db.commit()
                            print(f"  Added test case {case_id} (sample={is_sample})")

        print("Seeding completed successfully!")
    except Exception as e:
        print(f"Seeding failed: {e}", file=sys.stderr)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
