import React, { useState, useEffect } from 'react'
import ProblemList from './pages/ProblemList'
import ProblemWorkspace from './pages/ProblemWorkspace'
import CompilerPage from './pages/CompilerPage'
import ProfilePage from './pages/ProfilePage'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OpenSourceDoc from './components/OpenSourceDoc'
import LockedProblemsView from './components/LockedProblemsView'
import DsaMindMap from './components/DsaMindMap'
import DsaCheatsheet from './components/DsaCheatsheet'
import PatternDetail from './pages/PatternDetail'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import { apiUrl } from './lib/api'
import {
  Zap, LayoutList, Sun, Moon, Menu, X, User, LogOut, LogIn, Home, Network, FileText
} from 'lucide-react'

/* ── Theme toggle pill ───────────────────────────────────────────────────── */
function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`
        relative inline-flex items-center h-7 w-[52px] rounded-full border
        transition-all duration-300 ease-spring cursor-pointer focus-visible:ring-2
        focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
        ${dark
          ? 'bg-slate-900 border-slate-700'
          : 'bg-amber-50 border-amber-200'}
      `}
    >
      <Sun  className={`absolute left-1.5 w-3.5 h-3.5 text-amber-400 transition-opacity duration-200 ${dark ? 'opacity-0' : 'opacity-100'}`} />
      <Moon className={`absolute right-1.5 w-3.5 h-3.5 text-orange-400 transition-opacity duration-200 ${dark ? 'opacity-100' : 'opacity-0'}`} />
      <span
        className={`
          absolute top-0.5 h-6 w-6 rounded-full shadow-md flex items-center justify-center
          transition-transform duration-300 ease-spring
          ${dark
            ? 'translate-x-[26px] bg-[#FF5C00] shadow-orange-500/40'
            : 'translate-x-0.5 bg-white shadow-amber-200/60'}
        `}
      >
        {dark
          ? <Moon className="w-3 h-3 text-white" />
          : <Sun  className="w-3 h-3 text-amber-500" />
        }
      </span>
    </button>
  )
}

function LogoMark({ dark }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--accent)]/30 bg-[var(--accent-subtle)] shadow-sm">
        <span className="font-mono font-black text-sm text-[var(--accent)] tracking-wider">
          &gt;|&lt;
        </span>
      </div>
      <div>
        <p className="text-base font-display tracking-tight text-[var(--accent)] leading-none">
          CodePulse
        </p>
        <p className="text-[9px] font-mono text-[var(--text-muted)] leading-none mt-0.5 tracking-widest uppercase">
          Sandboxed Engine
        </p>
      </div>
    </div>
  )
}

/* ── NavButton ────────────────────────────────────────────────────────────────── */
function NavButton({ label, targetView, Icon, view, onClick }) {
  const active = view === targetView || (targetView === 'list' && view === 'problem')
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
        transition-all duration-200 cursor-pointer
        ${active
          ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent)]/30'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
        }
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

/* ── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState('home')
  const [selectedProblemId, setSelectedProblemId] = useState(null)
  const [selectedPatternId, setSelectedPatternId] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [authSyncError, setAuthSyncError] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)

  const handleSelectPattern = (patternId) => {
    setSelectedPatternId(patternId)
    setView('pattern-detail')
  }

  /* ── Persistent theme ── */
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('codepulse-theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Load auth state on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
  }, [])

  // Handle Supabase Auth redirect sync
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let handledAccessToken = null

    const exchangeSupabaseSession = async (session) => {
      if (session && session.access_token) {
        if (handledAccessToken === session.access_token) return
        handledAccessToken = session.access_token

        try {
          setAuthSyncError('')
          const res = await fetch(apiUrl('/api/v1/auth/supabase-login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: session.access_token }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.detail || 'Supabase login failed')
          
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('token', data.access_token)
          setUser(data.user)
          setToken(data.access_token)

          if (window.location.pathname === '/auth/callback' || window.location.hash || window.location.search) {
            window.history.replaceState(null, '', window.location.origin)
          }

          await supabase.auth.signOut()
        } catch (err) {
          console.error('Supabase authentication error:', err)
          setAuthSyncError(err.message)
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      exchangeSupabaseSession(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      exchangeSupabaseSession(session)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('codepulse-theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('codepulse-theme', 'light')
    }
  }, [dark])

  const handleAuthSuccess = (u, t) => {
    setUser(u)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setToken(null)
    setUserDropdownOpen(false)
    setView('home')
  }

  const handleViewProblem = (id) => {
    setSelectedProblemId(id)
    setView('problem')
    setMobileMenuOpen(false)
  }

  const handleBackToList = () => {
    setView('home')
    setSelectedProblemId(null)
  }

  const navigate = (v) => {
    setView(v)
    if (v !== 'problem') setSelectedProblemId(null)
    setMobileMenuOpen(false)
  }

  const openGetStarted = () => {
    navigate('register')
  }

  const openLogin = () => {
    navigate('login')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] font-sans transition-colors duration-200">

      {/* ── Navbar ── */}
      <header className="
        sticky top-0 z-50 h-14 border-b border-[var(--border)]
        bg-[var(--bg-surface)]/80 backdrop-blur-lg
        supports-[backdrop-filter]:bg-[var(--bg-surface)]/60
      ">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <button onClick={() => navigate('home')} className="flex-shrink-0 cursor-pointer">
            <LogoMark dark={dark} />
          </button>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <NavButton label="Home"       targetView="home"       Icon={Home}       view={view} onClick={() => navigate('home')} />
            <NavButton label="DSA Map"    targetView="patterns"   Icon={Network}    view={view} onClick={() => navigate('patterns')} />
            <NavButton label="Cheatsheet" targetView="cheatsheet" Icon={FileText}   view={view} onClick={() => navigate('cheatsheet')} />
            <NavButton label="Problems"   targetView="list"       Icon={LayoutList} view={view} onClick={() => navigate('list')} />
            <NavButton label="Compiler"   targetView="compiler"   Icon={Zap}        view={view} onClick={() => navigate('compiler')} />
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />

            {/* Authentication dropdown or sign-in */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(o => !o)}
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-all cursor-pointer text-[var(--text-primary)]"
                >
                  <div className="w-5 h-5 rounded-md bg-[var(--accent)] flex items-center justify-center text-white font-bold text-[10px] uppercase">
                    {user.username.slice(0, 2)}
                  </div>
                  <span className="hidden md:inline">{user.username}</span>
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-1.5 shadow-xl z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-[var(--border-subtle)] text-left">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user.username}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { navigate('profile'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors mt-1.5 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5" />
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-all cursor-pointer shadow-sm shadow-sky-500/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

            {/* Mobile menu */}
            <button
              className="sm:hidden p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] cursor-pointer"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 space-y-2">
            <div className="flex flex-col gap-1">
              <NavButton label="Home"       targetView="home"       Icon={Home}       view={view} onClick={() => navigate('home')} />
              <NavButton label="DSA Map"    targetView="patterns"   Icon={Network}    view={view} onClick={() => navigate('patterns')} />
              <NavButton label="Cheatsheet" targetView="cheatsheet" Icon={FileText}   view={view} onClick={() => navigate('cheatsheet')} />
              <NavButton label="Problems"   targetView="list"       Icon={LayoutList} view={view} onClick={() => navigate('list')} />
              <NavButton label="Compiler"   targetView="compiler"   Icon={Zap}        view={view} onClick={() => navigate('compiler')} />
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              {user ? (
                <div className="space-y-1">
                  <button
                    onClick={() => navigate('profile')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile ({user.username})
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-500 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { openLogin(); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2 text-xs font-semibold bg-[var(--accent)] text-white rounded-lg flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col">
        {authSyncError && (
          <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 flex items-center justify-center gap-3">
            <span>{authSyncError}</span>
            <button
              onClick={() => setAuthSyncError('')}
              aria-label="Dismiss authentication error"
              className="p-1 rounded-md hover:bg-red-500/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {!user && (view === 'list' || view === 'problem') ? (
          <LockedProblemsView onLogin={openLogin} onGetStarted={openGetStarted} />
        ) : view === 'login' || view === 'register' ? (
          <AuthPage initialTab={view === 'login' ? 'login' : 'register'} onAuthSuccess={handleAuthSuccess} onBack={() => navigate('home')} dark={dark} />
        ) : view === 'patterns' ? (
          <DsaMindMap onSelectPattern={handleSelectPattern} dark={dark} />
        ) : view === 'pattern-detail' ? (
          <PatternDetail patternId={selectedPatternId} onBack={() => navigate('patterns')} dark={dark} />
        ) : view === 'cheatsheet' ? (
          <DsaCheatsheet dark={dark} />
        ) : view === 'compiler' ? (
          <CompilerPage dark={dark} />
        ) : view === 'problem' ? (
          <ProblemWorkspace problemId={selectedProblemId} onBack={handleBackToList} dark={dark} />
        ) : view === 'profile' ? (
          <ProfilePage userProfileHash={user?.profile_hash} onBack={handleBackToList} dark={dark} />
        ) : view === 'list' ? (
          <ProblemList onSelectProblem={handleViewProblem} user={user} dark={dark} />
        ) : (
          <LandingPage
            user={user}
            onGetStarted={openGetStarted}
            onLogin={openLogin}
            onNavigate={navigate}
            onOpenSourceClick={() => setDocOpen(true)}
            dark={dark}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-4">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <p>© 2026 CodePulse — Sandboxed Online Judge</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setDocOpen(true)} 
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer font-medium"
            >
              Open Source
            </button>
            <span>·</span>
            <span>8 Languages</span>
            <span>·</span>
            <span>Sandboxed</span>
          </div>
        </div>
      </footer>

      {/* ── Open Source Story Drawer ── */}
      <OpenSourceDoc 
        isOpen={docOpen} 
        onClose={() => setDocOpen(false)} 
      />
    </div>
  )
}
