import React from 'react'
import { Sparkles, Terminal, Shield, HelpCircle, ArrowRight, Grid, Layers, ArrowUpRight, Zap, Code2, Database } from 'lucide-react'

export default function DsaCheatsheet({ dark }) {
  const patternTips = [
    { text: "Can't figure out the approach? Try brute force first, then optimize.", color: 'var(--accent)' },
    { text: "See 'sorted'? Think binary search or two pointers.", color: 'var(--accent)' },
    { text: "See 'subarray' or 'substring'? Think sliding window or prefix sum.", color: 'var(--accent)' },
    { text: "See 'top K' or 'Kth'? Think heap (priority queue).", color: 'var(--accent)' },
    { text: "See 'tree'? Think recursion (DFS) or queue (BFS).", color: 'var(--accent)' },
    { text: "See 'graph + shortest path'? Unweighted → BFS. Weighted → Dijkstra.", color: 'var(--accent)' },
    { text: "See 'all possibilities'? Think backtracking.", color: 'var(--accent)' },
    { text: "See 'overlapping subproblems'? Think Dynamic Programming.", color: 'var(--accent)' },
    { text: "See 'parentheses' or 'nesting'? Think stack.", color: 'var(--accent)' },
    { text: "See 'connected components'? Think Union Find or DFS.", color: 'var(--accent)' },
    { text: "Always clarify: input size, edge cases, sorted?, duplicates?, negative numbers?", color: 'var(--accent)' },
    { text: "Time complexity: nested loops = O(n²). Halving = O(log n). Both = O(n log n).", color: 'var(--accent)' }
  ]

  const dsComplexities = [
    { ds: 'Array', access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)' },
    { ds: 'Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)' },
    { ds: 'Hash Map', access: 'O(1)', search: 'O(1)', insert: 'O(1)', delete: 'O(1)' },
    { ds: 'BST (balanced)', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)' },
    { ds: 'Heap (top/pop)', access: 'O(1) / O(log n)', search: 'O(n)', insert: 'O(log n)', delete: 'O(log n)' },
    { ds: 'Stack / Queue', access: 'O(1) (top)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)' },
    { ds: 'Trie', access: '—', search: 'O(L)', insert: 'O(L)', delete: 'O(L)' },
  ]

  const sortAlgorithms = [
    { name: 'Quick Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: 'No' },
    { name: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: 'Yes' },
    { name: 'Heap Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: 'No' },
    { name: 'Bubble Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Yes' },
    { name: 'Insertion Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Yes' },
    { name: 'Counting Sort', best: 'O(n + k)', avg: 'O(n + k)', worst: 'O(n + k)', space: 'O(n + k)', stable: 'Yes' },
  ]

  const summaryPatterns = [
    {
      cat: 'Arrays & Hashing',
      items: [
        { name: 'Sliding Window', use: 'Contiguous subarray/substring with a condition', idea: 'Expand right, shrink left. Track window state.', time: 'O(n)' },
        { name: 'Two Pointer', use: 'Sorted array, pair/triplet problems', idea: 'Converge from ends or same direction. Eliminate half.', time: 'O(n)' },
        { name: 'Prefix Sum', use: 'Range sum queries, subarray sum = K', idea: 'prefix[j] − prefix[i] = sum(i..j). HashMap for O(n).', time: 'O(n)' },
        { name: 'Kadane\'s', use: 'Max subarray sum', idea: 'curr = max(num, curr + num). Track global max.', time: 'O(n)' },
        { name: 'Binary Search', use: 'Sorted data, monotonic condition', idea: 'Halve search space. Works on answer space.', time: 'O(log n)' },
        { name: 'Intervals', use: 'Overlapping ranges, scheduling', idea: 'Sort by start/end. Merge or sweep line.', time: 'O(n log n)' }
      ]
    },
    {
      cat: 'Strings',
      items: [
        { name: 'Frequency Map', use: 'Anagram, character count problems', idea: 'int[26] array for lowercase English letters. O(1) space.', time: 'O(n)' },
        { name: 'Sliding Window', use: 'Substring with constraints', idea: 'Expand right, contract left when count constraints violated.', time: 'O(n)' },
        { name: 'Palindrome', use: 'Find palindromic substrings', idea: 'Expand around centers (both single characters and spaces).', time: 'O(n²)' },
        { name: 'KMP / Z-Array', use: 'Pattern matching in text', idea: 'Preprocess pattern to build prefix lookup, skipping repeat shifts.', time: 'O(n + m)' }
      ]
    },
    {
      cat: 'Hash Maps',
      items: [
        { name: 'Two Sum / Complement', use: 'Find index pair summing to target', idea: 'Check target - x in map. Store index on mismatch.', time: 'O(n)' },
        { name: 'Frequency Sort', use: 'Top K, majority element, duplicate checks', idea: 'Frequency counting map combined with min-heap or bucket sort.', time: 'O(n)' },
        { name: 'LRU Cache', use: 'O(1) get/put caching with eviction', idea: 'Combine HashMap for O(1) lookup with doubly-linked list for order.', time: 'O(1)' }
      ]
    },
    {
      cat: 'Stacks',
      items: [
        { name: 'Monotonic Stack', use: 'Next greater/smaller elements, temperatures', idea: 'Push indices onto stack. Pop when current element breaks monotonicity.', time: 'O(n)' },
        { name: 'Parentheses Match', use: 'Bracket matching, nested tags', idea: 'Push opening brackets, pop and compare on closing. Stack must be empty.', time: 'O(n)' },
        { name: 'Expression Eval', use: 'Calculators, reverse polish notation (RPN)', idea: 'Operands onto stack. Operators pop two, compute, push back.', time: 'O(n)' }
      ]
    },
    {
      cat: 'Trees & BSTs',
      items: [
        { name: 'DFS Traversal', use: 'Deep search, node heights, symmetry checks', idea: 'Recursive Pre/In/Post order scans. Solve left & right, bubble up.', time: 'O(n)' },
        { name: 'BFS Traversal', use: 'Level order nodes, shortest root-to-leaf path', idea: 'Queue-based scan processing elements level-by-level.', time: 'O(n)' },
        { name: 'BST Operations', use: 'Sorted lookup, range query', idea: 'Left child < root < right child. Inorder traversal visits in order.', time: 'O(h)' },
        { name: 'Tree Paths', use: 'Max path sum, diameter of binary tree', idea: 'At each node, combine left + right results. Return single path up.', time: 'O(n)' }
      ]
    },
    {
      cat: 'Graphs',
      items: [
        { name: 'BFS Shortest Path', use: 'Shortest path on unweighted graphs', idea: 'Queue base. Set visited on insertion to avoid cycles.', time: 'O(V + E)' },
        { name: 'DFS Connection', use: 'Connected components, reachability, cycle detection', idea: 'Recursion with tracking visited/active stack states.', time: 'O(V + E)' },
        { name: 'Topological Sort', use: 'Course scheduling, task compilation DAG', idea: 'Kahn\'s BFS (in-degree array) or DFS post-order trace.', time: 'O(V + E)' },
        { name: 'Dijkstra', use: 'Shortest path on weighted graphs (no negative weights)', idea: 'Min-priority queue containing current minimum distances.', time: 'O(E log V)' },
        { name: 'Union Find (DSU)', use: 'Redundant connections, dynamic equivalence components', idea: 'Representative parent array with path compression + union by rank.', time: 'O(α(n))' }
      ]
    },
    {
      cat: 'Dynamic Programming',
      items: [
        { name: '1D State Space', use: 'Fibonacci, house robber, stair steps', idea: 'dp[i] depends on subset of previous. Optimize space using pointers.', time: 'O(n)' },
        { name: '2D Sequence Match', use: 'LCS, edit distance, grid traversals', idea: 'Matrix grid. Transition states based on match vs mismatch rules.', time: 'O(n·m)' },
        { name: 'Longest Subsequence', use: 'LIS (Longest Increasing Subsequence)', idea: 'O(n²) standard DP or O(n log n) with binary search (patience sort).', time: 'O(n log n)' },
        { name: 'Knapsack Choices', use: 'Maximize profit with weight limits', idea: '0/1 (subset check backwards) or Unbounded (forward checks).', time: 'O(n·W)' },
        { name: 'State Machines', use: 'Stock market runs with cooldown days', idea: 'Define states (buy, sell, hold, rest). Maintain transition states.', time: 'O(n)' }
      ]
    },
    {
      cat: 'Heaps & Priority',
      items: [
        { name: 'Top K Elements', use: 'Find K largest/smallest elements', idea: 'Build min-heap of size K. Keep top elements, pop smallest.', time: 'O(n log k)' },
        { name: 'Two Heaps', use: 'Dynamic streaming median tracking', idea: 'Max-heap (lower half) & min-heap (upper half). Rebalance size.', time: 'O(log n) / add' },
        { name: 'K-Way Merge', use: 'Merge K sorted arrays or lists', idea: 'Push heads of K lists into min-heap. Pop, append, push next head.', time: 'O(n log k)' }
      ]
    },
    {
      cat: 'Recursion & Backtracking',
      items: [
        { name: 'Subset Creation', use: 'Generate all combinations or power set', idea: 'Include element or skip it recursively. Leaf results collected.', time: 'O(2ⁿ)' },
        { name: 'Permutations', use: 'Find all possible ordering lists', idea: 'Iterate unused elements, recurse, back-swap elements.', time: 'O(n!)' },
        { name: 'Grid Constraints', use: 'N-Queens, sudoku solvers', idea: 'Recurse and check validity. Return false to trigger backtracking.', time: 'Exponential' }
      ]
    },
    {
      cat: 'Greedy Algorithms',
      items: [
        { name: 'Interval Scheduling', use: 'Pick maximum mutually exclusive intervals', idea: 'Sort intervals by end time. Always pick earliest ending.', time: 'O(n log n)' },
        { name: 'Jump Index Game', use: 'Reach final index with variable leaps', idea: 'Track maximum target reachable index from active point.', time: 'O(n)' }
      ]
    },
    {
      cat: 'Bit Manipulation',
      items: [
        { name: 'XOR Operations', use: 'Find single non-repeating number', idea: 'XOR cancels identical numbers (x ^ x = 0). O(1) space.', time: 'O(n)' },
        { name: 'Kernighan\'s Trick', use: 'Counting active set bits', idea: 'Formula (n & (n - 1)) clears the lowest set bit in O(1).', time: 'O(set bits)' }
      ]
    },
    {
      cat: 'Tries',
      items: [
        { name: 'Prefix Search', use: 'Word dictionaries, search autocompletes', idea: 'Character node links. Fast checks without hashing strings.', time: 'O(L) per op' }
      ]
    }
  ]

  return (
    <div className="w-full flex flex-col gap-8 max-w-screen-lg mx-auto py-8 px-4 fade-up">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-4">
        <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] font-display tracking-tight mb-2">
          DSA Interview <span className="gradient-text">Cheatsheet</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed">
          Full data scraped from dsamindmap.com. Pattern recognition strategies, time/space tables, and sorting algorithms.
        </p>
      </div>

      {/* Pattern Recognition Grid */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)]">
          <Zap className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-bold tracking-wider uppercase text-[var(--text-primary)] font-display">Pattern Recognition Tips</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {patternTips.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]/30 hover:shadow-md transition-all duration-200"
            >
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-white flex-shrink-0"
                style={{ background: tip.color }}
              >
                {idx + 1}
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">{tip.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Patterns summary tables */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)]">
          <Code2 className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-bold tracking-wider uppercase text-[var(--text-primary)] font-display">All Patterns at a Glance</h2>
        </div>
        <div className="flex flex-col gap-4">
          {summaryPatterns.map((catGroup, groupIdx) => (
            <div key={groupIdx} className="border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)] overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-surface)] flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)] font-mono uppercase tracking-wider">{catGroup.cat}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]/20 text-[10px] font-mono text-[var(--text-muted)]">
                      <th className="px-4 py-2 font-bold w-1/4">Pattern</th>
                      <th className="px-3 py-2 font-bold w-1/3">When to Use</th>
                      <th className="px-3 py-2 font-bold w-1/3">Key Idea</th>
                      <th className="px-4 py-2 font-bold w-24 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/60 text-xs">
                    {catGroup.items.map((item, itemIdx) => (
                      <tr key={itemIdx} className="hover:bg-[var(--bg-surface)]/20">
                        <td className="px-4 py-3 font-semibold text-[var(--accent)]">{item.name}</td>
                        <td className="px-3 py-3 text-[var(--text-secondary)] leading-relaxed">{item.use}</td>
                        <td className="px-3 py-3 text-[var(--text-muted)] leading-relaxed">{item.idea}</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-[var(--text-secondary)] text-right">{item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Structure Complexity */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)]">
          <Database className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-bold tracking-wider uppercase text-[var(--text-primary)] font-display">Data Structure Operations</h2>
        </div>
        <div className="border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)] text-[10px] font-mono text-[var(--text-muted)]">
                  <th className="px-4 py-3 font-bold">Data Structure</th>
                  <th className="px-3 py-3 font-bold text-center">Access</th>
                  <th className="px-3 py-3 font-bold text-center">Search</th>
                  <th className="px-3 py-3 font-bold text-center">Insertion</th>
                  <th className="px-4 py-3 font-bold text-center">Deletion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/60 text-xs">
                {dsComplexities.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-surface)]/20">
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{row.ds}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-center text-[var(--text-secondary)]">{row.access}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-center text-[var(--text-secondary)]">{row.search}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-center text-[var(--text-secondary)]">{row.insert}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-center text-[var(--text-secondary)]">{row.delete}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Sorting Complexities */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)]">
          <Grid className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-bold tracking-wider uppercase text-[var(--text-primary)] font-display">Sorting Algorithms Comparison</h2>
        </div>
        <div className="border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)] text-[10px] font-mono text-[var(--text-muted)]">
                  <th className="px-4 py-3 font-bold">Algorithm</th>
                  <th className="px-3 py-3 font-bold text-center">Best Case</th>
                  <th className="px-3 py-3 font-bold text-center">Average Case</th>
                  <th className="px-3 py-3 font-bold text-center">Worst Case</th>
                  <th className="px-3 py-3 font-bold text-center">Space Complexity</th>
                  <th className="px-4 py-3 font-bold text-center">Stable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/60 text-xs">
                {sortAlgorithms.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-surface)]/20">
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{row.name}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-center text-[var(--text-secondary)]">{row.best}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-center text-[var(--text-secondary)]">{row.avg}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-center text-[var(--text-secondary)]">{row.worst}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-center text-[var(--text-secondary)]">{row.space}</td>
                    <td className={`px-4 py-3 font-bold text-center ${row.stable === 'Yes' ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>{row.stable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
