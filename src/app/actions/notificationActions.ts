'use server'

import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { notificationScope } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

/** Mark every notification of the signed-in user as read. */
export async function markNotificationsReadAction() {
  const session = await getAdminSession()
  if (!session) return { success: false, error: 'Please sign in again.' }
  try {
    await (db as any).adminNotification.updateMany({
      where: { ...notificationScope(session), isRead: false },
      data: { isRead: true },
    })
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update notifications.' }
  }
}
