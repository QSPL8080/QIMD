import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const ext = path.extname(file.name) || '.bin'
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`
    const filePath = path.join(uploadsDir, uniqueName)

    fs.writeFileSync(filePath, buffer)

    const fileUrl = `/uploads/${uniqueName}`
    const isLogo = file.name.toLowerCase().includes('logo') || file.name.toLowerCase().includes('favicon')
    const folderName = isLogo ? 'Logos' : 'General'

    if (isLogo) {
      const existingLogoRecords = await db.mediaLibrary.findMany({
        where: { fileName: file.name },
      })
      for (const oldRec of existingLogoRecords) {
        if (oldRec.fileUrl && oldRec.fileUrl.startsWith('/uploads/')) {
          const oldPath = path.join(process.cwd(), 'public', oldRec.fileUrl.replace(/^\//, ''))
          if (fs.existsSync(oldPath)) {
            try {
              fs.unlinkSync(oldPath)
            } catch (e) {}
          }
        }
      }
      await db.mediaLibrary.deleteMany({ where: { fileName: file.name } })
    }

    // Insert into Media Library
    const media = await db.mediaLibrary.create({
      data: {
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: BigInt(file.size),
        fileUrl,
        thumbnailUrl: file.type.startsWith('image/') ? fileUrl : null,
        folder: folderName,
        uploadedById: session.id,
      },
    })

    return NextResponse.json({
      success: true,
      url: fileUrl,
      mediaId: media.id,
    })
  } catch (err: any) {
    console.error('File upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
