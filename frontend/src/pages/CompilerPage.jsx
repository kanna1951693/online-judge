import React, { useState, useRef, useCallback, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { apiUrl } from '../lib/api'
import {
  Play, Loader2, Terminal, ChevronDown, ChevronRight,
  Copy, Check, RotateCcw, Zap, Clock, Cpu, FileText,
  AlertCircle, CheckCircle2, XCircle, Pause, Code2
} from 'lucide-react'

/* ── Per-language starter boilerplates ────────────────────────────────────── */
const BOILERPLATES = {
  python: {
    code: `# cook your dish here\n`,
    label: 'Python 3.10',
    monaco: 'python',
  },
  cpp: {
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n\t// cook your dish here\n\treturn 0;\n}\n`,
    label: 'C++ 17',
    monaco: 'cpp',
  },
  java: {
    code: `import java.util.*;\nimport java.lang.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) throws java.lang.Exception {\n        // cook your dish here\n    }\n}\n`,
    label: 'Java 17',
    monaco: 'java',
  },
}

/* ── Verdict styles ──────────────────────────────────────────────────────── */
const VERDICT_STYLES = {
  AC:  { color: 'emerald', label: 'Accepted',         Icon: CheckCircle2 },
  WA:  { color: 'red',     label: 'Wrong Answer',     Icon: XCircle      },
  RE:  { color: 'red',     label: 'Runtime Error',    Icon: XCircle      },
  TLE: { color: 'amber',   label: 'Time Exceeded',    Icon: Clock        },
  MLE: { color: 'purple',  label: 'Memory Exceeded',  Icon: Cpu          },
  CE:  { color: 'slate',   label: 'Compile Error',    Icon: AlertCircle  },
}

const VERDICT_COLORS = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 dark:bg-emerald-900/20',
  red:     'bg-red-500/10     text-red-400     border-red-500/30     dark:bg-red-900/20',
  amber:   'bg-amber-500/10   text-amber-400   border-amber-500/30   dark:bg-amber-900/20',
  purple:  'bg-purple-500/10  text-purple-400  border-purple-500/30  dark:bg-purple-900/20',
  slate:   'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]',
}

/* ── VerdictBanner ────────────────────────────────────────────────────────── */
function VerdictBanner({ result }) {
  if (!result) return null
  const meta   = VERDICT_STYLES[result.verdict] || { color: 'slate', label: result.verdict, Icon: AlertCircle }
  const colors = VERDICT_COLORS[meta.color] || VERDICT_COLORS.slate
  const { Icon } = meta
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-bold font-mono">{meta.label.toUpperCase()}</span>
      {result.time_ms != null && (
        <span className="ml-auto text-xs opacity-70 font-mono">{result.time_ms}ms</span>
      )}
    </div>
  )
}

/* ── OutputBlock ─────────────────────────────────────────────────────────── */
function OutputBlock({ label, content, accent = 'slate', empty = 'No output.' }) {
  const colors = {
    slate:   'border-[var(--border)]  bg-[var(--bg-base)]',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    red:     'border-red-500/20     bg-red-500/5',
  }
  return (
    <div className={`rounded-xl border ${colors[accent] || colors.slate} overflow-hidden`}>
      <div className="px-3 py-1.5 border-b border-inherit flex items-center gap-2 bg-[var(--bg-elevated)]/50">
        <Terminal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span className="text-[10px] font-mono text-[var(--text-muted)] font-semibold tracking-widest uppercase">
          {label}
        </span>
      </div>
      <pre className="p-4 text-xs font-mono text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap max-h-64">
        {content?.trim() || <span className="text-[var(--text-muted)] italic">{empty}</span>}
      </pre>
    </div>
  )
}

