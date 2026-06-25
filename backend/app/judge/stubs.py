from typing import Dict, Any

# ── Canonical → language type maps ──────────────────────────────────────────
CPP_PARAM_TYPES = {
    "int": "int",
    "float": "double",
    "str": "string",
    "bool": "bool",
    "List[int]": "vector<int>&",
    "List[str]": "vector<string>&",
    "List[float]": "vector<double>&",
    "List[List[int]]": "vector<vector<int>>&",
    "List[List[str]]": "vector<vector<string>>&",
    "ListNode": "ListNode*",
    "TreeNode": "TreeNode*",
}
CPP_RET_TYPES = {
    "int": "int",
    "float": "double",
    "str": "string",
    "bool": "bool",
    "List[int]": "vector<int>",
    "List[str]": "vector<string>",
    "List[float]": "vector<double>",
    "List[List[int]]": "vector<vector<int>>",
    "List[List[str]]": "vector<vector<string>>",
    "ListNode": "ListNode*",
    "TreeNode": "TreeNode*",
}
JAVA_TYPES = {
    "int": "int",
    "float": "double",
    "str": "String",
    "bool": "boolean",
    "List[int]": "int[]",
    "List[str]": "String[]",
    "List[float]": "double[]",
    "List[List[int]]": "int[][]",
    "List[List[str]]": "String[][]",
    "ListNode": "ListNode",
    "TreeNode": "TreeNode",
}
PYTHON_TYPES = {
    "int": "int",
    "float": "float",
    "str": "str",
    "bool": "bool",
    "List[int]": "List[int]",
    "List[str]": "List[str]",
    "List[float]": "List[float]",
    "List[List[int]]": "List[List[int]]",
    "List[List[str]]": "List[List[str]]",
    "ListNode": "Optional[ListNode]",
    "TreeNode": "Optional[TreeNode]",
}


def _attr(p, key: str) -> str:
    """Works with both Pydantic models and plain dicts."""
    return getattr(p, key, None) or p.get(key)


def generate_stubs(signature: Any) -> Dict[str, str]:
    if not signature:
        return {}

    func_name = signature.function_name
    params     = signature.params
    ret_type   = signature.return_type

    # ── C++ ─────────────────────────────────────────────────────────────────
    cpp_params = [
        f"{CPP_PARAM_TYPES.get(_attr(p,'type'), _attr(p,'type'))} {_attr(p,'name')}"
        for p in params
    ]
    cpp_ret = CPP_RET_TYPES.get(ret_type, ret_type)
    cpp_stub = (
        f"class Solution {{\n"
        f"public:\n"
        f"    {cpp_ret} {func_name}({', '.join(cpp_params)}) {{\n"
        f"        \n"
        f"    }}\n"
        f"}};"
    )

    # ── Java ─────────────────────────────────────────────────────────────────
    java_params = [
        f"{JAVA_TYPES.get(_attr(p,'type'), _attr(p,'type'))} {_attr(p,'name')}"
        for p in params
    ]
    java_ret = JAVA_TYPES.get(ret_type, ret_type)
    java_stub = (
        f"class Solution {{\n"
        f"    public {java_ret} {func_name}({', '.join(java_params)}) {{\n"
        f"        \n"
        f"    }}\n"
        f"}}"
    )

    # ── Python ───────────────────────────────────────────────────────────────
    py_params = ["self"] + [
        f"{_attr(p,'name')}: {PYTHON_TYPES.get(_attr(p,'type'), _attr(p,'type'))}"
        for p in params
    ]
    py_ret = PYTHON_TYPES.get(ret_type, ret_type)
    py_stub = (
        f"class Solution:\n"
        f"    def {func_name}({', '.join(py_params)}) -> {py_ret}:\n"
        f"        "
    )

    return {"cpp": cpp_stub, "java": java_stub, "python": py_stub}
