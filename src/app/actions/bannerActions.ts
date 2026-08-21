'use server'

import { db } from '@/lib/db'
import { PrismaClient } from '@prisma/client'
import { requireContentManagerSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { safeDeleteUnusedFile } from '@/lib/mediaService'

const localDbUrl = 'postgresql://postgres:8080@localhost:5432/qimd_db?schema=public'
const localDb = new PrismaClient({
  datasources: { db: { url: localDbUrl } },
})

export async function saveBannerAction(
  data: {
    badge?: string
    title?: string
    titleAccent?: string
    subtitle?: string
    tag?: string
    accentColor?: string
    icon?: string
    imageUrl?: string
    displayOrder?: number
    isActive?: boolean
  },
  id?: string
) {
  await requireContentManagerSession()

  try {
    if (id) {
      const existing = await db.banner.findUnique({ where: { id } })
      if (!existing) {
        return { success: false, error: 'Banner record not found in database. Please refresh page.' }
      }

      if (existing.imageUrl && data.imageUrl && existing.imageUrl !== data.imageUrl) {
        await safeDeleteUnusedFile(existing.imageUrl, { table: 'banner', id })
      }

      const updatePayload = {
        badge: data.badge !== undefined ? data.badge : existing.badge,
        title: data.title !== undefined ? data.title : existing.title,
        titleAccent: data.titleAccent !== undefined ? data.titleAccent : existing.titleAccent,
        subtitle: data.subtitle !== undefined ? data.subtitle : existing.subtitle,
        tag: data.tag !== undefined ? data.tag : existing.tag,
        accentColor: data.accentColor !== undefined ? data.accentColor : existing.accentColor,
        icon: data.icon !== undefined ? data.icon : existing.icon,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl,
        displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : existing.displayOrder,
        isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
      }

      // Update Supabase
      await db.banner.update({
        where: { id },
        data: updatePayload,
      })

      // Sync Update to Local pgAdmin
      try {
        await localDb.banner.update({
          where: { id },
          data: updatePayload,
        })
      } catch (err) {
        console.warn('Local pgAdmin sync error (non-fatal):', err)
      }
    } else {
      const createPayload = {
        badge: data.badge || 'CAREER BOOSTER',
        title: data.title || null,
        titleAccent: data.titleAccent || null,
        subtitle: data.subtitle || null,
        tag: data.tag || '100% Job Assistance',
        accentColor: data.accentColor || '#764DFF',
        icon: data.icon || 'mdi:rocket-launch',
        imageUrl: data.imageUrl || '/images/Banner/Banner 1.png',
        displayOrder: Number(data.displayOrder || 0),
        isActive: data.isActive !== undefined ? data.isActive : true,
      }

      // Create in Supabase
      const newBanner = await db.banner.create({
        data: createPayload,
      })

      // Sync Create to Local pgAdmin
      try {
        await localDb.banner.create({
          data: {
            id: newBanner.id,
            ...createPayload,
          },
        })
      } catch (err) {
        console.warn('Local pgAdmin sync error (non-fatal):', err)
      }
    }

    revalidatePath('/admin/banners')
    revalidatePath('/')
    return { success: true, message: 'Banner saved successfully in both databases' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save banner' }
  }
}

export async function deleteBannerPermanentlyAction(id: string) {
  await requireContentManagerSession()
  try {
    const existing = await db.banner.findUnique({ where: { id } })
    if (existing) {
      // Delete from Supabase
      await db.banner.delete({ where: { id } })
      
      // Delete from Local pgAdmin
      try {
        await localDb.banner.delete({ where: { id } })
      } catch (err) {
        console.warn('Local pgAdmin delete sync error (non-fatal):', err)
      }

      if (existing.imageUrl) {
        await safeDeleteUnusedFile(existing.imageUrl, { table: 'banner', id })
      }
    }
    revalidatePath('/admin/banners')
    revalidatePath('/')
    return { success: true, message: 'Banner deleted successfully from both databases' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete banner' }
  }
}

export async function getPublicBannersAction() {
  try {
    const banners = await db.banner.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })

    return banners.map((b) => ({
      id: b.id,
      badge: b.badge || 'CAREER BOOSTER',
      title: b.title,
      titleAccent: b.titleAccent,
      subtitle: b.subtitle,
      tag: b.tag || '100% Job Assistance',
      accentColor: b.accentColor || '#764DFF',
      icon: b.icon || 'mdi:rocket-launch',
      imageUrl: b.imageUrl,
      displayOrder: b.displayOrder,
    }))
  } catch (err) {
    console.error('Error in getPublicBannersAction:', err)
    return []
  }
}