/* ── Stopwatch ───────────────────────────────────────────────────────────── */
function Stopwatch() {
  const [time, setTime]         = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef                = useRef(null)

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isRunning])

  const toggle = () => setIsRunning(r => !r)
  const reset  = () => { setIsRunning(false); setTime(0) }

  const fmt = s => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return [h > 0 ? String(h).padStart(2,'0') : null, String(m).padStart(2,'0'), String(sec).padStart(2,'0')]
      .filter(Boolean).join(':')
  }

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg
      bg-[var(--bg-elevated)] border border-[var(--border)]
      text-[var(--text-muted)] font-mono text-[10px] select-none
      hover:border-[var(--accent)]/30 transition-colors">
      <Clock className="w-3 h-3 text-[var(--accent)]" />
      <span className="font-bold text-[var(--text-primary)] tracking-wider tabular-nums">{fmt(time)}</span>
      <div className="h-2.5 w-px bg-[var(--border)]" />
      <button onClick={toggle} title={isRunning ? 'Pause' : 'Start'}
        className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">
        {isRunning
          ? <Pause className="w-2.5 h-2.5 text-amber-400" />
          : <Play  className="w-2.5 h-2.5 text-emerald-400" />}
      </button>
      <button onClick={reset} title="Reset"
        className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">
        <RotateCcw className="w-2.5 h-2.5" />
      </button>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function CompilerPage({ dark }) {
  const [language, setLanguage]   = useState('python')
  const [code, setCode]           = useState(BOILERPLATES.python.code)
  const [stdin, setStdin]         = useState('')
  const [running, setRunning]     = useState(false)
  const [result, setResult]       = useState(null)
  const [copied, setCopied]       = useState(false)
  const [stdinOpen, setStdinOpen] = useState(true)
  const editorRef                 = useRef(null)

  const handleLanguageChange = useCallback(lang => {
    setLanguage(lang)
    setCode(BOILERPLATES[lang].code)
    setResult(null)
  }, [])

  const handleRun = async () => {
    setRunning(true); setResult(null)
    try {
      const res  = await fetch(apiUrl('/api/v1/compiler/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, source_code: code, stdin }),
      })
      setResult(await res.json())
    } catch (err) {
      setResult({ verdict: 'RE', stderr: err.message, stdout: '', time_ms: 0 })
    } finally {
      setRunning(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleReset = () => { setCode(BOILERPLATES[language].code); setResult(null) }

  /* Monaco theme based on props */
  const monacoTheme = dark ? 'vs-dark' : 'light'

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-3.5rem)] overflow-hidden bg-[var(--bg-base)]">

      {/* ── Top bar ── */}
      <div className="h-12 border-b border-[var(--border)] bg-[var(--bg-surface)] flex items-center justify-between px-4 gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
            <Zap className="w-4 h-4 text-yellow-400" />
            Compiler
          </div>
          <span className="hidden sm:inline text-[10px] text-[var(--text-muted)] font-mono
            px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)]">
            Sandboxed · stdin supported · isolated execution
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language tabs */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--border)]">
            {Object.entries(BOILERPLATES).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => handleLanguageChange(key)}
                className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer
                  ${language === key
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Split layout ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ══ LEFT — Editor ══ */}
        <div className="flex-1 flex flex-col border-r border-[var(--border)] overflow-hidden min-h-[40vh] lg:min-h-0">

          {/* Editor chrome bar */}
          <div className="h-9 border-b border-[var(--border)] bg-[var(--bg-surface)] flex items-center justify-between px-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-2 text-[11px] text-[var(--text-muted)] font-mono">
                {language === 'java' ? 'Solution.java' : language === 'cpp' ? 'solution.cpp' : 'solution.py'}
              </span>
            </div>

            <Stopwatch />

            <div className="flex items-center gap-1">
              <button onClick={handleCopy} title="Copy code"
                className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]
                  hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                {copied
                  ? <Check    className="w-3.5 h-3.5 text-emerald-400" />
                  : <Copy     className="w-3.5 h-3.5" />}
              </button>
              <button onClick={handleReset} title="Reset to boilerplate"
                className="p-1.5 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]
                  hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={BOILERPLATES[language].monaco}
              value={code}
              onChange={v => setCode(v ?? '')}
              onMount={e => { editorRef.current = e }}
              theme={monacoTheme}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: 'on',
                renderLineHighlight: 'gutter',
                smoothScrolling: true,
                cursorBlinking: 'phase',
                wordWrap: 'on',
                bracketPairColorization: { enabled: true },
                tabSize: language === 'python' ? 4 : 2,
              }}
            />
          </div>
        </div>

        {/* ══ RIGHT — Stdin + Output ══ */}
        <div className="w-full lg:w-96 flex flex-col bg-[var(--bg-surface)]
          border-t border-[var(--border)] lg:border-t-0 overflow-hidden">

          {/* Stdin */}
          <div className="border-b border-[var(--border)]">
            <button
              onClick={() => setStdinOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5
                hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)] font-mono">STDIN</span>
                <span className="text-[10px] text-[var(--text-muted)]">custom input</span>
              </div>
              {stdinOpen
                ? <ChevronDown  className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                : <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
            </button>
            {stdinOpen && (
              <textarea
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                placeholder="Type or paste your input here…"
                spellCheck={false}
                className="w-full h-28 px-4 py-3 bg-[var(--bg-base)] border-t border-[var(--border)]
                  text-[var(--text-primary)] font-mono text-xs resize-none
                  focus:outline-none focus:border-[var(--accent)]/40
                  placeholder:text-[var(--text-muted)]"
              />
            )}
          </div>

          {/* Run button */}
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <button
              onClick={handleRun}
              disabled={running}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:opacity-90
                disabled:opacity-50 disabled:cursor-not-allowed
                text-white text-sm font-bold transition-all duration-200
                shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30
                hover:glow-pulse cursor-pointer"
            >
              {running
                ? <><Loader2 className="w-4 h-4 animate-spin" />Executing…</>
                : <><Play    className="w-4 h-4" />Run Code</>}
            </button>
          </div>

          {/* Output area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {running && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-[var(--accent)]/20 border-t-[var(--accent)] animate-spin" />
                <p className="text-xs text-[var(--text-muted)] font-mono animate-pulse">
                  Running in sandbox…
                </p>
              </div>
            )}

            {!running && result && (
              <>
                <VerdictBanner result={result} />
                {result.stdout && (
                  <OutputBlock label="stdout" content={result.stdout}
                    accent={result.verdict === 'AC' ? 'emerald' : 'slate'} />
                )}
                {result.stderr && (
                  <OutputBlock
                    label={result.verdict === 'CE' ? 'compile error' : 'stderr'}
                    content={result.stderr} accent="red" />
                )}
                {!result.stdout && !result.stderr && (
                  <div className="text-center py-8 text-[var(--text-muted)] text-xs font-mono">
                    No output produced.
                  </div>
                )}
              </>
            )}

            {!running && !result && (
              <div className="flex flex-col items-center justify-center py-12 gap-5 text-center fade-up">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]
                  flex items-center justify-center">
                  <Terminal className="w-7 h-7 text-[var(--text-muted)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Output will appear here</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">Write code → set stdin → Run</p>
                </div>

                {/* Language cards */}
                <div className="grid grid-cols-3 gap-2 w-full max-w-xs mt-2">
                  {[
                    { icon: 'PY', name: 'Python 3.10', cmd: 'python3'  },
                    { icon: 'C++', name: 'C++ 17',      cmd: 'g++ -O2'  },
                    { icon: 'JV', name: 'Java 17',      cmd: 'javac'    },
                  ].map(l => (
                    <div key={l.name}
                      className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] p-2.5 text-center
                        hover:border-[var(--accent)]/30 transition-colors">
                      <div className="text-[9px] font-black text-[var(--accent)] mb-1 font-mono tracking-widest">{l.icon}</div>
                      <div className="text-[10px] font-bold text-[var(--text-primary)]">{l.name}</div>
                      <div className="text-[9px] text-[var(--text-muted)] font-mono">{l.cmd}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
