"""
seed_problems.py — seeds ALL judge problems with function-mode signatures.

Every problem gets a FunctionSignature so the frontend shows a clean
class Solution { … } stub instead of the raw #include + main() boilerplate.
"""

import os
import json
import uuid
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from sqlalchemy import delete
from backend.app.core.database import SessionLocal, engine
from backend.app.db.models import Problem, TestCase, FunctionSignature, Difficulty, ProblemMode

# ─────────────────────────────────────────────────────────────────────────────
# Function-signature registry
#   Keys  : problem slug
#   Values: (function_name, params, return_type)
# ─────────────────────────────────────────────────────────────────────────────
FUNCTION_SIGNATURES = {
    # ── Arrays & Hashing ─────────────────────────────────────────────────────
    "two-sum": (
        "twoSum",
        [{"name": "nums", "type": "List[int]"}, {"name": "target", "type": "int"}],
        "List[int]",
    ),
    "contains-duplicate": (
        "containsDuplicate",
        [{"name": "nums", "type": "List[int]"}],
        "bool",
    ),
    "product-of-array-except-self": (
        "productExceptSelf",
        [{"name": "nums", "type": "List[int]"}],
        "List[int]",
    ),
    "group-anagrams": (
        "groupAnagrams",
        [{"name": "strs", "type": "List[str]"}],
        "List[List[str]]",
    ),
    "single-number": (
        "singleNumber",
        [{"name": "nums", "type": "List[int]"}],
        "int",
    ),
    "counting-bits": (
        "countBits",
        [{"name": "n", "type": "int"}],
        "List[int]",
    ),

    # ── Two Pointers / Sliding Window ─────────────────────────────────────────
    "valid-palindrome": (
        "isPalindrome",
        [{"name": "s", "type": "str"}],
        "bool",
    ),
    "valid-anagram": (
        "isAnagram",
        [{"name": "s", "type": "str"}, {"name": "t", "type": "str"}],
        "bool",
    ),
    "longest-common-prefix": (
        "longestCommonPrefix",
        [{"name": "strs", "type": "List[str]"}],
        "str",
    ),
    "longest-substring-without-repeating-characters": (
        "lengthOfLongestSubstring",
        [{"name": "s", "type": "str"}],
        "int",
    ),
    "container-with-most-water": (
        "maxArea",
        [{"name": "height", "type": "List[int]"}],
        "int",
    ),
    "3sum": (
        "threeSum",
        [{"name": "nums", "type": "List[int]"}],
        "List[List[int]]",
    ),
    "reverse-string": (
        "reverseString",
        [{"name": "s", "type": "List[str]"}],
        "List[str]",
    ),

    # ── Stack ─────────────────────────────────────────────────────────────────
    "valid-parentheses": (
        "isValid",
        [{"name": "s", "type": "str"}],
        "bool",
    ),
    # min-stack is a class-design problem — special-cased below

    # ── Binary Search ─────────────────────────────────────────────────────────
    "binary-search": (
        "search",
        [{"name": "nums", "type": "List[int]"}, {"name": "target", "type": "int"}],
        "int",
    ),
    "search-in-rotated-sorted-array": (
        "search",
        [{"name": "nums", "type": "List[int]"}, {"name": "target", "type": "int"}],
        "int",
    ),
    "find-minimum-in-rotated-sorted-array": (
        "findMin",
        [{"name": "nums", "type": "List[int]"}],
        "int",
    ),

    # ── Sliding Window / Stock ────────────────────────────────────────────────
    "best-time-to-buy-and-sell-stock": (
        "maxProfit",
        [{"name": "prices", "type": "List[int]"}],
        "int",
    ),

    # ── Linked Lists ──────────────────────────────────────────────────────────
    "reverse-linked-list": (
        "reverseList",
        [{"name": "head", "type": "ListNode"}],
        "ListNode",
    ),
    "merge-two-sorted-lists": (
        "mergeTwoLists",
        [{"name": "list1", "type": "ListNode"}, {"name": "list2", "type": "ListNode"}],
        "ListNode",
    ),

    # ── Trees ─────────────────────────────────────────────────────────────────
    "maximum-depth-of-binary-tree": (
        "maxDepth",
        [{"name": "root", "type": "TreeNode"}],
        "int",
    ),
    "invert-binary-tree": (
        "invertTree",
        [{"name": "root", "type": "TreeNode"}],
        "TreeNode",
    ),
    "binary-tree-level-order-traversal": (
        "levelOrder",
        [{"name": "root", "type": "TreeNode"}],
        "List[List[int]]",
    ),

    # ── Dynamic Programming ───────────────────────────────────────────────────
    "maximum-subarray": (
        "maxSubArray",
        [{"name": "nums", "type": "List[int]"}],
        "int",
    ),
    "climbing-stairs": (
        "climbStairs",
        [{"name": "n", "type": "int"}],
        "int",
    ),
    "house-robber": (
        "rob",
        [{"name": "nums", "type": "List[int]"}],
        "int",
    ),
    "coin-change": (
        "coinChange",
        [{"name": "coins", "type": "List[int]"}, {"name": "amount", "type": "int"}],
        "int",
    ),

    # ── Sorting ───────────────────────────────────────────────────────────────
    "merge-sort": (
        "sortArray",
        [{"name": "nums", "type": "List[int]"}],
        "List[int]",
    ),
    "kth-largest-element-in-an-array": (
        "findKthLargest",
        [{"name": "nums", "type": "List[int]"}, {"name": "k", "type": "int"}],
        "int",
    ),

    # ── System tests (stdin mode — no function stub needed) ───────────────────
    # "infinite-loop", "fork-bomb", "memory-leak", "runtime-error", "min-stack"
}

