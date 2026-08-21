import React from 'react'
import { db } from '@/lib/db'
import { requireContentManagerSession } from '@/lib/auth'
import BannerManagementClient from './BannerManagementClient'

export default async function AdminBannersPage() {
  await requireContentManagerSession()

  // Ensure initial 4 static images are seeded into the database if database is empty
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
    where: { isDeleted: false },
    orderBy: { displayOrder: 'asc' },
  })

  const formattedBanners = banners.map((b) => ({
    id: b.id,
    title: b.title,
    imageUrl: b.imageUrl,
    displayOrder: b.displayOrder,
    isActive: b.isActive,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }))

  return <BannerManagementClient initialBanners={formattedBanners} />
}
