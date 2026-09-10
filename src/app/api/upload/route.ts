import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import path from 'path'
import fs from 'fs'

const BUCKET_NAME = 'qimd-media'

// True only when real (non-placeholder) Supabase credentials are configured
const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder') &&
  process.env.SUPABASE_SERVICE_ROLE_KEY.length > 20

/**
 * Save a file buffer to the local /public/uploads/ directory.
 * Returns the public URL path e.g. /uploads/filename.ext
 */
function saveToLocalStorage(buffer: Buffer, uniqueName: string): string {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  const filePath = path.join(uploadsDir, uniqueName)
  fs.writeFileSync(filePath, buffer)
  return `/uploads/${uniqueName}`
}

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

    const ext = path.extname(file.name) || '.bin'
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`

    let fileUrl = ''

    // Attempt Supabase Storage upload when properly configured
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(uniqueName, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        })

      if (error) {
        // Supabase upload failed — fall back to local storage so the upload
        // never returns an empty URL to the client (which would clear the DB field).
        console.error('Supabase Storage upload failed, falling back to local storage:', error.message)
        fileUrl = saveToLocalStorage(buffer, uniqueName)
      } else {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(BUCKET_NAME)
          .getPublicUrl(uniqueName)
        fileUrl = publicUrlData.publicUrl
      }
    } else {
      // No Supabase config — use local /public/uploads/ (development)
      fileUrl = saveToLocalStorage(buffer, uniqueName)
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
    })
  } catch (err: any) {
    console.error('File upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
