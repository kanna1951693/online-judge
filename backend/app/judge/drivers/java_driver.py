import re
from typing import Any
from backend.app.judge.drivers.base import DriverGenerator
from backend.app.core.types import resolve_type

class JavaDriverGenerator(DriverGenerator):
    def generate(self, user_code: str, signature: Any, test_input_json: str) -> str:
        # Extract imports from user code to put them at the top of the file
        imports = re.findall(r'^\s*import\s+[^;]+;', user_code, flags=re.MULTILINE)
        user_code_no_imports = re.sub(r'^\s*import\s+[^;]+;', '', user_code, flags=re.MULTILINE)
        user_code_modified = re.sub(r'\bclass\s+Solution\b', 'class SolutionUser', user_code_no_imports)

        imports_str = "\n".join(imports)

        driver_code = f"""
import java.util.*;
import java.io.*;
import org.json.*;
{imports_str}

// --- Node Definitions ---
class ListNode {{
    public int val;
    public ListNode next;
    public ListNode() {{}}
    public ListNode(int val) {{ this.val = val; }}
    public ListNode(int val, ListNode next) {{ this.val = val; this.next = next; }}
}}

class TreeNode {{
    public int val;
    public TreeNode left;
    public TreeNode right;
    public TreeNode() {{}}
    public TreeNode(int val) {{ this.val = val; }}
    public TreeNode(int val, TreeNode left, TreeNode right) {{
        this.val = val;
        this.left = left;
        this.right = right;
    }}
}}

// --- User Modified Code ---
{user_code_modified}

// --- Main Wrapper Class ---
public class Solution {{
    
    // --- Serialization & Deserialization Helpers ---
    public static ListNode deserializeList(JSONArray j) {{
        if (j == null || j.length() == 0) return null;
        ListNode head = new ListNode(j.getInt(0));
        ListNode curr = head;
        for (int i = 1; i < j.length(); i++) {{
            curr.next = new ListNode(j.getInt(i));
            curr = curr.next;
        }}
        return head;
    }}

    public static JSONArray serializeList(ListNode head) {{
        JSONArray arr = new JSONArray();
        ListNode curr = head;
        while (curr != null) {{
            arr.put(curr.val);
            curr = curr.next;
        }}
        return arr;
    }}

    public static TreeNode deserializeTree(JSONArray j) {{
        if (j == null || j.length() == 0 || j.isNull(0)) return null;
        TreeNode root = new TreeNode(j.getInt(0));
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < j.length()) {{
            TreeNode curr = q.poll();
            if (curr != null) {{
                if (i < j.length() && !j.isNull(i)) {{
                    curr.left = new TreeNode(j.getInt(i));
                    q.add(curr.left);
                }}
                i++;
                if (i < j.length() && !j.isNull(i)) {{
                    curr.right = new TreeNode(j.getInt(i));
                    q.add(curr.right);
                }}
                i++;
            }}
        }}
        return root;
    }}

    public static JSONArray serializeTree(TreeNode root) {{
        JSONArray arr = new JSONArray();
        if (root == null) return arr;
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {{
            TreeNode curr = q.poll();
            if (curr != null) {{
                arr.put(curr.val);
                q.add(curr.left);
                q.add(curr.right);
            }} else {{
                arr.put(JSONObject.NULL);
            }}
        }}
        while (arr.length() > 0 && arr.isNull(arr.length() - 1)) {{
            arr.remove(arr.length() - 1);
        }}
        return arr;
    }}

    public static int[] deserializeIntArray(JSONArray j) {{
        if (j == null) return new int[0];
        int[] arr = new int[j.length()];
        for (int i = 0; i < j.length(); i++) arr[i] = j.getInt(i);
        return arr;
    }}

    public static String[] deserializeStringArray(JSONArray j) {{
        if (j == null) return new String[0];
        String[] arr = new String[j.length()];
        for (int i = 0; i < j.length(); i++) arr[i] = j.getString(i);
        return arr;
    }}

    public static double[] deserializeDoubleArray(JSONArray j) {{
        if (j == null) return new double[0];
        double[] arr = new double[j.length()];
        for (int i = 0; i < j.length(); i++) arr[i] = j.getDouble(i);
        return arr;
    }}

    public static int[][] deserializeIntMatrix(JSONArray j) {{
        if (j == null) return new int[0][0];
        int[][] matrix = new int[j.length()][];
        for (int i = 0; i < j.length(); i++) {{
            JSONArray row = j.getJSONArray(i);
            matrix[i] = deserializeIntArray(row);
        }}
        return matrix;
    }}

    public static void main(String[] args) throws Exception {{
        // Read stdin
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {{
            sb.append(line);
        }}
        String rawInput = sb.toString();
        if (rawInput.trim().isEmpty()) return;

        JSONObject data;
        try {{
            data = new JSONObject(rawInput);
        }} catch (Exception e) {{
            System.err.println("Failed to parse input parameters: " + e.getMessage());
            System.exit(1);
            return;
        }}

"""
        # Deserializing arguments
        for p in signature.params:
            name = p["name"]
            ptype = p["type"]
            java_type = resolve_type(ptype, "java")
            
            if ptype == "ListNode":
                driver_code += f"        ListNode {name} = deserializeList(data.optJSONArray(\"{name}\"));\n"
            elif ptype == "TreeNode":
                driver_code += f"        TreeNode {name} = deserializeTree(data.optJSONArray(\"{name}\"));\n"
            elif ptype == "List[int]":
                driver_code += f"        int[] {name} = deserializeIntArray(data.optJSONArray(\"{name}\"));\n"
            elif ptype == "List[str]":
                driver_code += f"        String[] {name} = deserializeStringArray(data.optJSONArray(\"{name}\"));\n"
            elif ptype == "List[float]":
                driver_code += f"        double[] {name} = deserializeDoubleArray(data.optJSONArray(\"{name}\"));\n"
            elif ptype == "List[List[int]]":
                driver_code += f"        int[][] {name} = deserializeIntMatrix(data.optJSONArray(\"{name}\"));\n"
            elif ptype == "int":
                driver_code += f"        int {name} = data.getInt(\"{name}\");\n"
            elif ptype == "float":
                driver_code += f"        double {name} = data.getDouble(\"{name}\");\n"
            elif ptype == "str":
                driver_code += f"        String {name} = data.getString(\"{name}\");\n"
            elif ptype == "bool":
                driver_code += f"        boolean {name} = data.getBoolean(\"{name}\");\n"

        # Call solution
        func_name = signature.function_name
        args_str = ", ".join(p["name"] for p in signature.params)
        
        driver_code += f"""
        SolutionUser sol = new SolutionUser();
        try {{
"""
        ret_type = signature.return_type
        java_ret = resolve_type(ret_type, "java")
        if java_ret == "void":
            driver_code += f"            sol.{func_name}({args_str});\n"
            driver_code += "            System.out.println(\"null\");\n"
        else:
            driver_code += f"            {java_ret} result = sol.{func_name}({args_str});\n"
            if ret_type == "ListNode":
                driver_code += "            System.out.println(serializeList(result).toString());\n"
            elif ret_type == "TreeNode":
                driver_code += "            System.out.println(serializeTree(result).toString());\n"
            elif ret_type in ["List[int]", "List[str]", "List[float]", "List[List[int]]", "List[List[str]]"]:
                driver_code += "            System.out.println(new JSONArray(result).toString());\n"
            elif ret_type == "str":
                driver_code += "            System.out.println(new JSONObject().put(\"res\", result).get(\"res\").toString());\n"
            elif ret_type == "bool":
                driver_code += "            System.out.println(result);\n"
            else:
                driver_code += "            System.out.println(String.valueOf(result));\n"
            
        driver_code += """
        } catch (Exception e) {
            System.err.println("Execution exception: " + e.getMessage());
            System.exit(1);
        }
    }
}
"""
        return driver_code
