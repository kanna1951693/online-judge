import React from 'react'
import { Lock, ShieldAlert, Code2, ArrowRight, LogIn } from 'lucide-react'

export default function LockedProblemsView({ onLogin, onGetStarted }) {
  const codeLines = [
    { num: 1, text: '// SECURE SANDBOX CONNECTION ESTABLISHED', cls: 'text-[var(--accent)]/80 font-semibold' },
    { num: 2, text: 'const codePulse = require("@codepulse/core");', cls: 'text-sky-400/80' },
    { num: 3, text: 'const session  = await codePulse.getSession();', cls: 'text-[var(--text-secondary)]' },
    { num: 4, pulse: 'if (!session.isAuthenticated()) {', cls: 'text-red-400 font-bold animate-code-pulse' },
    { num: 5, text: '  // Access Denied: Sign in required', cls: 'text-[var(--text-muted)] italic' },
    { num: 6, pulse: '  throw AuthError("LOGIN_REQUIRED");', cls: 'text-red-400 font-semibold animate-code-pulse' },
    { num: 7, text: '}', cls: 'text-red-400 font-bold' },
    { num: 8, text: 'const problems = await codePulse.loadProblems();', cls: 'text-emerald-400/80' },
    { num: 9, text: 'console.log("Sandbox ready. Start coding...");', cls: 'text-[var(--accent)]/80' },
  ]

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-3.5rem-3rem)] p-4 bg-[var(--bg-base)] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent)]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-slate-900/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl w-full grid md:grid-cols-12 gap-8 items-center bg-[var(--bg-surface)]/60 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-2xl z-10">

        <div className="md:col-span-5 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)]/20 w-fit">
            <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />
            <span className="text-[10px] font-mono tracking-wider text-[var(--accent)] uppercase font-semibold">Sandbox Locked</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display leading-[1.1] text-[var(--text-primary)]">
            ACCESS<br />
            <span className="gradient-text">RESTRICTED</span>
          </h2>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            CodePulse uses a secure sandboxed execution engine. Sign in or create a free account to view problems, submit code, and run test suites.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Sandbox
            </button>
            <button
              onClick={onGetStarted}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 font-semibold text-xs transition-all cursor-pointer"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl relative overflow-hidden flex flex-col h-[280px]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)]">
                <Code2 className="w-3.5 h-3.5" />
                auth_gate.js
              </div>
            </div>

            <div className="scan-line" />

            <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-hidden bg-black/40 text-left select-none relative">
              {codeLines.map((line, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="w-6 text-right text-[var(--text-muted)] opacity-40 select-none">{line.num}</span>
                  {line.pulse
                    ? <span className={line.cls}>{line.pulse}</span>
                    : <span className={line.cls}>{line.text}</span>
                  }
                </div>
              ))}

              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/40 flex items-center justify-center animate-lock-heartbeat">
                  <Lock className="w-7 h-7 text-[var(--accent)]" style={{ filter: 'drop-shadow(0 0 8px rgba(255,92,0,0.6))' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
