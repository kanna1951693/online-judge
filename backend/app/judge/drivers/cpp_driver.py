from typing import Any
from backend.app.judge.drivers.base import DriverGenerator
from backend.app.core.types import resolve_type

class CppDriverGenerator(DriverGenerator):
    def generate(self, user_code: str, signature: Any, test_input_json: str) -> str:
        driver_code = f"""
#include <bits/stdc++.h>
#include <nlohmann/json.hpp>

using namespace std;
using json = nlohmann::json;

struct ListNode {{
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {{}}
    ListNode(int x) : val(x), next(nullptr) {{}}
    ListNode(int x, ListNode *next) : val(x), next(next) {{}}
}};

struct TreeNode {{
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {{}}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {{}}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {{}}
}};

ListNode* deserialize_list(const json& j) {{
    if (j.is_null() || !j.is_array() || j.empty()) return nullptr;
    ListNode* head = new ListNode(j[0].get<int>());
    ListNode* curr = head;
    for (size_t i = 1; i < j.size(); ++i) {{
        curr->next = new ListNode(j[i].get<int>());
        curr = curr->next;
    }}
    return head;
}}

json serialize_list(ListNode* head) {{
    json arr = json::array();
    ListNode* curr = head;
    while (curr) {{
        arr.push_back(curr->val);
        curr = curr->next;
    }}
    return arr;
}}

TreeNode* deserialize_tree(const json& j) {{
    if (j.is_null() || !j.is_array() || j.empty() || j[0].is_null()) return nullptr;
    TreeNode* root = new TreeNode(j[0].get<int>());
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < j.size()) {{
        TreeNode* curr = q.front();
        q.pop();
        if (curr) {{
            if (i < j.size() && !j[i].is_null()) {{
                curr->left = new TreeNode(j[i].get<int>());
                q.push(curr->left);
            }} else {{
                curr->left = nullptr;
            }}
            i++;
            if (i < j.size() && !j[i].is_null()) {{
                curr->right = new TreeNode(j[i].get<int>());
                q.push(curr->right);
            }} else {{
                curr->right = nullptr;
            }}
            i++;
        }}
    }}
    return root;
}}

json serialize_tree(TreeNode* root) {{
    if (!root) return json::array();
    json arr = json::array();
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {{
        TreeNode* curr = q.front();
        q.pop();
        if (curr) {{
            arr.push_back(curr->val);
            q.push(curr->left);
            q.push(curr->right);
        }} else {{
            arr.push_back(nullptr);
        }}
    }}
    while (!arr.empty() && arr.back().is_null()) {{
        arr.erase(arr.size() - 1);
    }}
    return arr;
}}

// --- User Code ---
{user_code}

// --- Driver Main ---
int main() {{
    string raw_input;
    // Read all stdin
    char ch;
    while (cin.get(ch)) {{
        raw_input += ch;
    }}
    
    if (raw_input.empty()) return 0;
    
    json data;
    try {{
        data = json::parse(raw_input);
    }} catch (exception& e) {{
        cerr << "Failed to parse input parameters: " << e.what() << endl;
        return 1;
    }}

"""
        # Deserializing params
        for p in signature.params:
            name = p["name"]
            ptype = p["type"]
            cpp_type = resolve_type(ptype, "cpp")
            
            if ptype == "ListNode":
                driver_code += f"    ListNode* {name} = deserialize_list(data[\"{name}\"]);\n"
            elif ptype == "TreeNode":
                driver_code += f"    TreeNode* {name} = deserialize_tree(data[\"{name}\"]);\n"
            else:
                driver_code += f"    {cpp_type} {name} = data[\"{name}\"].get<{cpp_type}>();\n"

        # Calling solution
        func_name = signature.function_name
        args_str = ", ".join(p["name"] for p in signature.params)
        
        driver_code += f"""
    Solution sol;
    try {{
        auto result = sol.{func_name}({args_str});
        json serialized_result;
"""
        ret_type = signature.return_type
        if ret_type == "ListNode":
            driver_code += "        serialized_result = serialize_list(result);\n"
        elif ret_type == "TreeNode":
            driver_code += "        serialized_result = serialize_tree(result);\n"
        else:
            driver_code += "        serialized_result = json(result);\n"

        driver_code += """
        cout << serialized_result.dump() << endl;
    } catch (exception& e) {
        cerr << "Execution exception: " << e.what() << endl;
        return 1;
    }
    return 0;
}
"""
        return driver_code
