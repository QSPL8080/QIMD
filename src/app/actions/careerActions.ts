'use server'

import { db } from '@/lib/db'
import { jobOpeningSchema } from '@/lib/validations'
import { requireAdminSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function saveJobOpeningAction(data: any, id?: string) {
  const session = await requireAdminSession()
  try {
    const validated = jobOpeningSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    let resultJob: any = null
    if (id && UUID_REGEX.test(id)) {
      resultJob = await db.jobOpening.update({
        where: { id },
        data: validated.data,
      })
      await createAuditLog({ userId: session.id, module: 'CAREER_OPENINGS', action: 'UPDATE_JOB', recordId: id })
    } else {
      resultJob = await db.jobOpening.create({
        data: validated.data,
      })
      await createAuditLog({ userId: session.id, module: 'CAREER_OPENINGS', action: 'CREATE_JOB', recordId: resultJob.id })
    }

    revalidatePath('/careers')
    revalidatePath('/admin/careers')
    return { success: true, message: 'Job opening saved successfully.', job: JSON.parse(JSON.stringify(resultJob)) }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save job opening.' }
  }
}

export async function trashJobOpeningAction(id: string) {
  const session = await requireAdminSession()
  try {
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: 'Invalid job opening ID' }
    }
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
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: 'Invalid job opening ID' }
    }
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
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: 'Invalid job opening ID' }
    }
    await db.jobOpening.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'CAREER_OPENINGS', action: 'PERMANENT_DELETE_JOB', recordId: id })
    revalidatePath('/careers')
    revalidatePath('/admin/careers')
    return { success: true, message: 'Job opening permanently deleted.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete job opening.' }
  }
}

export async function bulkTrashJobOpeningsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    const validIds = (ids || []).filter((id) => UUID_REGEX.test(id))
    if (validIds.length === 0) return { success: false, error: 'No valid job openings selected.' }
    await db.jobOpening.updateMany({
      where: { id: { in: validIds } },
      data: { isDeleted: true },
    })
    await createAuditLog({ userId: session.id, module: 'CAREER_OPENINGS', action: 'BULK_TRASH_JOBS', recordId: validIds.join(',') })
    revalidatePath('/careers')
    revalidatePath('/admin/careers')
    return { success: true, message: `${validIds.length} job openings moved to Trash.` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash job openings.' }
  }
}

export async function bulkRestoreJobOpeningsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    const validIds = (ids || []).filter((id) => UUID_REGEX.test(id))
    if (validIds.length === 0) return { success: false, error: 'No valid job openings selected.' }
    await db.jobOpening.updateMany({
      where: { id: { in: validIds } },
      data: { isDeleted: false },
    })
    await createAuditLog({ userId: session.id, module: 'CAREER_OPENINGS', action: 'BULK_RESTORE_JOBS', recordId: validIds.join(',') })
    revalidatePath('/careers')
    revalidatePath('/admin/careers')
    return { success: true, message: `${validIds.length} job openings restored.` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore job openings.' }
  }
}

export async function bulkDeleteJobOpeningsPermanentlyAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    const validIds = (ids || []).filter((id) => UUID_REGEX.test(id))
    if (validIds.length === 0) return { success: false, error: 'No valid job openings selected.' }
    await db.jobOpening.deleteMany({
      where: { id: { in: validIds } },
    })
    await createAuditLog({ userId: session.id, module: 'CAREER_OPENINGS', action: 'BULK_PERMANENT_DELETE_JOBS', recordId: validIds.join(',') })
    revalidatePath('/careers')
    revalidatePath('/admin/careers')
    return { success: true, message: `${validIds.length} job openings permanently deleted.` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete job openings.' }
  }
}

