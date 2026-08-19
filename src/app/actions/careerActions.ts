'use server'

import { db } from '@/lib/db'
import { jobOpeningSchema } from '@/lib/validations'
import { requireAdminSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function saveJobOpeningAction(data: any, id?: string) {
  const session = await requireAdminSession()
  try {
    const validated = jobOpeningSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    if (id) {
      await db.jobOpening.update({
        where: { id },
        data: validated.data,
      })
      await createAuditLog({ userId: session.id, module: 'CAREER_OPENINGS', action: 'UPDATE_JOB', recordId: id })
    } else {
      const created = await db.jobOpening.create({
        data: validated.data,
      })
      await createAuditLog({ userId: session.id, module: 'CAREER_OPENINGS', action: 'CREATE_JOB', recordId: created.id })
    }

    revalidatePath('/careers')
    revalidatePath('/admin/careers')
    return { success: true, message: 'Job opening saved successfully.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save job opening.' }
  }
}

export async function trashJobOpeningAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.jobOpening.update({
      where: { id },
      data: { isDeleted: true },
    })
    await createAuditLog({ userId: session.id, module: 'CAREER_OPENINGS', action: 'TRASH_JOB', recordId: id })
    revalidatePath('/careers')
    revalidatePath('/admin/careers')
    return { success: true, message: 'Job opening moved to Trash.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash job opening.' }
  }
}

export async function restoreJobOpeningAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.jobOpening.update({
      where: { id },
      data: { isDeleted: false },
    })
    await createAuditLog({ userId: session.id, module: 'CAREER_OPENINGS', action: 'RESTORE_JOB', recordId: id })
    revalidatePath('/careers')
    revalidatePath('/admin/careers')
    return { success: true, message: 'Job opening restored from Trash.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore job opening.' }
  }
}

export async function deleteJobOpeningPermanentlyAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.jobOpening.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'CAREER_OPENINGS', action: 'PERMANENT_DELETE_JOB', recordId: id })
    revalidatePath('/careers')
    revalidatePath('/admin/careers')
    return { success: true, message: 'Job opening permanently deleted.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete job opening.' }
  }
}
