'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Badge, BTN_PRIMARY, BTN_SECONDARY, BTN_GHOST_DANGER, INPUT, LEAD_STATUS_TONE, Field } from '@/components/Admin/ui'
import Modal, { Msg } from '@/components/Admin/Modal'
import { confirmDialog } from '@/components/Admin/confirmDialog'
import { LEAD_STATUSES, LEAD_TYPES } from '@/lib/permissions'
import { assignLeadsAction, bulkLeadStatusAction, createManualLeadAction, trashLeadsAction } from '@/app/actions/leadActions'

type Item = {
  id: string
  leadCode: string
  fullName: string
  phone: string | null
  email: string | null
  course: string | null
  source: string
  type: string
  status: string
  statusLabel: string
  assignedTo: string | null
  nextFollowUp: string | null
  overdue: boolean
  duplicate: boolean
  createdAt: string
}

type Perms = { add: boolean; edit: boolean; assign: boolean; remove: boolean; export: boolean }

export default function LeadsTable({ items, perms, assignees, openAdd = false }: { items: Item[]; perms: Perms; assignees: { id: string; fullName: string }[]; openAdd?: boolean }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [assignTo, setAssignTo] = useState('')
  const [status, setStatus] = useState('')
  const [reason, setReason] = useState('')
  const [adding, setAdding] = useState(openAdd && perms.add)
  const bulk = perms.assign || perms.edit || perms.remove
  const allOnPage = items.length > 0 && items.every((i) => selected.includes(i.id))

  const run = async (fn: () => Promise<{ success: boolean; message?: string; error?: string }>) => {
    setBusy(true)
    setMsg(null)
    const r = await fn()
    setBusy(false)
    setMsg({ ok: r.success, text: r.success ? r.message || 'Done.' : r.error || 'Failed.' })
    if (r.success) {
      setSelected([])
      router.refresh()
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-100">
        {bulk && (
          <button type="button" className={BTN_SECONDARY} disabled={items.length === 0} onClick={() => setSelected(allOnPage ? [] : items.map((i) => i.id))}>
            <Icon icon={allOnPage ? 'ion:close-circle-outline' : 'ion:checkbox-outline'} className="w-4 h-4" />
            {allOnPage ? 'Deselect all' : `Select all (${items.length})`}
          </button>
        )}
        {perms.assign && (
          <span className="flex items-center gap-2">
            <select className={`${INPUT} w-48`} value={assignTo} onChange={(e) => setAssignTo(e.target.value)} aria-label="Assign to">
              <option value="">Assign to…</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName}
                </option>
              ))}
              <option value="__none">Unassign</option>
            </select>
            <button type="button" className={BTN_PRIMARY} disabled={busy || !assignTo || selected.length === 0} onClick={() => run(() => assignLeadsAction(selected, assignTo === '__none' ? null : assignTo))}>
              Assign ({selected.length})
            </button>
          </span>
        )}
        {perms.edit && (
          <span className="flex items-center gap-2">
            <select className={`${INPUT} w-48`} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Change status">
              <option value="">Change status…</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {status === 'INVALID' && <input className={`${INPUT} w-48`} placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />}
            <button type="button" className={BTN_SECONDARY} disabled={busy || !status || selected.length === 0} onClick={() => run(() => bulkLeadStatusAction(selected, status, reason))}>
              Update ({selected.length})
            </button>
          </span>
        )}
        {perms.remove && (
          <button
            type="button"
            className={BTN_GHOST_DANGER}
            disabled={busy || selected.length === 0}
            onClick={async () => {
              if (await confirmDialog(`Move ${selected.length} lead(s) to the Bin? The Super Admin can restore them.`, { confirmText: 'Move to Bin' })) run(() => trashLeadsAction(selected))
            }}
          >
            <Icon icon="ion:trash-outline" className="w-4 h-4" />
            Delete ({selected.length})
          </button>
        )}
        {perms.add && (
          <button type="button" className={`${BTN_PRIMARY} ml-auto`} onClick={() => setAdding(true)}>
            <Icon icon="ion:add-outline" className="w-4 h-4" />
            Add lead
          </button>
        )}
        <div className="w-full">
          <Msg msg={msg} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
            <tr>
              {bulk && <th className="p-3 w-8"></th>}
              <th className="p-3">Lead</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Course / Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Counsellor</th>
              <th className="p-3">Next follow-up</th>
              <th className="p-3">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  No leads match these filters.
                </td>
              </tr>
            ) : (
              items.map((l) => (
                <tr key={l.id} className={`hover:bg-slate-50 ${selected.includes(l.id) ? 'bg-zinc-100/40' : ''}`}>
                  {bulk && (
                    <td className="p-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${l.fullName}`}
                        checked={selected.includes(l.id)}
                        onChange={(e) => setSelected(e.target.checked ? [...selected, l.id] : selected.filter((x) => x !== l.id))}
                      />
                    </td>
                  )}
                  <td className="p-3 min-w-[180px]">
                    <Link href={`/admin/leads/${l.id}`} className="font-semibold text-slate-900 hover:text-black">
                      {l.fullName}
                    </Link>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      {l.leadCode} · {l.source}
                      {l.duplicate && <Badge tone="red">Possible duplicate</Badge>}
                    </div>
                  </td>
                  <td className="p-3 text-xs">
                    <div className="font-semibold text-slate-800">{l.phone || '—'}</div>
                    <div className="text-slate-500 break-all">{l.email || ''}</div>
                  </td>
                  <td className="p-3 text-xs">
                    <div className="text-slate-800">{l.course || '—'}</div>
                    <div className="text-slate-500">{l.type}</div>
                  </td>
                  <td className="p-3">
                    <Badge tone={LEAD_STATUS_TONE[l.status] || 'slate'}>{l.statusLabel}</Badge>
                  </td>
                  <td className="p-3 text-xs">{l.assignedTo || <span className="text-amber-700 font-semibold">Unassigned</span>}</td>
                  <td className={`p-3 text-xs ${l.overdue ? 'text-rose-600 font-semibold' : ''}`}>{l.nextFollowUp || '—'}</td>
                  <td className="p-3 text-xs whitespace-nowrap">{l.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {adding && <AddLeadModal assignees={perms.assign ? assignees : []} onClose={() => setAdding(false)} onSaved={(id) => router.push(`/admin/leads/${id}`)} />}
    </div>
  )
}

function AddLeadModal({ assignees, onClose, onSaved }: { assignees: { id: string; fullName: string }[]; onClose: () => void; onSaved: (id: string) => void }) {
  const [f, setF] = useState({ fullName: '', phone: '', email: '', enquiryType: 'ADMISSION', course: '', city: '', qualification: '', message: '', assignToId: '' })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value })
  return (
    <Modal title="Add lead" onClose={onClose} wide>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          const r = await createManualLeadAction(f)
          setBusy(false)
          if (r.success && r.id) onSaved(r.id)
          else setMsg({ ok: false, text: r.error || 'Failed.' })
        }}
      >
        <Field label="Full name *">
          <input className={INPUT} value={f.fullName} onChange={set('fullName')} required />
        </Field>
        <Field label="Enquiry type">
          <select className={INPUT} value={f.enquiryType} onChange={set('enquiryType')}>
            {LEAD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mobile number">
          <input className={INPUT} value={f.phone} onChange={set('phone')} inputMode="tel" />
        </Field>
        <Field label="Email">
          <input className={INPUT} value={f.email} onChange={set('email')} type="email" />
        </Field>
        <Field label="Course of interest">
          <input className={INPUT} value={f.course} onChange={set('course')} />
        </Field>
        <Field label="City">
          <input className={INPUT} value={f.city} onChange={set('city')} />
        </Field>
        <Field label="Qualification">
          <input className={INPUT} value={f.qualification} onChange={set('qualification')} />
        </Field>
        {assignees.length > 0 && (
          <Field label="Assign to">
            <select className={INPUT} value={f.assignToId} onChange={set('assignToId')}>
              <option value="">Not now</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Message / notes" className="sm:col-span-2">
          <textarea className={INPUT} rows={3} value={f.message} onChange={set('message')} />
        </Field>
        <p className="sm:col-span-2 text-[11px] text-slate-500">Enter a mobile number or email (or both). A lead with the same mobile/email is flagged as a possible duplicate, not dropped.</p>
        <div className="sm:col-span-2 flex items-center justify-end gap-2">
          <Msg msg={msg} />
          <button type="button" className={BTN_SECONDARY} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={BTN_PRIMARY} disabled={busy}>
            {busy ? 'Saving…' : 'Save lead'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
