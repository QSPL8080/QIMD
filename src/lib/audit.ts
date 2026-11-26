import { headers } from 'next/headers'
import { db } from './db'

type Actor = { id?: string | null; fullName?: string | null; roleName?: string | null } | null | undefined

/** Strip values that should never sit in an audit trail (password hashes, file bytes). */
function clean(v: unknown): any {
  if (v === undefined) return undefined
  return JSON.parse(
    JSON.stringify(v, (k, val) => {
      if (['passwordHash', 'password', 'passwordResetHash', 'data', 'receiptToken'].includes(k)) return undefined
      if (typeof val === 'bigint') return val.toString()
      return val
    }),
  )
}

/** Only the fields that changed (for before/after on updates). */
export function diff(before: Record<string, any> | null | undefined, after: Record<string, any> | null | undefined) {
  const b: Record<string, any> = {}
  const a: Record<string, any> = {}
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})])
  for (const k of keys) {
    if (['updatedAt', 'createdAt', 'updatedById', 'updatedByName'].includes(k)) continue
    const x = JSON.stringify(before?.[k] ?? null)
    const y = JSON.stringify(after?.[k] ?? null)
    if (x !== y) {
      b[k] = before?.[k] ?? null
      a[k] = after?.[k] ?? null
    }
  }
  return { before: b, after: a, changed: Object.keys(a) }
}

/**
 * Write an audit entry (SRS §15). Never throws: a failed audit write must not
 * undo the user's action, but it is reported in the server log.
 */
export async function audit(
  actor: Actor,
  action: string,
  entityType: string | null,
  entityId: string | null,
  summary: string,
  data?: { before?: unknown; after?: unknown },
) {
  let ip: string | null = null
  try {
    const h = await headers()
    ip = (h.get('x-forwarded-for') || h.get('x-real-ip') || '').split(',')[0].trim() || null
  } catch {
    ip = null
  }
  try {
    await (db as any).auditLog.create({
      data: {
        actorId: actor?.id || null,
        actorName: actor?.fullName || 'System',
        actorRole: actor?.roleName || null,
        action,
        entityType,
        entityId,
        summary: summary.slice(0, 500),
        before: data?.before == null ? undefined : clean(data.before),
        after: data?.after == null ? undefined : clean(data.after),
        ip,
      },
    })
  } catch (err) {
    console.error('[audit] could not write entry:', action, err)
  }
}
