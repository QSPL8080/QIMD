import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import PageEditorClient from './PageEditorClient'

export const dynamic = 'force-dynamic'

export default async function AdminPageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { id } = await params

  const page = await db.webPage.findUnique({
    where: { id },
    include: {
      sections: {
        where: { isDeleted: false },
        orderBy: { displayOrder: 'asc' },
      },
    },
  })

  if (!page) notFound()

  return <PageEditorClient page={JSON.parse(JSON.stringify(page))} />
}
