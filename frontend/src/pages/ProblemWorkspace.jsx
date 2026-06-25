import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import {
  ArrowLeft, Play, Send, Loader2, CheckCircle2, XCircle,
  AlertCircle, Clock, Database, ChevronDown, ChevronRight,
  Terminal, FlaskConical, Pause, RotateCcw, Lightbulb, BookOpen, Tag
} from 'lucide-react'

/* ── Language boilerplates ──────────────────────────────────────────────── */
const LANGUAGE_BOILERPLATES = {
  python: `# cook your solution here\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n\t// cook your solution here\n\treturn 0;\n}\n`,
  java: `import java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) throws Exception {\n        // cook your solution here\n    }\n}\n`,
}

const LANGUAGE_MONACO = { python: 'python', cpp: 'cpp', java: 'java' }

/* ── Verdict helpers ─────────────────────────────────────────────────────── */
const VERDICT_META = {
  AC:  { label: 'Accepted',              color: 'emerald' },
  WA:  { label: 'Wrong Answer',          color: 'red'     },
  TLE: { label: 'Time Limit Exceeded',   color: 'amber'   },
  MLE: { label: 'Memory Limit Exceeded', color: 'purple'  },
  RE:  { label: 'Runtime Error',         color: 'red'     },
  CE:  { label: 'Compile Error',         color: 'slate'   },
}

const VERDICT_CLS = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  red:     'bg-red-500/10     text-red-400     border-red-500/30',
  amber:   'bg-amber-500/10   text-amber-400   border-amber-500/30',
  purple:  'bg-purple-500/10  text-purple-400  border-purple-500/30',
  slate:   'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]',
  blue:    'bg-indigo-500/10  text-indigo-400  border-indigo-500/30',
}

function VerdictBadge({ verdict }) {
  const m   = VERDICT_META[verdict] || { label: 'Grading…', color: 'blue' }
  const cls = VERDICT_CLS[m.color]
  return (
    <span className={`px-2.5 py-0.5 border rounded-lg text-[10px] font-bold font-mono ${cls}`}>
      {m.label.toUpperCase()}
    </span>
  )
}

/* ── Stopwatch ───────────────────────────────────────────────────────────── */
function Stopwatch() {
  const [time, setTime]           = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef                  = useRef(null)

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
      hover:border-indigo-500/30 transition-colors">
      <Clock className="w-3 h-3 text-indigo-400" />
      <span className="font-bold text-[var(--text-primary)] tracking-wider tabular-nums">{fmt(time)}</span>
      <div className="h-2.5 w-px bg-[var(--border)]" />
      <button onClick={toggle} title={isRunning ? 'Pause' : 'Start'}
        className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">
        {isRunning ? <Pause className="w-2.5 h-2.5 text-amber-400" /> : <Play className="w-2.5 h-2.5 text-emerald-400" />}
      </button>
      <button onClick={reset} title="Reset"
        className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">
        <RotateCcw className="w-2.5 h-2.5" />
      </button>
    </div>
  )
}

