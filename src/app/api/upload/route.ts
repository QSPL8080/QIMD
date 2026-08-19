import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
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

    return NextResponse.json({
      success: true,
      url: fileUrl,
    })
  } catch (err: any) {
    console.error('File upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
