import React, { useEffect, useRef, useState } from 'react'
import {
  Zap, Code2, Trophy, Globe, ChevronRight, ArrowRight,
  BarChart2, Clock, CheckCircle2, Target, Shield, Cpu,
  Flame, BookOpen, Play
} from 'lucide-react'

/* ── Particle background (canvas) ─────────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = canvas.width  = canvas.offsetWidth
    let h = canvas.height = canvas.offsetHeight
    let raf

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      a: Math.random() * 0.4 + 0.15,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(56,189,248,${p.a})`
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(56,189,248,${0.10 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      w = canvas.width  = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.55 }} />
  )
}

/* ── Data ── */
const TICKER_ITEMS = [
  { icon: <BookOpen className="w-4 h-4" />, label: 'Problem Archive' },
  { icon: <Zap      className="w-4 h-4" />, label: 'Sub-2s Verdicts' },
  { icon: <Globe    className="w-4 h-4" />, label: '8 Languages' },
  { icon: <Trophy   className="w-4 h-4" />, label: 'Weekly Contests' },
  { icon: <Shield   className="w-4 h-4" />, label: 'Sandboxed Engine' },
  { icon: <Cpu      className="w-4 h-4" />, label: 'Cloud Execution' },
  { icon: <Target   className="w-4 h-4" />, label: '99.9% Uptime' },
  { icon: <BarChart2 className="w-4 h-4" />, label: 'Progress Tracking' },
]

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6 text-[var(--accent)]" />,
    title: 'Lightning Verdicts',
    desc: 'Sandboxed multi-language execution returns results in under 2 seconds with memory & time tracking.',
    accent: 'from-sky-400 to-blue-600',
  },
  {
    icon: <Code2 className="w-6 h-6 text-cyan-400" />,
    title: 'Multi-Language Support',
    desc: 'Code in C++, Python, Java, Go, Rust, JavaScript and more — all in a feature-rich Monaco editor.',
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-emerald-400" />,
    title: 'Deep Analytics',
    desc: 'Track your progress per topic, difficulty trend, submission history, and acceptance rates.',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    icon: <Trophy className="w-6 h-6 text-amber-400" />,
    title: 'Leaderboard & Rank',
    desc: 'Compete globally, earn ratings, climb weekly leaderboards, and showcase your profile.',
    accent: 'from-amber-500 to-orange-600',
  },
]

const CATEGORIES = [
  { tag: 'Arrays',         icon: '⊞', diff: 'Easy',   color: 'border-emerald-500/40 bg-emerald-500/5' },
  { tag: 'Dynamic Prog.',  icon: '◈', diff: 'Hard',   color: 'border-rose-500/40    bg-rose-500/5'    },
  { tag: 'Graphs',         icon: '⬡', diff: 'Medium', color: 'border-amber-500/40   bg-amber-500/5'   },
  { tag: 'Trees',          icon: '⟆', diff: 'Medium', color: 'border-cyan-500/40    bg-cyan-500/5'    },
  { tag: 'Binary Search',  icon: '⌖', diff: 'Easy',   color: 'border-blue-500/40    bg-blue-500/5'    },
  { tag: 'Sliding Window', icon: '⊟', diff: 'Medium', color: 'border-sky-500/40    bg-sky-500/5'     },
  { tag: 'Backtracking',   icon: '↺', diff: 'Hard',   color: 'border-pink-500/40    bg-pink-500/5'    },
  { tag: 'Greedy',         icon: '◉', diff: 'Medium', color: 'border-teal-500/40    bg-teal-500/5'    },
]

const DIFF_COLORS = {
  Easy:   'text-emerald-400 bg-emerald-400/10 border border-emerald-400/30',
  Medium: 'text-amber-400   bg-amber-400/10   border border-amber-400/30',
  Hard:   'text-rose-400    bg-rose-400/10    border border-rose-400/30',
}

const CODE_SNIPPETS = [
  {
    lang: 'C++', badge: 'Accepted',
    code: `int maxSubArray(vector<int>& nums) {\n  int best = nums[0], cur = nums[0];\n  for (int i = 1; i < nums.size(); i++) {\n    cur = max(nums[i], cur + nums[i]);\n    best = max(best, cur);\n  }\n  return best;\n}`,
    floatClass: 'float-card',
  },
  {
    lang: 'Python', badge: 'Runtime: 12ms',
    code: `def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i`,
    floatClass: 'float-card-delay',
  },
]

