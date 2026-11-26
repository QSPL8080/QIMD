import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Website media storage (Supabase Storage bucket "qimd-media").
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.
 */
export const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'qimd-media'

export function storageConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return Boolean(url && key && !url.includes('placeholder') && !key.includes('placeholder') && key.length > 20)
}

let client: SupabaseClient | null = null
export function storage() {
  if (!storageConfigured()) return null
  if (!client) client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  return client.storage
}

let bucketReady: Promise<void> | null = null
/** Per-file limit set on the bucket itself (bytes), or null when only the project-wide limit applies. */
export let bucketFileLimit: number | null = null

/**
 * Makes sure the bucket exists, is public (so website visitors can load the files) and has no
 * per-bucket size cap below what the admin panel allows — then only Supabase's project-wide
 * "Upload file size limit" applies (Free plan: 50 MB; Pro: up to 500 GB).
 */
export function ensurePublicBucket() {
  const s = storage()
  if (!s) return Promise.resolve()
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data, error } = await s.getBucket(BUCKET)
      if (error || !data) {
        const created = await s.createBucket(BUCKET, { public: true })
        if (created.error && !/exists/i.test(created.error.message)) throw new Error(created.error.message)
        bucketFileLimit = null
        return
      }
      const limit = (data as any).file_size_limit ? Number((data as any).file_size_limit) : null
      if (!data.public || (limit !== null && limit < MEDIA_TYPES.video.max)) {
        const upd = await s.updateBucket(BUCKET, { public: true, fileSizeLimit: null, allowedMimeTypes: (data as any).allowed_mime_types ?? null })
        if (upd.error) {
          console.error('[storage] could not update bucket settings:', upd.error.message)
          bucketFileLimit = limit
          return
        }
      }
      bucketFileLimit = null
    })().catch((e) => {
      bucketReady = null
      console.error('[storage] bucket check failed:', e?.message || e)
    })
  }
  return bucketReady
}

export function publicUrl(path: string) {
  const s = storage()
  return s ? s.from(BUCKET).getPublicUrl(path).data.publicUrl : ''
}

/** Object path inside our bucket for a public URL, or null if the URL is not ours. */
export function objectPathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const i = url.indexOf(marker)
  if (i >= 0) return decodeURIComponent(url.slice(i + marker.length).split('?')[0])
  const legacy = `/${BUCKET}/`
  const j = url.indexOf(legacy)
  if (j >= 0 && url.includes('supabase')) return decodeURIComponent(url.slice(j + legacy.length).split('?')[0])
  return null
}

const SAFE = /[^a-z0-9._-]+/g
/** e.g. gallery/2026/11/1732600000000-abc123-classroom-01.png */
export function newObjectPath(folder: string, fileName: string) {
  const ext = (fileName.match(/\.[a-z0-9]{1,5}$/i)?.[0] || '').toLowerCase()
  const base = fileName.replace(/\.[^.]+$/, '').toLowerCase().replace(SAFE, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'file'
  const f = folder.toLowerCase().replace(/[^a-z0-9/_-]+/g, '-').replace(/\/+/g, '/').replace(/^[-/]+|[-/]+$/g, '') || 'media'
  const d = new Date()
  return `${f}/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}${ext}`
}

export const MEDIA_TYPES: Record<string, { mime: RegExp; max: number; label: string }> = {
  image: { mime: /^image\/(jpeg|png|webp|gif|avif|svg\+xml)$/, max: 10 * 1024 * 1024, label: 'Images (JPG, PNG, WebP, GIF, AVIF, SVG) up to 10 MB' },
  video: { mime: /^video\/(mp4|webm|quicktime)$/, max: 200 * 1024 * 1024, label: 'Videos (MP4, WebM, MOV) up to 200 MB' },
  document: { mime: /^application\/pdf$/, max: 10 * 1024 * 1024, label: 'PDF up to 10 MB' },
}

export function mediaKind(mime: string) {
  for (const [k, v] of Object.entries(MEDIA_TYPES)) if (v.mime.test(mime)) return k as keyof typeof MEDIA_TYPES
  return null
}
