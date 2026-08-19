import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CourseCategoryManagementClient from './CourseCategoryManagementClient'

export const dynamic = 'force-dynamic'

export default async function AdminCourseCategoriesPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const categories = await db.courseCategory.findMany({
    include: { courses: true },
    orderBy: { displayOrder: 'asc' },
  })

  return <CourseCategoryManagementClient initialCategories={JSON.parse(JSON.stringify(categories))} />
}
