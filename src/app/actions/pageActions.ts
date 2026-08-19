'use server'

import { db } from '@/lib/db'
import { requireContentManagerSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function saveWebPageAction(
  data: {
    pageName: string
    pageKey: string
    slug: string
    description?: string
    status?: 'DRAFT' | 'PUBLISHED'
    metaTitle?: string
    metaDescription?: string
    canonicalUrl?: string
    ogImage?: string
  },
  id?: string
) {
  const session = await requireContentManagerSession()

  try {
    let page
    if (id) {
      page = await db.webPage.update({
        where: { id },
        data: {
          pageName: data.pageName,
          slug: data.slug,
          description: data.description || null,
          status: data.status || 'PUBLISHED',
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
          canonicalUrl: data.canonicalUrl || null,
          ogImage: data.ogImage || null,
        },
      })
    } else {
      page = await db.webPage.create({
        data: {
          pageName: data.pageName,
          pageKey: data.pageKey.toUpperCase(),
          slug: data.slug,
          description: data.description || null,
          status: data.status || 'PUBLISHED',
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
          canonicalUrl: data.canonicalUrl || null,
          ogImage: data.ogImage || null,
        },
      })
    }

    await createAuditLog({
      userId: session.id,
      module: 'WEB_PAGES',
      action: id ? 'UPDATE_WEB_PAGE' : 'CREATE_WEB_PAGE',
      recordId: page.id,
    })

    revalidatePath('/admin/pages')
    revalidatePath(data.slug)

    return { success: true, message: 'Page saved successfully!' }
  } catch (err: any) {
    console.error('Error saving web page:', err)
    return { success: false, error: err.message || 'Failed to save page' }
  }
}

export async function togglePageStatusAction(id: string, status: 'DRAFT' | 'PUBLISHED') {
  const session = await requireContentManagerSession()

  try {
    const page = await db.webPage.update({
      where: { id },
      data: { status },
    })

    await createAuditLog({
      userId: session.id,
      module: 'WEB_PAGES',
      action: status === 'PUBLISHED' ? 'PUBLISH_PAGE' : 'UNPUBLISH_PAGE',
      recordId: id,
    })

    revalidatePath('/admin/pages')
    revalidatePath(page.slug)

    return { success: true, message: `Page status changed to ${status}` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update page status' }
  }
}

export async function trashWebPageAction(id: string) {
  const session = await requireContentManagerSession()

  try {
    await db.webPage.update({
      where: { id },
      data: { isDeleted: true },
    })

    await createAuditLog({
      userId: session.id,
      module: 'WEB_PAGES',
      action: 'TRASH_WEB_PAGE',
      recordId: id,
    })

    revalidatePath('/admin/pages')
    return { success: true, message: 'Page moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash page' }
  }
}

export async function restoreWebPageAction(id: string) {
  const session = await requireContentManagerSession()

  try {
    await db.webPage.update({
      where: { id },
      data: { isDeleted: false },
    })

    await createAuditLog({
      userId: session.id,
      module: 'WEB_PAGES',
      action: 'RESTORE_WEB_PAGE',
      recordId: id,
    })

    revalidatePath('/admin/pages')
    return { success: true, message: 'Page restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore page' }
  }
}

export async function deleteWebPagePermanentlyAction(id: string) {
  const session = await requireContentManagerSession()

  try {
    await db.webPage.delete({ where: { id } })

    await createAuditLog({
      userId: session.id,
      module: 'WEB_PAGES',
      action: 'PERMANENT_DELETE_WEB_PAGE',
      recordId: id,
    })

    revalidatePath('/admin/pages')
    return { success: true, message: 'Page permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete page' }
  }
}
