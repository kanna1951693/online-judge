import React, { useState, useEffect, useRef } from 'react'
import {
  X, ChevronRight, BookOpen, Layers, Cpu, Code2, Play, HardDrive, Database,
  ArrowRight, Sparkles, Terminal, Activity, Info
} from 'lucide-react'

export default function OpenSourceDoc({ isOpen, onClose }) {
  const [showIndex, setShowIndex] = useState(false)
  const [activeSection, setActiveSection] = useState('intro')
  const contentRef = useRef(null)

  const sections = [
    { id: 'intro', label: '🌟 The Magical Playground' },
    { id: 'frontend', label: '🎠 The Front Yard (Frontend)' },
    { id: 'backend', label: '🍳 The Secret Kitchen (Backend)' },
    { id: 'sandbox', label: '📦 The Safe Toy Box (Sandbox)' },
    { id: 'flow', label: '🌊 How the Magic Flows (Website Flow)' },
    { id: 'diagram', label: '🗺️ Interactive Flow Map' }
  ]

  // Scroll spy to highlight active section in the table of contents
  useEffect(() => {
    const handleScroll = () => {
      const container = contentRef.current
      if (!container) return

      let currentSection = ''
      for (const section of sections) {
        const el = container.querySelector(`#${section.id}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          if (rect.top - containerRect.top < 120) {
            currentSection = section.id
          }
        }
      }
      setActiveSection(currentSection || 'intro')
    }

    const container = contentRef.current
    if (isOpen && container) {
      container.addEventListener('scroll', handleScroll)
      handleScroll()
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const scrollToSection = (id) => {
    const container = contentRef.current
    const el = container?.querySelector(`#${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center transition-opacity duration-300">
      {/* Sliding bottom sheet panel */}
      <div 
        className="w-full max-w-5xl h-[85vh] bg-[var(--bg-elevated)] border-t border-[var(--border)] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        style={{
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-surface)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] font-display tracking-wide">
                Magical Code Playground: How It Works! 🌟
              </h2>
              <p className="text-xs text-[var(--text-muted)]">Explaining the architecture like you are 5 years old</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggleable Table of Contents Index Button */}
            <button
              onClick={() => setShowIndex(!showIndex)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showIndex 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--border-subtle)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {showIndex ? 'Hide Index' : 'Show Index'}
            </button>

            <button
              onClick={onClose}
              aria-label="Close documentation panel"
              className="p-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area (Sidebar + Markdown-like page content) */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Index Sidebar (Hidden by default, slides in/out) */}
          <div 
            className={`border-r border-[var(--border)] bg-[var(--bg-surface)] overflow-y-auto transition-all duration-300 ${
              showIndex ? 'w-64 opacity-100 px-4 py-6' : 'w-0 opacity-0 pointer-events-none'
            }`}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              Map of Playground
            </h3>
            <nav className="flex flex-col gap-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                    activeSection === section.id
                      ? 'bg-indigo-500/10 text-indigo-500 border-l-2 border-indigo-500 pl-2.5'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                  }`}
                >
                  <span>{section.label}</span>
                  {activeSection === section.id && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Scrollable Story Panel */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 space-y-12 scroll-smooth bg-[var(--bg-elevated)]"
          >
            {/* Section 1: Intro */}
            <section id="intro" className="space-y-4">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>🌟</span> The Magical Playground
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Imagine you are in a super fun playground! But instead of swings and slides made of metal, this playground is made of <strong>computer codes</strong>! 
                You get to type special secret messages (codes) to a friendly helper robot named <strong>Judge</strong>. 
                You tell the robot to solve puzzles, and the robot quickly checks if your answer is correct. 
                If it is, you get a shiny green checkmark! If not, the robot helps you try again!
              </p>
              <div className="p-4 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--border)] flex gap-3">
                <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong>Kid-friendly definition of Online Judge:</strong> A website where you submit code, it compiles and runs your code automatically against hidden test answers, and returns a verdict like "Accepted" or "Wrong Answer" in seconds.
                </p>
              </div>
            </section>

            {/* Section 2: Frontend */}
            <section id="frontend" className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>🎠</span> The Front Yard (What You See)
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                The <strong>Frontend</strong> is like the sandbox, slides, and climbing gym. It is the part of the playground you can see, touch, and play with!
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" /> React (The Building Blocks)
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Like LEGO blocks! We use them to build the pages, buttons, list boxes, and forms so everything snaps together nicely and works instantly without reloading the page.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-cyan-500" /> Monaco Editor (The Writing Board)
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    A special drawing board where you write your code. It's the exact same tool used in big-kid editors like VS Code! It colors your text so you don't get lost.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-500" /> Tailwind CSS (The Theme Painter)
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Our bucket of paint and stamps. It lets us style everything with warm colors like <strong>Bone</strong> and <strong>Olive Drab</strong>, and makes the cards float nicely with smooth transitions.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-rose-500" /> Lucide React (Cute Stickers)
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Cute stickers (icons) like clocks, run buttons, checkmarks, and locks. They show you exactly what each button does without using big words.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Backend */}
            <section id="backend" className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>🍳</span> The Secret Kitchen (What You Don't See)
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                The <strong>Backend</strong> is like the kitchen behind the diner. You don't sit inside the kitchen, but that's where the cooks bake cookies, wash dishes, and store recipe books!
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-amber-500" /> FastAPI (The Speedy Waiter)
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    A very fast waiter who takes the code you typed, runs to the kitchen to hand it to the cooks, and rushes back to bring you the checkmark or cross.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-violet-500" /> Redis (The Line Leader)
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Like a teacher keeping children in a straight line. If many kids submit code at the same time, Redis makes sure they wait in line nicely so the cooks don't get confused.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-500" /> PostgreSQL & Supabase (The Magic Lockbox)
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    A giant steel lockbox where we store your profile, your username, and your points list. It never forgets how many puzzles you solved!
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-indigo-500" /> Celery Workers (The Chefs)
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    The background cooks who take your code from the queue line, execute it inside the safe sandbox, check the result, and save it.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: Sandbox */}
            <section id="sandbox" className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>📦</span> The Safe Toy Box (The Sandbox)
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                What is a **Sandbox**? Imagine playing with sand inside a plastic bucket. If you spill water, it only wets the sand in the bucket, not the living room carpet!
              </p>
              <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-3">
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" /> Docker containers (Safe Bubbles)
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  We use **Docker** to create separate virtual tiny bubbles. When you run your code, it runs inside this bubble. 
                  Even if your code runs forever, uses too much power, or tries to steal data, it cannot break out of the bubble! 
                  It is safe, isolated, and popped cleanly after each run.
                </p>
              </div>
            </section>

            {/* Section 5: Web Flow */}
            <section id="flow" className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>🌊</span> How the Magic Flows (Website Flow)
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                When you click the green **Run** button, a fast process takes place behind the scenes:
              </p>

              <div className="relative border-l-2 border-indigo-500/20 pl-6 ml-4 space-y-6 text-xs text-[var(--text-secondary)]">
                <div className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">1</span>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Write & Submit</h4>
                  <p className="mt-1 leading-relaxed">You write code on the Front Yard board (React + Monaco) and click Submit.</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">2</span>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Waiter Delivers</h4>
                  <p className="mt-1 leading-relaxed">The waiter (FastAPI) takes your code and drops it in the queue line (Redis).</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">3</span>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Bubble is Blown</h4>
                  <p className="mt-1 leading-relaxed">The chef (Celery Worker) builds a locked tiny box (Docker sandbox) and places your code inside.</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">4</span>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Checking Answers</h4>
                  <p className="mt-1 leading-relaxed">The cook runs your code with secret input test numbers. It matches the outputs. If it is 100% correct, verdict is "Accepted"!</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">5</span>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">Deliver Gold Star</h4>
                  <p className="mt-1 leading-relaxed">The result goes back to the waiter, gets stored in the lockbox (Supabase), and displays a nice green banner on your screen!</p>
                </div>
              </div>
            </section>

            {/* Section 6: Diagram */}
            <section id="diagram" className="space-y-4 pt-4 border-t border-[var(--border)] pb-8">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>🗺️</span> Interactive Flow Map
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Follow the light-up dot to see how information moves!
              </p>

              {/* Graphical CSS/SVG Flow Map */}
              <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col gap-6 overflow-x-auto min-w-[280px]">
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
                  
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] w-40">
                    <span className="text-2xl mb-1">🎠</span>
                    <span className="font-bold text-xs text-[var(--text-primary)]">Frontend</span>
                    <span className="text-[10px] text-[var(--text-muted)]">React + Monaco</span>
                    <span className="mt-2 text-[9px] bg-indigo-500/10 text-indigo-500 font-semibold px-2 py-0.5 rounded-full">You write code</span>
                  </div>

                  <ArrowRight className="hidden md:block w-5 h-5 text-indigo-500 animate-pulse" />

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] w-40">
                    <span className="text-2xl mb-1">🏃‍♂️</span>
                    <span className="font-bold text-xs text-[var(--text-primary)]">API Waiter</span>
                    <span className="text-[10px] text-[var(--text-muted)]">FastAPI</span>
                    <span className="mt-2 text-[9px] bg-amber-500/10 text-amber-500 font-semibold px-2 py-0.5 rounded-full">Carries package</span>
                  </div>

                  <ArrowRight className="hidden md:block w-5 h-5 text-indigo-500 animate-pulse" />

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] w-40">
                    <span className="text-2xl mb-1">📦</span>
                    <span className="font-bold text-xs text-[var(--text-primary)]">Sandboxed Box</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Docker Containers</span>
                    <span className="mt-2 text-[9px] bg-emerald-500/10 text-emerald-500 font-semibold px-2 py-0.5 rounded-full">Runs securely</span>
                  </div>

                  <ArrowRight className="hidden md:block w-5 h-5 text-indigo-500 animate-pulse" />

                  {/* Step 4 */}
                  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] w-40">
                    <span className="text-2xl mb-1">💾</span>
                    <span className="font-bold text-xs text-[var(--text-primary)]">Lockbox DB</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Postgres</span>
                    <span className="mt-2 text-[9px] bg-rose-500/10 text-rose-500 font-semibold px-2 py-0.5 rounded-full">Saves point</span>
                  </div>
                </div>

                <div className="text-center text-[10px] text-[var(--text-muted)] font-mono border-t border-[var(--border)] pt-4 mt-2">
                  🔄 Information automatically loops back to show you your green checkmark!
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