const QUICK_ACTIONS = [
  { icon: <BookOpen className="w-5 h-5" />, label: 'Browse Problems', view: 'list',     gradient: 'from-sky-500 to-blue-600' },
  { icon: <Zap      className="w-5 h-5" />, label: 'Open Compiler',  view: 'compiler', gradient: 'from-cyan-500 to-blue-600' },
]

export default function LandingPage({ user, onGetStarted, onLogin, onNavigate, onOpenSourceClick }) {
  const [activeCatIdx, setActiveCatIdx] = useState(null)
  const carouselRef = useRef(null)

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const interval = setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: 288, behavior: 'smooth' })
      }
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  /* ── LOGGED-IN DASHBOARD ─────────────────────────────────────────── */
  if (user) {
    return (
      <div className="flex flex-col min-h-full bg-[var(--bg-base)] text-[var(--text-primary)]">
        <section className="relative overflow-hidden py-16 px-4 bg-[var(--bg-surface)] border-b border-[var(--border)]">
          <ParticleCanvas />
          <div className="relative max-w-screen-xl mx-auto">
            <div className="fade-up-stagger delay-100">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--accent)] mb-3">Welcome back</p>
              <h1 className="text-4xl sm:text-5xl font-display text-[var(--text-primary)] leading-tight mb-4">
                Ready to <span className="gradient-text">crush it</span>,<br />{user.username}?
              </h1>
              <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-lg mb-8">
                Pick up where you left off or explore a new challenge today.
              </p>
              <div className="flex flex-wrap gap-3">
                {QUICK_ACTIONS.map(a => (
                  <button
                    key={a.view}
                    onClick={() => onNavigate(a.view)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r ${a.gradient} shadow-lg hover:scale-105 hover:shadow-sky-500/30 transition-all duration-200 cursor-pointer`}
                  >
                    {a.icon}{a.label}<ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <StatsTicker />
        <CategorySection carouselRef={carouselRef} activeCatIdx={activeCatIdx} setActiveCatIdx={setActiveCatIdx} onNavigate={onNavigate} />
        <FeaturesSection />
      </div>
    )
  }

  /* ── LOGGED-OUT MARKETING PAGE (Scrollable, full page) ─────────────── */
  return (
    <div className="flex flex-col min-h-full bg-[var(--bg-base)] text-[var(--text-primary)] overflow-y-auto">

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center bg-[var(--bg-surface)] border-b border-[var(--border)]">
        <ParticleCanvas />
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)]/25 mb-6 fade-up-stagger delay-100">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="text-xs font-semibold text-[var(--accent)] tracking-wide">Sandboxed · Sub-2s · Open Source</span>
              </div>

              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-display text-[var(--text-primary)] leading-[1.05] mb-6 fade-up-stagger delay-200">
                THE <span className="gradient-text">NEW</span><br />STANDARD<br />
                <span className="text-[var(--accent)]">IN</span> COMPETITIVE<br />CODING
              </h1>

              <p className="text-[var(--text-secondary)] text-lg max-w-lg mb-10 leading-relaxed fade-up-stagger delay-300">
                CodePulse gives you a lightning-fast sandboxed judge, curated problems,
                deep analytics, and global sharing logs — all in one sleek platform.
              </p>

              <div className="flex flex-wrap gap-4 fade-up-stagger delay-400">
                <button
                  id="landing-get-started"
                  onClick={onGetStarted}
                  className="glow-border relative flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-white font-bold text-sm shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  Get Started — It's Free
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="landing-login"
                  onClick={onLogin}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-semibold text-sm hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-200 cursor-pointer"
                >
                  Log In<ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right floating cards */}
            <div className="hidden lg:flex relative h-[480px] items-center justify-center">
              <div className="absolute w-64 h-64 rounded-full bg-[var(--accent)]/5 blur-3xl" />

              {CODE_SNIPPETS.map((s, i) => (
                <div
                  key={i}
                  className={`absolute ${i === 0 ? '-left-4 top-8' : 'right-0 bottom-8'} w-72 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-xl ${s.floatClass}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/60" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">{s.lang}</span>
                      <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/25">{s.badge}</span>
                    </div>
                  </div>
                  <pre className="text-[10px] font-mono text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap overflow-hidden">{s.code}</pre>
                </div>
              ))}

              <div className="absolute right-6 top-1/3 p-3 flex items-center gap-2.5 float-card-delay2 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-lg">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-500">Accepted</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Runtime 8ms · 5.2MB</p>
                </div>
              </div>

              <div className="absolute left-8 bottom-12 p-3 flex items-center gap-2.5 float-card-delay rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-lg">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Sub-2s</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Avg. verdict time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div className="w-px h-8 bg-gradient-to-b from-[var(--accent)]/50 to-transparent" />
          <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase">scroll</p>
        </div>
      </section>

      <StatsTicker />
      <FeaturesSection />
      <CategorySection carouselRef={carouselRef} activeCatIdx={activeCatIdx} setActiveCatIdx={setActiveCatIdx} onNavigate={onNavigate} />

      {/* CTA Banner */}
      <section className="py-24 px-4 relative overflow-hidden bg-[var(--bg-surface)] border-t border-[var(--border)]">
        <ParticleCanvas />
        <div className="relative max-w-2xl mx-auto text-center">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--accent)] mb-4">Start for free</p>
          <h2 className="text-4xl sm:text-5xl font-display text-[var(--text-primary)] mb-5">
            Ready to reach<br /><span className="gradient-text">your peak?</span>
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Solve problems, build skills, and level up every day.
          </p>
          <button
            onClick={onGetStarted}
            className="glow-border inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-white font-bold shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105 transition-all duration-200 cursor-pointer text-sm"
          >
            <Flame className="w-4 h-4" />Get Started Free<ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────── */
function StatsTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="bg-[var(--bg-elevated)] border-y border-[var(--border)] py-3 overflow-hidden">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 px-8 text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap">
            <span className="text-[var(--accent)]">{item.icon}</span>
            {item.label}
            {i < doubled.length - 1 && <span className="ml-8 text-[var(--border)] text-xl leading-none">·</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-[var(--bg-base)]">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--accent)] mb-3">Platform Features</p>
          <h2 className="text-3xl sm:text-4xl font-display text-[var(--text-primary)] mb-4">
            Everything you need to<br /><span className="gradient-text">code at your peak</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            A complete competitive programming environment built for speed, accuracy, and growth.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className={`rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 cursor-default hover:-translate-y-1 hover:shadow-lg hover:border-[var(--accent)]/30 transition-all duration-300 fade-up-stagger delay-${(i + 1) * 100}`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.accent} p-0.5 mb-5`}>
                <div className="w-full h-full rounded-[10px] bg-[var(--bg-elevated)] flex items-center justify-center">
                  {f.icon}
                </div>
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategorySection({ carouselRef, activeCatIdx, setActiveCatIdx, onNavigate }) {
  return (
    <section className="py-20 px-4 bg-[var(--bg-surface)] border-y border-[var(--border)]">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--accent)] mb-2">Problem Library</p>
            <h2 className="text-3xl sm:text-4xl font-display text-[var(--text-primary)]">
              Explore by<span className="gradient-text"> topic</span>
            </h2>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('list')}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:text-sky-400 transition-colors cursor-pointer"
            >
              View all problems<ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((cat, i) => (
            <div
              key={i}
              onMouseEnter={() => setActiveCatIdx(i)}
              onMouseLeave={() => setActiveCatIdx(null)}
              onClick={() => onNavigate && onNavigate('list')}
              className={`flex-shrink-0 w-64 rounded-2xl border p-5 transition-all duration-300 ${cat.color} ${activeCatIdx === i ? 'scale-[1.03] shadow-xl' : 'scale-100'} ${onNavigate ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{cat.icon}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${DIFF_COLORS[cat.diff]}`}>{cat.diff}</span>
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">{cat.tag}</h3>
              <div className="w-full h-1 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${cat.diff === 'Easy' ? 'bg-emerald-500' : cat.diff === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: activeCatIdx === i ? '100%' : '40%' }}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[var(--text-muted)]">
                <Play className="w-3 h-3" /><span className="text-[11px] font-semibold">Start practicing</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
