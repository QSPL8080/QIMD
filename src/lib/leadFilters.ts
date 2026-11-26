import type { SessionUser } from './auth'
import { leadScope } from './leadAccess'
import { isYmd, istEnd, istStart, todayIST } from './dates'
import { LEAD_STATUSES } from './permissions'

export type LeadQuery = {
  q?: string
  status?: string
  source?: string
  type?: string
  course?: string
  assigned?: string // 'unassigned' | 'me' | userId
  from?: string
  to?: string
  followup?: string // 'today' | 'overdue' | 'upcoming'
  dup?: string // '1'
  page?: string
}

export const LEAD_QUERY_KEYS: (keyof LeadQuery)[] = ['q', 'status', 'source', 'type', 'course', 'assigned', 'from', 'to', 'followup', 'dup', 'page']

export function pickLeadQuery(sp: Record<string, string | string[] | undefined>): LeadQuery {
  const out: LeadQuery = {}
  for (const k of LEAD_QUERY_KEYS) {
    const v = sp[k]
    const s = Array.isArray(v) ? v[0] : v
    if (s) out[k] = String(s).slice(0, 200)
  }
  return out
}

/** Prisma `where` for leads: the user's record scope first, then the filters. */
export function buildLeadWhere(session: SessionUser, f: LeadQuery) {
  const and: any[] = [{ isDeleted: false }, leadScope(session)]
  if (f.q) {
    const q = f.q.trim()
    const digits = q.replace(/\D/g, '')
    and.push({
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { leadCode: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        ...(digits.length >= 4 ? [{ phoneNormalized: { contains: digits.slice(-10) } }] : []),
      ],
    })
  }
  if (f.status && LEAD_STATUSES.some((s) => s.value === f.status)) and.push({ status: f.status })
  if (f.source && ['WEBSITE', 'META', 'MANUAL'].includes(f.source)) and.push({ source: f.source })
  if (f.type && ['ADMISSION', 'CONTACT'].includes(f.type)) and.push({ enquiryType: f.type })
  if (f.course) and.push({ course: f.course })
  if (f.assigned === 'unassigned') and.push({ assignedToId: null })
  else if (f.assigned === 'me') and.push({ assignedToId: session.id })
  else if (f.assigned && /^[0-9a-f-]{36}$/i.test(f.assigned)) and.push({ assignedToId: f.assigned })
  if (f.from && isYmd(f.from)) and.push({ createdAt: { gte: istStart(f.from) } })
  if (f.to && isYmd(f.to)) and.push({ createdAt: { lte: istEnd(f.to) } })
  const today = todayIST()
  if (f.followup === 'today') and.push({ nextFollowUpAt: { gte: istStart(today), lte: istEnd(today) } })
  else if (f.followup === 'overdue') and.push({ nextFollowUpAt: { lt: new Date() }, status: { notIn: ['NOT_INTERESTED', 'ADMISSION_CLOSED', 'INVALID'] } })
  else if (f.followup === 'upcoming') and.push({ nextFollowUpAt: { gt: istEnd(today) } })
  if (f.dup === '1') and.push({ duplicateOfId: { not: null } })
  return { AND: and }
}
