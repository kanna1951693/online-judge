import React, { useState } from 'react'
import { Network, BookOpen, ExternalLink, HelpCircle, Lightbulb } from 'lucide-react'

const MIND_MAP_CATEGORIES = [
  // ── Left Side Categories (8 categories, x=380) ──
  {
    id: 'sliding',
    label: 'Sliding Window',
    side: 'left',
    x: 380,
    y: 80,
    color: '#0EA5E9',
    font: "'Outfit', 'Inter', sans-serif",
    description: 'Sliding window optimizes subarray scans by maintaining a subset of elements in a range. Instead of nested loops, you slide pointers to adjust borders.',
    insight: 'Use for contiguous subarrays or substrings where you want to find a maximum, minimum, or target pattern matching constraints.',
    problems: ['Longest Substring Without Repeats', 'Minimum Window Substring', 'Max Sliding Window'],
    subCategories: [
      {
        id: 'sliding-fixed',
        label: 'Fixed Window',
        patterns: [
          { id: 'best-stock', label: 'Best Stock Time' }
        ]
      },
      {
        id: 'sliding-variable',
        label: 'Variable Window',
        patterns: [
          { id: 'longest-substr', label: 'Longest Substring' },
          { id: 'min-window-substr', label: 'Min Window Substr' }
        ]
      }
    ]
  },
  {
    id: 'twoptr',
    label: 'Two Pointers',
    side: 'left',
    x: 380,
    y: 190,
    color: '#38BDF8',
    font: "'Playfair Display', Georgia, serif",
    description: 'Two pointers traverse sorted data from opposite directions or identical direction with divergent speeds to avoid expensive lookup matrices.',
    insight: 'Think of this first whenever input arrays are sorted and you are searching for binary pairs or triplets.',
    problems: ['Three Sum', 'Container With Most Water', 'Trapping Rain Water'],
    subCategories: [
      {
        id: 'twoptr-converge',
        label: 'Converging Pointers',
        patterns: [
          { id: '3sum', label: 'Three Sum' },
          { id: 'container-water', label: 'Container Water' }
        ]
      },
      {
        id: 'twoptr-fastslow',
        label: 'Fast & Slow Pointers',
        patterns: [
          { id: 'trapping-rain', label: 'Trapping Rain' }
        ]
      }
    ]
  },
  {
    id: 'linkedlist',
    label: 'Linked Lists',
    side: 'left',
    x: 380,
    y: 300,
    color: '#2563EB',
    font: "'Fira Code', monospace",
    description: 'Linked Lists involve manipulating nodes, reversing pointer directions, interleaving halves, or measuring loops using pointer ratios.',
    insight: 'Use slow/fast runner pointers to detect cycles and middle boundaries, and store auxiliary nodes to handle merging.',
    problems: ['Reverse Linked List', 'Merge K Sorted Lists', 'Linked List Cycle II'],
    subCategories: [
      {
        id: 'linkedlist-swap',
        label: 'Pointers Swap',
        patterns: [
          { id: 'reverse-ll', label: 'Reverse List' },
          { id: 'cycle-detect', label: 'Cycle Detect' }
        ]
      }
    ]
  },
  {
    id: 'dp',
    label: 'Dynamic Programming',
    side: 'left',
    x: 380,
    y: 410,
    color: '#FCA311',
    font: "'Cabinet Grotesk', sans-serif",
    description: 'Dynamic Programming simplifies complex operations by storing solutions to overlapping subproblems in 1D/2D table matrices.',
    insight: 'If a problem has optimal substructure and you choose to make a decision at each index, DP is your core solution.',
    problems: ['Climbing Stairs', 'Coin Change', 'Longest Increasing Subsequence'],
    subCategories: [
      {
        id: 'dp-1d',
        label: '1D State Space',
        patterns: [
          { id: 'climbing-stairs', label: 'Climbing Stairs' }
        ]
      },
      {
        id: 'dp-2d',
        label: '2D Sequence Match',
        patterns: [
          { id: 'coin-change', label: 'Coin Change' }
        ]
      }
    ]
  },
  {
    id: 'stack',
    label: 'Stack',
    side: 'left',
    x: 380,
    y: 520,
    color: '#10B981',
    font: "'Courier New', monospace",
    description: 'Stacks enforce LIFO (Last In First Out) order. They are perfect for nesting, recursive backtracking traces, and monotonic scans.',
    insight: 'If you need to match open/close boundaries or find the next greater element in linear time, think Monotonic Stack.',
    problems: ['Valid Parentheses', 'Daily Temperatures', 'Largest Rectangle in Histogram'],
    subCategories: [
      {
        id: 'stack-monotonic',
        label: 'Monotonic Stack',
        patterns: [
          { id: 'valid-parentheses', label: 'Valid Brackets' }
        ]
      }
    ]
  },
  {
    id: 'queue',
    label: 'Queue / Deque',
    side: 'left',
    x: 380,
    y: 630,
    color: '#EC4899',
    font: "'Outfit', 'Inter', sans-serif",
    description: 'Queues maintain FIFO ordering. Double-ended queues (Deques) allow insertions and deletions at both ends in constant time.',
    insight: 'Use Deques to solve sliding window extremum bounds or maintain sorted window ranges.',
    problems: ['Sliding Window Maximum', 'Design Circular Queue'],
    subCategories: [
      {
        id: 'queue-deque',
        label: 'Deque Operations',
        patterns: [
          { id: 'sliding-max', label: 'Sliding Window Max' }
        ]
      }
    ]
  },
  {
    id: 'matrix',
    label: 'Matrix',
    side: 'left',
    x: 380,
    y: 740,
    color: '#8B5CF6',
    font: "'Playfair Display', Georgia, serif",
    description: 'Matrix involves traversing 2D grid dimensions, rotating values, or tracking states using depth-first coordinates.',
    insight: 'Spot boundary conditions early. Use offsets arrays [[0,1],[1,0]] to search adjacent neighbors efficiently.',
    problems: ['Spiral Matrix', 'Rotate Image', 'Set Matrix Zeroes'],
    subCategories: [
      {
        id: 'matrix-traverse',
        label: 'Grid Traversal',
        patterns: [
          { id: 'spiral-matrix', label: 'Spiral Scan' }
        ]
      }
    ]
  },
  {
    id: 'recursion',
    label: 'Recursion',
    side: 'left',
    x: 380,
    y: 850,
    color: '#F43F5E',
    font: "'Fira Code', monospace",
    description: 'Recursion breaks functions into self-similar sub-executions. Use base states to trigger returns.',
    insight: 'Ensure base checks are defined at the very top of your stack to avoid overflow errors.',
    problems: ['Generate Parentheses', 'Subsets', 'Permutations'],
    subCategories: [
      {
        id: 'recursion-dfs',
        label: 'Backtracking Search',
        patterns: [
          { id: 'subsets', label: 'Subsets Gen' }
        ]
      }
    ]
  },

  // ── Right Side Categories (8 categories, x=800) ──
  {
    id: 'arrays',
    label: 'Array',
    side: 'right',
    x: 800,
    y: 80,
    color: '#FCA311',
    font: "'Outfit', 'Inter', sans-serif",
    description: 'Arrays store contiguous values. Typical techniques include complement hash mapping, prefix accumulations, and partitioning.',
    insight: 'Usually resolved using single-pass maps or running sums to avoid nested quadratic iterations.',
    problems: ['Two Sum', 'Contains Duplicate', 'Group Anagrams'],
    subCategories: [
      {
        id: 'arrays-hash',
        label: 'Complement / Hash',
        patterns: [
          { id: 'two-sum', label: 'Two Sum' },
          { id: 'contains-dup', label: 'Contains Dup' }
        ]
      },
      {
        id: 'arrays-freq',
        label: 'Frequency Count',
        patterns: [
          { id: 'top-k', label: 'Top K Frequent' }
        ]
      }
    ]
  },
  {
    id: 'trees',
    label: 'Trees',
    side: 'right',
    x: 800,
    y: 190,
    color: '#0EA5E9',
    font: "'Playfair Display', Georgia, serif",
    description: 'Tree structures organize nodes hierarchically. Traversing includes recursive post-order DFS and level-by-level BFS scans.',
    insight: 'Sub-problems resolve on children nodes. If children values can compute the node state, bubble it up.',
    problems: ['Invert Binary Tree', 'Validate BST', 'Lowest Common Ancestor'],
    subCategories: [
      {
        id: 'trees-dfs',
        label: 'DFS Traversals',
        patterns: [
          { id: 'invert-tree', label: 'Invert Binary' },
          { id: 'max-depth', label: 'Max Tree Depth' }
        ]
      }
    ]
  },
  {
    id: 'graphs',
    label: 'Graphs',
    side: 'right',
    x: 800,
    y: 300,
    color: '#38BDF8',
    font: "'Fira Code', monospace",
    description: 'Graphs model network links. Algorithms involve cycle scans, path minimization, topological sorts, and connectivity checks.',
    insight: 'Unweighted graphs utilize BFS for shortest path, weighted utilize Dijkstra, and DAGs use Topological sorting.',
    problems: ['Number of Islands', 'Course Schedule', 'Clone Graph'],
    subCategories: [
      {
        id: 'graphs-search',
        label: 'Path Solvers',
        patterns: [
          { id: 'num-islands', label: 'Islands Count' },
          { id: 'course-schedule', label: 'Topological Sort' }
        ]
      }
    ]
  },
  {
    id: 'sorting',
    label: 'Sorting',
    side: 'right',
    x: 800,
    y: 410,
    color: '#2563EB',
    font: "'Cabinet Grotesk', sans-serif",
    description: 'Sorting reorders items. Binary Search halves sorted search space in logarithmic time.',
    insight: 'Always verify if elements can be halved. Binary search operates even on sorted numeric result spans.',
    problems: ['Binary Search', 'Search in Rotated Sorted Array', 'Find Peak Element'],
    subCategories: [
      {
        id: 'sorting-binary',
        label: 'Binary Search Space',
        patterns: [
          { id: 'binary-search', label: 'Binary Search' },
          { id: 'search-rotated', label: 'Search Rotated' }
        ]
      }
    ]
  },
  {
    id: 'heap',
    label: 'Heap',
    side: 'right',
    x: 800,
    y: 520,
    color: '#10B981',
    font: "'Courier New', monospace",
    description: 'Heaps (priority queues) give O(1) access to maximum/minimum values. They are essential for merging and streaming metrics.',
    insight: 'Need K elements? A Min-Heap of size K will filter values in O(N log K) time.',
    problems: ['Kth Largest Element', 'Top K Frequent Elements', 'Find Median from Stream'],
    subCategories: [
      {
        id: 'heap-topk',
        label: 'Top K Elements',
        patterns: [
          { id: 'k-closest', label: 'K Closest' }
        ]
      }
    ]
  },
  {
    id: 'greedy',
    label: 'Greedy',
    side: 'right',
    x: 800,
    y: 630,
    color: '#EC4899',
    font: "'Outfit', 'Inter', sans-serif",
    description: 'Greedy algorithms construct solutions iteratively by choosing the locally optimal choice at each step.',
    insight: 'Sort tasks or intervals by boundaries first, then schedule greedily.',
    problems: ['Jump Game', 'Non-overlapping Intervals'],
    subCategories: [
      {
        id: 'greedy-scheduling',
        label: 'Interval Greedy',
        patterns: [
          { id: 'jump-game', label: 'Jump Index' }
        ]
      }
    ]
  },
  {
    id: 'bit',
    label: 'Bit Manipulation',
    side: 'right',
    x: 800,
    y: 740,
    color: '#8B5CF6',
    font: "'Playfair Display', Georgia, serif",
    description: 'Bit manipulation optimizes operations by performing boolean logic directly on register bit paths.',
    insight: 'Use XOR to eliminate mirrors, and checks like n & (n - 1) to clear bits.',
    problems: ['Single Number', 'Number of 1 Bits'],
    subCategories: [
      {
        id: 'bit-ops',
        label: 'Bitwise Math',
        patterns: [
          { id: 'single-number', label: 'Single Num' }
        ]
      }
    ]
  },
  {
    id: 'trie',
    label: 'Trie',
    side: 'right',
    x: 800,
    y: 850,
    color: '#F43F5E',
    font: "'Fira Code', monospace",
    description: 'Tries (Prefix Trees) organize strings by node branches representing characters.',
    insight: 'Excellent for dictionary lookups, autocomplete suggestions, and string search prefixes.',
    problems: ['Implement Trie', 'Design Add Search Word'],
    subCategories: [
      {
        id: 'trie-tree',
        label: 'Prefix Structure',
        patterns: [
          { id: 'implement-trie', label: 'Trie Build' }
        ]
      }
    ]
  }
]

