import { db } from './db'
import { isYmd, istEnd, istStart } from './dates'

export type PaymentQuery = { q?: string; mode?: string; kind?: string; from?: string; to?: string; page?: string }

export function pickPaymentQuery(sp: Record<string, string | string[] | undefined>): PaymentQuery {
  const g = (k: string) => {
    const v = sp[k]
    const s = Array.isArray(v) ? v[0] : v
    return s ? String(s).slice(0, 100) : undefined
  }
  return { q: g('q'), mode: g('mode'), kind: g('kind'), from: g('from'), to: g('to'), page: g('page') }
}

/** Same filter for the Fees page and the payments export. */
export function buildPaymentWhere(f: PaymentQuery) {
  const and: any[] = []
  if (isYmd(f.from)) and.push({ paidAt: { gte: istStart(f.from) } })
  if (isYmd(f.to)) and.push({ paidAt: { lte: istEnd(f.to) } })
  if (f.mode) and.push({ mode: f.mode })
  if (f.kind) and.push({ kind: f.kind })
  const q = f.q?.trim()
  if (q)
    and.push({
      OR: [
        { paymentCode: { contains: q, mode: 'insensitive' } },
        { receiptNo: { contains: q, mode: 'insensitive' } },
        { reference: { contains: q, mode: 'insensitive' } },
        { admission: { studentName: { contains: q, mode: 'insensitive' } } },
        { admission: { admissionCode: { contains: q, mode: 'insensitive' } } },
        { admission: { mobile: { contains: q.replace(/\D/g, '') || q } } },
      ],
    })
  return { AND: and }
}

/** Net collection (payments − refunds − reversals) between two instants. Adjustments are not income. */
export async function netCollection(from?: Date, to?: Date) {
  const where: any = { status: 'SUCCESSFUL', kind: { in: ['PAYMENT', 'REFUND', 'REVERSAL'] } }
  if (from || to) where.paidAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) }
  const rows = await (db as any).payment.groupBy({ by: ['kind'], where, _sum: { amount: true }, _count: { _all: true } })
  let received = 0
  let returned = 0
  let count = 0
  for (const r of rows) {
    const v = Number(r._sum.amount || 0)
    if (r.kind === 'PAYMENT') {
      received += v
      count += r._count._all
    } else returned += v
  }
  return { received: round(received), returned: round(returned), net: round(received - returned), count }
}

const round = (n: number) => Math.round(n * 100) / 100
