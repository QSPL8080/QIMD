import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.pdf': 'application/pdf' }

/**
 * Older uploads were saved into public/uploads while the site was running. Next.js only serves
 * public files that existed at build time, so those images showed in the CRM list but not on the
 * website. This serves them from disk until they are re-uploaded to the bucket.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path || []
  const root = path.join(process.cwd(), 'public', 'uploads')
  const file = path.join(root, ...parts.map((p) => decodeURIComponent(p)))
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return new Response('Not found', { status: 404 })
  const type = TYPES[path.extname(file).toLowerCase()]
  if (!type) return new Response('Not found', { status: 404 })
  const data = fs.readFileSync(file)
  return new Response(data, { headers: { 'Content-Type': type, 'Content-Length': String(data.length), 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' } })
}
