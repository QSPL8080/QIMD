'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function savePageSectionAction(data: {
  pageKey: string
  sectionKey: string
  sectionTitle?: string
  subtitle?: string
  content?: string
  image?: string
  buttonText?: string
  buttonUrl?: string
  displayOrder?: number
  isActive?: boolean
}, id?: string) {
  const session = await requireAdminSession()

  try {
    let section
    if (id) {
      section = await db.pageSection.update({
        where: { id },
        data: {
          pageKey: data.pageKey.toUpperCase(),
          sectionKey: data.sectionKey.toUpperCase(),
          sectionTitle: data.sectionTitle || null,
          subtitle: data.subtitle || null,
          content: data.content || null,
          image: data.image || null,
          buttonText: data.buttonText || null,
          buttonUrl: data.buttonUrl || null,
          displayOrder: data.displayOrder ?? 0,
          isActive: data.isActive ?? true,
        },
      })
    } else {
      const existing = await db.pageSection.findFirst({
        where: {
          pageKey: data.pageKey.toUpperCase(),
          sectionKey: data.sectionKey.toUpperCase(),
        },
      })
      if (existing) {
        section = await db.pageSection.update({
          where: { id: existing.id },
          data: {
            sectionTitle: data.sectionTitle || null,
            subtitle: data.subtitle || null,
            content: data.content || null,
            image: data.image || null,
            buttonText: data.buttonText || null,
            buttonUrl: data.buttonUrl || null,
            displayOrder: data.displayOrder ?? 0,
            isActive: data.isActive ?? true,
            isDeleted: false,
          },
        })
      } else {
        section = await db.pageSection.create({
          data: {
            pageKey: data.pageKey.toUpperCase(),
            sectionKey: data.sectionKey.toUpperCase(),
            sectionTitle: data.sectionTitle || null,
            subtitle: data.subtitle || null,
            content: data.content || null,
            image: data.image || null,
            buttonText: data.buttonText || null,
            buttonUrl: data.buttonUrl || null,
            displayOrder: data.displayOrder ?? 0,
            isActive: data.isActive ?? true,
          },
        })
      }
    }

    await createAuditLog({
      userId: session.id,
      module: 'PAGE_SECTIONS',
      action: id ? 'UPDATE_PAGE_SECTION' : 'CREATE_PAGE_SECTION',
      recordId: section.id,
    })

    revalidatePath('/admin/sections')
    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/why-qimd')
    revalidatePath('/courses')
    revalidatePath('/contact')

    return { success: true, message: 'Page section updated successfully!' }
  } catch (err: any) {
    console.error('Error saving page section:', err)
    return { success: false, error: err.message || 'Failed to save page section' }
  }
}

export async function trashPageSectionAction(id: string) {
  const session = await requireAdminSession()

  try {
    await db.pageSection.update({
      where: { id },
      data: { isDeleted: true },
    })

    await createAuditLog({
      userId: session.id,
      module: 'PAGE_SECTIONS',
      action: 'TRASH_PAGE_SECTION',
      recordId: id,
    })

    revalidatePath('/admin/sections')
    return { success: true, message: 'Section moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash section' }
  }
}

export async function restorePageSectionAction(id: string) {
  const session = await requireAdminSession()

  try {
    await db.pageSection.update({
      where: { id },
      data: { isDeleted: false },
    })

    await createAuditLog({
      userId: session.id,
      module: 'PAGE_SECTIONS',
      action: 'RESTORE_PAGE_SECTION',
      recordId: id,
    })

    revalidatePath('/admin/sections')
    return { success: true, message: 'Section restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore section' }
  }
}

export async function deletePageSectionPermanentlyAction(id: string) {
  const session = await requireAdminSession()

  try {
    await db.pageSection.delete({ where: { id } })

    await createAuditLog({
      userId: session.id,
      module: 'PAGE_SECTIONS',
      action: 'PERMANENT_DELETE_PAGE_SECTION',
      recordId: id,
    })

    revalidatePath('/admin/sections')
    return { success: true, message: 'Section permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete section' }
  }
}
