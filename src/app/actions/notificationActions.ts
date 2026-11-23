'use server'

import { db } from '@/lib/db'
import { requireSuperAdminSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

/** Super Admin: mark every notification as read. */
export async function markNotificationsReadAction() {
  await requireSuperAdminSession()
  try {
    await (db as any).adminNotification.updateMany({ where: { isRead: false }, data: { isRead: true } })
    revalidatePath('/admin', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update notifications.' }
  }
}
