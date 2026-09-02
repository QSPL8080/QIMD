import React from 'react'
import { db } from '@/lib/db'
import { requireContentManagerSession } from '@/lib/auth'
import BannerManagementClient from './BannerManagementClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminBannersPage() {
  await requireContentManagerSession()

  const banners = await db.banner.findMany({
    where: { isDeleted: false },
    orderBy: { displayOrder: 'asc' },
  })

  const formattedBanners = banners.map((b) => ({
    id: b.id,
    badge: b.badge || 'CAREER BOOSTER',
    title: b.title || 'Upgrade Your Skills.',
    titleAccent: b.titleAccent || 'Upgrade Your Future.',
    subtitle: b.subtitle || 'Master in-demand digital skills.',
    tag: b.tag || '100% Job Assistance',
    accentColor: b.accentColor || '#764DFF',
    icon: b.icon || 'mdi:rocket-launch',
    imageUrl: b.imageUrl,
    displayOrder: b.displayOrder,
    isActive: b.isActive,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }))

  return <BannerManagementClient initialBanners={formattedBanners} />
}
