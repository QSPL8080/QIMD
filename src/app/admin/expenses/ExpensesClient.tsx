'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { BTN_PRIMARY, BTN_SECONDARY, BTN_GHOST_DANGER, INPUT, Field } from '@/components/Admin/ui'
import Modal, { Msg } from '@/components/Admin/Modal'
import { confirmDialog } from '@/components/Admin/confirmDialog'
import { saveExpenseAction, trashExpenseAction } from '@/app/actions/expenseActions'

type Options = { categories: string[]; modes: { value: string; label: string }[]; nowLocal: string }
type ExpenseInput = { id?: string; code?: string; expenseAt: string; category: string; description: string; amount: string; paymentMode: string; reference: string; attachmentFileId: string; attachmentName: string }

/** "Add expense" button + modal. */
export default function ExpensesClient({ options }: { options: Options }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={BTN_PRIMARY} onClick={() => setOpen(true)}>
        <Icon icon="ion:add" className="w-4 h-4" /> Add expense
      </button>
      {open && (
        <ExpenseModal
          options={options}
          initial={{ expenseAt: options.nowLocal, category: options.categories[0] || '', description: '', amount: '', paymentMode: 'CASH', reference: '', attachmentFileId: '', attachmentName: '' }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

export function ExpenseRowActions({ expense, options, perms }: { expense: ExpenseInput; options: Options; perms: { edit: boolean; remove: boolean } }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  if (!perms.edit && !perms.remove) return null
  return (
    <span className="inline-flex gap-1.5">
      {perms.edit && (
        <button type="button" className={BTN_SECONDARY} onClick={() => setOpen(true)}>
          Edit
        </button>
      )}
      {perms.remove && (
        <button
          type="button"
          className={BTN_GHOST_DANGER}
          onClick={async () => {
            if (!(await confirmDialog(`Move ${expense.code} to the Bin? It will no longer count in totals. The Super Admin can restore it.`, { confirmText: 'Move to Bin' }))) return
            const r = await trashExpenseAction(expense.id!)
            if (r.success) router.refresh()
            else alert(r.error)
          }}
        >
          Delete
        </button>
      )}
      {open && <ExpenseModal options={options} initial={expense} onClose={() => setOpen(false)} />}
    </span>
  )
}

function ExpenseModal({ options, initial, onClose }: { options: Options; initial: ExpenseInput; onClose: () => void }) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (k: keyof ExpenseInput, val: string) => setV((x) => ({ ...x, [k]: val }))
  const categories = v.category && !options.categories.includes(v.category) ? [...options.categories, v.category] : options.categories

  const uploadBill = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return setMsg({ ok: false, text: 'File is larger than 5 MB.' })
    setBusy(true)
    const body = new FormData()
    body.set('file', file)
    body.set('ownerType', 'expense')
    if (v.id) body.set('ownerId', v.id)
    body.set('label', 'Bill')
    try {
      const res = await fetch('/api/admin/files', { method: 'POST', body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) setMsg({ ok: false, text: data.error || 'Upload failed.' })
      else {
        setV((x) => ({ ...x, attachmentFileId: data.file.id, attachmentName: data.file.originalName }))
        setMsg(null)
      }
    } catch {
      setMsg({ ok: false, text: 'Upload failed. Check your connection.' })
    }
    setBusy(false)
  }

  return (
    <Modal title={v.id ? `Edit ${v.code}` : 'Add expense'} onClose={onClose}>
      <form
        className="space-y-3 text-left"
        onSubmit={async (e) => {
          e.preventDefault()
          setBusy(true)
          const r = await saveExpenseAction(v.id || null, v)
          setBusy(false)
          if (r.success) {
            onClose()
            router.refresh()
          } else setMsg({ ok: false, text: r.error || 'Failed.' })
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Date & time *">
            <input type="datetime-local" className={INPUT} value={v.expenseAt} max={options.nowLocal} onChange={(e) => set('expenseAt', e.target.value)} required />
          </Field>
          <Field label="Amount (₹) *">
            <input className={INPUT} value={v.amount} onChange={(e) => set('amount', e.target.value)} inputMode="decimal" required />
          </Field>
          <Field label="Category">
            <select className={INPUT} value={v.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Payment mode *">
            <select className={INPUT} value={v.paymentMode} onChange={(e) => set('paymentMode', e.target.value)}>
              {options.modes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Description *">
          <input className={INPUT} value={v.description} onChange={(e) => set('description', e.target.value)} maxLength={500} required />
        </Field>
        <Field label="Reference / bill no.">
          <input className={INPUT} value={v.reference} onChange={(e) => set('reference', e.target.value)} maxLength={150} />
        </Field>
        <Field label="Bill / receipt (PDF, JPG, PNG · max 5 MB)">
          {v.attachmentFileId ? (
            <span className="flex items-center justify-between gap-2 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <span className="truncate">{v.attachmentName || 'Bill attached'}</span>
              <button type="button" className="text-xs font-semibold text-rose-700" onClick={() => setV((x) => ({ ...x, attachmentFileId: '', attachmentName: '' }))}>
                Remove
              </button>
            </span>
          ) : (
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="block w-full text-sm" disabled={busy} onChange={(e) => e.target.files?.[0] && uploadBill(e.target.files[0])} />
          )}
        </Field>
        <Msg msg={msg} />
        <div className="flex justify-end gap-2">
          <button type="button" className={BTN_SECONDARY} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={BTN_PRIMARY} disabled={busy}>
            {busy ? 'Saving…' : 'Save expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
