'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requirePermission } from '@/lib/auth'
import { recordPaymentInternal, admissionLedger } from '@/lib/payments'
import { emailReceipt, receiptLink } from '@/lib/receipts'
import { audit } from '@/lib/audit'
import { istLocalToDate, fmtDate, fmtMoney, todayIST } from '@/lib/dates'
import { getSetting } from '@/lib/settings'
import { sendMail, emailLayout, emailTable, esc } from '@/lib/mailer'
import { normalizePhone } from '@/lib/leads'
import { PAYMENT_KIND_LABEL } from '@/lib/fees'

type Result = { success: boolean; message?: string; error?: string; url?: string }
const fail = (err: any): Result => ({ success: false, error: String(err?.message || err).replace(/^(UNAUTHORIZED|FORBIDDEN): /, '') })
const str = (v: unknown, max: number) => {
  const s = String(v ?? '').trim()
  return s ? s.slice(0, max) : null
}

function refresh(admissionId: string) {
  revalidatePath(`/admin/admissions/${admissionId}`)
  revalidatePath('/admin/fees')
  revalidatePath('/admin/dashboard')
}

/** Admission Head / Admin: record a payment received. */
export async function recordPaymentAction(admissionId: string, input: { amount: string; paidAt: string; mode: string; reference?: string; loanBank?: string; notes?: string }): Promise<Result> {
  try {
    const session = await requirePermission('fees', 'add')
    const paidAt = istLocalToDate(input.paidAt || '')
    if (!paidAt) return { success: false, error: 'Enter the payment date and time.' }
    const res = await recordPaymentInternal(session, admissionId, {
      amount: Number(String(input.amount).replace(/,/g, '')),
      paidAt,
      mode: input.mode,
      reference: str(input.reference, 150),
      loanBank: str(input.loanBank, 150),
      notes: str(input.notes, 1000),
    })
    refresh(admissionId)
    return res
  } catch (err) {
    return fail(err)
  }
}

/**
 * Super Admin / Admin: correct a payment with a separate reversal or refund row.
 * The original payment is never changed or erased.
 */
export async function reversePaymentAction(paymentId: string, kind: 'REVERSAL' | 'REFUND', input: { amount?: string; reason: string; mode?: string; reference?: string }): Promise<Result> {
  try {
    const session = await requirePermission('fees', 'delete')
    if (!['REVERSAL', 'REFUND'].includes(kind)) return { success: false, error: 'Invalid correction type.' }
    const reason = str(input.reason, 1000)
    if (!reason) return { success: false, error: 'Give a reason.' }
    const p = await (db as any).payment.findFirst({ where: { id: paymentId, kind: 'PAYMENT', status: 'SUCCESSFUL' }, include: { admission: true } })
    if (!p) return { success: false, error: 'Payment not found.' }
    const already = await (db as any).payment.findMany({ where: { relatedPaymentId: p.id, kind: { in: ['REVERSAL', 'REFUND'] }, status: 'SUCCESSFUL' } })
    const undone = already.reduce((s: number, x: any) => s + Number(x.amount), 0)
    const left = Math.round((Number(p.amount) - undone) * 100) / 100
    if (left <= 0) return { success: false, error: 'This payment has already been fully reversed / refunded.' }
    const amount = kind === 'REVERSAL' ? left : Math.round(Number(String(input.amount || '').replace(/,/g, '')) * 100) / 100
    if (!Number.isFinite(amount) || amount <= 0 || amount > left) return { success: false, error: `Refund amount must be between ₹1 and ${fmtMoney(left)}.` }
    const row = await (db as any).payment.create({
      data: {
        admissionId: p.admissionId,
        kind,
        status: 'SUCCESSFUL',
        amount,
        paidAt: new Date(),
        mode: kind === 'REFUND' ? input.mode || p.mode : p.mode,
        reference: str(input.reference, 150),
        notes: reason,
        relatedPaymentId: p.id,
        recordedById: session.id,
        recordedByName: session.fullName,
      },
    })
    await audit(session, kind === 'REFUND' ? 'PAYMENT_REFUND' : 'PAYMENT_REVERSAL', 'payment', row.id, `${PAYMENT_KIND_LABEL[kind]} ${row.paymentCode} of ${fmtMoney(amount)} against ${p.paymentCode} (${p.admission.admissionCode}): ${reason}`, { after: row })
    refresh(p.admissionId)
    return { success: true, message: `${PAYMENT_KIND_LABEL[kind]} ${row.paymentCode} recorded.` }
  } catch (err) {
    return fail(err)
  }
}

