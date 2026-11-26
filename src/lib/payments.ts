import { randomBytes } from 'crypto'
import { db } from './db'
import type { SessionUser } from './auth'
import { computeLedger, PAYMENT_MODES, paymentModeLabel } from './fees'
import { fmtMoney, todayIST, ymdOf } from './dates'
import { audit } from './audit'
import { emailReceipt } from './receipts'
import { notifyRoles } from './notifications'

export const MODES_NEEDING_REFERENCE = ['UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'GATEWAY']

export async function nextReceiptNo(): Promise<string> {
  const rows: any[] = await (db as any).$queryRawUnsafe(`SELECT 'RCPT-' || lpad(nextval('receipt_no_seq')::text, 6, '0') AS no`)
  return String(rows[0].no)
}

export async function admissionLedger(admissionId: string) {
  const a = await (db as any).admission.findUnique({ where: { id: admissionId }, include: { installments: true, payments: true } })
  if (!a) return null
  const ledger = computeLedger(
    Number(a.totalFee),
    a.installments.map((i: any) => ({ id: i.id, label: i.label, dueDate: ymdOf(i.dueDate), amount: Number(i.amount) })),
    a.payments.map((p: any) => ({ id: p.id, kind: p.kind, status: p.status, amount: Number(p.amount), relatedPaymentId: p.relatedPaymentId })),
    todayIST(),
  )
  return { admission: a, ledger }
}

/**
 * Record a successful payment: one new immutable row, a unique Payment ID and receipt number,
 * then email the receipt and log the result (SRS §10).
 */
export async function recordPaymentInternal(
  session: SessionUser | null,
  admissionId: string,
  p: { amount: number; paidAt: Date; mode: string; reference?: string | null; loanBank?: string | null; notes?: string | null },
  /** Online payments: gateway transaction ID (each is recorded once) and who reported it */
  online?: { gatewayTxnId: string; gateway: string },
): Promise<{ success: boolean; message?: string; error?: string; paymentId?: string; emailed?: boolean; receiptNo?: string; duplicate?: boolean }> {
  const found = await admissionLedger(admissionId)
  if (!found || found.admission.isDeleted) return { success: false, error: 'Admission not found.' }
  const { admission, ledger } = found
  if (admission.status === 'CANCELLED') return { success: false, error: 'This admission is cancelled / withdrawn; payments cannot be recorded.' }

  const amount = Math.round(Number(p.amount) * 100) / 100
  if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: 'Amount must be greater than 0.' }
  if (amount > ledger.balance) return { success: false, error: `Amount is more than the outstanding balance (${fmtMoney(ledger.balance)}).` }
  if (!PAYMENT_MODES.some((m) => m.value === p.mode)) return { success: false, error: 'Choose the payment mode.' }
  if (MODES_NEEDING_REFERENCE.includes(p.mode) && !p.reference) return { success: false, error: `Enter the transaction / reference number for ${paymentModeLabel(p.mode)}.` }
  if (p.mode === 'LOAN' && !p.loanBank) return { success: false, error: 'Enter the loan bank name.' }
  if (!(p.paidAt instanceof Date) || Number.isNaN(p.paidAt.getTime())) return { success: false, error: 'Enter the payment date.' }
  if (p.paidAt.getTime() > Date.now() + 5 * 60 * 1000) return { success: false, error: 'Payment date cannot be in the future.' }

  if (online) {
    const existing = await (db as any).payment.findUnique({ where: { gatewayTxnId: online.gatewayTxnId } })
    if (existing) return { success: true, duplicate: true, paymentId: existing.id, receiptNo: existing.receiptNo, message: 'Already recorded.' }
  }
  const recorder = session ? session.fullName : `${online?.gateway || 'Online'} payment`
  const payment = await (db as any).payment.create({
    data: {
      admissionId,
      kind: 'PAYMENT',
      status: 'SUCCESSFUL',
      amount,
      paidAt: p.paidAt,
      mode: p.mode,
      reference: p.reference || null,
      loanBank: p.loanBank || null,
      notes: p.notes || null,
      source: online ? 'GATEWAY' : 'MANUAL',
      gatewayTxnId: online?.gatewayTxnId || null,
      receiptNo: await nextReceiptNo(),
      receiptToken: randomBytes(24).toString('hex'),
      recordedById: session?.id || null,
      recordedByName: recorder,
    },
  })
  await audit(session || { fullName: recorder, roleName: 'SYSTEM' }, 'PAYMENT_CREATE', 'payment', payment.id, `${payment.paymentCode}: ${fmtMoney(amount)} (${paymentModeLabel(p.mode)}) for ${admission.admissionCode} ${admission.studentName}`, { after: payment })
  await audit(session || { fullName: recorder, roleName: 'SYSTEM' }, 'RECEIPT_GENERATE', 'payment', payment.id, `Receipt ${payment.receiptNo} generated for ${payment.paymentCode}`)

  const mail = await emailReceipt(payment.id)
  await audit(session || { fullName: recorder, roleName: 'SYSTEM' }, mail.ok ? 'RECEIPT_EMAIL_SENT' : 'RECEIPT_EMAIL_FAILED', 'payment', payment.id, mail.ok ? `Receipt ${payment.receiptNo} emailed to ${admission.email}` : `Receipt ${payment.receiptNo} email failed: ${mail.error}`)
  await notifyRoles(
    ['SUPER_ADMIN', 'ADMIN', 'ADMISSION_HEAD'],
    {
      type: 'PAYMENT_RECORDED',
      title: `${fmtMoney(amount)} received from ${admission.studentName} (${admission.admissionCode}) — receipt ${payment.receiptNo}${mail.ok ? ' emailed' : ' (email not sent)'}`,
      link: `/admin/admissions/${admission.id}?tab=fees`,
      actor: session ? { id: session.id, fullName: session.fullName, email: session.email, role: session.roleName } : { fullName: recorder },
    },
    session?.id,
  )
  return {
    success: true,
    paymentId: payment.id,
    receiptNo: payment.receiptNo,
    emailed: mail.ok,
    message: `${payment.paymentCode} saved, receipt ${payment.receiptNo}${mail.ok ? ' emailed to the student' : ` — email not sent: ${mail.error}`}`,
  }
}
