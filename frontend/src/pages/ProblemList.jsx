import React, { useState, useEffect, useMemo } from 'react'
import {
  Loader2, Server, Search, SlidersHorizontal, CheckCircle2,
  ChevronDown, X
} from 'lucide-react'

/* ── Difficulty styling ──────────────────────────────────────────────────── */
const DIFF = {
  Easy:   { label: 'Easy',   cls: 'text-emerald-500 dark:text-emerald-400' },
  Medium: { label: 'Med.',   cls: 'text-amber-500   dark:text-amber-400'   },
  Hard:   { label: 'Hard',   cls: 'text-red-500     dark:text-red-400'     },
}

/* ── Tag pill ────────────────────────────────────────────────────────────── */
function TagPill({ tag, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
        transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0
        ${active
          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'}
      `}
    >
      {tag}
      {count != null && (
        <span className={`text-[10px] font-mono ${active ? 'text-indigo-400/70' : 'text-[var(--text-muted)]'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

/* ── Problem row ─────────────────────────────────────────────────────────── */
function ProblemRow({ problem, index, onSelect }) {
  const diff = DIFF[problem.difficulty] || { label: problem.difficulty, cls: 'text-[var(--text-muted)]' }
  // Simulated acceptance % based on difficulty (cosmetic)
  const acceptance = problem.difficulty === 'Easy' ? (55 + (index * 7) % 15).toFixed(1)
    : problem.difficulty === 'Medium' ? (35 + (index * 11) % 20).toFixed(1)
    : (25 + (index * 13) % 20).toFixed(1)

  return (
    <button
      onClick={() => onSelect(problem.slug)}
      className={`
        w-full flex items-center gap-4 px-5 py-3.5
        hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer text-left
        border-b border-[var(--border)]
        ${index % 2 === 0 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-base)]'}
      `}
    >
      {/* Status indicator */}
      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
        {problem.status === 'solved' && (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" title="Solved" />
        )}
        {problem.status === 'attempted' && (
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" title="Attempted" />
        )}
      </span>

      {/* Number */}
      <span className="w-10 text-right text-xs font-mono text-[var(--text-muted)] flex-shrink-0">
        {index + 1}.
      </span>

      {/* Title */}
      <span className="flex-1 text-sm font-medium text-[var(--text-primary)] truncate
        group-hover:text-indigo-400 transition-colors">
        {problem.title}
      </span>

      {/* Acceptance */}
      <span className="hidden sm:block w-16 text-right text-xs font-mono text-[var(--text-muted)]">
        {acceptance}%
      </span>

      {/* Difficulty */}
      <span className={`w-12 text-right text-xs font-bold ${diff.cls}`}>
        {diff.label}
      </span>
    </button>
  )
}

/* ── Loading skeleton rows ───────────────────────────────────────────────── */
function SkeletonRows() {
  return (
    <div className="divide-y divide-[var(--border)]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`flex items-center gap-4 px-5 py-4 animate-pulse
          ${i % 2 === 0 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-base)]'}`}>
          <div className="w-10 h-3 rounded bg-[var(--bg-elevated)]" />
          <div className="flex-1 h-4 rounded bg-[var(--bg-elevated)]" style={{ maxWidth: `${200 + (i * 40) % 200}px` }} />
          <div className="hidden sm:block w-12 h-3 rounded bg-[var(--bg-elevated)]" />
          <div className="w-10 h-3 rounded bg-[var(--bg-elevated)]" />
        </div>
      ))}
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function ProblemList({ onSelectProblem, user }) {
  const [problems, setProblems] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [activeProgram, setActiveProgram] = useState('dsa')
  const [activeTag, setActiveTag] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllTags, setShowAllTags] = useState(false)

  useEffect(() => {
    setLoading(true)
    const headers = {}
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    fetch('http://localhost:8000/api/v1/judge/problems', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load challenges')
        return res.json()
      })
      .then(data => { setProblems(data); setLoading(false) })
      .catch(err  => { setError(err.message); setLoading(false) })
  }, [user])

  /* ── Filter by program first ── */
  const programFiltered = useMemo(() => {
    return problems.filter(p => (p.programs || []).includes(activeProgram))
  }, [problems, activeProgram])

  /* ── Derive tags with counts for the active program ── */
  const tagCounts = useMemo(() => {
    const map = {}
    programFiltered.forEach(p => {
      (p.tags || []).forEach(t => { map[t] = (map[t] || 0) + 1 })
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [programFiltered])

  /* ── Filter problems by tag and search queries ── */
  const filtered = useMemo(() => {
    let list = programFiltered

    // Filter by tag
    if (activeTag) {
      list = list.filter(p => (p.tags || []).includes(activeTag))
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      )
    }

    return list
  }, [programFiltered, activeTag, searchQuery])

  /* How many tags to show before "Expand" */
  const VISIBLE_TAGS = 8
  const visibleTags = showAllTags ? tagCounts : tagCounts.slice(0, VISIBLE_TAGS)

  /* ── Error ── */
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20
            flex items-center justify-center">
            <Server className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Backend Unreachable</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20
              border border-indigo-500/30 text-indigo-400 text-xs font-semibold
              transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-6 w-full fade-up">

      {/* ── Program Selector Tabs ── */}
      <div className="flex gap-1 border-b border-[var(--border)] mb-5 overflow-x-auto no-scrollbar">
        {[
          { id: 'dsa', label: 'DSA Sheet', count: problems.filter(p => (p.programs || []).includes('dsa')).length },
          { id: 'neetcode', label: 'NeetCode 150', count: problems.filter(p => (p.programs || []).includes('neetcode')).length },
          { id: 'system', label: 'System Tests', count: problems.filter(p => (p.programs || []).includes('system')).length },
        ].map(prog => (
          <button
            key={prog.id}
            onClick={() => {
              setActiveProgram(prog.id)
              setActiveTag(null)
            }}
            className={`
              px-5 py-3 text-xs font-semibold border-b-2 -mb-[2px] transition-all cursor-pointer whitespace-nowrap
              ${activeProgram === prog.id
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
            `}
          >
            {prog.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-medium
              ${activeProgram === prog.id ? 'bg-indigo-500/15 text-indigo-400' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>
              {prog.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Topic tags bar ── */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {visibleTags.map(([tag, count]) => (
          <TagPill
            key={tag}
            tag={tag}
            count={count}
            active={activeTag === tag}
            onClick={() => setActiveTag(prev => prev === tag ? null : tag)}
          />
        ))}
        {tagCounts.length > VISIBLE_TAGS && (
          <button
            onClick={() => setShowAllTags(s => !s)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
              text-[var(--text-muted)] hover:text-[var(--text-primary)]
              transition-colors cursor-pointer"
          >
            {showAllTags ? 'Collapse' : `Expand`}
            <ChevronDown className={`w-3 h-3 transition-transform ${showAllTags ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* ── Active tag indicator ── */}
      {activeTag && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-[var(--text-muted)]">Filtering:</span>
          <button
            onClick={() => setActiveTag(null)}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
              bg-indigo-500/15 text-indigo-400 border border-indigo-500/30
              hover:bg-indigo-500/25 transition-colors cursor-pointer"
          >
            {activeTag}
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Search bar + stats ── */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search questions"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg
              bg-[var(--bg-elevated)] border border-[var(--border)]
              text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-indigo-500/40
              transition-colors"
          />
        </div>

        {/* Stats */}
        <div className="ml-auto text-xs text-[var(--text-muted)] font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{filtered.length}{activeTag || searchQuery ? `/${problems.length}` : ''} Problems</span>
        </div>
      </div>

      {/* ── Problem table ── */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">

        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-2.5 bg-[var(--bg-elevated)] border-b border-[var(--border)]
          text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
          <span className="w-10 text-right">#</span>
          <span className="flex-1">Title</span>
          <span className="hidden sm:block w-16 text-right">Accept.</span>
          <span className="w-12 text-right">Diff.</span>
        </div>

        {/* Rows */}
        {loading ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--text-muted)]">
            {searchQuery || activeTag
              ? 'No problems match your search or filter.'
              : 'No problems found. Seed the database first.'}
          </div>
        ) : (
          <div>
            {filtered.map((p, i) => (
              <ProblemRow
                key={p.id || p.slug}
                problem={p}
                index={i}
                onSelect={onSelectProblem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
