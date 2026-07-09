import React, { useState } from 'react'
import {
  Sparkles, X, LogIn, UserPlus, User, Mail, Lock, Chrome, ArrowLeft, Terminal, ShieldCheck
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { apiUrl } from '../lib/api'

export default function AuthPage({ initialTab = 'login', onAuthSuccess, onBack, dark }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLocalSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const endpoint = activeTab === 'login' ? '/api/v1/user/login' : '/api/v1/user/register'
    const payload = activeTab === 'login' 
      ? { email, password }
      : { username, email, password }

    try {
      const res = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed')
      }
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.access_token)
      onAuthSuccess(data.user, data.access_token)
      onBack() // Redirect back to previous or home page
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSupabaseGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Google login is disabled.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (err) throw err
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-3.5rem-3.5rem)] p-4 bg-[var(--bg-base)] relative overflow-hidden">
      {/* Background orbs to make it look premium */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-slate-900/5 dark:bg-white/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-2xl z-10 flex flex-col gap-5">
        
        {/* Back Link */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to CodePulse
        </button>

        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-sm text-[var(--accent)] border border-[var(--accent)]/30 bg-[var(--accent-subtle)] px-2 py-0.5 rounded-lg">&gt;|&lt;</span>
            <h2 className="text-xl font-bold font-display tracking-wide text-[var(--text-primary)]">
              {activeTab === 'login' ? 'System Login' : 'Developer Register'}
            </h2>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Secure Session
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[var(--bg-elevated)] p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('login'); setError('') }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError('') }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-red-500/10 border border-red-500/30 text-red-400 px-3.5 py-2.5 rounded-xl text-xs font-semibold"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLocalSubmit} className="flex flex-col gap-4">
          {activeTab === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]" htmlFor="auth-username">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="auth-username"
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]" htmlFor="auth-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]" htmlFor="auth-password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                id="auth-password"
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-sky-500/10 disabled:opacity-50 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? 'Authenticating...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="relative my-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]"></div>
            </div>
            <span className="relative px-3 bg-[var(--bg-surface)] text-[var(--text-muted)] text-[10px] font-semibold uppercase tracking-wider">
              or continue with
            </span>
          </div>

          <button
            type="button"
            onClick={handleSupabaseGoogleLogin}
            disabled={loading}
            aria-label="Sign in with Google"
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[var(--bg-elevated)] dark:hover:bg-[var(--border)] text-white py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 shadow-md shadow-slate-900/20 disabled:opacity-50 cursor-pointer"
          >
            <Chrome className="w-4 h-4 text-white" />
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  )
}
