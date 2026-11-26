'use client'

import React, { useActionState } from 'react'
import { requestPasswordResetAction } from '@/app/actions/authActions'

export default function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, null as null | { success: boolean; message?: string; error?: string })
  if (state?.success) return <p className="rounded-xl bg-emerald-50 text-emerald-800 text-sm px-4 py-3">{state.message}</p>
  return (
    <form action={action} className="space-y-4">
      {state?.error && <p className="rounded-xl bg-rose-50 text-rose-700 text-xs px-4 py-3">{state.error}</p>}
      <label className="block">
        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">Email or Username</span>
        <input name="email" required autoComplete="username" autoCapitalize="none" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-300" />
      </label>
      <button type="submit" disabled={pending} className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60">
        {pending ? 'Sending…' : 'Email me a reset link'}
      </button>
    </form>
  )
}
