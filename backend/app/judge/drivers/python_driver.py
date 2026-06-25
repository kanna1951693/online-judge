from typing import Any
from backend.app.judge.drivers.base import DriverGenerator

class PythonDriverGenerator(DriverGenerator):
    def generate(self, user_code: str, signature: Any, test_input_json: str) -> str:
        # Code boilerplate to inject
        driver_code = f"""
# --- Standard Library Imports & Node Definitions ---
import sys
import json
from typing import List, Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# --- Serialization & Deserialization Helpers ---
def deserialize_list(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    curr = head
    for val in arr[1:]:
        curr.next = ListNode(val)
        curr = curr.next
    return head

def serialize_list(head):
    result = []
    curr = head
    while curr:
        result.append(curr.val)
        curr = curr.next
    return result

def deserialize_tree(arr):
    if not arr:
        return None
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        node = queue.pop(0)
        if node is not None:
            if i < len(arr) and arr[i] is not None:
                node.left = TreeNode(arr[i])
                queue.append(node.left)
            else:
                node.left = None
            i += 1
            if i < len(arr) and arr[i] is not None:
                node.right = TreeNode(arr[i])
                queue.append(node.right)
            else:
                node.right = None
            i += 1
    return root

def serialize_tree(root):
    if not root:
        return []
    result = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    while result and result[-1] is None:
        result.pop()
    return result

# --- User Code ---
{user_code}

# --- Driver Main ---
def __driver_main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            return
        data = json.loads(raw_input)
    except Exception as e:
        print(json.dumps({{"error": "Failed to parse input parameters: " + str(e)}}))
        return

    # Deserializing arguments
    params = []
"""

        # Append param loading
        for p in signature.params:
            name = p["name"]
            ptype = p["type"]
            if ptype == "ListNode":
                driver_code += f"    {name} = deserialize_list(data.get('{name}'))\n"
            elif ptype == "TreeNode":
                driver_code += f"    {name} = deserialize_tree(data.get('{name}'))\n"
            else:
                driver_code += f"    {name} = data.get('{name}')\n"
            
            driver_code += f"    params.append({name})\n"

        # Invoke method
        func_name = signature.function_name
        driver_code += f"""
    try:
        sol = Solution()
        result = sol.{func_name}(*params)
    except Exception as e:
        print(json.dumps({{"error": "Execution exception: " + str(e)}}), file=sys.stderr)
        sys.exit(1)

    # Serializing result
"""
        ret_type = signature.return_type
        if ret_type == "ListNode":
            driver_code += "    serialized_result = serialize_list(result)\n"
        elif ret_type == "TreeNode":
            driver_code += "    serialized_result = serialize_tree(result)\n"
        else:
            driver_code += "    serialized_result = result\n"

        driver_code += """
    print(json.dumps(serialized_result))

if __name__ == '__main__':
    __driver_main()
"""
        return driver_code
