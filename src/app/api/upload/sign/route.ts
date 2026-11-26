import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { BUCKET, ensurePublicBucket, MEDIA_TYPES, mediaKind, newObjectPath, publicUrl, storage } from '@/lib/storage'

export const dynamic = 'force-dynamic'

/** Signed upload URL so the browser can send big files (videos) straight to the bucket. */
export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session || !can(session.roleName, 'content', 'edit', session.moduleAccess)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const s = storage()
  if (!s) return NextResponse.json({ direct: false })
  const body = await req.json().catch(() => ({}))
  const name = String(body.name || 'file')
  const type = String(body.type || '')
  const size = Number(body.size || 0)
  const kind = mediaKind(type)
  if (!kind) return NextResponse.json({ error: 'Unsupported file type. Use JPG, PNG, WebP, GIF, SVG, MP4, WebM, MOV or PDF.' }, { status: 400 })
  if (!size || size > MEDIA_TYPES[kind].max) return NextResponse.json({ error: `File too large. ${MEDIA_TYPES[kind].label}.` }, { status: 400 })
  await ensurePublicBucket()
  const path = newObjectPath(String(body.folder || 'media'), name)
  const { data, error } = await s.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) return NextResponse.json({ error: `Storage error: ${error?.message || 'no upload URL'}` }, { status: 502 })
  return NextResponse.json({ direct: true, signedUrl: data.signedUrl, path, url: publicUrl(path) })
}
