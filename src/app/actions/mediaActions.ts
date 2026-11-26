'use server'

import { requirePermission } from '@/lib/auth'

export async function deleteUnusedImageAction(fileUrl: string) {
  await requirePermission('content', 'edit')
  try {
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const deleted = await safeDeleteUnusedFile(fileUrl)
    return { success: true, deleted }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete image' }
  }
}
