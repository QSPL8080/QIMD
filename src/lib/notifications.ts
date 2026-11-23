import { db } from './db'

export type AdminNotificationItem = {
  id: string
  type: string
  title: string
  actorName: string | null
  actorEmail: string | null
  actorRole: string | null
  isRead: boolean
  createdAt: string
}

/** Save a notification for the Super Admin. Never blocks the action that caused it. */
export async function notifySuperAdmin(data: {
  type: string
  title: string
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
      },
    })
  } catch (err) {
    console.warn('Notification not saved (run prisma/sql/create_admin_notifications.sql):', err)
  }
}

export async function getNotifications(limit = 30): Promise<{ items: AdminNotificationItem[]; unread: number }> {
  try {
    const [items, unread] = await Promise.all([
      (db as any).adminNotification.findMany({ orderBy: { createdAt: 'desc' }, take: limit }),
      (db as any).adminNotification.count({ where: { isRead: false } }),
    ])
    return {
      items: (items || []).map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        actorName: n.actorName ?? null,
        actorEmail: n.actorEmail ?? null,
        actorRole: n.actorRole ?? null,
        isRead: Boolean(n.isRead),
        createdAt: new Date(n.createdAt ?? Date.now()).toISOString(),
      })),
      unread: Number(unread) || 0,
    }
  } catch {
    return { items: [], unread: 0 }
  }
}
