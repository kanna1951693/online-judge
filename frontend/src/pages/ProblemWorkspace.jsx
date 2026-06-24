import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { ArrowLeft, Play, Loader2, CheckCircle2, XCircle, AlertCircle, Clock, Database, ChevronDown, ChevronRight } from 'lucide-react'

const LANGUAGE_BOILERPLATES = {
  python: `# Write your Python 3 solution here
import sys

def solve():
    # Read input from standard input (stdin)
    # Print output to standard output (stdout)
    pass

if __name__ == '__main__':
    solve()
`,
  cpp: `// Write your C++17 solution here
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    // Read input from standard input (cin)
    // Print output to standard output (cout)
    return 0;
}
`
}

function ProblemWorkspace({ problemId, onBack }) {
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState(LANGUAGE_BOILERPLATES.python)
  
  // Submission states
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState(null)
  const [activeTab, setActiveTab] = useState(0) // Details tab vs Case tab
  const [expandedCase, setExpandedCase] = useState(null)

  const pollIntervalRef = useRef(null)

  useEffect(() => {
    // Fetch problem details
    fetch(`/api/v1/problems/${problemId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Problem loading failed')
        return res.json()
      })
      .then((data) => {
        setProblem(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [problemId])

  const handleLanguageChange = (e) => {
    const lang = e.target.value
    setLanguage(lang)
    setCode(LANGUAGE_BOILERPLATES[lang])
  }

  const pollSubmission = (subId) => {
    fetch(`/api/v1/submission/${subId}`)
      .then((res) => res.json())
      .then((data) => {
        setSubmission(data)
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setSubmitting(false)
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
        }
      })
      .catch((err) => {
        console.error('Polling error:', err)
      })
  }

  const handleSubmit = () => {
    setSubmitting(true)
    setSubmission({ status: 'QUEUED', verdict: null, test_cases: [] })
    setExpandedCase(null)
    
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)

    fetch('/api/v1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_id: problemId,
        language: language,
        source_code: code
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to submit solution')
        return res.json()
      })
      .then((data) => {
        // Start polling
        pollSubmission(data.submission_id)
        pollIntervalRef.current = setInterval(() => {
          pollSubmission(data.submission_id)
        }, 1200)
      })
      .catch((err) => {
        setError(err.message)
        setSubmitting(false)
      })
  }

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'AC':
        return <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded text-xs font-bold font-mono">ACCEPTED</span>
      case 'WA':
        return <span className="px-2.5 py-1 bg-red-950 text-red-400 border border-red-800/40 rounded text-xs font-bold font-mono">WRONG ANSWER</span>
      case 'TLE':
        return <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800/40 rounded text-xs font-bold font-mono">TIME LIMIT EXCEEDED</span>
      case 'MLE':
        return <span className="px-2.5 py-1 bg-purple-950 text-purple-400 border border-purple-800/40 rounded text-xs font-bold font-mono">MEMORY LIMIT EXCEEDED</span>
      case 'RE':
        return <span className="px-2.5 py-1 bg-red-950 text-red-400 border border-red-800/40 rounded text-xs font-bold font-mono">RUNTIME ERROR</span>
      case 'CE':
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs font-bold font-mono">COMPILE ERROR</span>
      default:
        return <span className="px-2.5 py-1 bg-blue-950 text-blue-400 border border-blue-800/40 rounded text-xs font-bold font-mono">GRADING</span>
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm">Loading problem descriptions...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full h-[calc(100vh-4rem)]">
      {/* Left Pane: Description & Sample Test Cases */}
      <div className="w-full md:w-1/2 flex flex-col border-r border-slate-900 bg-slate-950 overflow-y-auto">
        <div className="p-6 border-b border-slate-900 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur z-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          
          <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-3">
            <span>Time: {problem.time_limit}s</span>
            <span>•</span>
            <span>Memory: {problem.memory_limit}MB</span>
          </div>
        </div>

        <div className="p-6 flex-1 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{problem.title}</h2>
            <div className="prose prose-invert text-slate-300 text-sm leading-relaxed max-w-none">
              {problem.description.split('\n').map((para, i) => (
                <p key={i} className="mb-3">{para}</p>
              ))}
            </div>
          </div>

          {/* Sample Cases */}
          {problem.sample_cases && problem.sample_cases.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Sample Test Case</h3>
              {problem.sample_cases.map((sample, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded border border-slate-800 p-4">
                    <div className="text-[10px] text-slate-500 font-mono uppercase mb-2">Input</div>
                    <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">{sample.input}</pre>
                  </div>
                  <div className="bg-slate-900 rounded border border-slate-800 p-4">
                    <div className="text-[10px] text-slate-500 font-mono uppercase mb-2">Output</div>
                    <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">{sample.output}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Code Editor & Execution Results Panel */}
      <div className="w-full md:w-1/2 flex flex-col bg-slate-900 overflow-hidden">
        {/* Editor Toolbar */}
        <div className="h-14 px-4 border-b border-slate-900 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <label className="text-xs text-slate-400 font-mono">Language:</label>
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={submitting}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="python">Python 3</option>
              <option value="cpp">C++ 17 (g++)</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-md transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Submit Code
              </>
            )}
          </button>
        </div>

        {/* Monaco Editor Container */}
        <div className="flex-1 min-h-[300px] border-b border-slate-950">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : 'python'}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'Menlo, Monaco, Consolas, Courier New, monospace',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              readOnly: submitting,
              padding: { top: 12 }
            }}
          />
        </div>

        {/* Bottom Verdict Breakdown Area */}
        <div className="h-[260px] flex flex-col bg-slate-950/80 border-t border-slate-900 overflow-hidden">
          <div className="h-10 px-4 border-b border-slate-900 flex items-center justify-between bg-slate-950">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              Submission Report Panel
            </span>
            {submission && (
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-500 font-mono">Status: {submission.status}</span>
                {getVerdictBadge(submission.verdict)}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!submission ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs font-mono text-center">
                <span>Code Sandbox Ready. Click "Submit Code" to test.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Dynamic Queue/Running indicators */}
                {(submission.status === 'QUEUED' || submission.status === 'RUNNING') && (
                  <div className="flex items-center gap-3 p-4 bg-slate-900 rounded border border-slate-800 animate-pulse">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-200">
                        {submission.status === 'QUEUED' ? 'Waiting in Queue...' : 'Running Sandbox Grader...'}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Spinning up fresh, isolated container inside Apple Silicon VM.
                      </p>
                    </div>
                  </div>
                )}

                {/* Compilation Error (CE) Box */}
                {submission.verdict === 'CE' && (
                  <div className="bg-slate-950 border border-slate-800 rounded p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-mono mb-2">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                      Compiler Diagnostic Stderr Output
                    </div>
                    <pre className="text-xs font-mono text-red-400 bg-red-950/20 border border-red-900/40 rounded p-3 overflow-x-auto whitespace-pre-wrap">
                      {submission.error_message}
                    </pre>
                  </div>
                )}

                {/* Test Cases List */}
                {submission.test_cases && submission.test_cases.length > 0 && (
                  <div className="space-y-2">
                    {submission.test_cases.map((tc) => {
                      const isExpanded = expandedCase === tc.case_id
                      return (
                        <div
                          key={tc.case_id}
                          className="bg-slate-900/50 border border-slate-900 rounded overflow-hidden"
                        >
                          <div
                            onClick={() => setExpandedCase(isExpanded ? null : tc.case_id)}
                            className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-900 transition-colors"
                          >
                            <div className="flex items-center space-x-2 text-xs">
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                              <span className="font-mono text-slate-400">Test #{tc.case_id}</span>
                              <span className="font-mono font-bold text-[10px] ml-2">
                                {tc.verdict === 'AC' ? (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                                  </span>
                                ) : (
                                  <span className="text-red-400 flex items-center gap-1">
                                    <XCircle className="w-3.5 h-3.5" /> {tc.verdict}
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono">
                              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {tc.time_ms} ms</span>
                              {tc.memory_kb > 0 && (
                                <span className="flex items-center gap-0.5"><Database className="w-3 h-3" /> {tc.memory_kb} KB</span>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2 border-t border-slate-900 bg-slate-950/60 space-y-3">
                              {/* Wrong Answer Output Details */}
                              {tc.verdict === 'WA' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                                  <div>
                                    <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Expected Output</div>
                                    <pre className="bg-slate-900 border border-slate-800 rounded p-2.5 font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                                      {tc.expected_output}
                                    </pre>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Actual Output</div>
                                    <pre className="bg-slate-900 border border-slate-800 rounded p-2.5 font-mono text-red-300 overflow-x-auto whitespace-pre-wrap">
                                      {tc.stdout}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {/* Runtime Error Stderr Details */}
                              {tc.verdict === 'RE' && tc.error_message && (
                                <div>
                                  <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Process Crash Stderr Trace</div>
                                  <pre className="bg-red-950/10 border border-red-900/20 text-red-400 rounded p-2.5 font-mono overflow-x-auto whitespace-pre-wrap text-[11px]">
                                    {tc.error_message}
                                  </pre>
                                </div>
                              )}

                              {/* Time Limit Details */}
                              {tc.verdict === 'TLE' && (
                                <div className="text-slate-400 text-xs font-mono">
                                  ⚠️ Execution exceeded maximum runtime limit. Host-driven watchdog issued SIGKILL to terminate the sandbox.
                                </div>
                              )}

                              {/* Memory Limit Details */}
                              {tc.verdict === 'MLE' && (
                                <div className="text-slate-400 text-xs font-mono">
                                  ⚠️ Container memory limit (256MB) exceeded. Process terminated by Linux kernel OOM killer (cgroups).
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemWorkspace
