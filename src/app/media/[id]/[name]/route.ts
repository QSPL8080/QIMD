import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Public website media kept in the database (used only when the storage bucket is not configured). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; name: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('Not found', { status: 404 })
  const f = await (db as any).storedFile.findFirst({ where: { id, ownerType: 'media', isDeleted: false }, select: { data: true, mimeType: true, size: true } })
  if (!f) return new Response('Not found', { status: 404 })
  return new Response(Buffer.from(f.data), {
    headers: { 'Content-Type': f.mimeType, 'Content-Length': String(f.size), 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
  })
}
