import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { coursesData, siteConfig } from '@/data'
import { db } from '@/lib/db'
import BrochureViewClient from './BrochureViewClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  let courseTitle = 'Course Brochure'

  try {
    const dbCourse = await db.course.findFirst({
      where: {
        OR: [{ slug }, { slug: { contains: slug } }],
        isActive: true,
        isDeleted: false,
      },
    })
    if (dbCourse) {
      courseTitle = `${dbCourse.courseName} – Official Brochure`
    }
  } catch (err) {}

  return {
    title: `${courseTitle} | ${siteConfig.name}`,
    description: `View and download the official syllabus and curriculum brochure for ${courseTitle}.`,
  }
}

export default async function BrochurePage({ params }: PageProps) {
  const { slug } = await params
  let course: any = null

  try {
    const coreKey = slug
      .replace('ai-powered-', '')
      .replace('ai-', '')
      .replace('-course', '')

    const dbCourse = await db.course.findFirst({
      where: {
        OR: [
          { slug: slug },
          { slug: { contains: slug } },
          { slug: { contains: coreKey } },
          { courseName: { contains: coreKey, mode: 'insensitive' } },
        ],
        isActive: true,
        isDeleted: false,
      },
    })

    if (dbCourse) {
      course = {
        id: dbCourse.id,
        title: dbCourse.courseName,
        slug: dbCourse.slug,
        description: dbCourse.shortDescription || dbCourse.description,
      }
    }
  } catch (err) {
    console.error('Error fetching course brochure:', err)
  }

  // Fallback to static courses data if not in db
  if (!course) {
    const staticCourse = coursesData.find((c) => c.slug === slug || slug.includes(c.slug) || c.slug.includes(slug))
    if (staticCourse) {
      course = {
        id: staticCourse.id,
        title: staticCourse.title,
        slug: staticCourse.slug,
        description: staticCourse.description,
      }
    } else {
      course = {
        id: slug,
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        slug: slug,
        description: 'Official course syllabus and training details.',
      }
    }
  }

  return <BrochureViewClient course={course} />
}
