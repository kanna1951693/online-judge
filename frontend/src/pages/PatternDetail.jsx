import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Code2, Layers, BookOpen, ExternalLink, Clock, CheckCircle2 } from 'lucide-react'

// Comprehensive mock repository of python + cpp code and steps for key patterns.
const PATTERN_RESOURCES = {
  'two-sum': {
    title: 'Two Sum',
    category: 'Arrays & Hashing',
    difficulty: 'Easy',
    time: 'O(n)',
    space: 'O(n)',
    description: 'Find two numbers that add up to target. Use a hash map to look up the complement in O(1).',
    leetcode: 'https://leetcode.com/problems/two-sum/',
    code: {
      python: `def twoSum(nums, target):
    seen = {} # val -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`
    },
    notes: 'Classic space-time tradeoff. Storing elements in hash map enables O(1) searches. Ensure we do not use the same element twice.',
    vizData: {
      array: [2, 7, 11, 15],
      target: 9,
      steps: [
        { index: 0, val: 2, comp: 7, seen: {}, found: false, desc: "Step 1: Check val=2. Complement target - 2 = 7. Not in hashmap. Insert 2 -> index 0." },
        { index: 1, val: 7, comp: 2, seen: {"2": 0}, found: true, desc: "Step 2: Check val=7. Complement target - 7 = 2. Found 2 at index 0! Return [0, 1]." }
      ]
    }
  },
  'binary-search': {
    title: 'Binary Search',
    category: 'Sorting & Search',
    difficulty: 'Easy',
    time: 'O(log n)',
    space: 'O(1)',
    description: 'Find a target value in a sorted array by repeatedly dividing the search interval in half.',
    leetcode: 'https://leetcode.com/problems/binary-search/',
    code: {
      python: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1`,
      cpp: `int search(vector<int>& nums, int target) {
    int l = 0, r = nums.size() - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}`
    },
    notes: 'Ensure boundary updates (mid + 1, mid - 1) to avoid infinite loops. To prevent integer overflow in languages like C++, use: l + (r - l) / 2.',
    vizData: {
      array: [1, 3, 5, 7, 9, 11, 13],
      target: 9,
      steps: [
        { l: 0, r: 6, mid: 3, val: 7, desc: "Step 1: l=0, r=6. mid=3 (val=7). Since 7 < target (9), set l = mid + 1 (4)." },
        { l: 4, r: 6, mid: 5, val: 11, desc: "Step 2: l=4, r=6. mid=5 (val=11). Since 11 > target (9), set r = mid - 1 (4)." },
        { l: 4, r: 4, mid: 4, val: 9, desc: "Step 3: l=4, r=4. mid=4 (val=9). Target found at index 4!" }
      ]
    }
  },
  '3sum': {
    title: 'Three Sum',
    category: 'Two Pointers',
    difficulty: 'Medium',
    time: 'O(n²)',
    space: 'O(1)',
    description: 'Find all unique triplets in an array that sum to zero. Sort array, fix one element, use two pointers for the rest.',
    leetcode: 'https://leetcode.com/problems/3sum/',
    code: {
      python: `def threeSum(nums):
    nums.sort()
    res = []
    for i, a in enumerate(nums):
        if i > 0 and a == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            three_sum = a + nums[l] + nums[r]
            if three_sum > 0:
                r -= 1
            elif three_sum < 0:
                l += 1
            else:
                res.append([a, nums[l], nums[r]])
                l += 1
                while nums[l] == nums[l - 1] and l < r:
                    l += 1
    return res`,
      cpp: `vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;
    for (int i = 0; i < nums.size(); ++i) {
        if (i > 0 && nums[i] == nums[i-1]) continue;
        int l = i + 1, r = nums.size() - 1;
        while (l < r) {
            int sum = nums[i] + nums[l] + nums[r];
            if (sum > 0) r--;
            else if (sum < 0) l++;
            else {
                res.push_back({nums[i], nums[l], nums[r]});
                l++;
                while (nums[l] == nums[l-1] && l < r) l++;
            }
        }
    }
    return res;
}`
    },
    notes: 'Sorting is essential to skip duplicates easily. Skipping duplicates on both left pointer and the initial index is critical to avoid duplicate entries in result.',
    vizData: {
      array: [-4, -1, -1, 0, 1, 2],
      target: 0,
      steps: [
        { i: 0, val_i: -4, l: 1, r: 5, sum: -3, action: "i=0 (val=-4). Pointer l=1 (-1), r=5 (2). Sum = -3 < 0. Advance left pointer.", active: [0, 1, 5] },
        { i: 0, val_i: -4, l: 2, r: 5, sum: -3, action: "i=0. l=2 (-1), r=5 (2). Sum = -3 < 0. Advance left pointer.", active: [0, 2, 5] },
        { i: 1, val_i: -1, l: 2, r: 5, sum: 0, action: "i=1 (val=-1). Pointer l=2 (-1), r=5 (2). Sum = 0. Found triplet [-1, -1, 2]!", active: [1, 2, 5] },
        { i: 1, val_i: -1, l: 3, r: 4, sum: 0, action: "i=1. l=3 (0), r=4 (1). Sum = 0. Found triplet [-1, 0, 1]!", active: [1, 3, 4] }
      ]
    }
  },
  'best-stock': {
    title: 'Best Time to Buy Stock',
    category: 'Sliding Window',
    difficulty: 'Easy',
    time: 'O(n)',
    space: 'O(1)',
    description: 'Track running minimum price of stock. Update global max profit when selling on subsequent days.',
    leetcode: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    code: {
      python: `def maxProfit(prices):
    min_price = float('inf')
    max_prof = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_prof:
            max_prof = price - min_price
    return max_prof`,
      cpp: `int maxProfit(vector<int>& prices) {
    int min_price = INT_MAX;
    int max_prof = 0;
    for (int p : prices) {
        min_price = min(min_price, p);
        max_prof = max(max_prof, p - min_price);
    }
    return max_prof;
}`
    },
    notes: 'Single pass solution. Think of it as a sliding window where the left edge resets to the cheapest buying opportunity seen.',
    vizData: {
      array: [7, 1, 5, 3, 6, 4],
      steps: [
        { idx: 0, val: 7, min: 7, profit: 0, desc: "Step 1: price=7. Initial min_price=7. Profit=0." },
        { idx: 1, val: 1, min: 1, profit: 0, desc: "Step 2: price=1. Found new min_price=1. Profit=0." },
        { idx: 2, val: 5, min: 1, profit: 4, desc: "Step 3: price=5. profit = 5 - 1 = 4. Update max_prof = 4." },
        { idx: 4, val: 6, min: 1, profit: 5, desc: "Step 5: price=6. profit = 6 - 1 = 5. Update max_prof = 5." }
      ]
    }
  },
  'reverse-ll': {
    title: 'Reverse Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    time: 'O(n)',
    space: 'O(1)',
    description: 'Swap link pointers in-place iteratively using prev, curr, and next tracking pointers.',
    leetcode: 'https://leetcode.com/problems/reverse-linked-list/',
    code: {
      python: `def reverseList(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      cpp: `ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr) {
        ListNode* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`
    },
    notes: 'Iterative swap is space-safe. If doing recursively, watch out for call stack depth limits.',
    vizData: {
      nodes: [1, 2, 3, 4],
      steps: [
        { curr: 0, prev: -1, links: [1, 2, 3], desc: "Start: curr=1, prev=null. Temp store next=2." },
        { curr: 1, prev: 0, links: [-1, 2, 3], desc: "Point 1 -> null. Update prev=1, curr=2." },
        { curr: 2, prev: 1, links: [-1, 0, 3], desc: "Point 2 -> 1. Update prev=2, curr=3." },
        { curr: 3, prev: 2, links: [-1, 0, 1], desc: "Point 3 -> 2. Update prev=3, curr=null. Done!" }
      ]
    }
  }
}

