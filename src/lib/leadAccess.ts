import { db } from './db'
import type { SessionUser } from './auth'
import { isLeadScopedToAssignee } from './permissions'

/** Server-side record scope: counsellors only ever reach leads assigned to them (SRS §3.2). */
export function leadScope(session: SessionUser): Record<string, any> {
  return isLeadScopedToAssignee(session.roleName) ? { assignedToId: session.id } : {}
}

/** A lead this user may see, or null (never reveals that another lead exists). */
export async function findLeadForUser(session: SessionUser, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  return (db as any).lead.findFirst({ where: { id, isDeleted: false, ...leadScope(session) } })
}