# Types that need custom serialization in "List[List[str]]"
CANONICAL_TYPES_EXT = {
    "List[List[str]]": {
        "python": "List[List[str]]",
        "cpp": "vector<vector<string>>",
        "java": "String[][]",
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# Input → JSON converter registry
#   Each callable(raw_input_str) -> json_str that the driver will parse
# ─────────────────────────────────────────────────────────────────────────────
def _1array(raw):
    return json.dumps({"nums": json.loads(raw.strip())})

def _1array_strs(raw):
    return json.dumps({"strs": json.loads(raw.strip())})

def _1string(raw):
    return json.dumps({"s": raw.strip()})

def _1array_s(raw):
    return json.dumps({"s": json.loads(raw.strip())})

def _1array_height(raw):
    return json.dumps({"height": json.loads(raw.strip())})

def _1array_prices(raw):
    return json.dumps({"prices": json.loads(raw.strip())})

def _1int(raw):
    return json.dumps({"n": int(raw.strip())})

def _two_sum_in(raw):
    lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
    return json.dumps({"nums": json.loads(lines[0]), "target": int(lines[1])})

def _two_ints_array(raw):
    """nums\ntarget — for binary search / rotated search / kth largest"""
    lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
    return json.dumps({"nums": json.loads(lines[0]), "target": int(lines[1])})

def _nums_and_k(raw):
    lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
    return json.dumps({"nums": json.loads(lines[0]), "k": int(lines[1])})

def _two_strings(raw):
    lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
    return json.dumps({"s": lines[0], "t": lines[1]})

def _coins_amount(raw):
    lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
    return json.dumps({"coins": json.loads(lines[0]), "amount": int(lines[1])})

def _list_node(raw):
    return json.dumps({"head": json.loads(raw.strip())})

def _two_lists(raw):
    lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
    l1 = json.loads(lines[0]) if lines else []
    l2 = json.loads(lines[1]) if len(lines) > 1 else []
    return json.dumps({"list1": l1, "list2": l2})

def _tree_root(raw):
    return json.dumps({"root": json.loads(raw.strip())})

# ─── Output normaliser (raw file output → driver-compatible JSON) ──────────
def _json_out(raw):
    return json.dumps(json.loads(raw.strip()))

def _str_out(raw):
    return raw.strip()

def _bool_out(raw):
    return raw.strip().lower()   # "true" / "false"

INPUT_PARSERS = {
    "two-sum":                                    _two_sum_in,
    "contains-duplicate":                         _1array,
    "product-of-array-except-self":               _1array,
    "group-anagrams":                             _1array_strs,
    "single-number":                              _1array,
    "counting-bits":                              _1int,
    "valid-palindrome":                           _1string,
    "valid-anagram":                              _two_strings,
    "longest-common-prefix":                      _1array_strs,
    "longest-substring-without-repeating-characters": _1string,
    "container-with-most-water":                  _1array_height,
    "3sum":                                       _1array,
    "reverse-string":                             _1array_s,
    "valid-parentheses":                          _1string,
    "binary-search":                              _two_ints_array,
    "search-in-rotated-sorted-array":             _two_ints_array,
    "find-minimum-in-rotated-sorted-array":       _1array,
    "best-time-to-buy-and-sell-stock":            _1array_prices,
    "reverse-linked-list":                        _list_node,
    "merge-two-sorted-lists":                     _two_lists,
    "maximum-depth-of-binary-tree":               _tree_root,
    "invert-binary-tree":                         _tree_root,
    "binary-tree-level-order-traversal":          _tree_root,
    "maximum-subarray":                           _1array,
    "climbing-stairs":                            _1int,
    "house-robber":                               _1array,
    "coin-change":                                _coins_amount,
    "merge-sort":                                 _1array,
    "kth-largest-element-in-an-array":            _nums_and_k,
}

OUTPUT_PARSERS = {
    # JSON arrays / objects
    "two-sum":                                    _json_out,
    "product-of-array-except-self":               _json_out,
    "group-anagrams":                             _json_out,
    "counting-bits":                              _json_out,
    "3sum":                                       _json_out,
    "reverse-string":                             _json_out,
    "reverse-linked-list":                        _json_out,
    "merge-two-sorted-lists":                     _json_out,
    "invert-binary-tree":                         _json_out,
    "binary-tree-level-order-traversal":          _json_out,
    "merge-sort":                                 _json_out,
    # Plain strings (already ints stored as strings)
    "contains-duplicate":                         _bool_out,
    "single-number":                              _str_out,
    "valid-palindrome":                           _bool_out,
    "valid-anagram":                              _bool_out,
    "longest-common-prefix":                      _str_out,
    "longest-substring-without-repeating-characters": _str_out,
    "container-with-most-water":                  _str_out,
    "valid-parentheses":                          _bool_out,
    "binary-search":                              _str_out,
    "search-in-rotated-sorted-array":             _str_out,
    "find-minimum-in-rotated-sorted-array":       _str_out,
    "best-time-to-buy-and-sell-stock":            _str_out,
    "maximum-depth-of-binary-tree":               _str_out,
    "maximum-subarray":                           _str_out,
    "climbing-stairs":                            _str_out,
    "house-robber":                               _str_out,
    "coin-change":                                _str_out,
    "kth-largest-element-in-an-array":            _str_out,
}

# Problems that stay stdin (no stub, raw main)
STDIN_PROBLEMS = {"min-stack", "infinite-loop", "fork-bomb", "memory-leak", "runtime-error"}


# ─────────────────────────────────────────────────────────────────────────────
def seed():
    print("Connecting to database...")
    db = SessionLocal()
    try:
        print("Clearing tables...")
        db.execute(delete(TestCase))
        db.execute(delete(FunctionSignature))
        db.execute(delete(Problem))
        db.commit()

        problems_json_path = "/app/backend/app/problems.json"
        if not os.path.exists(problems_json_path):
            problems_json_path = os.path.join(
                os.path.dirname(__file__), "..", "backend", "app", "problems.json"
            )
        if not os.path.exists(problems_json_path):
            problems_json_path = os.path.join(
                os.path.dirname(__file__), "..", "app", "problems.json"
            )

        with open(problems_json_path, "r") as f:
            problems_data = json.load(f)

        problems_dir = "/app/backend/problems"
        if not os.path.exists(problems_dir):
            problems_dir = os.path.join(os.path.dirname(__file__), "..", "problems")

        for p_data in problems_data:
            p_id = p_data["id"]
            print(f"Seeding problem: {p_id}")

            diff = Difficulty[p_data["difficulty"].lower()]
            mode = ProblemMode.stdin if p_id in STDIN_PROBLEMS else ProblemMode.function

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
                similar_questions=p_data.get("similar_questions", []),
            )
            db.add(prob)
            db.commit()
            db.refresh(prob)

            # Insert function signature
            if p_id in FUNCTION_SIGNATURES:
                func_name, params, ret_type = FUNCTION_SIGNATURES[p_id]
                sig = FunctionSignature(
                    problem_id=prob.id,
                    function_name=func_name,
                    params=params,
                    return_type=ret_type,
                )
                db.add(sig)
                db.commit()
                print(f"  Signature: {ret_type} {func_name}({', '.join(p['type'] for p in params)})")

            # Load test cases from filesystem
            p_tests_dir = os.path.join(problems_dir, p_id, "tests")
            if not os.path.exists(p_tests_dir):
                continue

            inp_parser = INPUT_PARSERS.get(p_id)
            out_parser = OUTPUT_PARSERS.get(p_id)

            for case_str in sorted(
                os.listdir(p_tests_dir),
                key=lambda x: int(x) if x.isdigit() else 999,
            ):
                case_path = os.path.join(p_tests_dir, case_str)
                if not (os.path.isdir(case_path) and case_str.isdigit()):
                    continue

                case_id = int(case_str)
                input_file = os.path.join(case_path, "input.txt")
                output_file = os.path.join(case_path, "expected_output.txt")

                if not (os.path.exists(input_file) and os.path.exists(output_file)):
                    continue

                with open(input_file) as f:
                    inp = f.read()
                with open(output_file) as f:
                    out = f.read()

                if inp_parser:
                    try:
                        inp = inp_parser(inp)
                    except Exception as e:
                        print(f"  WARN: input parse failed for {p_id} case {case_id}: {e}")
                        continue

                if out_parser:
                    try:
                        out = out_parser(out)
                    except Exception as e:
                        print(f"  WARN: output parse failed for {p_id} case {case_id}: {e}")
                        continue

                is_sample = case_id <= 2
                tc = TestCase(
                    problem_id=prob.id,
                    input=inp.strip(),
                    expected_output=out.strip(),
                    is_sample=is_sample,
                    display_order=case_id,
                )
                db.add(tc)
                db.commit()
                print(f"  Added test case {case_id} (sample={is_sample})")

        print("\nSeeding completed successfully!")
    except Exception as e:
        import traceback
        print(f"Seeding failed: {e}", file=sys.stderr)
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
