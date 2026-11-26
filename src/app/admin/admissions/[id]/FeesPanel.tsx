'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Card, Badge, Field, INPUT, BTN_PRIMARY, BTN_SECONDARY, BTN_GHOST_DANGER } from '@/components/Admin/ui'
import Modal, { Msg } from '@/components/Admin/Modal'
import { PAYMENT_MODES } from '@/lib/fees'
import { recordPaymentAction, reversePaymentAction, addFeeAdjustmentAction, resendReceiptAction, receiptWhatsAppAction, sendStudentReminderAction } from '@/app/actions/paymentActions'

type Payment = {
  id: string
  code: string
  receiptNo: string | null
  kind: string
  kindLabel: string
  status: string
  amount: number
  paidAt: string
  mode: string
  reference: string | null
  loanBank: string | null
  notes: string | null
  recordedBy: string | null
  emailStatus: string | null
  emailError: string | null
  reversed: number
}
type Inst = { id: string; label: string; dueDate: string; dueLabel: string; amount: number; paid: number; remaining: number; state: string }
type Reminder = { id: string; when: string; audience: string; stage: string; channel: string; status: string; error: string | null; by: string | null; due: string }

const inr = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const STATE_TONE: Record<string, any> = { PAID: 'green', PARTIAL: 'amber', DUE: 'slate', OVERDUE: 'red' }
const STAGE_LABEL: Record<string, string> = { D15: '15 days before', D7: '7 days before', D3: '3 days before', D0: 'Due date', OVERDUE: 'Overdue', MANUAL: 'Sent by staff' }