export default function DsaMindMap({ onSelectPattern, dark }) {
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeSubCategory, setActiveSubCategory] = useState(null)

  const cx = 590
  const cy = 465

  const handleCategoryClick = (catId) => {
    setActiveCategory(prev => {
      if (prev === catId) {
        setActiveSubCategory(null)
        return null
      }
      setActiveSubCategory(null)
      return catId
    })
  }

  const handleSubCategoryClick = (subId) => {
    setActiveSubCategory(prev => prev === subId ? null : subId)
  }

  // Draw smooth cubic bezier curve
  const makeBezier = (x1, y1, x2, y2) => {
    const midX = (x1 + x2) / 2
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
  }

  const selectedCat = MIND_MAP_CATEGORIES.find(c => c.id === activeCategory)

  return (
    <div className="w-full flex flex-col gap-6 max-w-screen-xl mx-auto py-8 px-4 fade-up">
      {/* Page Title */}
      <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-2">
        <div className="w-10 h-10 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/15 mb-3 animate-pulse">
          <Network className="w-5 h-5" />
        </div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] leading-none mb-1.5">Free Learning Resource</p>
        <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)] font-display tracking-tight">
          DSA <span className="gradient-text">Interactive Map</span>
        </h2>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2 max-w-md">
          Explore all 16 categories with deep 3-level SVG branches. Click categories, expand sub-types, and click leaf nodes for code and visualization details.
        </p>
      </div>

      {/* Mind Map Grid Layout (SVG left, Info Card right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Big Mind Map SVG Container (col-span-8) */}
        <div className="lg:col-span-8 border border-[var(--border)] rounded-2xl bg-[var(--bg-elevated)] p-4 shadow-xl overflow-x-auto">
          <div className="min-w-[1100px] relative">
            <svg viewBox="0 0 1200 930" className="w-full h-auto select-none overflow-visible">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="#14213D" />
                </linearGradient>
              </defs>

              {/* Connecting paths with energy animation */}
              <g>
                {/* Level 1 Connections: Center -> Categories */}
                {MIND_MAP_CATEGORIES.map(cat => {
                  const isActive = activeCategory === cat.id
                  return (
                    <g key={cat.id}>
                      <path
                        d={makeBezier(cx, cy, cat.x, cat.y)}
                        fill="none"
                        stroke={isActive ? cat.color : 'var(--border)'}
                        strokeWidth={isActive ? 3.5 : 2}
                        className="transition-all duration-300 opacity-60"
                        filter={isActive ? "url(#glow)" : ""}
                      />
                      <path
                        d={makeBezier(cx, cy, cat.x, cat.y)}
                        fill="none"
                        stroke={cat.color}
                        strokeWidth={1.5}
                        strokeDasharray="8 8"
                        className="opacity-70"
                        style={{
                          animation: 'dashFlow 12s linear infinite'
                        }}
                      />
                    </g>
                  )
                })}

                {/* Level 2 Connections: Category -> Sub-Categories */}
                {MIND_MAP_CATEGORIES.map(cat => {
                  if (activeCategory !== cat.id) return null
                  return cat.subCategories.map((sub, sIdx) => {
                    const spacing = 75
                    const offset = (sIdx - (cat.subCategories.length - 1) / 2) * spacing
                    const targetX = cat.side === 'left' ? cat.x - 170 : cat.x + 170
                    const targetY = cat.y + offset
                    const isSubActive = activeSubCategory === sub.id
                    return (
                      <path
                        key={sub.id}
                        d={makeBezier(cat.x, cat.y, targetX, targetY)}
                        fill="none"
                        stroke={isSubActive ? cat.color : 'var(--border)'}
                        strokeWidth={isSubActive ? 2.8 : 1.8}
                        className="transition-all duration-200 opacity-80"
                        filter={isSubActive ? "url(#glow)" : ""}
                      />
                    )
                  })
                })}

                {/* Level 3 Connections: Sub-Category -> Patterns */}
                {MIND_MAP_CATEGORIES.map(cat => {
                  if (activeCategory !== cat.id) return null
                  return cat.subCategories.map((sub, sIdx) => {
                    if (activeSubCategory !== sub.id) return null
                    const spacing = 75
                    const sOffset = (sIdx - (cat.subCategories.length - 1) / 2) * spacing
                    const subX = cat.side === 'left' ? cat.x - 170 : cat.x + 170
                    const subY = cat.y + sOffset

                    return sub.patterns.map((p, pIdx) => {
                      const pSpacing = 50
                      const pOffset = (pIdx - (sub.patterns.length - 1) / 2) * pSpacing
                      const targetX = cat.side === 'left' ? subX - 150 : subX + 150
                      const targetY = subY + pOffset
                      return (
                        <path
                          key={p.id}
                          d={makeBezier(subX, subY, targetX, targetY)}
                          fill="none"
                          stroke={cat.color}
                          strokeWidth={2}
                          className="transition-all duration-200 opacity-90"
                          filter="url(#glow)"
                        />
                      )
                    })
                  })
                })}
              </g>

              {/* Central Main Node - Enlarged */}
              <g transform={`translate(${cx}, ${cy})`} className="cursor-default">
                <rect
                  x="-95"
                  y="-30"
                  width="190"
                  height="60"
                  rx="18"
                  fill="url(#centerGradient)"
                  stroke="var(--accent)"
                  strokeWidth="3.5"
                  className="shadow-lg filter drop-shadow-md"
                />
                <text
                  textAnchor="middle"
                  y="6"
                  className="text-[15px] font-black tracking-wider fill-white font-mono"
                >
                  &gt; | &lt;
                </text>
              </g>

              {/* Category Nodes (Level 1) - Enlarged */}
              {MIND_MAP_CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id
                return (
                  <g
                    key={cat.id}
                    transform={`translate(${cat.x}, ${cat.y})`}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="cursor-pointer group"
                  >
                    <rect
                      x="-90"
                      y="-22"
                      width="180"
                      height="44"
                      rx="14"
                      fill="var(--bg-base)"
                      stroke={isActive ? cat.color : 'var(--border)'}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      className="transition-all duration-200 group-hover:scale-[1.03] group-hover:stroke-[var(--accent)]"
                      style={{
                        filter: isActive ? `drop-shadow(0 0 8px ${cat.color})` : 'none'
                      }}
                    />
                    <circle cx="-70" cy="0" r="5" fill={cat.color} className="animate-pulse" />
                    <text
                      textAnchor="middle"
                      x="10"
                      y="4"
                      className="text-[12px] font-extrabold fill-[var(--text-primary)] group-hover:fill-[var(--accent)] transition-colors"
                      style={{ fontFamily: cat.font }}
                    >
                      {cat.label}
                    </text>
                  </g>
                )
              })}

              {/* Sub-Category Nodes (Level 2) - Enlarged */}
              {MIND_MAP_CATEGORIES.map(cat => {
                if (activeCategory !== cat.id) return null
                return cat.subCategories.map((sub, sIdx) => {
                  const spacing = 75
                  const offset = (sIdx - (cat.subCategories.length - 1) / 2) * spacing
                  const px = cat.side === 'left' ? cat.x - 170 : cat.x + 170
                  const py = cat.y + offset
                  const isSubActive = activeSubCategory === sub.id

                  return (
                    <g
                      key={sub.id}
                      transform={`translate(${px}, ${py})`}
                      onClick={() => handleSubCategoryClick(sub.id)}
                      className="cursor-pointer group animate-scale-up"
                    >
                      <rect
                        x="-80"
                        y="-19"
                        width="160"
                        height="38"
                        rx="10"
                        fill="var(--bg-elevated)"
                        stroke={isSubActive ? cat.color : 'var(--border)'}
                        strokeWidth={isSubActive ? 2 : 1.2}
                        className="transition-all duration-200 group-hover:scale-[1.03] group-hover:fill-[var(--accent-subtle)]"
                      />
                      <text
                        textAnchor="middle"
                        y="3"
                        className="text-[11px] font-bold fill-[var(--text-secondary)] group-hover:fill-[var(--accent)] transition-colors"
                        style={{ fontFamily: cat.font }}
                      >
                        {sub.label}
                      </text>
                    </g>
                  )
                })
              })}

              {/* Pattern Nodes (Level 3 Leaf Nodes) - Enlarged */}
              {MIND_MAP_CATEGORIES.map(cat => {
                if (activeCategory !== cat.id) return null
                return cat.subCategories.map((sub, sIdx) => {
                  if (activeSubCategory !== sub.id) return null
                  const spacing = 75
                  const sOffset = (sIdx - (cat.subCategories.length - 1) / 2) * spacing
                  const subX = cat.side === 'left' ? cat.x - 170 : cat.x + 170
                  const subY = cat.y + sOffset

                  return sub.patterns.map((p, pIdx) => {
                    const pSpacing = 50
                    const pOffset = (pIdx - (sub.patterns.length - 1) / 2) * pSpacing
                    const px = cat.side === 'left' ? subX - 150 : subX + 150
                    const py = subY + pOffset

                    return (
                      <g
                        key={p.id}
                        transform={`translate(${px}, ${py})`}
                        onClick={() => onSelectPattern(p.id)}
                        className="cursor-pointer group animate-scale-up"
                      >
                        <rect
                          x="-70"
                          y="-16"
                          width="140"
                          height="32"
                          rx="8"
                          fill="var(--bg-base)"
                          stroke={cat.color}
                          strokeWidth="1.2"
                          className="transition-all duration-200 group-hover:scale-[1.04] group-hover:fill-[var(--accent-subtle)]"
                          style={{
                            filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.4))`
                          }}
                        />
                        <text
                          textAnchor="middle"
                          y="3.5"
                          className="text-[10px] font-semibold fill-[var(--text-secondary)] group-hover:fill-[var(--accent)] transition-colors"
                          style={{ fontFamily: cat.font }}
                        >
                          {p.label}
                        </text>
                      </g>
                    )
                  })
                })
              })}
            </svg>
          </div>
        </div>

        {/* Right Column: Floating category preview info card (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {selectedCat ? (
            <div className="border border-[var(--border)] rounded-2xl bg-[var(--bg-elevated)] p-6 shadow-xl relative overflow-hidden flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full animate-pulse" style={{ background: selectedCat.color }} />
                  <h3 className="text-sm font-bold text-[var(--text-primary)] font-display uppercase tracking-wide">
                    {selectedCat.label}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/15">
                  Category Details
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {selectedCat.description}
              </p>

              {/* Key insight box */}
              <div className="border border-[var(--border)] bg-[var(--bg-surface)] p-4 rounded-xl flex flex-col gap-1.5 shadow-inner">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Key Insight
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                  "{selectedCat.insight}"
                </p>
              </div>

              {/* Must know problems */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Must-Know Problems</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCat.problems.map((prob, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50 transition-colors"
                    >
                      {prob}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-elevated)]/30 p-12 text-center flex flex-col items-center justify-center min-h-[320px]">
              <HelpCircle className="w-8 h-8 text-[var(--text-muted)]/40 mb-3" />
              <h3 className="text-xs font-bold text-[var(--text-secondary)] font-display uppercase tracking-wider">Inspect Algorithm Data</h3>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-1 max-w-[200px]">
                Click any of the 16 category nodes in the tree to display description insights, expand sub-categories, and drill down to techniques.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Styled inline SVG dash flow animation */}
      <style>{`
        @keyframes dashFlow {
          to {
            stroke-dashoffset: -120;
          }
        }
      `}</style>
    </div>
  )
}
