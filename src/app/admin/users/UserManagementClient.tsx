'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { confirmDialog } from '@/components/Admin/confirmDialog'
import PasswordField from '@/components/Admin/PasswordField'
import Modal, { Msg } from '@/components/Admin/Modal'
import { Card, Badge, Field, INPUT, BTN_PRIMARY, BTN_SECONDARY, BTN_GHOST_DANGER } from '@/components/Admin/ui'
import { ROLE_LIST, VIEWER_MODULES, normalizeRole, roleLabel, parseModuleAccess } from '@/lib/permissions'
import { saveUserAction, trashUserAction, restoreUserAction, deleteUserPermanentlyAction, resetUserPasswordAction, sendResetLinkAction, unlockUserAction } from '@/app/actions/userActions'

type UserItem = {
  id: string
  fullName: string
  email: string
  username: string | null
  phone: string | null
  role: string
  status: boolean
  isDeleted: boolean
  lastLogin: string | null
  createdAt: string
  moduleAccess: string | null
  lockedUntil: string | null
}
type M = { ok: boolean; text: string } | null

const fmt = (d: string | null) => (d ? new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'Never')

export default function UserManagementClient(props: { initialUsers: UserItem[]; currentUserId: string; superAdmin: boolean; canAdd: boolean; canEdit: boolean; canDelete: boolean; mailReady: boolean }) {
  const { initialUsers: users, currentUserId, superAdmin } = props
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [bin, setBin] = useState(false)
  const [editing, setEditing] = useState<UserItem | 'new' | null>(null)
  const [pwdFor, setPwdFor] = useState<UserItem | null>(null)
  const [credentials, setCredentials] = useState<{ name: string; login: string; password: string } | null>(null)
  const [msg, setMsg] = useState<M>(null)

  const now = Date.now()
  const locked = (u: UserItem) => Boolean(u.lockedUntil && new Date(u.lockedUntil).getTime() > now)
  const manageable = (u: UserItem) => superAdmin || normalizeRole(u.role) !== 'SUPER_ADMIN'

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (bin ? !u.isDeleted : u.isDeleted) return false
      if (q && ![u.fullName, u.email, u.username || '', u.phone || ''].some((x) => x.toLowerCase().includes(q))) return false
      if (roleFilter && normalizeRole(u.role) !== roleFilter) return false
      if (statusFilter === 'ACTIVE' && !u.status) return false
      if (statusFilter === 'INACTIVE' && u.status) return false
      if (statusFilter === 'LOCKED' && !locked(u)) return false
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, search, roleFilter, statusFilter, bin])

  const run = async (fn: () => Promise<{ success: boolean; message?: string; error?: string }>) => {
    const r = await fn()
    setMsg({ ok: r.success, text: r.success ? r.message || 'Done.' : r.error || 'Failed.' })
    if (r.success) router.refresh()
    return r.success
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <label className="sm:col-span-2">
            <span className="block text-xs font-semibold text-slate-600 mb-1">Search</span>
            <input className={INPUT} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, username or phone" />
          </label>
          <label>
            <span className="block text-xs font-semibold text-slate-600 mb-1">Role</span>
            <select className={INPUT} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              {ROLE_LIST.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-xs font-semibold text-slate-600 mb-1">Status</span>
            <select className={INPUT} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="LOCKED">Locked</option>
            </select>
          </label>
          <div className="flex gap-2 justify-end">
            {superAdmin && (
              <button type="button" className={BTN_SECONDARY} onClick={() => setBin(!bin)}>
                {bin ? 'Active users' : `Bin (${users.filter((u) => u.isDeleted).length})`}
              </button>
            )}
            {props.canAdd && !bin && (
              <button type="button" className={BTN_PRIMARY} onClick={() => setEditing('new')}>
                <Icon icon="ion:person-add-outline" className="w-4 h-4" /> Add user
              </button>
            )}
          </div>
        </div>
      </Card>

      <Msg msg={msg} />

      {credentials && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>
            Login details for <strong>{credentials.name}</strong>: <span className="font-mono">{credentials.login}</span> / <span className="font-mono">{credentials.password}</span>. Share them privately — the password is not shown again.
          </span>
          <span className="flex gap-2">
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => navigator.clipboard?.writeText(`Login: ${window.location.origin}/admin/login\nUser: ${credentials.login}\nPassword: ${credentials.password}`).catch(() => {})}
            >
              Copy
            </button>
            <button type="button" className={BTN_SECONDARY} onClick={() => setCredentials(null)}>
              Done
            </button>
          </span>
        </div>
      )}

      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last sign-in</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                list.map((u) => {
                  const self = u.id === currentUserId
                  const can = manageable(u)
                  const mods = normalizeRole(u.role) === 'VIEWER' ? parseModuleAccess(u.moduleAccess) : []
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 align-top">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">
                          {u.fullName} {self && <Badge tone="blue">You</Badge>}
                        </div>
                        <div className="text-[11px] text-slate-500 break-all">
                          {u.email}
                          {u.username ? ` · @${u.username}` : ''}
                          {u.phone ? ` · ${u.phone}` : ''}
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        <div className="font-semibold text-slate-800">{roleLabel(u.role)}</div>
                        {mods.length > 0 && <div className="text-slate-500">{mods.map((m) => VIEWER_MODULES.find((x) => x.value === m)?.label).join(', ')}</div>}
                      </td>
                      <td className="p-3">
                        {u.isDeleted ? <Badge tone="red">In Bin</Badge> : locked(u) ? <Badge tone="red">Locked</Badge> : u.status ? <Badge tone="green">Active</Badge> : <Badge>Inactive</Badge>}
                      </td>
                      <td className="p-3 text-xs whitespace-nowrap">{fmt(u.lastLogin)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {!can ? (
                            <span className="text-[11px] text-slate-400">Super Admin only</span>
                          ) : u.isDeleted ? (
                            superAdmin && (
                              <>
                                <button type="button" className={BTN_SECONDARY} onClick={() => run(() => restoreUserAction(u.id))}>
                                  Restore
                                </button>
                                <button
                                  type="button"
                                  className={BTN_GHOST_DANGER}
                                  onClick={async () => {
                                    if (await confirmDialog(`Permanently delete ${u.fullName}? This cannot be undone. Their name stays on history records.`, { confirmText: 'Delete forever' })) run(() => deleteUserPermanentlyAction(u.id))
                                  }}
                                >
                                  Delete forever
                                </button>
                              </>
                            )
                          ) : (
                            <>
                              {props.canEdit && (
                                <button type="button" className={BTN_SECONDARY} onClick={() => setEditing(u)}>
                                  Edit
                                </button>
                              )}
                              {props.canEdit && (
                                <button type="button" className={BTN_SECONDARY} onClick={() => setPwdFor(u)}>
                                  Set password
                                </button>
                              )}
                              {props.canEdit && (
                                <button
                                  type="button"
                                  className={BTN_SECONDARY}
                                  disabled={!props.mailReady}
                                  title={props.mailReady ? 'Email a single-use reset link' : 'Email is not set up'}
                                  onClick={async () => {
                                    if (await confirmDialog(`Email a password reset link to ${u.email}? The link works once, for 30 minutes.`, { confirmText: 'Send link', danger: false })) run(() => sendResetLinkAction(u.id))
                                  }}
                                >
                                  Reset link
                                </button>
                              )}
                              {props.canEdit && locked(u) && (
                                <button type="button" className={BTN_SECONDARY} onClick={() => run(() => unlockUserAction(u.id))}>
                                  Unlock
                                </button>
                              )}
                              {props.canDelete && !self && (
                                <button
                                  type="button"
                                  className={BTN_GHOST_DANGER}
                                  onClick={async () => {
                                    if (await confirmDialog(`Deactivate ${u.fullName} and move the account to the Bin? They can no longer sign in.`, { confirmText: 'Move to Bin' })) run(() => trashUserAction(u.id))
                                  }}
                                >
                                  Delete
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <UserModal
          user={editing === 'new' ? null : editing}
          superAdmin={superAdmin}
          self={editing !== 'new' && editing.id === currentUserId}
          onClose={() => setEditing(null)}
          onSaved={(m, creds) => {
            setEditing(null)
            setMsg({ ok: true, text: m })
            if (creds) setCredentials(creds)
            router.refresh()
          }}
        />
      )}
      {pwdFor && (
        <PasswordModal
          user={pwdFor}
          onClose={() => setPwdFor(null)}
          onSaved={(password) => {
            setCredentials({ name: pwdFor.fullName, login: pwdFor.username || pwdFor.email, password })
            setMsg({ ok: true, text: 'Password updated.' })
            setPwdFor(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function UserModal({ user, superAdmin, self, onClose, onSaved }: { user: UserItem | null; superAdmin: boolean; self: boolean; onClose: () => void; onSaved: (m: string, creds?: { name: string; login: string; password: string }) => void }) {
  const [v, setV] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || '',
    phone: user?.phone || '',
    role: user ? normalizeRole(user.role) : 'COUNSELLOR',
    status: user ? user.status : true,
    moduleAccess: user ? parseModuleAccess(user.moduleAccess) : ([] as string[]),
    password: '',
  })
  const [msg, setMsg] = useState<M>(null)
  const [busy, setBusy] = useState(false)
  const roles = ROLE_LIST.filter((r) => superAdmin || r.value !== 'SUPER_ADMIN')

  return (
    <Modal title={user ? `Edit ${user.fullName}` : 'Add user'} onClose={onClose} wide>
      <form
        className="space-y-3 text-left"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          const r = await saveUserAction(v, user?.id)
          setBusy(false)
          if (r.success) onSaved(r.message || 'Saved.', v.password ? { name: v.fullName, login: v.username || v.email, password: v.password } : undefined)
          else setMsg({ ok: false, text: r.error || 'Failed.' })
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full name *">
            <input className={INPUT} value={v.fullName} onChange={(e) => setV({ ...v, fullName: e.target.value })} required />
          </Field>
          <Field label="Email *">
            <input type="email" className={INPUT} value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} required />
          </Field>
          <Field label="Username" hint="Optional. At least 3 letters or numbers (dot, dash, underscore allowed). Can be used to sign in instead of the email.">
            <input className={INPUT} value={v.username} onChange={(e) => setV({ ...v, username: e.target.value.replace(/\s/g, '').toLowerCase() })} autoComplete="off" />
          </Field>
          <Field label="Phone">
            <input className={INPUT} value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
          </Field>
          <Field label="Role *" hint={ROLE_LIST.find((r) => r.value === v.role)?.hint}>
            <select className={INPUT} value={v.role} disabled={self} onChange={(e) => setV({ ...v, role: e.target.value as any })}>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className={INPUT} value={v.status ? 'true' : 'false'} disabled={self} onChange={(e) => setV({ ...v, status: e.target.value === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </Field>
        </div>
        {v.role === 'VIEWER' && (
          <fieldset className="rounded-xl border border-slate-200 p-3">
            <legend className="px-1 text-xs font-semibold text-slate-600">Viewer can see (read only) *</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VIEWER_MODULES.map((m) => (
                <label key={m.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={v.moduleAccess.includes(m.value)}
                    onChange={(e) => setV({ ...v, moduleAccess: e.target.checked ? [...v.moduleAccess, m.value] : v.moduleAccess.filter((x) => x !== m.value) })}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <Field label={user ? 'New password (leave blank to keep the current one)' : 'Password * (at least 8 characters)'}>
          <PasswordField value={v.password} onChange={(p) => setV({ ...v, password: p })} required={!user} />
        </Field>
        <Msg msg={msg} />
        <div className="flex justify-end gap-2">
          <button type="button" className={BTN_SECONDARY} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={BTN_PRIMARY} disabled={busy}>
            {busy ? 'Saving…' : 'Save user'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function PasswordModal({ user, onClose, onSaved }: { user: UserItem; onClose: () => void; onSaved: (password: string) => void }) {
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<M>(null)
  const [busy, setBusy] = useState(false)
  return (
    <Modal title={`Set password for ${user.fullName}`} onClose={onClose}>
      <form
        className="space-y-3 text-left"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          const r = await resetUserPasswordAction(user.id, password)
          setBusy(false)
          if (r.success) onSaved(password)
          else setMsg({ ok: false, text: r.error || 'Failed.' })
        }}
      >
        <p className="text-xs text-slate-600">Passwords are stored encrypted and cannot be viewed. Set a new one and share it privately; the Super Admin is notified.</p>
        <PasswordField value={password} onChange={setPassword} required />
        <Msg msg={msg} />
        <div className="flex justify-end gap-2">
          <button type="button" className={BTN_SECONDARY} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={BTN_PRIMARY} disabled={busy || password.length < 8}>
            Save password
          </button>
        </div>
      </form>
    </Modal>
  )
}
