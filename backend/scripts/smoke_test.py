#!/usr/bin/env python3
import json, time, urllib.request, urllib.error, subprocess

BASE = "http://localhost:8000/api/v1/judge"

def api(method, path, body=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method,
          headers={"Content-Type": "application/json"} if data else {})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "body": e.read().decode()}

def poll(sub_id, timeout=90):
    start = time.time()
    while time.time() - start < timeout:
        r = api("GET", f"/submissions/{sub_id}")
        if r.get("status") in ("COMPLETED", "FAILED"):
            return r
        time.sleep(2)
    return {"status": "TIMEOUT"}

def check(label, cond, detail=""):
    icon = "PASS" if cond else "FAIL"
    print(f"  [{icon}] {label}" + (f" ({detail})" if detail else ""))
    return cond

EXPECTED = ["[0,1]", "[0, 1]"]

CPP_CORRECT = (
    "class Solution {\n"
    "public:\n"
    "    vector<int> twoSum(vector<int>& nums, int target) {\n"
    "        unordered_map<int,int> m;\n"
    "        for (int i = 0; i < (int)nums.size(); i++) {\n"
    "            if (m.count(target - nums[i])) return {m[target-nums[i]], i};\n"
    "            m[nums[i]] = i;\n"
    "        }\n"
    "        return {};\n"
    "    }\n"
    "};"
)
CPP_WRONG = (
    "class Solution {\n"
    "public:\n"
    "    vector<int> twoSum(vector<int>& nums, int target) {\n"
    "        return {};  // deliberately wrong\n"
    "    }\n"
    "};"
)
PYTHON_CORRECT = (
    "class Solution:\n"
    "    def twoSum(self, nums, target):\n"
    "        seen = {}\n"
    "        for i, n in enumerate(nums):\n"
    "            if target - n in seen:\n"
    "                return [seen[target - n], i]\n"
    "            seen[n] = i\n"
    "        return []\n"
)
JAVA_CORRECT = (
    "import java.util.*;\n"
    "class Solution {\n"
    "    public int[] twoSum(int[] nums, int target) {\n"
    "        Map<Integer,Integer> m = new HashMap<>();\n"
    "        for (int i = 0; i < nums.length; i++) {\n"
    "            if (m.containsKey(target - nums[i])) return new int[]{m.get(target-nums[i]), i};\n"
    "            m.put(nums[i], i);\n"
    "        }\n"
    "        return new int[]{};\n"
    "    }\n"
    "}"
)
STDIN = '{"nums": [2, 7, 11, 15], "target": 9}'

print("\n" + "="*60)
print("  STEP 1 - Stack health")
print("="*60)
problems = api("GET", "/problems")
check("Problems endpoint up", "error" not in problems)
p = next((x for x in problems if x["slug"] == "two-sum"), None)
check("twoSum found in DB", p is not None)

print("\n" + "="*60)
print("  STEP 2 - C++ correct, RUN")
print("="*60)
r = api("POST", "/problems/two-sum/run", {"language":"cpp","source_code":CPP_CORRECT,"stdin":STDIN})
print("  response:", json.dumps(r))
check("verdict OK", r.get("verdict")=="OK", r.get("verdict"))
check("stdout=[0,1]", any(e in (r.get("stdout") or "") for e in EXPECTED), repr(r.get("stdout")))

print("\n" + "="*60)
print("  STEP 3 - C++ correct, SUBMIT")
print("="*60)
sub = api("POST", "/problems/two-sum/submit", {"language":"cpp","source_code":CPP_CORRECT})
print("  submit:", json.dumps(sub))
sid = sub.get("submission_id")
check("submission_id returned", bool(sid))
if sid:
    res = poll(sid)
    print("  final:", json.dumps({k:v for k,v in res.items() if k!="test_cases"}))
    check("status=COMPLETED", res.get("status")=="COMPLETED", res.get("status"))
    check("verdict=AC", res.get("verdict")=="AC", res.get("verdict"))
    tcs = res.get("test_cases",[])
    passed = sum(1 for t in tcs if t.get("passed"))
    check(f"all TCs passed", passed==len(tcs), f"{passed}/{len(tcs)}")

print("\n" + "="*60)
print("  STEP 4 - C++ WRONG, Run + Submit")
print("="*60)
rw = api("POST", "/problems/two-sum/run", {"language":"cpp","source_code":CPP_WRONG,"stdin":STDIN})
print("  run response:", json.dumps(rw))
check("run doesn't crash (not CE/internal)", rw.get("verdict") in ("OK","WA","RE"), rw.get("verdict"))

sw = api("POST", "/problems/two-sum/submit", {"language":"cpp","source_code":CPP_WRONG})
sid_w = sw.get("submission_id")
if sid_w:
    rw2 = poll(sid_w)
    print("  final:", json.dumps({k:v for k,v in rw2.items() if k!="test_cases"}))
    check("status=COMPLETED (no crash)", rw2.get("status")=="COMPLETED", rw2.get("status"))
    check("verdict=WA (not AC)", rw2.get("verdict")=="WA", rw2.get("verdict"))

print("\n" + "="*60)
print("  STEP 5a - Python correct, Run + Submit")
print("="*60)
rp = api("POST", "/problems/two-sum/run", {"language":"python","source_code":PYTHON_CORRECT,"stdin":STDIN})
print("  run response:", json.dumps(rp))
check("Python run OK", rp.get("verdict")=="OK", rp.get("verdict"))
check("Python stdout=[0,1]", any(e in (rp.get("stdout") or "") for e in EXPECTED), repr(rp.get("stdout")))

sp = api("POST", "/problems/two-sum/submit", {"language":"python","source_code":PYTHON_CORRECT})
sid_p = sp.get("submission_id")
if sid_p:
    rp2 = poll(sid_p)
    print("  final:", json.dumps({k:v for k,v in rp2.items() if k!="test_cases"}))
    check("Python COMPLETED", rp2.get("status")=="COMPLETED", rp2.get("status"))
    check("Python verdict=AC", rp2.get("verdict")=="AC", rp2.get("verdict"))

print("\n" + "="*60)
print("  STEP 5b - Java correct, Run + Submit")
print("="*60)
rj = api("POST", "/problems/two-sum/run", {"language":"java","source_code":JAVA_CORRECT,"stdin":STDIN})
print("  run response:", json.dumps(rj))
check("Java run OK", rj.get("verdict")=="OK", rj.get("verdict"))
check("Java stdout=[0,1]", any(e in (rj.get("stdout") or "") for e in EXPECTED), repr(rj.get("stdout")))

sj = api("POST", "/problems/two-sum/submit", {"language":"java","source_code":JAVA_CORRECT})
sid_j = sj.get("submission_id")
if sid_j:
    rj2 = poll(sid_j, timeout=120)
    print("  final:", json.dumps({k:v for k,v in rj2.items() if k!="test_cases"}))
    check("Java COMPLETED", rj2.get("status")=="COMPLETED", rj2.get("status"))
    check("Java verdict=AC", rj2.get("verdict")=="AC", rj2.get("verdict"))

print("\n" + "="*60)
print("  DB verification")
print("="*60)
q = "SELECT language, verdict, COUNT(*) FROM submissions GROUP BY language, verdict ORDER BY language;"
out = subprocess.run(["docker","exec","apexjudge-postgres","psql","-U","apexjudge","-d","apexjudge","-c",q], capture_output=True, text=True)
print(out.stdout)

print("="*60 + "\n")