// Fallback visualizer if selected pattern is not specifically mocked
const DEFAULT_RESOURCES = {
  title: 'DSA Technique Detail',
  category: 'General',
  difficulty: 'Medium',
  time: 'O(n)',
  space: 'O(1)',
  description: 'Select an interactive algorithm from the DSA Mind Map to review detailed visual execution flow, python/C++ implementation code, and notes.',
  leetcode: '#',
  code: {
    python: `# Choose a pattern from the map to inspect code.`,
    cpp: `// Choose a pattern from the map to inspect code.`
  },
  notes: 'Select nodes in the categories to view exact complexity and code structures.',
  vizData: {
    array: [1, 2, 3, 4, 5],
    steps: [{ desc: "Demonstration view. Click a pattern card from arrays, sliding window, two pointers, etc." }]
  }
}

export default function PatternDetail({ patternId, onBack, dark }) {
  const data = PATTERN_RESOURCES[patternId] || DEFAULT_RESOURCES
  const [activeTab, setActiveTab] = useState('viz')
  const [lang, setLang] = useState('python')
  const [stepIdx, setStepIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef(null)

  const steps = data.vizData.steps
  const currentStep = steps[stepIdx] || steps[0]

  useEffect(() => {
    setStepIdx(0)
    setIsPlaying(false)
  }, [patternId])

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 2000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, steps])

  const nextStep = () => {
    if (stepIdx < steps.length - 1) setStepIdx(prev => prev + 1)
  }

  const prevStep = () => {
    if (stepIdx > 0) setStepIdx(prev => prev - 1)
  }

  const resetViz = () => {
    setStepIdx(0)
    setIsPlaying(false)
  }

  const renderVizComponent = () => {
    if (patternId === 'two-sum') {
      const arr = data.vizData.array
      const activeIdx = currentStep.index
      const seen = currentStep.seen
      return (
        <div className="flex flex-col gap-6 w-full items-center p-4">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-mono text-[var(--text-muted)]">Target Sum:</span>
            <span className="text-xs font-mono font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-md">
              {data.vizData.target}
            </span>
          </div>

          {/* Array visualization */}
          <div className="flex gap-2">
            {arr.map((val, idx) => {
              const isActive = idx === activeIdx
              const isSeen = seen[val.toString()] !== undefined
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isActive
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)] scale-110 shadow-md'
                        : isSeen
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                    }`}
                  >
                    {val}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1.5">i={idx}</span>
                </div>
              )
            })}
          </div>

          {/* Hash map visualizer */}
          <div className="w-full max-w-xs border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)] overflow-hidden shadow-sm">
            <div className="px-3 py-1.5 border-b border-[var(--border)] bg-[var(--bg-surface)] text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              HashMap (Seen Value → Index)
            </div>
            <div className="p-3 flex flex-col gap-1.5 min-h-[60px] justify-center">
              {Object.keys(seen).length === 0 ? (
                <span className="text-xs text-[var(--text-muted)] text-center font-mono italic">Empty {}</span>
              ) : (
                Object.entries(seen).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg text-xs font-mono">
                    <span className="text-[var(--text-secondary)]">key: {k}</span>
                    <span className="text-[var(--accent)] font-bold">idx: {v}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )
    }

    if (patternId === 'binary-search') {
      const arr = data.vizData.array
      const { l, r, mid } = currentStep
      return (
        <div className="flex flex-col gap-5 w-full items-center p-4">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-mono text-[var(--text-muted)]">Looking for:</span>
            <span className="text-xs font-mono font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-md">
              {data.vizData.target}
            </span>
          </div>

          <div className="flex gap-1.5 flex-wrap justify-center">
            {arr.map((val, idx) => {
              const isMid = idx === mid
              const inRange = idx >= l && idx <= r
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-11 h-11 rounded-lg border flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isMid
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white scale-110 shadow-md shadow-sky-500/20'
                        : inRange
                        ? 'border-[var(--accent)]/40 bg-[var(--accent-subtle)]/30'
                        : 'border-[var(--border)] bg-[var(--bg-elevated)] opacity-35'
                    }`}
                  >
                    {val}
                  </div>
                  <div className="flex flex-col items-center mt-1 font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">
                    <span>{idx}</span>
                    {isMid && <span className="text-[var(--accent)] font-bold mt-0.5">mid</span>}
                    {idx === l && <span className="text-emerald-500 font-bold">L</span>}
                    {idx === r && <span className="text-rose-500 font-bold">R</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    if (patternId === '3sum') {
      const arr = data.vizData.array
      const active = currentStep.active || []
      return (
        <div className="flex flex-col gap-5 w-full items-center p-4">
          <div className="flex gap-2">
            {arr.map((val, idx) => {
              const isActive = active.includes(idx)
              const pointerLabel = active[0] === idx ? 'i' : active[1] === idx ? 'L' : active[2] === idx ? 'R' : ''
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isActive
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)] scale-110'
                        : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                    }`}
                  >
                    {val}
                  </div>
                  <div className="flex flex-col items-center font-mono text-[9px] mt-1">
                    <span className="text-[var(--text-muted)]">{idx}</span>
                    {pointerLabel && <span className="font-bold text-[var(--accent)] mt-0.5">{pointerLabel}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    if (patternId === 'best-stock') {
      const arr = data.vizData.array
      const activeIdx = currentStep.idx
      const runningMin = currentStep.min
      return (
        <div className="flex flex-col gap-6 w-full items-center p-4">
          <div className="flex items-end gap-1.5 h-36">
            {arr.map((val, idx) => {
              const isActive = idx === activeIdx
              const isMin = val === runningMin && idx <= activeIdx
              const height = (val / 8) * 100
              return (
                <div key={idx} className="flex flex-col items-center w-10">
                  <div className="text-[10px] font-mono text-[var(--text-muted)] mb-1">${val}</div>
                  <div
                    className={`w-5 rounded-t-md transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--accent)] shadow-lg shadow-sky-500/20'
                        : isMin
                        ? 'bg-emerald-500'
                        : 'bg-[var(--border)]'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-[9px] font-mono text-[var(--text-muted)] mt-1.5">D{idx+1}</div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-4 border border-[var(--border)] bg-[var(--bg-elevated)] p-2.5 rounded-xl text-xs font-mono shadow-sm">
            <div>Min Price: <span className="text-emerald-500 font-bold">${runningMin}</span></div>
            <div className="border-l border-[var(--border)] pl-4">Max Profit: <span className="text-[var(--accent)] font-bold">${currentStep.profit}</span></div>
          </div>
        </div>
      )
    }

    if (patternId === 'reverse-ll') {
      const nodes = data.vizData.nodes
      const { curr, prev, links } = currentStep
      return (
        <div className="flex flex-col gap-6 w-full items-center p-4">
          <div className="flex items-center gap-4 flex-wrap justify-center min-h-[80px]">
            {nodes.map((val, idx) => {
              const isCurr = idx === curr
              const isPrev = idx === prev
              const linkTarget = links[idx] // Index of node it points to
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center font-bold text-xs transition-all duration-300 relative ${
                      isCurr
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)] scale-110'
                        : isPrev
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <span>{val}</span>
                    <span className="absolute -bottom-5 text-[8px] font-mono text-[var(--text-muted)]">
                      {isCurr ? 'curr' : isPrev ? 'prev' : ''}
                    </span>
                  </div>

                  {idx < nodes.length - 1 && (
                    <div className="flex items-center text-[var(--text-muted)] font-bold text-lg font-mono w-8 justify-center">
                      {linkTarget === -1 ? '∅' : linkTarget < idx ? '←' : '→'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Default basic list/index scanner
    const arr = data.vizData.array || [1, 2, 3, 4, 5]
    return (
      <div className="flex flex-col gap-4 w-full items-center p-4">
        <div className="flex gap-2">
          {arr.map((val, idx) => (
            <div
              key={idx}
              className="w-12 h-12 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-center font-bold text-sm text-[var(--text-primary)]"
            >
              {val}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-screen-md mx-auto py-6 px-4 fade-up">
      {/* Breadcrumb / Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer mb-5 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Mind Map
      </button>

      {/* Hero header */}
      <div className="border border-[var(--border)] bg-[var(--bg-elevated)] rounded-2xl p-5 mb-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)] font-bold">
              {data.category}
            </span>
            <span className="text-[var(--border)]">·</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              data.difficulty === 'Easy' ? 'text-emerald-500 bg-emerald-500/10' :
              data.difficulty === 'Medium' ? 'text-amber-500 bg-amber-500/10' :
              'text-red-500 bg-red-500/10'
            }`}>
              {data.difficulty}
            </span>
          </div>

          <a
            href={data.leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] hover:underline"
          >
            LeetCode Practice <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <h2 className="text-xl font-bold font-display text-[var(--text-primary)] mb-2">{data.title}</h2>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{data.description}</p>

        <div className="flex items-center gap-4 mt-4 border-t border-[var(--border)]/60 pt-3 text-[11px] font-mono text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> Time: {data.time}
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[var(--accent)]" /> Space: {data.space}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] mb-4">
        <button
          onClick={() => setActiveTab('viz')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'viz'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Visualization
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'code'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Code Snippets
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Key Notes
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="min-h-[260px] flex flex-col">
        {activeTab === 'viz' && (
          <div className="border border-[var(--border)] rounded-2xl bg-[var(--bg-elevated)] overflow-hidden shadow-sm flex-1 flex flex-col">
            {/* Visual area */}
            <div className="p-6 flex-1 flex items-center justify-center border-b border-[var(--border)]/60 bg-[var(--bg-surface)]/25">
              {renderVizComponent()}
            </div>

            {/* Steps panel / Controls */}
            <div className="p-4 bg-[var(--bg-surface)]/45">
              <p className="text-xs text-[var(--text-primary)] font-semibold leading-relaxed mb-4 min-h-[36px] bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border)] shadow-inner">
                {currentStep.desc || currentStep.action}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  Step {stepIdx + 1} of {steps.length}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={resetViz}
                    className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={prevStep}
                    disabled={stepIdx === 0}
                    className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3 h-3" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-white" /> Play
                      </>
                    )}
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={stepIdx === steps.length - 1}
                    className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="border border-[var(--border)] rounded-2xl bg-[var(--bg-elevated)] overflow-hidden shadow-sm flex flex-col flex-1">
            <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-surface)] flex gap-2">
              <button
                onClick={() => setLang('python')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  lang === 'python'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setLang('cpp')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  lang === 'cpp'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                C++
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[11px] font-mono text-[var(--text-primary)] bg-[var(--bg-surface)]/20 flex-1 leading-relaxed selection:bg-[var(--accent)]/30">
              <code>{data.code[lang]}</code>
            </pre>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="border border-[var(--border)] rounded-2xl p-5 bg-[var(--bg-elevated)] shadow-sm flex-1 leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent)] mb-3">Pitfalls & Interview Key Points</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{data.notes}</p>

            <div className="flex flex-col gap-2.5 mt-5 border-t border-[var(--border)]/60 pt-4">
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-[var(--text-secondary)]">Optimise duplicate comparisons early.</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-[var(--text-secondary)]">Verify indices stay cleanly bound and avoid overflow.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
