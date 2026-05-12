'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/utils/supabase/client'

import { FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/upload')
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-sm bg-background border border-border rounded-xl p-10 shadow-md">

        <div className="mb-8">
          <h1 className="font-serif italic text-[22px] text-foreground tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-muted">Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg text-[13px] bg-[--color-red-50] border border-[--color-red-500] text-[--color-red-700]">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[--color-text-secondary] mb-1.5">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-9 px-3 rounded-lg text-sm bg-surface border border-border-strong text-foreground placeholder:text-[--color-text-tertiary] outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle transition-shadow"
          />
        </div>

        <div className="mb-1.5">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[--color-text-secondary] mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-9 px-3 rounded-lg text-sm bg-surface border border-border-strong text-foreground placeholder:text-[--color-text-tertiary] outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle transition-shadow"
          />
        </div>

        <div className="text-right mb-5">
          <a href="/forgot-password" className="text-xs text-[--color-text-secondary] hover:text-foreground transition-colors">
            Forgot password?
          </a>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-9 rounded-lg text-sm font-medium bg-foreground text-background disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 active:scale-[0.99] transition-all"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="flex items-center gap-3 my-4 text-xs text-muted">
          <div className="flex-1 h-px bg-border" />
          or
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full h-9 rounded-lg text-sm text-foreground border border-border-strong flex items-center justify-center gap-2 hover:bg-surface active:scale-[0.99] transition-all"
        >
          <FaGoogle />
          Continue with Google
        </button>

        <p className="text-center mt-5 text-[13px] text-muted">
          No account?{' '}
          <a href="/signup" className="text-foreground font-medium hover:underline">
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}