import React, { useState } from 'react'
import ProblemList from './pages/ProblemList'
import ProblemWorkspace from './pages/ProblemWorkspace'
import { Award, ShieldAlert, Cpu } from 'lucide-react'

function App() {
  const [view, setView] = useState('list')
  const [selectedProblemId, setSelectedProblemId] = useState(null)

  const handleViewProblem = (id) => {
    setSelectedProblemId(id)
    setView('problem')
  }

  const handleBackToList = () => {
    setView('list')
    setSelectedProblemId(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleBackToList}>
            <span className="text-2xl">⚖️</span>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                ApexJudge
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">SANDBOXED ENGINE v1.0</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Docker Workers Online</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/30">
              <Award className="w-3.5 h-3.5" />
              <span>SDE Recruiting Candidate</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col">
        {view === 'list' ? (
          <ProblemList onSelectProblem={handleViewProblem} />
        ) : (
          <ProblemWorkspace problemId={selectedProblemId} onBack={handleBackToList} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <p>© 2026 ApexJudge. Built under 5-day lock down.</p>
          <div className="flex items-center space-x-1 text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Isolated Execution (Docker cgroups, --network none, read-only rootfs)</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
