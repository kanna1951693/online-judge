import React, { useState } from 'react'
import { X, Mail, Lock, User, LogIn, UserPlus, Chrome, Sparkles } from 'lucide-react'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login') // 'login' | 'register' | 'google-sim'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // For simulated Google login
  const [simName, setSimName] = useState('Google Developer')
  const [simEmail, setSimEmail] = useState('dev@google.com')

  if (!isOpen) return null

  const handleLocalSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = activeTab === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register'
    const payload = activeTab === 'login' 
      ? { email, password }
      : { username, email, password }

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed')
      }
      // Save token and user details
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onAuthSuccess(data.user, data.access_token)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSimSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Generate a simulated google_id based on email or name
    const googleId = `g_${simEmail.replace(/[^a-zA-Z0-9]/g, '')}`
    const idToken = `sim:${googleId}:${simEmail}:${simName}`

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Google Authentication failed')
      }
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onAuthSuccess(data.user, data.access_token)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Decorative corner glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold font-display tracking-wide text-[var(--text-primary)]">
              {activeTab === 'login' && 'Welcome Back'}
              {activeTab === 'register' && 'Create Account'}
              {activeTab === 'google-sim' && 'Google Authentication'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab buttons */}
        {activeTab !== 'google-sim' && (
          <div className="flex bg-[var(--bg-elevated)] p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('login'); setError('') }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'login'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError('') }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'register'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Tab Contents */}
        {activeTab !== 'google-sim' ? (
          <form onSubmit={handleLocalSubmit} className="flex flex-col gap-4 mt-1">
            {activeTab === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/10 disabled:opacity-50 text-sm flex items-center justify-center gap-1.5"
            >
              {loading ? 'Authenticating...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {/* Separator */}
            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <span className="relative px-3 bg-[var(--bg-surface)] text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
                or continue with
              </span>
            </div>

            {/* Google Authentication Options */}
            <button
              type="button"
              onClick={() => setActiveTab('google-sim')}
              className="w-full bg-[var(--bg-elevated)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 hover:shadow-sm"
            >
              <Chrome className="w-4 h-4 text-rose-500" />
              Sign in with Google (Dev Connect)
            </button>
          </form>
        ) : (
          /* Google Sim Sub-Form */
          <form onSubmit={handleGoogleSimSubmit} className="flex flex-col gap-4 mt-1">
            <div className="bg-indigo-500/10 border border-indigo-500/20 text-[var(--text-secondary)] px-4 py-3 rounded-xl text-xs leading-relaxed">
              <strong>Simulated Developer Account Connection:</strong> This allows you to simulate linking a Google account instantly for local development and profile evaluation without requiring Client ID credentials.
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Profile Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Developer"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Simulated Google Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  placeholder="dev@google.com"
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError('') }}
                className="flex-1 border border-[var(--border)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] py-3 rounded-xl font-bold transition-all text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/10 disabled:opacity-50 text-sm flex items-center justify-center gap-1.5"
              >
                {loading ? 'Connecting...' : 'Connect Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
