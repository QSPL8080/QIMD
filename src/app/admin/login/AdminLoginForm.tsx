'use client'

import React, { useState, useEffect } from 'react'
import { loginAdminAction } from '@/app/actions/authActions'
import { Icon } from '@iconify/react'

export default function AdminLoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    try {
      const savedRemember = localStorage.getItem('qimd_remember_me')
      if (savedRemember === 'true') {
        const savedEmail = localStorage.getItem('qimd_saved_email')
        if (savedEmail) {
          setRememberMe(true)
          setEmail(savedEmail)
        }
      }
      // If not 'true', leave defaults: rememberMe=false, email=''
    } catch (e) {
      console.error('LocalStorage error:', e)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (rememberMe) {
        localStorage.setItem('qimd_remember_me', 'true')
        localStorage.setItem('qimd_saved_email', email)
      } else {
        localStorage.setItem('qimd_remember_me', 'false')
        localStorage.removeItem('qimd_saved_email')
      }
    } catch (e) {
      console.error('LocalStorage save error:', e)
    }

    const formData = new FormData(e.currentTarget)
    const res = await loginAdminAction(null, formData)

    if (res.success && res.redirect) {
      window.location.href = res.redirect
    } else {
      setError(res.error || 'Login failed. Please check credentials.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5 shadow-2xs">
          <Icon icon="ion:alert-circle" className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div>
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 pl-10 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder="admin@qimd.in"
          />
          <Icon icon="ion:mail-outline" className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
            Password
          </label>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 pl-10 pr-10 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder="••••••••"
          />
          <Icon icon="ion:lock-closed-outline" className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors p-0.5"
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon
              icon={showPassword ? 'ion:eye-off-outline' : 'ion:eye-outline'}
              className="w-5 h-5"
            />
          </button>
        </div>
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center justify-between pt-0.5 pb-1">
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium hover:text-slate-900 transition-colors">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 accent-blue-600 cursor-pointer"
          />
          <span>Remember me</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 text-sm active:scale-[0.99]"
      >
        {loading ? (
          <>
            <Icon icon="ion:sync" className="w-5 h-5 animate-spin" />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <Icon icon="ion:log-in-outline" className="w-5 h-5" />
            <span>Sign In to Dashboard</span>
          </>
        )}
      </button>
    </form>
  )
}
