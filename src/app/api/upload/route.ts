import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { db } from '@/lib/db'
import { BUCKET, ensurePublicBucket, MEDIA_TYPES, mediaKind, newObjectPath, publicUrl, storage } from '@/lib/storage'

export const dynamic = 'force-dynamic'

/**
 * Website media upload through the server (images, small videos, PDFs).
 * Large videos go straight from the browser to the bucket via /api/upload/sign.
 * Stored in the Supabase bucket; if storage is not configured, kept in the database
 * and served from /media/<id>/<name> (never written to /public, which is wiped on redeploy).
 */
export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || !can(session.roleName, 'content', 'edit', session.moduleAccess)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const folder = String(form.get('folder') || 'media')
    if (!file || !file.size) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    const kind = mediaKind(file.type)
    if (!kind) return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, WebP, GIF, SVG, MP4, WebM, MOV or PDF.' }, { status: 400 })
    if (file.size > MEDIA_TYPES[kind].max) return NextResponse.json({ error: `File too large. ${MEDIA_TYPES[kind].label}.` }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const s = storage()
    if (s) {
      await ensurePublicBucket()
      const path = newObjectPath(folder, file.name)
      const { error } = await s.from(BUCKET).upload(path, buffer, { contentType: file.type, cacheControl: '31536000', upsert: false })
      if (!error) return NextResponse.json({ success: true, url: publicUrl(path), storage: 'bucket' })
      console.error('[upload] bucket upload failed:', error.message)
      return NextResponse.json({ error: `Storage upload failed: ${error.message}` }, { status: 502 })
    }

    // No bucket configured: keep the file in the database (survives redeploys)
    if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'Storage bucket is not configured; files over 25 MB need it.' }, { status: 400 })
    const name = file.name.replace(/[^\w.-]+/g, '-').slice(-80) || 'file'
    const row = await (db as any).storedFile.create({
      data: { ownerType: 'media', label: folder.slice(0, 120), originalName: name, mimeType: file.type, size: file.size, data: buffer, uploadedById: session.id, uploadedByName: session.fullName },
      select: { id: true },
    })
    return NextResponse.json({ success: true, url: `/media/${row.id}/${encodeURIComponent(name)}`, storage: 'database' })
  } catch (err: any) {
    console.error('File upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
