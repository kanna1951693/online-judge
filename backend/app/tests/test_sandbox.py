import sys
import os
import unittest

# Add backend/app and backend to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from backend.app.core.sandbox import SandboxExecutor

class TestSandboxVerdicts(unittest.TestCase):
    def run_sandbox_case(self, lang: str, code: str, problem_id: str, input_data: str, expected_output: str, time_limit: float = 2.0, memory_limit: int = 256):
        executor = SandboxExecutor(
            problem_id=problem_id,
            language=lang,
            source_code=code,
            time_limit=time_limit,
            memory_limit_mb=memory_limit
        )
        if lang == "cpp":
            compile_ok = executor.compile()
            if not compile_ok:
                executor.cleanup()
                return {"verdict": "CE", "error_message": executor.compile_error_msg}
        
        result = executor.run_test_case(input_data, expected_output)
        executor.cleanup()
        return result

    # ----------------- Python Tests -----------------

    def test_python_ac(self):
        code = """import sys, json
lines = sys.stdin.read().splitlines()
nums = json.loads(lines[0])
target = int(lines[1])
seen = {}
for i, num in enumerate(nums):
    diff = target - num
    if diff in seen:
        print(json.dumps([seen[diff], i]))
        sys.exit(0)
    seen[num] = i
"""
        res = self.run_sandbox_case("python", code, "two-sum", "[2,7,11,15]\n9\n", "[0, 1]\n")
        self.assertEqual(res["verdict"], "AC")

    def test_python_wa(self):
        code = "print('[]')"
        res = self.run_sandbox_case("python", code, "two-sum", "[2,7,11,15]\n9\n", "[0,1]\n")
        self.assertEqual(res["verdict"], "WA")

    def test_python_tle(self):
        code = "import time\nwhile True:\n    time.sleep(0.01)"
        res = self.run_sandbox_case("python", code, "infinite-loop", "1\n", "loop\n", time_limit=1.0)
        self.assertEqual(res["verdict"], "TLE")

    def test_python_mle(self):
        # Trigger Python Memory Limit
        code = "a = [0] * (50 * 1024 * 1024)\nprint('leak')"
        res = self.run_sandbox_case("python", code, "memory-leak", "1\n", "leak\n", memory_limit=256)
        self.assertEqual(res["verdict"], "MLE")

    def test_python_re(self):
        code = "raise ValueError('Intentional crash')"
        res = self.run_sandbox_case("python", code, "runtime-error", "1\n", "crash\n")
        self.assertEqual(res["verdict"], "RE")

    def test_python_fork_bomb(self):
        code = """import os, sys
try:
    for _ in range(1000):
        pid = os.fork()
        if pid == 0:
            sys.exit(0)
except OSError:
    print('bomb')
    sys.exit(0)
"""
        res = self.run_sandbox_case("python", code, "fork-bomb", "1\n", "bomb\n")
        self.assertEqual(res["verdict"], "AC")

    # ----------------- C++ Tests -----------------

    def test_cpp_ac(self):
        code = """#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>
#include <string>

using namespace std;

vector<int> parse_array(const string& s) {
    vector<int> res;
    string num_str = "";
    for (char c : s) {
        if (isdigit(c) || c == '-') {
            num_str += c;
        } else {
            if (!num_str.empty()) {
                res.push_back(stoi(num_str));
                num_str = "";
            }
        }
    }
    return res;
}

int main() {
    string arr_line;
    int target;
    if (getline(cin, arr_line) && cin >> target) {
        vector<int> nums = parse_array(arr_line);
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int diff = target - nums[i];
            if (seen.count(diff)) {
                cout << "[" << seen[diff] << "," << i << "]" << endl;
                return 0;
            }
            seen[nums[i]] = i;
        }
    }
    return 0;
}
"""
        res = self.run_sandbox_case("cpp", code, "two-sum", "[2,7,11,15]\n9\n", "[0,1]\n")
        self.assertEqual(res["verdict"], "AC")

    def test_cpp_tle(self):
        code = "int main() { while(true) {} return 0; }"
        res = self.run_sandbox_case("cpp", code, "infinite-loop", "1\n", "loop\n", time_limit=1.0)
        self.assertEqual(res["verdict"], "TLE")

    def test_cpp_mle(self):
        code = """#include <vector>
#include <iostream>
int main() {
    std::vector<int> v(128 * 1024 * 1024, 0); // 512MB allocation
    std::cout << "leak" << std::endl;
    return 0;
}
"""
        res = self.run_sandbox_case("cpp", code, "memory-leak", "1\n", "leak\n", memory_limit=256)
        self.assertEqual(res["verdict"], "MLE")

    def test_cpp_re(self):
        code = """int main() {
    int* p = nullptr;
    *p = 123; // Segfault
    return 0;
}
"""
        res = self.run_sandbox_case("cpp", code, "runtime-error", "1\n", "crash\n")
        self.assertEqual(res["verdict"], "RE")

if __name__ == "__main__":
    unittest.main()
