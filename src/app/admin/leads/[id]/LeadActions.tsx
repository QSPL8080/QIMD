'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, Field, INPUT, BTN_PRIMARY, BTN_SECONDARY } from '@/components/Admin/ui'
import Modal, { Msg } from '@/components/Admin/Modal'
import { LEAD_STATUSES, LEAD_TYPES } from '@/lib/permissions'
import { addFollowUpAction, assignLeadsAction, clearDuplicateAction, linkDuplicateAction, updateLeadDetailsAction } from '@/app/actions/leadActions'

type Lead = {
  id: string
  leadCode: string
  status: string
  fullName: string
  phone: string
  email: string
  course: string
  city: string
  qualification: string
  subject: string
  message: string
  enquiryType: string
  assignedToId: string
  duplicateOf: { id: string; leadCode: string; fullName: string } | null
  nowLocal: string
}

export default function LeadActions({ lead, perms, assignees }: { lead: Lead; perms: { followUp: boolean; editDetails: boolean; assign: boolean; createAdmission: boolean }; assignees: { id: string; fullName: string }[] }) {
  const router = useRouter()
  const [fu, setFu] = useState({ followedAt: lead.nowLocal, remarks: '', status: lead.status, nextFollowUpAt: '', reason: '' })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [assignTo, setAssignTo] = useState(lead.assignedToId)
  const [dupCode, setDupCode] = useState('')
  const [editing, setEditing] = useState(false)

  const done = (r: { success: boolean; message?: string; error?: string }) => {
    setMsg({ ok: r.success, text: r.success ? r.message || 'Saved.' : r.error || 'Failed.' })
    if (r.success) router.refresh()
    return r.success
  }

  return (
    <>
      {perms.followUp && (
        <Card title="Log a follow-up">
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setBusy(true)
              const ok = done(await addFollowUpAction(lead.id, fu))
              setBusy(false)
              if (ok) setFu({ ...fu, remarks: '', nextFollowUpAt: '', reason: '' })
            }}
          >
            <Field label="Follow-up date & time *">
              <input type="datetime-local" className={INPUT} value={fu.followedAt} max={lead.nowLocal} onChange={(e) => setFu({ ...fu, followedAt: e.target.value })} required />
            </Field>
            <Field label="Remarks *" hint="What was discussed, the outcome and next action.">
              <textarea className={INPUT} rows={3} value={fu.remarks} onChange={(e) => setFu({ ...fu, remarks: e.target.value })} required />
            </Field>
            <Field label="Status after this follow-up">
              <select className={INPUT} value={fu.status} onChange={(e) => setFu({ ...fu, status: e.target.value })}>
                {LEAD_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            {fu.status === 'INVALID' && (
              <Field label="Reason (required)">
                <input className={INPUT} value={fu.reason} onChange={(e) => setFu({ ...fu, reason: e.target.value })} />
              </Field>
            )}
            <Field label="Next follow-up" hint="Leave empty if no further follow-up is needed.">
              <input type="datetime-local" className={INPUT} value={fu.nextFollowUpAt} min={lead.nowLocal} onChange={(e) => setFu({ ...fu, nextFollowUpAt: e.target.value })} />
            </Field>
            <Msg msg={msg} />
            <button type="submit" className={`${BTN_PRIMARY} w-full`} disabled={busy}>
              {busy ? 'Saving…' : 'Save follow-up'}
            </button>
          </form>
        </Card>
      )}

      {perms.assign && (
        <Card title="Assign counsellor">
          <div className="flex gap-2">
            <select className={INPUT} value={assignTo} onChange={(e) => setAssignTo(e.target.value)} aria-label="Counsellor">
              <option value="">Unassigned</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={BTN_PRIMARY}
              disabled={busy || assignTo === lead.assignedToId}
              onClick={async () => {
                setBusy(true)
                done(await assignLeadsAction([lead.id], assignTo || null))
                setBusy(false)
              }}
            >
              {lead.assignedToId ? 'Reassign' : 'Assign'}
            </button>
          </div>
        </Card>
      )}

      {perms.assign && (
        <Card title="Duplicate link">
          {lead.duplicateOf ? (
            <div className="space-y-2 text-sm">
              <p>
                Flagged as a possible duplicate of{' '}
                <Link className="font-semibold text-zinc-900" href={`/admin/leads/${lead.duplicateOf.id}`}>
                  {lead.duplicateOf.leadCode} ({lead.duplicateOf.fullName})
                </Link>
                .
              </p>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  done(await clearDuplicateAction(lead.id))
                  setBusy(false)
                }}
              >
                Not a duplicate
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input className={INPUT} placeholder="Original Lead ID, e.g. LD-000123" value={dupCode} onChange={(e) => setDupCode(e.target.value)} />
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={busy || !dupCode.trim()}
                onClick={async () => {
                  setBusy(true)
                  if (done(await linkDuplicateAction(lead.id, dupCode))) setDupCode('')
                  setBusy(false)
                }}
              >
                Link
              </button>
            </div>
          )}
        </Card>
      )}

      {perms.editDetails && (
        <button type="button" className={`${BTN_SECONDARY} w-full`} onClick={() => setEditing(true)}>
          Edit enquiry details
        </button>
      )}
      {!perms.followUp && <Msg msg={msg} />}

      {editing && <EditLead lead={lead} onClose={() => setEditing(false)} onSaved={() => router.refresh()} />}
    </>
  )
}

function EditLead({ lead, onClose, onSaved }: { lead: Lead; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    fullName: lead.fullName,
    phone: lead.phone,
    email: lead.email,
    enquiryType: lead.enquiryType,
    course: lead.course,
    city: lead.city,
    qualification: lead.qualification,
    subject: lead.subject,
    message: lead.message,
  })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value })
  return (
    <Modal title={`Edit ${lead.leadCode}`} onClose={onClose} wide>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={async (e) => {
          e.preventDefault()
          const r = await updateLeadDetailsAction(lead.id, f)
          if (r.success) {
            onSaved()
            onClose()
          } else setMsg({ ok: false, text: r.error || 'Failed.' })
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
        <Field label="Mobile">
          <input className={INPUT} value={f.phone} onChange={set('phone')} />
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
        <Field label="Subject">
          <input className={INPUT} value={f.subject} onChange={set('subject')} />
        </Field>
        <Field label="Message" className="sm:col-span-2">
          <textarea className={INPUT} rows={3} value={f.message} onChange={set('message')} />
        </Field>
        <div className="sm:col-span-2 flex items-center justify-end gap-2">
          <Msg msg={msg} />
          <button type="button" className={BTN_SECONDARY} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={BTN_PRIMARY}>
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}