/** Super Admin / Admin: approved fee adjustment (discount / waiver). Reduces the balance; not counted as income. */
export async function addFeeAdjustmentAction(admissionId: string, input: { amount: string; reason: string }): Promise<Result> {
  try {
    const session = await requirePermission('fees', 'delete')
    const reason = str(input.reason, 1000)
    if (!reason) return { success: false, error: 'Give a reason for the adjustment.' }
    const found = await admissionLedger(admissionId)
    if (!found || found.admission.isDeleted) return { success: false, error: 'Admission not found.' }
    const amount = Math.round(Number(String(input.amount).replace(/,/g, '')) * 100) / 100
    if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: 'Enter an amount greater than 0.' }
    if (amount > found.ledger.balance) return { success: false, error: `Adjustment is more than the balance (${fmtMoney(found.ledger.balance)}).` }
    const row = await (db as any).payment.create({
      data: { admissionId, kind: 'ADJUSTMENT', status: 'SUCCESSFUL', amount, paidAt: new Date(), mode: 'OTHER', notes: reason, recordedById: session.id, recordedByName: session.fullName },
    })
    await audit(session, 'FEE_ADJUSTMENT', 'payment', row.id, `Fee adjustment ${row.paymentCode} of ${fmtMoney(amount)} on ${found.admission.admissionCode}: ${reason}`, { after: row })
    refresh(admissionId)
    return { success: true, message: `Adjustment ${row.paymentCode} saved.` }
  } catch (err) {
    return fail(err)
  }
}

export async function resendReceiptAction(paymentId: string): Promise<Result> {
  try {
    const session = await requirePermission('fees', 'edit')
    const p = await (db as any).payment.findFirst({ where: { id: paymentId, kind: 'PAYMENT', status: 'SUCCESSFUL' } })
    if (!p) return { success: false, error: 'Payment not found.' }
    const r = await emailReceipt(paymentId)
    await audit(session, r.ok ? 'RECEIPT_EMAIL_SENT' : 'RECEIPT_EMAIL_FAILED', 'payment', paymentId, r.ok ? `Receipt ${p.receiptNo} re-sent` : `Receipt ${p.receiptNo} re-send failed: ${r.error}`)
    refresh(p.admissionId)
    return r.ok ? { success: true, message: 'Receipt emailed.' } : { success: false, error: r.error }
  } catch (err) {
    return fail(err)
  }
}

/** WhatsApp share link for a receipt (secure, unguessable link). */
export async function receiptWhatsAppAction(paymentId: string): Promise<Result> {
  try {
    const session = await requirePermission('fees', 'edit')
    const p = await (db as any).payment.findFirst({ where: { id: paymentId, kind: 'PAYMENT', status: 'SUCCESSFUL' }, include: { admission: true } })
    if (!p || !p.receiptToken) return { success: false, error: 'Receipt not found.' }
    const inst = await getSetting('institute')
    const to = normalizePhone(p.admission.whatsapp || p.admission.mobile)
    const text = `Dear ${p.admission.studentName}, thank you for your payment of ${fmtMoney(Number(p.amount))} to ${inst.name}. Receipt ${p.receiptNo}: ${receiptLink(p.receiptToken)}`
    await audit(session, 'RECEIPT_WHATSAPP', 'payment', paymentId, `Receipt ${p.receiptNo} shared on WhatsApp`)
    return { success: true, url: `https://wa.me/${to && to.length === 10 ? `91${to}` : to || ''}?text=${encodeURIComponent(text)}` }
  } catch (err) {
    return fail(err)
  }
}

/**
 * Admission Head: send a fee reminder to the student (email, or open WhatsApp with the message).
 * The same reminder cannot go twice on the same day for the same instalment and channel.
 */
