import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import path from 'path'
import fs from 'fs'

const BUCKET_NAME = 'qimd-media'
const RESUMES_FOLDER = 'resumes'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type - only PDF, DOC, DOCX
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    const allowedExts = ['.pdf', '.doc', '.docx']
    const ext = path.extname(file.name).toLowerCase()

    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: 'Only PDF, DOC, and DOCX files are allowed' },
        { status: 400 }
      )
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uniqueName = `${RESUMES_FOLDER}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`

    let fileUrl = ''

    // Upload to Supabase Storage if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(uniqueName, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })

      if (error) {
        console.error('Supabase Resume Upload Error:', error)
        // Fallback to local storage
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }
        const localName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`
        const filePath = path.join(uploadsDir, localName)
        fs.writeFileSync(filePath, buffer)
        fileUrl = `/uploads/resumes/${localName}`
      } else {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(BUCKET_NAME)
          .getPublicUrl(uniqueName)
        fileUrl = publicUrlData.publicUrl
      }
    } else {
      // Local fallback
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      const localName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`
      const filePath = path.join(uploadsDir, localName)
      fs.writeFileSync(filePath, buffer)
      fileUrl = `/uploads/resumes/${localName}`
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
    })
  } catch (err: any) {
    console.error('Career resume upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
