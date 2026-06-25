import React, { useState, useEffect, useMemo } from 'react'
import { 
  ArrowLeft, Calendar, Trophy, Zap, Award, Search, 
  ExternalLink, CheckCircle, ChevronDown, Flame, BarChart3, HelpCircle 
} from 'lucide-react'
import { apiUrl } from '../lib/api'

export default function ProfilePage({ userProfileHash, onBack, dark }) {
  const [profile, setProfile] = useState(null)
  const [heatmap, setHeatmap] = useState(null)
  const [tags, setTags] = useState([])
  const [solvedList, setSolvedList] = useState([])
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [tagSearch, setTagSearch] = useState('')
  const [solvedSearch, setSolvedSearch] = useState('')
  const [solvedDifficultyFilter, setSolvedDifficultyFilter] = useState('All')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hoveredDay, setHoveredDay] = useState(null) // tooltip state
  const [hoveredBubble, setHoveredBubble] = useState(null) // bubble chart tooltip state

  // Fetch all profile details
  useEffect(() => {
    if (!userProfileHash) return

    const fetchAllData = async () => {
      setLoading(true)
      setError('')
      try {
        const headers = {}
        const token = localStorage.getItem('token')
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        // 1. Profile Stats
        const profileRes = await fetch(apiUrl(`/api/v1/users/profile/${userProfileHash}`), { headers })
        if (!profileRes.ok) throw new Error('Failed to load profile')
        const profileData = await profileRes.json()
        setProfile(profileData)

        // 2. Tags
        const tagsRes = await fetch(apiUrl(`/api/v1/users/profile/${userProfileHash}/tags`), { headers })
        if (!tagsRes.ok) throw new Error('Failed to load tag distribution')
        const tagsData = await tagsRes.json()
        setTags(tagsData)

        // 3. Solved List
        const solvedRes = await fetch(apiUrl(`/api/v1/users/profile/${userProfileHash}/solved`), { headers })
        if (!solvedRes.ok) throw new Error('Failed to load solved problems')
        const solvedData = await solvedRes.json()
        setSolvedList(solvedData)

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [userProfileHash])

  // Fetch heatmap specifically when the selected year changes
  useEffect(() => {
    if (!userProfileHash) return

    const fetchHeatmap = async () => {
      try {
        const headers = {}
        const token = localStorage.getItem('token')
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        const heatmapRes = await fetch(apiUrl(`/api/v1/users/profile/${userProfileHash}/heatmap?year=${selectedYear}`), { headers })
        if (!heatmapRes.ok) throw new Error('Failed to load activity heatmap')
        const heatmapData = await heatmapRes.json()
        setHeatmap(heatmapData)
      } catch (err) {
        console.error(err)
      }
    }

    fetchHeatmap()
  }, [userProfileHash, selectedYear])

  // Process Heatmap Data into weeks/grid
  const heatmapGrid = useMemo(() => {
    if (!heatmap || !heatmap.days) return []
    
    // We group days into weeks starting from Sunday
    const days = [...heatmap.days]
    const grid = []
    let currentWeek = []

    days.forEach((day) => {
      const dateObj = new Date(day.date)
      const dayOfWeek = dateObj.getDay() // 0 = Sunday, 6 = Saturday

      // If it's Sunday and we already have some days, push current week and start new
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        grid.push(currentWeek)
        currentWeek = []
      }

      currentWeek.push(day)
    })

    if (currentWeek.length > 0) {
      grid.push(currentWeek)
    }

    return grid
  }, [heatmap])

  // Packaging Bubbles (3D Analysis tag distribution)
  const bubbles = useMemo(() => {
    if (!tags || tags.length === 0) return []

    // Sort tags by solved count descending (largest center)
    const sorted = [...tags].sort((a, b) => b.solved - a.solved)
    
    // Compute positions in a deterministic golden spiral
    return sorted.map((item, index) => {
      const angle = index * 2.39996 // Golden angle in radians
      // Spread out spiral spacing
      const radius = 25 + index * 13
      const cx = 200 + radius * Math.cos(angle)
      const cy = 180 + radius * Math.sin(angle)
      
      // Radius proportional to solved count, with min size of 16
      const r = 18 + Math.sqrt(item.solved) * 11
      
      // Predefined 3D radial gradient color IDs
      const colors = ['violet', 'indigo', 'blue', 'emerald', 'amber', 'rose']
      const themeColor = colors[index % colors.length]

      return {
        ...item,
        cx,
        cy,
        r,
        themeColor
      }
    })
  }, [tags])

  // Filtered Solved Problems List
  const filteredSolvedList = useMemo(() => {
    return solvedList.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(solvedSearch.toLowerCase()) ||
                            item.slug.toLowerCase().includes(solvedSearch.toLowerCase())
      const matchesDifficulty = solvedDifficultyFilter === 'All' || item.difficulty === solvedDifficultyFilter
      return matchesSearch && matchesDifficulty
    })
  }, [solvedList, solvedSearch, solvedDifficultyFilter])

  // Filtered Bubbles based on Search input
  const filteredBubbles = useMemo(() => {
    return bubbles.map(b => {
      const matches = b.tag.toLowerCase().includes(tagSearch.toLowerCase())
      return {
        ...b,
        dimmed: tagSearch.trim() !== '' && !matches
      }
    })
  }, [bubbles, tagSearch])

  // Helper for Heatmap square color
  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-900 border-[var(--border-subtle)]'
    if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
    if (count <= 5) return 'bg-emerald-400 dark:bg-emerald-800 text-white'
    return 'bg-emerald-600 dark:bg-emerald-600 text-white font-bold'
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-sm text-[var(--text-secondary)] font-semibold">Loading stats & submissions analysis...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
        <HelpCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Error Loading Profile</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{error || 'Could not verify profile details.'}</p>
        <button 
          onClick={onBack}
          className="mt-6 flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold rounded-xl transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Problems
        </button>
      </div>
    )
  }

  // Calculate difficulty progress percentages
  const easyPct = profile.easy_solved > 0 ? 100 : 0
  const medPct = profile.medium_solved > 0 ? 100 : 0
  const hardPct = profile.hard_solved > 0 ? 100 : 0

  return (
    <div className="flex-1 max-w-screen-xl w-full mx-auto px-4 sm:px-6 py-6 fade-up">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all bg-[var(--bg-surface)] px-3 py-1.5 rounded-lg border border-[var(--border)] shadow-sm hover:shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-wider">Candidate Analysis Profile</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: User Card & Diff Distribution */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* User Profile Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-display text-2xl uppercase shadow-md shadow-indigo-500/20">
                {profile.username.slice(0, 2)}
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">{profile.username}</h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">{profile.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${profile.google_connected ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    {profile.google_connected ? 'Connected via Google' : 'Local Developer'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Member Since</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{profile.member_since}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Attempts</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{profile.total_submissions}</p>
              </div>
            </div>
          </div>

          {/* Difficulty Cards */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 shadow-md">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Difficulty Distribution
            </h3>

            {/* Main Total display */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
              <div>
                <p className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{profile.total_solved}</p>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Problems Solved</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center font-bold text-xs">
                {profile.total_solved}
              </div>
            </div>

            {/* Individual difficulties */}
            <div className="flex flex-col gap-4">
              {/* Easy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-500 font-bold">Easy</span>
                  <span className="text-[var(--text-primary)] font-mono">{profile.easy_solved} solved</span>
                </div>
                <div className="w-full bg-[var(--bg-elevated)] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${profile.easy_solved > 0 ? Math.min(100, (profile.easy_solved / Math.max(1, profile.total_solved)) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-500 font-bold">Medium</span>
                  <span className="text-[var(--text-primary)] font-mono">{profile.medium_solved} solved</span>
                </div>
                <div className="w-full bg-[var(--bg-elevated)] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${profile.medium_solved > 0 ? Math.min(100, (profile.medium_solved / Math.max(1, profile.total_solved)) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-rose-500 font-bold">Hard</span>
                  <span className="text-[var(--text-primary)] font-mono">{profile.hard_solved} solved</span>
                </div>
                <div className="w-full bg-[var(--bg-elevated)] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${profile.hard_solved > 0 ? Math.min(100, (profile.hard_solved / Math.max(1, profile.total_solved)) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Heatmap, Bubble Chart, Solved table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* 1. Activity Heatmap */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 shadow-md relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Submission Activity Heatmap
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Real-time daily code submission frequency density</p>
              </div>

              {/* Year Select & Streaks */}
              <div className="flex items-center gap-3">
                {heatmap && (
                  <div className="flex items-center gap-2.5 px-3 py-1 bg-[var(--bg-elevated)] rounded-lg text-xs font-bold border border-[var(--border)]">
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span className="text-[var(--text-secondary)]">Max Streak:</span>
                    <span className="text-[var(--text-primary)] font-mono">{heatmap.max_streak}d</span>
                    <span className="mx-1 text-[var(--text-muted)]">|</span>
                    <span className="text-[var(--text-secondary)]">Current:</span>
                    <span className="text-[var(--text-primary)] font-mono">{heatmap.current_streak}d</span>
                  </div>
                )}

                <div className="relative inline-block">
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="appearance-none bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-[var(--text-primary)] focus:border-[var(--accent)] outline-none cursor-pointer"
                  >
                    {[2026, 2025, 2024].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Heatmap Grid Wrapper */}
            <div className="overflow-x-auto pb-2 relative">
              <div className="min-w-[640px] flex flex-col gap-1.5">
                
                {/* Month labels row */}
                <div className="flex pl-8 text-[9px] text-[var(--text-muted)] font-mono">
                  {/* Split across columns approximation */}
                  <span className="w-12">Jan</span>
                  <span className="w-12">Feb</span>
                  <span className="w-12">Mar</span>
                  <span className="w-12">Apr</span>
                  <span className="w-12">May</span>
                  <span className="w-12">Jun</span>
                  <span className="w-12">Jul</span>
                  <span className="w-12">Aug</span>
                  <span className="w-12">Sep</span>
                  <span className="w-12">Oct</span>
                  <span className="w-12">Nov</span>
                  <span className="w-12">Dec</span>
                </div>

                <div className="flex gap-1.5">
                  {/* Row day labels */}
                  <div className="flex flex-col justify-between text-[9px] text-[var(--text-muted)] font-mono pr-1.5 h-[84px] py-0.5">
                    <span>Sun</span>
                    <span>Wed</span>
                    <span>Sat</span>
                  </div>

                  {/* Grid squares */}
                  <div className="flex-1 flex gap-1">
                    {heatmapGrid.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-1">
                        {week.map((day) => (
                          <div
                            key={day.date}
                            className={`w-2.5 h-2.5 rounded-sm border border-transparent transition-all cursor-pointer hover:border-slate-400 ${getHeatmapColor(day.count)}`}
                            onMouseEnter={(e) => setHoveredDay({ day, rect: e.target.getBoundingClientRect() })}
                            onMouseLeave={() => setHoveredDay(null)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Summary statistics */}
            {heatmap && (
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
                <div>
                  Total Submissions in {selectedYear}: <strong className="text-[var(--text-primary)]">{heatmap.total_submissions}</strong>
                </div>
                <div>
                  Active Days: <strong className="text-[var(--text-primary)]">{heatmap.total_active_days}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-900 border border-[var(--border-subtle)]"></div>
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-950/60"></div>
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-800"></div>
                  <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></div>
                  <span>More</span>
                </div>
              </div>
            )}

            {/* Heatmap Tooltip */}
            {hoveredDay && (
              <div 
                className="fixed bg-slate-950/90 text-white border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono pointer-events-none z-50 shadow-xl"
                style={{
                  top: `${hoveredDay.rect.top - 42}px`,
                  left: `${hoveredDay.rect.left - 50}px`
                }}
              >
                <strong>{hoveredDay.day.count} sub</strong> on {hoveredDay.day.date}
              </div>
            )}
          </div>

          {/* 2. Interactive SVG Bubble Chart (3D Analysis) */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 shadow-md relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Tag-Wise Topic Profile Analysis
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Floating 3D bubble chart packing — sizes reflect solved question densities
                </p>
              </div>

              {/* Search filter for bubbles */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] focus:border-[var(--accent)] outline-none w-48 transition-all"
                />
              </div>
            </div>

            {/* SVG Canvas Area */}
            <div className="relative bg-slate-50/50 dark:bg-slate-950/20 border border-[var(--border-subtle)] rounded-xl h-[360px] flex items-center justify-center overflow-hidden">
              {tags.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] font-mono">No submissions recorded to generate tag statistics.</p>
              ) : (
                <svg viewBox="0 0 400 360" className="w-full h-full max-w-[400px] select-none">
                  <defs>
                    {/* Define 3D gradients with offset light source */}
                    <radialGradient id="bubble-violet" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#ddd6fe" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#5b21b6" />
                    </radialGradient>
                    <radialGradient id="bubble-indigo" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#c7d2fe" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#3730a3" />
                    </radialGradient>
                    <radialGradient id="bubble-blue" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#bfdbfe" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </radialGradient>
                    <radialGradient id="bubble-emerald" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#a7f3d0" />
                      <stop offset="50%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#065f46" />
                    </radialGradient>
                    <radialGradient id="bubble-amber" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#fde68a" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#92400e" />
                    </radialGradient>
                    <radialGradient id="bubble-rose" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#fecdd3" />
                      <stop offset="50%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#9f1239" />
                    </radialGradient>
                  </defs>

                  {/* Render packaged bubble elements */}
                  {filteredBubbles.map((bubble, idx) => {
                    const completionPct = Math.round((bubble.solved / bubble.total) * 100)
                    
                    // Simple deterministic drift using idx for phase offset
                    const driftOffset = Math.sin(idx + Date.now() / 1500) * 2

                    return (
                      <g 
                        key={bubble.tag}
                        className={`transition-all duration-300 transform cursor-pointer ${
                          bubble.dimmed ? 'opacity-20 scale-90' : 'hover:scale-105'
                        }`}
                        onMouseEnter={(e) => setHoveredBubble({ 
                          bubble, 
                          rect: e.currentTarget.getBoundingClientRect(),
                          pct: completionPct
                        })}
                        onMouseLeave={() => setHoveredBubble(null)}
                      >
                        {/* Shimmer light highlights */}
                        <circle
                          cx={bubble.cx}
                          cy={bubble.cy + driftOffset}
                          r={bubble.r}
                          fill={`url(#bubble-${bubble.themeColor})`}
                          className="transition-transform duration-300 drop-shadow-md hover:drop-shadow-lg"
                        />

                        {/* White reflection spot on sphere */}
                        <circle
                          cx={bubble.cx - bubble.r * 0.3}
                          cy={bubble.cy + driftOffset - bubble.r * 0.3}
                          r={bubble.r * 0.15}
                          fill="rgba(255,255,255,0.4)"
                          pointerEvents="none"
                        />

                        {/* Tag abbreviation/text label */}
                        <text
                          x={bubble.cx}
                          y={bubble.cy + driftOffset + 4}
                          textAnchor="middle"
                          fill="white"
                          fontSize={bubble.r > 24 ? "10px" : "8px"}
                          fontWeight="bold"
                          className="pointer-events-none drop-shadow font-sans select-none"
                        >
                          {bubble.tag.length > 8 && bubble.r < 32 
                            ? `${bubble.tag.slice(0, 6)}..` 
                            : bubble.tag
                          }
                        </text>

                        {/* Counter label underneath */}
                        {bubble.r > 28 && (
                          <text
                            x={bubble.cx}
                            y={bubble.cy + driftOffset + 14}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.85)"
                            fontSize="8px"
                            fontWeight="500"
                            className="pointer-events-none drop-shadow font-mono select-none"
                          >
                            {bubble.solved}/{bubble.total}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </svg>
              )}

              {/* Bubble Tooltip */}
              {hoveredBubble && (
                <div 
                  className="fixed bg-slate-950/95 text-white border border-slate-800 rounded-xl p-3 text-xs pointer-events-none z-50 shadow-2xl flex flex-col gap-1.5"
                  style={{
                    top: `${hoveredBubble.rect.top - 90}px`,
                    left: `${hoveredBubble.rect.left + hoveredBubble.rect.width / 2 - 80}px`
                  }}
                >
                  <strong className="text-indigo-300 text-[13px]">{hoveredBubble.bubble.tag}</strong>
                  <div className="flex justify-between items-center gap-8 font-mono">
                    <span className="text-slate-400">Solved:</span>
                    <span className="font-bold">{hoveredBubble.bubble.solved} / {hoveredBubble.bubble.total}</span>
                  </div>
                  <div className="flex justify-between items-center gap-8 font-mono">
                    <span className="text-slate-400">Completion:</span>
                    <span className="font-bold text-emerald-400">{hoveredBubble.pct}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Solved Problems List */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Successfully Solved Problems
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Verified problem solutions recorded in sandbox database</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search titles..."
                    value={solvedSearch}
                    onChange={(e) => setSolvedSearch(e.target.value)}
                    className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] focus:border-[var(--accent)] outline-none w-44 transition-all"
                  />
                </div>

                {/* Difficulty Select */}
                <div className="relative inline-block">
                  <select 
                    value={solvedDifficultyFilter}
                    onChange={(e) => setSolvedDifficultyFilter(e.target.value)}
                    className="appearance-none bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-[var(--text-primary)] focus:border-[var(--accent)] outline-none cursor-pointer"
                  >
                    <option value="All">All Difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Solved List Table */}
            <div className="overflow-x-auto border border-[var(--border)] rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-elevated)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                    <th className="px-4 py-3">Problem Details</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3 text-right">Completion Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-sm font-medium">
                  {filteredSolvedList.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-xs text-[var(--text-muted)] font-mono">
                        No resolved items match current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSolvedList.map((item) => (
                      <tr key={item.slug} className="hover:bg-[var(--bg-elevated)]/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="text-[var(--text-primary)] font-bold">{item.title}</span>
                          <span className="block text-[10px] text-[var(--text-muted)] font-mono mt-0.5">{item.slug}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                            item.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-rose-500/10 text-rose-500'
                          }`}>
                            {item.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs text-[var(--text-secondary)]">
                          {item.solved_at}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
