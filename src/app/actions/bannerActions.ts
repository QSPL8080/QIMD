'use server'

import { db } from '@/lib/db'
import { requireContentManagerSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { safeDeleteUnusedFile } from '@/lib/mediaService'

export async function saveBannerAction(
  data: {
    title?: string
    imageUrl: string
    displayOrder?: number
    isActive?: boolean
  },
  id?: string
) {
  await requireContentManagerSession()

  if (!data.imageUrl) {
    return { success: false, error: 'Banner image URL is required' }
  }

  try {
    if (id) {
      const existing = await db.banner.findUnique({ where: { id } })
      if (existing && existing.imageUrl && existing.imageUrl !== data.imageUrl) {
        await safeDeleteUnusedFile(existing.imageUrl, { table: 'banner', id })
      }

      await db.banner.update({
        where: { id },
        data: {
          title: data.title || null,
          imageUrl: data.imageUrl,
          displayOrder: Number(data.displayOrder || 0),
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      })
    } else {
      await db.banner.create({
        data: {
          title: data.title || null,
          imageUrl: data.imageUrl,
          displayOrder: Number(data.displayOrder || 0),
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      })
    }

    revalidatePath('/admin/banners')
    revalidatePath('/')
    return { success: true, message: 'Banner saved successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save banner' }
  }
}

export async function deleteBannerPermanentlyAction(id: string) {
  await requireContentManagerSession()
  try {
    const existing = await db.banner.findUnique({ where: { id } })
    if (existing) {
      await db.banner.delete({ where: { id } })
      if (existing.imageUrl) {
        await safeDeleteUnusedFile(existing.imageUrl, { table: 'banner', id })
      }
    }
    revalidatePath('/admin/banners')
    revalidatePath('/')
    return { success: true, message: 'Banner deleted successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete banner' }
  }
}

export async function getPublicBannersAction() {
  try {
    // Seed initial 4 banners if database is empty
    const count = await db.banner.count()
    if (count === 0) {
      await db.banner.createMany({
        data: [
          {
            title: 'Career Booster - Upgrade Your Skills',
            imageUrl: '/images/Banner/Banner 1.png',
            displayOrder: 1,
            isActive: true,
          },
          {
            title: 'Enroll Now - Learn Practice Get Hired',
            imageUrl: '/images/Banner/Banner 2.png',
            displayOrder: 2,
            isActive: true,
          },
          {
            title: 'AI Practical - Master AI Tools',
            imageUrl: '/images/Banner/Banner 3.png',
            displayOrder: 3,
            isActive: true,
          },
          {
            title: 'Scholarship - Build Live Portfolio',
            imageUrl: '/images/Banner/Banner 4.png',
            displayOrder: 4,
            isActive: true,
          },
        ],
      })
    }

    const banners = await db.banner.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })

    return banners.map((b) => ({
      id: b.id,
      title: b.title,
      imageUrl: b.imageUrl,
      displayOrder: b.displayOrder,
    }))
  } catch (err) {
    console.error('Error in getPublicBannersAction:', err)
    return [
      { id: 'default-1', title: 'Banner 1', imageUrl: '/images/Banner/Banner 1.png', displayOrder: 1 },
      { id: 'default-2', title: 'Banner 2', imageUrl: '/images/Banner/Banner 2.png', displayOrder: 2 },
      { id: 'default-3', title: 'Banner 3', imageUrl: '/images/Banner/Banner 3.png', displayOrder: 3 },
      { id: 'default-4', title: 'Banner 4', imageUrl: '/images/Banner/Banner 4.png', displayOrder: 4 },
    ]
  }
}
