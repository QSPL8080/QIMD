import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PageSectionManagementClient from './PageSectionManagementClient'

export const dynamic = 'force-dynamic'

export default async function AdminSectionsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const sections = await db.pageSection.findMany({
    orderBy: [{ pageKey: 'asc' }, { displayOrder: 'asc' }],
  })

  return <PageSectionManagementClient initialSections={JSON.parse(JSON.stringify(sections))} />
}
