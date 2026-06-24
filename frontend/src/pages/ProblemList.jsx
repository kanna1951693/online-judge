import React, { useState, useEffect } from 'react'
import { Code2, ArrowRight, Loader2, Sparkles, Server } from 'lucide-react'

function ProblemList({ onSelectProblem }) {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/v1/problems')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load algorithmic challenges')
        return res.json()
      })
      .then((data) => {
        setProblems(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm">Querying problem catalog database...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="bg-red-950/20 border border-red-800/40 rounded-lg p-6 max-w-md">
          <Server className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-red-400 font-bold mb-2">Backend Connection Failed</h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-700/30 rounded text-xs text-red-200 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
      {/* Welcome Banner */}
      <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-slate-900 border border-blue-900/30 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            Candidate Workspace
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Select a problem below to open the IDE. All code runs in a resource-budgeted, network-isolated Docker sandbox container.
          </p>
        </div>
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Docker Runtimes: C++17, Python 3.10</span>
        </div>
      </div>

      {/* Problem Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="group relative rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700 p-6 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-2xl"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium bg-slate-950 text-slate-400 border border-slate-800">
                  <Code2 className="w-3.5 h-3.5" />
                  {problem.id}
                </span>
                
                <div className="flex space-x-2 text-[10px] text-slate-500 font-mono">
                  <span>{problem.time_limit}s TLE</span>
                  <span>•</span>
                  <span>{problem.memory_limit}MB MLE</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                {problem.title}
              </h3>
              <p className="text-slate-400 text-sm line-clamp-3 mb-6">
                {problem.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-500">Exact Output Diffing Match</span>
              <button
                onClick={() => onSelectProblem(problem.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md shadow-md transition-colors"
              >
                Solve Challenge
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProblemList
