import { db } from './db'
import { computeLedger, type Ledger } from './fees'
import { todayIST, ymdOf } from './dates'

/** Ledgers for many admissions in two queries. */
export async function loadLedgers(admissions: { id: string; totalFee: any }[], today = todayIST()): Promise<Map<string, Ledger>> {
  const ids = admissions.map((a) => a.id)
  const map = new Map<string, Ledger>()
  if (ids.length === 0) return map
  const [inst, pays] = await Promise.all([
    (db as any).feeInstallment.findMany({ where: { admissionId: { in: ids } }, select: { id: true, admissionId: true, label: true, dueDate: true, amount: true } }),
    (db as any).payment.findMany({ where: { admissionId: { in: ids } }, select: { id: true, admissionId: true, kind: true, status: true, amount: true, relatedPaymentId: true } }),
  ])
  for (const a of admissions) {
    map.set(
      a.id,
      computeLedger(
        Number(a.totalFee),
        inst.filter((i: any) => i.admissionId === a.id).map((i: any) => ({ id: i.id, label: i.label, dueDate: ymdOf(i.dueDate), amount: Number(i.amount) })),
        pays.filter((p: any) => p.admissionId === a.id).map((p: any) => ({ id: p.id, kind: p.kind, status: p.status, amount: Number(p.amount), relatedPaymentId: p.relatedPaymentId })),
        today,
      ),
    )
  }
  return map
}

/** Admissions that count for fees (not cancelled, not in the Bin). */
export const LIVE_ADMISSION = { isDeleted: false, status: { not: 'CANCELLED' } }
