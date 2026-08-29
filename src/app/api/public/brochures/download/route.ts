import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import path from 'path'
import fs from 'fs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fileParam = searchParams.get('file')
    const courseIdParam = searchParams.get('courseId')
    const brochureIdParam = searchParams.get('id')

    let fileUrl: string | null = fileParam
    let downloadFileName = 'course-brochure.pdf'

    if (!fileUrl && (courseIdParam || brochureIdParam)) {
      let brochure = null
      if (brochureIdParam) {
        brochure = await db.brochure.findUnique({
          where: { id: brochureIdParam },
          include: { course: true },
        })
      } else if (courseIdParam) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseIdParam)
        let course = null
        if (isUuid) {
          course = await db.course.findFirst({ where: { id: courseIdParam, isDeleted: false } })
        } else {
          course = await db.course.findFirst({
            where: {
              OR: [
                { slug: courseIdParam },
                { slug: { contains: courseIdParam } },
                { courseName: { contains: courseIdParam, mode: 'insensitive' } },
              ],
              isDeleted: false,
            },
          })
        }

        if (course) {
          brochure = await db.brochure.findFirst({
            where: { courseId: course.id, isActive: true, isDeleted: false },
            include: { course: true },
            orderBy: { updatedAt: 'desc' },
          })
        }
      }

      if (brochure) {
        fileUrl = brochure.fileUrl
        const parts = fileUrl.split('/')
        const lastPart = parts[parts.length - 1]
        if (lastPart && lastPart.toLowerCase().endsWith('.pdf')) {
          downloadFileName = lastPart
        } else {
          const safeName = (brochure.course?.courseName || brochure.title || 'course')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
          downloadFileName = `${safeName}-brochure.pdf`
        }
      }
    }

    if (!fileUrl) {
      return NextResponse.json({ error: 'Brochure not found' }, { status: 404 })
    }

    // Determine filename from fileUrl if still default
    if (downloadFileName === 'course-brochure.pdf') {
      const parts = fileUrl.split('/')
      const lastPart = parts[parts.length - 1]
      if (lastPart && lastPart.toLowerCase().endsWith('.pdf')) {
        downloadFileName = lastPart
      }
    }

    const isInline = searchParams.get('view') === '1' || searchParams.get('inline') === '1'
    const contentDisposition = isInline ? 'inline' : `attachment; filename="${downloadFileName}"`

    // If local public file
    if (fileUrl.startsWith('/') || !fileUrl.startsWith('http')) {
      const cleanPath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl
      const localFilePath = path.join(process.cwd(), 'public', cleanPath)
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath)
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': contentDisposition,
            'Content-Length': fileBuffer.length.toString(),
            'Cache-Control': 'public, max-age=3600',
          },
        })
      }
    }

    // If remote URL
    const remoteRes = await fetch(fileUrl)
    if (!remoteRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch remote brochure file' }, { status: 502 })
    }

    const buffer = Buffer.from(await remoteRes.arrayBuffer())
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err: any) {
    console.error('Brochure download error:', err)
    return NextResponse.json({ error: 'Failed to download brochure' }, { status: 500 })
  }
}