export default function FeesPanel(props: {
  admissionId: string
  cancelled: boolean
  hasEmail: boolean
  mailReady: boolean
  nowLocal: string
  perms: { add: boolean; edit: boolean; correct: boolean }
  ledger: { balance: number; nextDue: { dueDate: string; amount: number; label: string } | null }
  installments: Inst[]
  payments: Payment[]
  reminders: Reminder[]
}) {
  const { admissionId, perms, ledger } = props
  const router = useRouter()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [pay, setPay] = useState({ amount: ledger.nextDue ? String(ledger.nextDue.amount) : '', paidAt: props.nowLocal, mode: 'CASH', reference: '', loanBank: '', notes: '' })
  const [correct, setCorrect] = useState<{ p: Payment; kind: 'REVERSAL' | 'REFUND' } | null>(null)
  const [adjusting, setAdjusting] = useState(false)

  const result = (r: { success: boolean; message?: string; error?: string; url?: string }) => {
    setMsg({ ok: r.success, text: r.success ? r.message || 'Done.' : r.error || 'Failed.' })
    if (r.url) window.open(r.url, '_blank', 'noopener,noreferrer')
    if (r.success) router.refresh()
    return r.success
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4 min-w-0">
        <Card title="Payment schedule">
          {props.installments.length === 0 ? (
            <p className="text-sm text-slate-500">No due dates set. Add them from Edit admission so reminders go out.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase text-slate-500 text-left">
                  <tr>
                    <th className="py-2 pr-3">Instalment</th>
                    <th className="py-2 pr-3">Due date</th>
                    <th className="py-2 pr-3 text-right">Amount</th>
                    <th className="py-2 pr-3 text-right">Paid</th>
                    <th className="py-2 pr-3 text-right">Remaining</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {props.installments.map((i) => (
                    <tr key={i.id}>
                      <td className="py-2 pr-3 font-semibold text-slate-800">{i.label}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{i.dueLabel}</td>
                      <td className="py-2 pr-3 text-right">{inr(i.amount)}</td>
                      <td className="py-2 pr-3 text-right">{inr(i.paid)}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{inr(i.remaining)}</td>
                      <td className="py-2">
                        <Badge tone={STATE_TONE[i.state]}>{i.state === 'PAID' ? 'Paid' : i.state === 'PARTIAL' ? 'Part paid' : i.state === 'OVERDUE' ? 'Overdue' : 'Due'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title="Payment history"
          actions={
            perms.correct && ledger.balance > 0 ? (
              <button type="button" className={BTN_SECONDARY} onClick={() => setAdjusting(true)}>
                Fee adjustment
              </button>
            ) : null
          }
        >
          {props.payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {props.payments.map((p) => (
                <li key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className={`text-slate-900 ${p.kind === 'PAYMENT' ? '' : 'text-rose-700'}`}>
                        {p.kind === 'PAYMENT' || p.kind === 'ADJUSTMENT' ? '' : '− '}
                        {inr(p.amount)}
                      </strong>
                      <Badge tone={p.kind === 'PAYMENT' ? 'green' : p.kind === 'ADJUSTMENT' ? 'purple' : 'red'}>{p.kindLabel}</Badge>
                      {p.reversed > 0 && <Badge tone="red">{p.reversed >= p.amount ? 'Reversed / refunded' : `${inr(p.reversed)} refunded`}</Badge>}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {p.code}
                      {p.receiptNo ? ` · Receipt ${p.receiptNo}` : ''} · {p.paidAt} · {p.mode}
                      {p.loanBank ? ` (${p.loanBank})` : ''}
                      {p.reference ? ` · Ref ${p.reference}` : ''}
                    </p>
                    {p.notes && <p className="text-xs text-slate-500">{p.notes}</p>}
                    <p className="text-[11px] text-slate-400">
                      Recorded by {p.recordedBy || '—'}
                      {p.kind === 'PAYMENT' && (p.emailStatus === 'SENT' ? ' · receipt emailed' : p.emailStatus === 'FAILED' ? ` · receipt email failed: ${p.emailError || ''}` : '')}
                    </p>
                  </div>
                  {p.kind === 'PAYMENT' && p.receiptNo && (
                    <div className="flex flex-wrap gap-1.5 sm:justify-end">
                      <Link href={`/admin/receipts/${p.id}`} target="_blank" className={BTN_SECONDARY}>
                        <Icon icon="ion:receipt-outline" className="w-4 h-4" /> Receipt
                      </Link>
                      {perms.edit && (
                        <>
                          <button type="button" className={BTN_SECONDARY} disabled={busy || !props.hasEmail} title={props.hasEmail ? 'Email the receipt again' : 'No student email'} onClick={async () => { setBusy(true); result(await resendReceiptAction(p.id)); setBusy(false) }}>
                            <Icon icon="ion:mail-outline" className="w-4 h-4" /> Email
                          </button>
                          <button type="button" className={BTN_SECONDARY} disabled={busy} onClick={async () => { setBusy(true); result(await receiptWhatsAppAction(p.id)); setBusy(false) }}>
                            <Icon icon="ion:logo-whatsapp" className="w-4 h-4" /> WhatsApp
                          </button>
                        </>
                      )}
                      {perms.correct && p.reversed < p.amount && (
                        <>
                          <button type="button" className={BTN_GHOST_DANGER} onClick={() => setCorrect({ p, kind: 'REFUND' })}>
                            Refund
                          </button>
                          <button type="button" className={BTN_GHOST_DANGER} onClick={() => setCorrect({ p, kind: 'REVERSAL' })}>
                            Reverse
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Reminders">
          {props.reminders.length === 0 ? (
            <p className="text-sm text-slate-500">No reminders yet. Internal reminders go to the Admission Head 15, 7 and 3 days before a due date, on the due date, and when overdue.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-xs">
              {props.reminders.map((r) => (
                <li key={r.id} className="py-2 flex flex-wrap items-center gap-2">
                  <strong className="text-slate-800">{r.when}</strong>
                  <Badge tone={r.audience === 'STUDENT' ? 'blue' : 'slate'}>{r.audience === 'STUDENT' ? `Student · ${r.channel === 'EMAIL' ? 'Email' : r.channel === 'WHATSAPP' ? 'WhatsApp' : r.channel}` : 'Internal'}</Badge>
                  <span>{STAGE_LABEL[r.stage] || r.stage}</span>
                  <span className="text-slate-500">{r.due}</span>
                  <Badge tone={r.status === 'FAILED' ? 'red' : 'green'}>{r.status === 'OPENED' ? 'WhatsApp opened' : r.status === 'SENT' ? 'Sent' : 'Failed'}</Badge>
                  {r.error && <span className="text-rose-600">{r.error}</span>}
                  {r.by && <span className="text-slate-400">by {r.by}</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="space-y-4 min-w-0">
        {perms.add && !props.cancelled && ledger.balance > 0 && (
          <Card title="Record a payment">
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault()
                setBusy(true)
                const ok = result(await recordPaymentAction(admissionId, pay))
                setBusy(false)
                if (ok) setPay({ ...pay, amount: '', reference: '', loanBank: '', notes: '' })
              }}
            >
              <Field label={`Amount (₹) * — balance ${inr(ledger.balance)}`}>
                <input className={INPUT} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} inputMode="decimal" required />
              </Field>
              <Field label="Payment date & time *">
                <input type="datetime-local" className={INPUT} value={pay.paidAt} max={props.nowLocal} onChange={(e) => setPay({ ...pay, paidAt: e.target.value })} required />
              </Field>
              <Field label="Mode *">
                <select className={INPUT} value={pay.mode} onChange={(e) => setPay({ ...pay, mode: e.target.value })}>
                  {PAYMENT_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Field>
              {pay.mode === 'LOAN' && (
                <Field label="Loan bank *">
                  <input className={INPUT} value={pay.loanBank} onChange={(e) => setPay({ ...pay, loanBank: e.target.value })} />
                </Field>
              )}
              {pay.mode !== 'CASH' && (
                <Field label={`Transaction / reference no.${['UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'GATEWAY'].includes(pay.mode) ? ' *' : ''}`}>
                  <input className={INPUT} value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} />
                </Field>
              )}
              <Field label="Note">
                <input className={INPUT} value={pay.notes} onChange={(e) => setPay({ ...pay, notes: e.target.value })} />
              </Field>
              <p className="text-[11px] text-slate-500">
                Saving creates a Payment ID and receipt and {props.hasEmail ? (props.mailReady ? 'emails the receipt to the student.' : 'tries to email the receipt (email is not set up yet).') : 'the student has no email — share the receipt on WhatsApp.'}
              </p>
              <button type="submit" className={`${BTN_PRIMARY} w-full`} disabled={busy}>
                {busy ? 'Saving…' : 'Save payment'}
              </button>
            </form>
          </Card>
        )}

        {perms.edit && ledger.balance > 0 && !props.cancelled && (
          <Card title="Remind the student">
            <p className="text-xs text-slate-600 mb-3">{ledger.nextDue ? `${inr(ledger.nextDue.amount)} due on ${ledger.nextDue.dueDate.split('-').reverse().join('/')} (${ledger.nextDue.label}).` : `${inr(ledger.balance)} outstanding.`}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={BTN_SECONDARY} disabled={busy || !props.hasEmail} title={props.hasEmail ? '' : 'No student email'} onClick={async () => { setBusy(true); result(await sendStudentReminderAction(admissionId, 'EMAIL')); setBusy(false) }}>
                <Icon icon="ion:mail-outline" className="w-4 h-4" /> Email
              </button>
              <button type="button" className={BTN_SECONDARY} disabled={busy} onClick={async () => { setBusy(true); result(await sendStudentReminderAction(admissionId, 'WHATSAPP')); setBusy(false) }}>
                <Icon icon="ion:logo-whatsapp" className="w-4 h-4" /> WhatsApp
              </button>
              <button type="button" className={BTN_SECONDARY} disabled title="SMS needs a provider and approved template">
                SMS
              </button>
            </div>
          </Card>
        )}

        {ledger.balance <= 0 && <div className="rounded-xl bg-emerald-50 text-emerald-800 text-sm px-4 py-3">Fully paid — no reminders will be sent.</div>}
        <Msg msg={msg} />
      </div>

      {correct && (
        <CorrectionModal
          payment={correct.p}
          kind={correct.kind}
          onClose={() => setCorrect(null)}
          onSubmit={async (v) => {
            const ok = result(await reversePaymentAction(correct.p.id, correct.kind, v))
            if (ok) setCorrect(null)
          }}
        />
      )}
      {adjusting && (
        <AdjustModal
          balance={ledger.balance}
          onClose={() => setAdjusting(false)}
          onSubmit={async (v) => {
            const ok = result(await addFeeAdjustmentAction(admissionId, v))
            if (ok) setAdjusting(false)
          }}
        />
      )}
    </div>
  )
}

function CorrectionModal({ payment, kind, onClose, onSubmit }: { payment: Payment; kind: 'REVERSAL' | 'REFUND'; onClose: () => void; onSubmit: (v: { amount?: string; reason: string; mode?: string; reference?: string }) => void }) {
  const left = payment.amount - payment.reversed
  const [v, setV] = useState({ amount: String(left), reason: '', mode: 'BANK_TRANSFER', reference: '' })
  return (
    <Modal title={`${kind === 'REFUND' ? 'Refund' : 'Reverse'} ${payment.code}`} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(v)
        }}
      >
        <p className="text-xs text-slate-600">
          {kind === 'REVERSAL'
            ? `Use for an entry made by mistake or a bounced cheque. A reversal row of ${inr(left)} is added; the original payment stays in the history.`
            : 'Money returned to the student. A refund row is added; the original payment stays in the history.'}
        </p>
        {kind === 'REFUND' && (
          <>
            <Field label={`Refund amount (max ${inr(left)})`}>
              <input className={INPUT} value={v.amount} onChange={(e) => setV({ ...v, amount: e.target.value })} inputMode="decimal" />
            </Field>
            <Field label="Refund mode">
              <select className={INPUT} value={v.mode} onChange={(e) => setV({ ...v, mode: e.target.value })}>
                {PAYMENT_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reference">
              <input className={INPUT} value={v.reference} onChange={(e) => setV({ ...v, reference: e.target.value })} />
            </Field>
          </>
        )}
        <Field label="Reason *">
          <input className={INPUT} value={v.reason} onChange={(e) => setV({ ...v, reason: e.target.value })} required />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className={BTN_SECONDARY} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={BTN_GHOST_DANGER}>
            {kind === 'REFUND' ? 'Record refund' : 'Reverse payment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function AdjustModal({ balance, onClose, onSubmit }: { balance: number; onClose: () => void; onSubmit: (v: { amount: string; reason: string }) => void }) {
  const [v, setV] = useState({ amount: '', reason: '' })
  return (
    <Modal title="Fee adjustment" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(v)
        }}
      >
        <p className="text-xs text-slate-600">An approved discount or waiver. It lowers the balance but is not counted as fees collected.</p>
        <Field label={`Amount (max ${inr(balance)})`}>
          <input className={INPUT} value={v.amount} onChange={(e) => setV({ ...v, amount: e.target.value })} inputMode="decimal" required />
        </Field>
        <Field label="Reason / approval *">
          <input className={INPUT} value={v.reason} onChange={(e) => setV({ ...v, reason: e.target.value })} required />
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className={BTN_SECONDARY} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={BTN_PRIMARY}>
            Save adjustment
          </button>
        </div>
      </form>
    </Modal>
  )
}
