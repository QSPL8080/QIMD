import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PageManagementClient from './PageManagementClient'

export const dynamic = 'force-dynamic'

export default async function AdminPagesListPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const pages = await db.webPage.findMany({
    include: {
      sections: {
        where: { isDeleted: false },
        orderBy: { displayOrder: 'asc' },
      },
    },
    orderBy: { pageName: 'asc' },
  })

  return <PageManagementClient initialPages={JSON.parse(JSON.stringify(pages))} />
}
