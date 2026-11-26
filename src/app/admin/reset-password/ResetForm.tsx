'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { resetPasswordAction } from '@/app/actions/authActions'

const INPUT = 'w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-300'

export default function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, null as null | { success: boolean; message?: string; error?: string })
  const [show, setShow] = useState(false)
  if (state?.success)
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-emerald-50 text-emerald-800 text-sm px-4 py-3">{state.message}</p>
        <Link href="/admin/login" className="block text-center w-full bg-zinc-900 hover:bg-black text-white font-bold py-3 rounded-xl text-sm">
          Sign in
        </Link>
      </div>
    )
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.error && <p className="rounded-xl bg-rose-50 text-rose-700 text-xs px-4 py-3">{state.error}</p>}
      <label className="block">
        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">New password</span>
        <input name="password" type={show ? 'text' : 'password'} required minLength={8} autoComplete="new-password" className={INPUT} />
      </label>
      <label className="block">
        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">Confirm new password</span>
        <input name="confirm" type={show ? 'text' : 'password'} required minLength={8} autoComplete="new-password" className={INPUT} />
      </label>
      <label className="flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
      </label>
      <button type="submit" disabled={pending} className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60">
        {pending ? 'Saving…' : 'Save new password'}
      </button>
    </form>
  )
}
