CANONICAL_TYPES = {
    "int": {
        "python": "int",
        "cpp": "int",
        "java": "int"
    },
    "float": {
        "python": "float",
        "cpp": "double",
        "java": "double"
    },
    "str": {
        "python": "str",
        "cpp": "string",
        "java": "String"
    },
    "bool": {
        "python": "bool",
        "cpp": "bool",
        "java": "boolean"
    },
    "List[int]": {
        "python": "List[int]",
        "cpp": "vector<int>",
        "java": "int[]"
    },
    "List[str]": {
        "python": "List[str]",
        "cpp": "vector<string>",
        "java": "String[]"
    },
    "List[float]": {
        "python": "List[float]",
        "cpp": "vector<double>",
        "java": "double[]"
    },
    "List[List[int]]": {
        "python": "List[List[int]]",
        "cpp": "vector<vector<int>>",
        "java": "int[][]"
    },
    "List[List[str]]": {
        "python": "List[List[str]]",
        "cpp": "vector<vector<string>>",
        "java": "String[][]"
    },
    "ListNode": {
        "python": "ListNode",
        "cpp": "ListNode*",
        "java": "ListNode"
    },
    "TreeNode": {
        "python": "TreeNode",
        "cpp": "TreeNode*",
        "java": "TreeNode"
    }
}

def resolve_type(canonical: str, lang: str) -> str:
    if canonical not in CANONICAL_TYPES:
        raise ValueError(f"Unsupported canonical type: {canonical}")
    return CANONICAL_TYPES[canonical][lang]
