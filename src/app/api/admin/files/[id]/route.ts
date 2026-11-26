import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { canOpenFile } from '@/lib/files'

export const dynamic = 'force-dynamic'

/** Serve a private file after an access check. Never cached, never public. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getAdminSession()
  if (!session) return new Response('Please sign in.', { status: 401 })
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('Not found', { status: 404 })
  const f = await (db as any).storedFile.findFirst({ where: { id, isDeleted: false } })
  if (!f) return new Response('Not found', { status: 404 })
  if (!canOpenFile(session, f.ownerType)) return new Response('Your role cannot open this file.', { status: 403 })
  const download = new URL(request.url).searchParams.get('download') === '1'
  const name = String(f.originalName).replace(/"/g, '')
  return new Response(Buffer.from(f.data), {
    headers: {
      'Content-Type': f.mimeType,
      'Content-Length': String(f.size),
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${name}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
