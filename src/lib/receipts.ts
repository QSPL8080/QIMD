import { db } from './db'
import { computeLedger } from './fees'
import { paymentModeLabel } from './fees'
import { ymdOf, todayIST, fmtDateTime, fmtMoney } from './dates'
import { getSetting, type InstituteSettings } from './settings'
import { sendMail, emailLayout, emailTable, emailButton, esc, SITE_URL } from './mailer'

export type ReceiptData = {
  paymentId: string
  receiptNo: string
  paymentCode: string
  token: string
  institute: InstituteSettings
  studentName: string
  studentEmail: string | null
  studentMobile: string
  admissionId: string
  admissionCode: string
  courseName: string
  amount: number
  paidAt: string
  mode: string
  reference: string | null
  loanBank: string | null
  recordedByName: string | null
  totalFee: number
  collected: number
  adjustments: number
  balance: number
  reversed: boolean
}

/** Everything a receipt shows, with the fee summary as of this payment. */
export async function getReceiptData(where: { id?: string; token?: string }): Promise<ReceiptData | null> {
  const p = await (db as any).payment.findFirst({
    where: { ...(where.id ? { id: where.id } : { receiptToken: where.token }), kind: 'PAYMENT', status: 'SUCCESSFUL', receiptNo: { not: null } },
    include: { admission: { include: { installments: true } } },
  })
  if (!p) return null
  // Fee summary counts movements recorded up to and including this payment
  const upTo = await (db as any).payment.findMany({
    where: { admissionId: p.admissionId, createdAt: { lte: p.createdAt } },
    select: { id: true, kind: true, status: true, amount: true },
  })
  const reversal = await (db as any).payment.findFirst({ where: { relatedPaymentId: p.id, kind: { in: ['REVERSAL', 'REFUND'] }, status: 'SUCCESSFUL' } })
  const ledger = computeLedger(
    Number(p.admission.totalFee),
    p.admission.installments.map((i: any) => ({ id: i.id, label: i.label, dueDate: ymdOf(i.dueDate), amount: Number(i.amount) })),
    upTo.map((x: any) => ({ id: x.id, kind: x.kind, status: x.status, amount: Number(x.amount) })),
    todayIST(),
  )
  return {
    paymentId: p.id,
    receiptNo: p.receiptNo,
    paymentCode: p.paymentCode,
    token: p.receiptToken,
    institute: await getSetting('institute'),
    studentName: p.admission.studentName,
    studentEmail: p.admission.email,
    studentMobile: p.admission.mobile,
    admissionId: p.admission.id,
    admissionCode: p.admission.admissionCode,
    courseName: p.admission.courseName,
    amount: Number(p.amount),
    paidAt: new Date(p.paidAt).toISOString(),
    mode: paymentModeLabel(p.mode),
    reference: p.reference,
    loanBank: p.loanBank,
    recordedByName: p.recordedByName,
    totalFee: ledger.totalFee,
    collected: ledger.collected,
    adjustments: ledger.adjustments,
    balance: ledger.balance,
    reversed: Boolean(reversal),
  }
}

export const receiptLink = (token: string) => `${SITE_URL}/receipt/${token}`

/** Email the receipt to the student and record the delivery result on the payment. */
export async function emailReceipt(paymentId: string): Promise<{ ok: boolean; error?: string }> {
  const r = await getReceiptData({ id: paymentId })
  if (!r) return { ok: false, error: 'Receipt not found.' }
  let result: { ok: boolean; error?: string }
  if (!r.studentEmail) {
    result = { ok: false, error: 'The student has no email address on the admission.' }
  } else {
    const html = emailLayout(
      `Payment Receipt ${r.receiptNo}`,
      `<p>Dear ${esc(r.studentName)},</p><p>Thank you. We have received your payment.</p>` +
        emailTable([
          { label: 'Receipt No.', value: r.receiptNo },
          { label: 'Admission ID', value: r.admissionCode },
          { label: 'Course', value: r.courseName },
          { label: 'Payment ID', value: r.paymentCode },
          { label: 'Amount Paid', value: fmtMoney(r.amount) },
          { label: 'Payment Date', value: fmtDateTime(r.paidAt) },
          { label: 'Payment Mode', value: r.mode },
          { label: 'Transaction Ref.', value: r.reference },
          { label: 'Total Course Fee', value: fmtMoney(r.totalFee) },
          { label: 'Total Paid', value: fmtMoney(r.collected) },
          ...(r.adjustments ? [{ label: 'Fee Adjustments', value: fmtMoney(r.adjustments) }] : []),
          { label: 'Balance Due', value: fmtMoney(r.balance) },
        ]) +
        emailButton(receiptLink(r.token), 'View / Download Receipt') +
        `<p style="color:#6B6A80;font-size:12px;margin-top:18px">${esc(r.institute.name)} · ${esc(r.institute.address)}${r.institute.phone ? ` · ${esc(r.institute.phone)}` : ''}</p>`,
    )
    const text = `Payment Receipt ${r.receiptNo}\nStudent: ${r.studentName}\nAdmission ID: ${r.admissionCode}\nCourse: ${r.courseName}\nAmount: ${fmtMoney(r.amount)}\nDate: ${fmtDateTime(r.paidAt)}\nMode: ${r.mode}\nBalance due: ${fmtMoney(r.balance)}\nReceipt: ${receiptLink(r.token)}`
    const sent = await sendMail({ to: r.studentEmail, subject: `Payment Receipt ${r.receiptNo} — ${r.institute.shortName || r.institute.name}`, html, text, replyTo: r.institute.email })
    result = sent.ok ? { ok: true } : { ok: false, error: sent.error }
  }
  await (db as any).payment.update({
    where: { id: paymentId },
    data: { receiptEmailStatus: result.ok ? 'SENT' : 'FAILED', receiptEmailError: result.ok ? null : (result.error || '').slice(0, 500), receiptEmailedAt: new Date() },
  })
  return result
}
