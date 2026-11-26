import { db } from './db'
import { isYmd, dateOnly } from './dates'
import { loadLedgers } from './admissionData'
import { ADMISSION_STATUSES, type Ledger } from './fees'

export type AdmissionQuery = { q?: string; status?: string; course?: string; counsellor?: string; from?: string; to?: string; fee?: string; page?: string }
const KEYS: (keyof AdmissionQuery)[] = ['q', 'status', 'course', 'counsellor', 'from', 'to', 'fee', 'page']

export function pickAdmissionQuery(sp: Record<string, string | string[] | undefined>): AdmissionQuery {
  const out: AdmissionQuery = {}
  for (const k of KEYS) {
    const v = sp[k]
    const s = Array.isArray(v) ? v[0] : v
    if (s) out[k] = String(s).slice(0, 200)
  }
  return out
}

export function buildAdmissionWhere(f: AdmissionQuery) {
  const and: any[] = [{ isDeleted: false }]
  if (f.q) {
    const q = f.q.trim()
    const digits = q.replace(/\D/g, '')
    and.push({
      OR: [
        { studentName: { contains: q, mode: 'insensitive' } },
        { admissionCode: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q } },
        ...(digits.length >= 4 ? [{ mobileNormalized: { contains: digits.slice(-10) } }] : []),
      ],
    })
  }
  if (f.status && ADMISSION_STATUSES.some((s) => s.value === f.status)) and.push({ status: f.status })
  if (f.course) and.push({ courseName: f.course })
  if (f.counsellor && /^[0-9a-f-]{36}$/i.test(f.counsellor)) and.push({ counsellorId: f.counsellor })
  if (f.from && isYmd(f.from)) and.push({ admissionDate: { gte: dateOnly(f.from) } })
  if (f.to && isYmd(f.to)) and.push({ admissionDate: { lte: dateOnly(f.to) } })
  return { AND: and }
}

/** Matching admissions with their ledgers; the fee-status filter is applied on the computed ledger. */
export async function queryAdmissions(f: AdmissionQuery, select: Record<string, any> = {}) {
  const rows = await (db as any).admission.findMany({
    where: buildAdmissionWhere(f),
    orderBy: [{ admissionDate: 'desc' }, { createdAt: 'desc' }],
    select: { id: true, totalFee: true, status: true, ...select },
  })
  const ledgers = await loadLedgers(rows)
  const withLedger = rows.map((r: any) => ({ ...r, ledger: ledgers.get(r.id) as Ledger }))
  const fee = f.fee
  return fee && ['FULLY_PAID', 'PARTIALLY_PAID', 'PENDING', 'OVERDUE'].includes(fee) ? withLedger.filter((r: any) => r.ledger.status === fee) : withLedger
}
