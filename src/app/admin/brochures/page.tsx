import React from 'react'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth'
import BrochuresManagementClient from './BrochuresManagementClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminBrochuresPage() {
  await requireAdminSession()

  const [brochures, courses] = await Promise.all([
    db.brochure.findMany({
      include: {
        course: {
          select: { id: true, courseName: true, slug: true },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    }),
    db.course.findMany({
      where: { isDeleted: false },
      select: { id: true, courseName: true, slug: true },
      orderBy: { courseName: 'asc' },
    }),
  ])

  const formattedBrochures = brochures.map((b) => ({
    id: b.id,
    title: b.title,
    courseId: b.courseId,
    courseName: b.course?.courseName || 'Unassigned Course',
    courseSlug: b.course?.slug || '',
    fileUrl: b.fileUrl,
    fileSize: b.fileSize || 'N/A',
    isActive: b.isActive,
    isDeleted: b.isDeleted,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }))

  const formattedCourses = courses.map((c) => ({
    id: c.id,
    courseName: c.courseName,
    slug: c.slug,
  }))

  return (
    <BrochuresManagementClient
      initialBrochures={formattedBrochures}
      courses={formattedCourses}
    />
  )
}
