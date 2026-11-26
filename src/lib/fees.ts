/**
 * Fee ledger (SRS §10). Pure functions — the same rules on every screen, report and reminder.
 *
 *   collected  = successful payments − successful refunds − successful reversals
 *   adjustments = approved fee adjustments (e.g. discount/waiver; not income)
 *   balance    = total fee − collected − adjustments  (never below 0)
 *
 * Pending/failed payments are never counted. Instalments are cleared in due-date order.
 */

export type LedgerPayment = { id: string; kind: string; status: string; amount: number; relatedPaymentId?: string | null }
export type LedgerInstallment = { id: string; label: string; dueDate: string; amount: number }

export type InstallmentState = LedgerInstallment & {
  paid: number
  remaining: number
  state: 'PAID' | 'PARTIAL' | 'DUE' | 'OVERDUE'
}

export type FeeStatus = 'FULLY_PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'OVERDUE'

export type Ledger = {
  totalFee: number
  collected: number
  refunded: number
  adjustments: number
  balance: number
  status: FeeStatus
  installments: InstallmentState[]
  nextDue: { dueDate: string; amount: number; label: string; installmentId: string } | null
  overdueAmount: number
  unscheduled: number
}

const r2 = (n: number) => Math.round(n * 100) / 100

export const FEE_STATUS_LABEL: Record<FeeStatus, string> = {
  FULLY_PAID: 'Fully Paid',
  PARTIALLY_PAID: 'Partially Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
}

export function computeLedger(totalFeeIn: number, installmentsIn: LedgerInstallment[], payments: LedgerPayment[], today: string): Ledger {
  const totalFee = r2(Number(totalFeeIn) || 0)
  const ok = payments.filter((p) => p.status === 'SUCCESSFUL')
  const sum = (kind: string[]) => r2(ok.filter((p) => kind.includes(p.kind)).reduce((s, p) => s + Number(p.amount || 0), 0))
  const paid = sum(['PAYMENT'])
  const refunded = sum(['REFUND', 'REVERSAL'])
  const adjustments = sum(['ADJUSTMENT'])
  const collected = r2(paid - refunded)
  const balance = Math.max(0, r2(totalFee - collected - adjustments))

  let credit = r2(collected + adjustments)
  const sorted = [...installmentsIn].sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0))
  const installments: InstallmentState[] = sorted.map((i) => {
    const amount = r2(Number(i.amount) || 0)
    const take = Math.max(0, Math.min(amount, credit))
    credit = r2(credit - take)
    const remaining = r2(amount - take)
    const state: InstallmentState['state'] = remaining <= 0 ? 'PAID' : i.dueDate < today ? 'OVERDUE' : take > 0 ? 'PARTIAL' : 'DUE'
    return { ...i, amount, paid: r2(take), remaining, state }
  })

  const open = installments.find((i) => i.remaining > 0)
  const overdueAmount = r2(installments.filter((i) => i.state === 'OVERDUE').reduce((s, i) => s + i.remaining, 0))
  const scheduled = r2(installments.reduce((s, i) => s + i.amount, 0))
  const unscheduled = Math.max(0, r2(totalFee - Math.max(scheduled, collected + adjustments)))

  let status: FeeStatus
  if (totalFee > 0 && balance <= 0) status = 'FULLY_PAID'
  else if (overdueAmount > 0) status = 'OVERDUE'
  else if (collected > 0) status = 'PARTIALLY_PAID'
  else status = 'PENDING'

  return {
    totalFee,
    collected,
    refunded,
    adjustments,
    balance,
    status,
    installments,
    nextDue: open ? { dueDate: open.dueDate, amount: open.remaining, label: open.label, installmentId: open.id } : null,
    overdueAmount,
    unscheduled,
  }
}

export const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'CARD', label: 'Debit / Credit Card' },
  { value: 'LOAN', label: 'Loan' },
  { value: 'GATEWAY', label: 'Payment Gateway' },
  { value: 'OTHER', label: 'Other' },
] as const

export const paymentModeLabel = (m?: string | null) => PAYMENT_MODES.find((x) => x.value === m)?.label || m || '—'

export const PAYMENT_KIND_LABEL: Record<string, string> = {
  PAYMENT: 'Payment',
  REFUND: 'Refund',
  REVERSAL: 'Reversal',
  ADJUSTMENT: 'Fee Adjustment',
}

export const ADMISSION_STATUSES = [
  { value: 'VERIFICATION_PENDING', label: 'Verification Pending' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled / Withdrawn' },
] as const

export const admissionStatusLabel = (s?: string | null) => ADMISSION_STATUSES.find((x) => x.value === s)?.label || s || '—'
