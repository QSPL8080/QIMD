import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import path from 'path'
import fs from 'fs'

const BUCKET_NAME = 'qimd-media'

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY

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

    // If Supabase Storage is configured, upload to cloud (permanent storage)
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(uniqueName, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        })

      if (error) {
        console.error('Supabase Storage Upload Error:', error)
        // When Supabase is configured but fails, return an error — do NOT silently fall
        // back to local storage because production servers (Vercel, etc.) have ephemeral
        // filesystem and locally-saved files will not persist across deployments.
        return NextResponse.json(
          {
            error: `Cloud storage upload failed: ${error.message}. Please check your Supabase storage configuration and bucket permissions.`,
          },
          { status: 500 }
        )
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uniqueName)

      fileUrl = publicUrlData.publicUrl
    } else {
      // Local fallback — only used in development when Supabase is NOT configured
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      const filePath = path.join(uploadsDir, uniqueName)
      fs.writeFileSync(filePath, buffer)
      fileUrl = `/uploads/${uniqueName}`
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
