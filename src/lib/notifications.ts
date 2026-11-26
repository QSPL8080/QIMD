import { db } from './db'
import type { SessionUser } from './auth'
import { isSuperAdminRole } from './auth'

export type AdminNotificationItem = {
  id: string
  type: string
  title: string
  actorName: string | null
  actorEmail: string | null
  actorRole: string | null
  link: string | null
  isRead: boolean
  createdAt: string
}

/** Save a notification for the Super Admin. Never blocks the action that caused it. */
export async function notifySuperAdmin(data: {
  type: string
  title: string
  link?: string | null
  actor?: { id?: string | null; fullName?: string | null; email?: string | null; role?: string | null }
}) {
  try {
    await (db as any).adminNotification.create({
      data: {
        type: data.type,
        title: data.title.slice(0, 255),
        actorId: data.actor?.id || null,
        actorName: data.actor?.fullName || null,
        actorEmail: data.actor?.email || null,
        actorRole: data.actor?.role || null,
        link: (data as any).link || null,
      },
    })
  } catch (err) {
    console.warn('Notification not saved (run prisma/sql/create_admin_notifications.sql):', err)
  }
}

/** Send an in-system notification to one user (e.g. a counsellor who was assigned leads). */
export async function notifyUser(
  recipientId: string,
  data: { type: string; title: string; link?: string | null; actor?: { id?: string | null; fullName?: string | null; email?: string | null; role?: string | null } },
) {
  try {
    await (db as any).adminNotification.create({
      data: {
        recipientId,
        type: data.type,
        title: data.title.slice(0, 255),
        link: data.link || null,
        actorId: data.actor?.id || null,
        actorName: data.actor?.fullName || null,
        actorEmail: data.actor?.email || null,
        actorRole: data.actor?.role || null,
      },
    })
  } catch (err) {
    console.warn('Notification not saved:', err)
  }
}

/** Notify every active user with one of the given roles. */
export async function notifyRoles(
  roles: string[],
  data: { type: string; title: string; link?: string | null; actor?: { id?: string | null; fullName?: string | null; email?: string | null; role?: string | null } },
  exceptUserId?: string | null,
) {
  try {
    const users = await db.user.findMany({
      where: { role: { in: roles }, status: true, isDeleted: false },
      select: { id: true },
    })
    await Promise.all(users.filter((u: any) => u.id !== exceptUserId).map((u: any) => notifyUser(u.id, data)))
  } catch (err) {
    console.warn('Role notification not saved:', err)
  }
}

/** Notifications this user may see: their own, plus Super Admin ones for a Super Admin. */
export function notificationScope(session: SessionUser) {
  return isSuperAdminRole(session.roleName)
    ? { OR: [{ recipientId: session.id }, { recipientId: null }] }
    : { recipientId: session.id }
}

export async function getNotifications(session: SessionUser, limit = 30): Promise<{ items: AdminNotificationItem[]; unread: number }> {
  try {
    const where = notificationScope(session)
    const [items, unread] = await Promise.all([
      (db as any).adminNotification.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit }),
      (db as any).adminNotification.count({ where: { ...where, isRead: false } }),
    ])
    return {
      items: (items || []).map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        actorName: n.actorName ?? null,
        actorEmail: n.actorEmail ?? null,
        actorRole: n.actorRole ?? null,
        link: n.link ?? null,
        isRead: Boolean(n.isRead),
        createdAt: new Date(n.createdAt ?? Date.now()).toISOString(),
      })),
      unread: Number(unread) || 0,
    }
  } catch {
    return { items: [], unread: 0 }
  }
}