/* ── Collapsible section ─────────────────────────────────────────────────── */
function CollapsibleSection({ title, icon: Icon, iconCls = 'text-indigo-400', children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3
          bg-[var(--bg-elevated)] hover:bg-[var(--bg-base)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${iconCls}`} />
          <span className="text-xs font-semibold text-[var(--text-primary)]">{title}</span>
        </div>
        {open
          ? <ChevronDown  className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          : <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
      </button>
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-surface)]">
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function ProblemWorkspace({ problemId, onBack, dark }) {
  const [problem, setProblem]   = useState(null)
  const [loading, setLoading]   = useState(true)

  const [language, setLanguage] = useState('python')
  const [code, setCode]         = useState(LANGUAGE_BOILERPLATES.python)

  const [customInput, setCustomInput] = useState('')
  const [running, setRunning]         = useState(false)
  const [runResult, setRunResult]     = useState(null)

  const [submitting, setSubmitting]     = useState(false)
  const [submission, setSubmission]     = useState(null)
  const [expandedCase, setExpandedCase] = useState(null)
  const [openHintIdx, setOpenHintIdx]   = useState(null)

  const [activePanel, setActivePanel] = useState('run')

  const pollRef = useRef(null)

  /* ── Fetch problem ── */
  useEffect(() => {
    fetch(`/api/v1/judge/problems/${problemId}`)
      .then(r => { if (!r.ok) throw new Error('Problem not found'); return r.json() })
      .then(d => { setProblem(d); setLoading(false) })
      .catch(() => setLoading(false))
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [problemId])

  /* ── Language switch ── */
  const handleLanguageChange = e => {
    const lang = e.target.value
    setLanguage(lang)
    setCode(LANGUAGE_BOILERPLATES[lang])
  }

  /* ── Run ── */
  const handleRun = async () => {
    setRunning(true); setRunResult(null); setActivePanel('run')
    try {
      const res = await fetch(`/api/v1/judge/problems/${problemId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, source_code: code, stdin: customInput }),
      })
      if (!res.ok) throw new Error('Run request failed')
      setRunResult(await res.json())
    } catch (err) {
      setRunResult({ verdict: 'RE', stderr: err.message, stdout: '', time_ms: 0 })
    } finally {
      setRunning(false)
    }
  }

  /* ── Submit ── */
  const pollSubmission = id => {
    fetch(`/api/v1/judge/submissions/${id}`)
      .then(r => r.json())
      .then(data => {
        setSubmission(data)
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setSubmitting(false)
          clearInterval(pollRef.current)
          pollRef.current = null
        }
      })
      .catch(console.error)
  }

  const handleSubmit = () => {
    setSubmitting(true)
    setSubmission({ status: 'QUEUED', verdict: null, test_cases: [] })
    setExpandedCase(null)
    setActivePanel('submit')
    if (pollRef.current) clearInterval(pollRef.current)

    const headers = { 'Content-Type': 'application/json' }
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    fetch(`/api/v1/judge/problems/${problemId}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ language, source_code: code }),
    })
      .then(r => { if (!r.ok) throw new Error('Submit failed'); return r.json() })
      .then(data => {
        pollSubmission(data.submission_id)
        pollRef.current = setInterval(() => pollSubmission(data.submission_id), 1200)
      })
      .catch(err => { setSubmitting(false); console.error(err) })
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
        <p className="text-[var(--text-muted)] font-mono text-sm">Loading problem…</p>
      </div>
    )
  }

  const DIFF_CLS = {
    Easy:   'text-emerald-500 dark:text-emerald-400',
    Medium: 'text-amber-500 dark:text-amber-400',
    Hard:   'text-red-500 dark:text-red-400',
  }

  /* Dynamic Monaco theme */
  const monacoTheme = dark ? 'vs-dark' : 'light'

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-[calc(100dvh-3.5rem)] bg-[var(--bg-base)]">

      {/* ════════ LEFT — Problem Description ════════ */}
      <div className="w-full md:w-[44%] flex flex-col border-r border-[var(--border)] bg-[var(--bg-surface)] overflow-y-auto">

        {/* Top bar */}
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between
          sticky top-0 bg-[var(--bg-surface)]/95 backdrop-blur z-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]
              hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Problems
          </button>
          <div className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-2">
            <Clock className="w-3 h-3 inline" />
            {problem?.time_limit_ms ? (problem.time_limit_ms/1000).toFixed(1) : '–'}s
            <span className="text-[var(--border)]">·</span>
            <Database className="w-3 h-3 inline" />
            {problem?.memory_limit_kb ? Math.round(problem.memory_limit_kb/1024) : '–'}MB
          </div>
        </div>

        <div className="p-6 space-y-7">

          {/* Title + meta */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {problem?.difficulty && (
                <span className={`text-xs font-bold ${DIFF_CLS[problem.difficulty] || 'text-[var(--text-muted)]'}`}>
                  {problem.difficulty}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{problem?.title}</h2>

            {/* Description */}
            <div className="text-[var(--text-secondary)] text-sm leading-relaxed space-y-2">
              {(problem?.statement || problem?.description)?.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Examples */}
          {problem?.sample_cases?.length > 0 && (
            <div className="space-y-4">
              {problem.sample_cases.map((ex, idx) => (
                <div key={idx}>
                  <p className="text-sm font-bold text-[var(--text-primary)] mb-2">Example {idx+1}:</p>
                  <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-4
                    font-mono text-xs space-y-2">
                    <div>
                      <span className="text-[var(--text-muted)]">Input:&nbsp;&nbsp;</span>
                      <span className="text-[var(--text-primary)]">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">Output:&nbsp;</span>
                      <span className="text-[var(--text-primary)]">{ex.expected_output || ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="pt-2 border-t border-[var(--border)] text-[var(--text-muted)] text-[11px]">
                        <span className="font-semibold text-[var(--text-secondary)]">Explanation: </span>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Constraints */}
          {problem?.constraints?.length > 0 && (
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)] mb-3">Constraints:</p>
              <ul className="space-y-1.5">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                    <span className="text-indigo-400">•</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hints */}
          {problem?.hints?.length > 0 && (
            <CollapsibleSection title={`Hints (${problem.hints.length})`} icon={Lightbulb} iconCls="text-yellow-400">
              <div className="divide-y divide-[var(--border)]">
                {problem.hints.map((hint, idx) => {
                  const isOpen = openHintIdx === idx
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => setOpenHintIdx(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between px-4 py-2.5
                          hover:bg-[var(--bg-elevated)] transition-colors text-xs cursor-pointer"
                      >
                        <span className="font-semibold text-[var(--text-secondary)]">Hint {idx+1}</span>
                        {isOpen
                          ? <ChevronDown  className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          : <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3 text-xs text-[var(--text-secondary)] leading-relaxed
                          bg-[var(--bg-elevated)]/40">
                          {hint}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* Similar Questions */}
          {problem?.similar_questions?.length > 0 && (
            <CollapsibleSection title="Similar Questions" icon={BookOpen} iconCls="text-indigo-400">
              <div className="divide-y divide-[var(--border)]">
                {problem.similar_questions.map((q, idx) => {
                  const dc = {
                    Easy:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
                    Medium: 'text-amber-400   bg-amber-500/10   border-amber-500/25',
                    Hard:   'text-red-400     bg-red-500/10     border-red-500/25',
                  }[q.difficulty] || 'text-[var(--text-muted)] bg-[var(--bg-elevated)] border-[var(--border)]'
                  return (
                    <div key={idx} className="flex items-center justify-between px-4 py-3
                      hover:bg-[var(--bg-elevated)] transition-colors">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{q.title}</span>
                      <span className={`px-2 py-0.5 border rounded-lg text-[10px] font-bold font-mono ${dc}`}>
                        {q.difficulty}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CollapsibleSection>
          )}

        </div>
      </div>

      {/* ════════ RIGHT — Editor + Panels ════════ */}
      <div className="w-full md:w-[56%] flex flex-col bg-[var(--bg-base)] overflow-hidden">

        {/* Editor toolbar */}
        <div className="h-12 px-4 border-b border-[var(--border)] flex items-center justify-between
          bg-[var(--bg-surface)]">

          <div className="flex items-center gap-3">
            <label className="text-xs text-[var(--text-muted)] font-mono hidden sm:inline">Language:</label>
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={submitting || running}
              className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2.5 py-1
                text-xs text-[var(--text-primary)] font-mono
                focus:outline-none focus:border-indigo-500/40
                disabled:opacity-50 cursor-pointer"
            >
              <option value="python">Python 3</option>
              <option value="cpp">C++ 17</option>
              <option value="java">Java 17</option>
            </select>
          </div>

          <Stopwatch />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={running || submitting}
              title="Run with custom input"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] border border-[var(--border)]
                hover:border-indigo-500/30 hover:text-indigo-400
                text-[var(--text-primary)] text-xs font-semibold
                transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {running
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Running…</>
                : <><Play    className="w-3.5 h-3.5 fill-current" />Run</>}
            </button>

            <button
              onClick={handleSubmit}
              disabled={submitting || running}
              title="Submit to judge all test cases"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold
                shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30
                transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Judging…</>
                : <><Send    className="w-3.5 h-3.5" />Submit</>}
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0 border-b border-[var(--border)]">
          <Editor
            height="100%"
            language={LANGUAGE_MONACO[language]}
            theme={monacoTheme}
            value={code}
            onChange={val => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
              fontLigatures: true,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              readOnly: submitting || running,
              padding: { top: 12, bottom: 12 },
              tabSize: 4,
              lineNumbers: 'on',
              bracketPairColorization: { enabled: true },
              smoothScrolling: true,
            }}
          />
        </div>

        {/* ── Bottom Panel ── */}
        <div className="h-[260px] flex flex-col bg-[var(--bg-surface)] border-t border-[var(--border)] overflow-hidden">

          {/* Tabs */}
          <div className="flex items-center border-b border-[var(--border)] bg-[var(--bg-surface)]">
            <button
              onClick={() => setActivePanel('run')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 cursor-pointer
                ${activePanel === 'run'
                  ? 'text-[var(--text-primary)] border-indigo-500'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] border-transparent'}`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Custom Input / Output
            </button>
            <button
              onClick={() => setActivePanel('submit')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 cursor-pointer
                ${activePanel === 'submit'
                  ? 'text-[var(--text-primary)] border-emerald-500'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] border-transparent'}`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Test Results
              {submission?.verdict && (
                <span className="ml-1.5"><VerdictBadge verdict={submission.verdict} /></span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-hidden">

            {/* ── Run tab ── */}
            {activePanel === 'run' && (
              <div className="flex h-full divide-x divide-[var(--border)]">

                <div className="flex flex-col w-1/2 p-3">
                  <label className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest mb-1.5">
                    stdin — Custom Input
                  </label>
                  <textarea
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="Type your input here…"
                    className="flex-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-2.5
                      text-xs font-mono text-[var(--text-primary)] resize-none
                      focus:outline-none focus:border-indigo-500/40
                      placeholder:text-[var(--text-muted)]"
                    spellCheck={false}
                  />
                </div>

                <div className="flex flex-col w-1/2 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest">
                      stdout — Output
                    </label>
                    {runResult && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">{runResult.time_ms}ms</span>
                        <span className={`text-[10px] font-bold font-mono ${
                          runResult.verdict === 'OK' ? 'text-emerald-400' :
                          runResult.verdict === 'CE' ? 'text-[var(--text-secondary)]' : 'text-red-400'
                        }`}>
                          {runResult.verdict === 'OK' ? '✓ OK' : `✗ ${runResult.verdict}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-auto bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-2.5">
                    {running ? (
                      <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-xs font-mono gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Executing in sandbox…
                      </div>
                    ) : runResult ? (
                      runResult.verdict === 'CE' ? (
                        <pre className="text-xs font-mono text-red-400 whitespace-pre-wrap">
                          {runResult.compile_error || 'Compile Error'}
                        </pre>
                      ) : runResult.stderr ? (
                        <pre className="text-xs font-mono text-red-400 whitespace-pre-wrap">
                          {runResult.stderr}
                        </pre>
                      ) : (
                        <pre className="text-xs font-mono text-[var(--text-primary)] whitespace-pre-wrap">
                          {runResult.stdout || '(no output)'}
                        </pre>
                      )
                    ) : (
                      <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-xs font-mono">
                        Press Run ▶ to see output
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ── Submit tab ── */}
            {activePanel === 'submit' && (
              <div className="h-full overflow-y-auto p-4 space-y-3">
                {!submission ? (
                  <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-xs font-mono">
                    Press Submit to judge against all hidden test cases
                  </div>
                ) : (
                  <>
                    {/* Queue / Running indicator */}
                    {(submission.status === 'QUEUED' || submission.status === 'RUNNING') && (
                      <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border)] animate-pulse">
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold font-mono text-[var(--text-primary)]">
                            {submission.status === 'QUEUED' ? 'Queued — waiting for worker…' : 'Running in isolated sandbox…'}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            Docker · --network none · resource limits enforced
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Compile Error */}
                    {submission.verdict === 'CE' && (
                      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] font-mono mb-2">
                          <AlertCircle className="w-4 h-4" /> Compile Error
                        </div>
                        <pre className="text-xs font-mono text-red-400 bg-red-500/5 border border-red-500/15 rounded-lg p-2.5 whitespace-pre-wrap overflow-x-auto">
                          {submission.error_message}
                        </pre>
                      </div>
                    )}

                    {/* Test Cases */}
                    {submission.test_cases?.length > 0 && (
                      <div className="space-y-1.5">
                        {submission.test_cases.map(tc => {
                          const isOpen = expandedCase === tc.case_id
                          return (
                            <div key={tc.case_id}
                              className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl overflow-hidden">
                              <div
                                onClick={() => setExpandedCase(isOpen ? null : tc.case_id)}
                                className="flex items-center justify-between px-3 py-2 cursor-pointer
                                  hover:bg-[var(--bg-base)] transition-colors"
                              >
                                <div className="flex items-center gap-2 text-xs">
                                  {isOpen
                                    ? <ChevronDown  className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                    : <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                                  <span className="font-mono text-[var(--text-secondary)]">Test #{tc.case_id}</span>
                                  {tc.verdict === 'AC'
                                    ? <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px] font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                                      </span>
                                    : <span className="text-red-400 flex items-center gap-1 font-mono text-[10px] font-bold">
                                        <XCircle className="w-3.5 h-3.5" /> {tc.verdict}
                                      </span>
                                  }
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-mono">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tc.time_ms}ms</span>
                                  {tc.memory_kb > 0 && (
                                    <span className="flex items-center gap-1"><Database className="w-3 h-3" />{tc.memory_kb}KB</span>
                                  )}
                                </div>
                              </div>

                              {isOpen && (
                                <div className="px-4 pb-3 pt-2 border-t border-[var(--border)] bg-[var(--bg-base)] space-y-2">
                                  {tc.verdict === 'WA' && (
                                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                                      <div>
                                        <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase mb-1">Expected Output</div>
                                        <pre className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 font-mono text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap">
                                          {tc.expected_output}
                                        </pre>
                                      </div>
                                      <div>
                                        <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase mb-1">Your Output</div>
                                        <pre className="bg-[var(--bg-elevated)] border border-red-500/20 rounded-lg p-2 font-mono text-red-400 overflow-x-auto whitespace-pre-wrap">
                                          {tc.stdout}
                                        </pre>
                                      </div>
                                    </div>
                                  )}
                                  {tc.verdict === 'RE' && tc.error_message && (
                                    <pre className="text-red-400 bg-red-500/5 border border-red-500/15 rounded-lg p-2.5 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                                      {tc.error_message}
                                    </pre>
                                  )}
                                  {tc.verdict === 'TLE' && (
                                    <p className="text-amber-400 text-xs font-mono">
                                      ⚠ Execution exceeded time limit of {problem?.time_limit}s
                                    </p>
                                  )}
                                  {tc.verdict === 'MLE' && (
                                    <p className="text-purple-400 text-xs font-mono">
                                      ⚠ Memory usage exceeded limit of {problem?.memory_limit}MB
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
