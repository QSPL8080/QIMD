'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { BTN_PRIMARY, BTN_SECONDARY, BTN_GHOST_DANGER, INPUT, Field } from '@/components/Admin/ui'
import Modal, { Msg } from '@/components/Admin/Modal'
import { confirmDialog } from '@/components/Admin/confirmDialog'
import { ADMISSION_STATUSES } from '@/lib/fees'
import { setAdmissionStatusAction, trashAdmissionAction } from '@/app/actions/admissionActions'

export default function AdmissionControls({ id, status, code, canEdit, canDelete }: { id: string; status: string; code: string; canEdit: boolean; canDelete: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [next, setNext] = useState(status)
  const [reason, setReason] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <>
      {canEdit && status === 'VERIFICATION_PENDING' && (
        <button
          type="button"
          className={BTN_PRIMARY}
          disabled={busy}
          onClick={async () => {
            if (!(await confirmDialog(`Mark ${code} as verified and Active?`, { confirmText: 'Verify', danger: false }))) return
            setBusy(true)
            const r = await setAdmissionStatusAction(id, 'ACTIVE')
            setBusy(false)
            if (r.success) router.refresh()
            else setMsg({ ok: false, text: r.error || 'Failed.' })
          }}
        >
          <Icon icon="ion:shield-checkmark-outline" className="w-4 h-4" />
          Verify
        </button>
      )}
      {canEdit && (
        <button type="button" className={BTN_SECONDARY} onClick={() => setOpen(true)}>
          Change status
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          className={BTN_GHOST_DANGER}
          onClick={async () => {
            if (!(await confirmDialog(`Move admission ${code} to the Bin? Its payments are kept. The Super Admin can restore it.`, { confirmText: 'Move to Bin' }))) return
            const r = await trashAdmissionAction(id)
            if (r.success) router.push('/admin/admissions')
            else setMsg({ ok: false, text: r.error || 'Failed.' })
          }}
        >
          <Icon icon="ion:trash-outline" className="w-4 h-4" />
          Delete
        </button>
      )}
      <Msg msg={msg} />
      {open && (
        <Modal title={`Status of ${code}`} onClose={() => setOpen(false)}>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setBusy(true)
              const r = await setAdmissionStatusAction(id, next, reason)
              setBusy(false)
              if (r.success) {
                setOpen(false)
                router.refresh()
              } else setMsg({ ok: false, text: r.error || 'Failed.' })
            }}
          >
            <Field label="Status">
              <select className={INPUT} value={next} onChange={(e) => setNext(e.target.value)}>
                {ADMISSION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={next === 'CANCELLED' ? 'Reason (required)' : 'Note (optional)'}>
              <input className={INPUT} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
            <Msg msg={msg} />
            <div className="flex justify-end gap-2">
              <button type="button" className={BTN_SECONDARY} onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="submit" className={BTN_PRIMARY} disabled={busy}>
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