export async function sendStudentReminderAction(admissionId: string, channel: 'EMAIL' | 'WHATSAPP' | 'SMS'): Promise<Result> {
  try {
    const session = await requirePermission('fees', 'edit')
    if (channel === 'SMS') return { success: false, error: 'SMS is not set up yet. An SMS provider and approved template are needed.' }
    const found = await admissionLedger(admissionId)
    if (!found || found.admission.isDeleted) return { success: false, error: 'Admission not found.' }
    const { admission: a, ledger } = found
    if (ledger.balance <= 0) return { success: false, error: 'Nothing is due — the fee is fully paid.' }
    const inst = await getSetting('institute')
    const due = ledger.nextDue
    const dueText = due ? `${fmtMoney(due.amount)} due on ${fmtDate(due.dueDate)}` : `${fmtMoney(ledger.balance)} outstanding`
    const today = todayIST()
    const key = `STU:${due?.installmentId || 'balance'}:${due?.dueDate || 'none'}:${channel}:${today}`
    const exists = await (db as any).reminderLog.findUnique({ where: { uniqueKey: key } })
    if (exists) return { success: false, error: `A ${channel === 'EMAIL' ? 'email' : 'WhatsApp'} reminder for this due amount was already sent today.` }

    const contact = [inst.phone, inst.email].filter(Boolean).join(' · ')
    const message = `Dear ${a.studentName}, this is a reminder from ${inst.name} for Admission ID ${a.admissionCode} (${a.courseName}): ${dueText}. Total outstanding: ${fmtMoney(ledger.balance)}. Please pay at the institute office (cash/UPI/bank transfer) or contact us${contact ? ` at ${contact}` : ''}. Ignore if already paid.`

    let status = 'SENT'
    let error: string | null = null
    let url: string | undefined
    if (channel === 'EMAIL') {
      if (!a.email) return { success: false, error: 'The student has no email address on the admission.' }
      const r = await sendMail({
        to: a.email,
        subject: `Fee reminder — ${a.admissionCode}`,
        replyTo: inst.email,
        text: message,
        html: emailLayout(
          'Fee Payment Reminder',
          `<p>Dear ${esc(a.studentName)},</p><p>This is a friendly reminder about your course fee.</p>` +
            emailTable([
              { label: 'Admission ID', value: a.admissionCode },
              { label: 'Course', value: a.courseName },
              { label: 'Amount Due', value: due ? fmtMoney(due.amount) : fmtMoney(ledger.balance) },
              { label: 'Due Date', value: due ? fmtDate(due.dueDate) : null },
              { label: 'Total Outstanding', value: fmtMoney(ledger.balance) },
            ]) +
            `<p>Please pay at the institute office (cash / UPI / bank transfer)${contact ? ` or contact us at ${esc(contact)}` : ''}. If you have already paid, please ignore this message.</p><p style="color:#6B6A80;font-size:12px">${esc(inst.name)} · ${esc(inst.address)}</p>`,
        ),
      })
      if (!r.ok) {
        status = 'FAILED'
        error = r.error
      }
    } else {
      const to = normalizePhone(a.whatsapp || a.mobile)
      url = `https://wa.me/${to && to.length === 10 ? `91${to}` : to || ''}?text=${encodeURIComponent(message)}`
      status = 'OPENED'
    }

    await (db as any).reminderLog.create({
      data: {
        admissionId,
        installmentId: due?.installmentId || null,
        audience: 'STUDENT',
        stage: 'MANUAL',
        channel,
        dueDate: due ? new Date(`${due.dueDate}T00:00:00Z`) : null,
        amount: due ? due.amount : ledger.balance,
        // a failed email can be retried the same day
        uniqueKey: status === 'FAILED' ? `${key}:failed:${Date.now()}` : key,
        status,
        error,
        sentById: session.id,
        sentByName: session.fullName,
      },
    })
    await audit(session, status === 'FAILED' ? 'REMINDER_FAILED' : 'REMINDER_SENT', 'admission', admissionId, `${channel} fee reminder to ${a.studentName} (${a.admissionCode}): ${status}${error ? ` — ${error}` : ''}`)
    refresh(admissionId)
    if (status === 'FAILED') return { success: false, error: `Email not sent: ${error}` }
    return { success: true, message: channel === 'EMAIL' ? 'Reminder emailed.' : 'WhatsApp opened with the reminder.', url }
  } catch (err) {
    return fail(err)
  }
}
