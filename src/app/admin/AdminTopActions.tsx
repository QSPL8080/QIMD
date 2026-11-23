'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import PasswordField from '@/components/Admin/PasswordField'
import { changeOwnPasswordAction } from '@/app/actions/userActions'
import { markNotificationsReadAction } from '@/app/actions/notificationActions'
import { logoutAdminAction } from '@/app/actions/authActions'

export type TopNotification = {
  id: string
  type: string
  title: string
  actorEmail: string | null
  actorRole: string | null
  isRead: boolean
  createdAt: string
}

function timeAgo(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function useOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOut()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, onOut])
}

/** Super Admin bell: who changed their password, and when. */
export function NotificationBell({ items, unread }: { items: TopNotification[]; unread: number }) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(unread)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  useOutside(ref, () => setOpen(false))
  useEffect(() => setCount(unread), [unread])

  const markRead = async () => {
    const res = await markNotificationsReadAction()
    if (res.success) {
      setCount(0)
      router.refresh()
    }
  }

  return (
    <div className="qad-pop" ref={ref}>
      <button type="button" className={`qad-bell${open ? ' is-open' : ''}`} onClick={() => setOpen((o) => !o)} title="Notifications" aria-label="Notifications">
        <Icon icon="ion:notifications-outline" />
        {count > 0 && <span className="qad-bell-count">{count > 99 ? '99+' : count}</span>}
      </button>
      {open && (
        <div className="qad-pop-panel qad-notes">
          <div className="qad-notes-head">
            <strong>Notifications</strong>
            {count > 0 && (
              <button type="button" onClick={markRead}>
                Mark all as read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="qad-notes-empty">No notifications yet.</p>
          ) : (
            <ul>
              {items.map((n) => (
                <li key={n.id} className={n.isRead ? '' : 'is-unread'}>
                  <span className="qad-notes-ic">
                    <Icon icon="ion:key-outline" />
                  </span>
                  <span className="qad-notes-body">
                    <strong>{n.title}</strong>
                    <small>
                      {[n.actorEmail, timeAgo(n.createdAt)].filter(Boolean).join(' · ')}
                    </small>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

/** Account chip: change your own password, sign out. */
export function AccountMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(false)
  const [current, setCurrent] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setOpen(false))

  const openModal = () => {
    setOpen(false)
    setCurrent('')
    setNext('')
    setConfirm('')
    setError('')
    setDone(false)
    setModal(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (next !== confirm) {
      setError('New password and confirm password do not match.')
      return
    }
    setSaving(true)
    const res = await changeOwnPasswordAction(current, next)
    setSaving(false)
    if (res.success) setDone(true)
    else setError(res.error || 'Failed to change password.')
  }

  const inputCls =
    'w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-slate-900 focus:outline-none focus:border-blue-600'

  return (
    <div className="qad-pop" ref={ref}>
      <button type="button" className="qad-account" onClick={() => setOpen((o) => !o)}>
        <Icon icon="ion:person-circle-outline" />
        <span className="qad-account-email">{email}</span>
        <Icon icon="ion:chevron-down-outline" className="qad-account-caret" />
      </button>
      {open && (
        <div className="qad-pop-panel qad-menu">
          <button type="button" onClick={openModal}>
            <Icon icon="ion:key-outline" />
            Change Password
          </button>
          <form action={logoutAdminAction}>
            <button type="submit">
              <Icon icon="ion:log-out-outline" />
              Sign Out
            </button>
          </form>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
              <button type="button" onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600" title="Close">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            {done ? (
              <div className="space-y-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-emerald-700">
                  <Icon icon="ion:checkmark-circle-outline" className="w-5 h-5" />
                  Your password has been changed.
                </p>
                <p className="text-slate-600 text-xs">Use the new password the next time you sign in.</p>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 text-xs">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                      required
                      autoComplete="current-password"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((s) => !s)}
                      title={showCurrent ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-1.5 my-auto h-8 w-8 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-200/70"
                    >
                      <Icon icon={showCurrent ? 'ion:eye-off-outline' : 'ion:eye-outline'} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                  <PasswordField name="newPassword" value={next} onChange={setNext} required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={inputCls}
                  />
                </div>
                {error && <p className="text-rose-600 font-semibold">{error}</p>}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60">
                    {saving ? 'Saving...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
