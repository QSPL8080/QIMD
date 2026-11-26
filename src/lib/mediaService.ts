import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'
import { BUCKET, objectPathFromUrl, storage } from '@/lib/storage'

/**
 * Website media clean-up. A file is removed from storage only when no record
 * (blog, banner, gallery, placement, testimonial, student review, user) still uses it.
 */

import { MEDIA_FIELDS } from './mediaService.fields'
export { MEDIA_FIELDS }

/** Only files we host can be deleted (our bucket, /media/… or /uploads/…). */
export function isOwnMediaUrl(url: string) {
  return Boolean(url && (objectPathFromUrl(url) || url.startsWith('/media/') || url.startsWith('/uploads/')))
}

/** All own-media URLs in a record. */
export function mediaUrlsOf(table: string, row: any): string[] {
  if (!row) return []
  const out = new Set<string>()
  for (const f of MEDIA_FIELDS[table] || []) {
    const v = row[f]
    const list = Array.isArray(v) ? v : [v]
    for (const u of list) if (typeof u === 'string' && isOwnMediaUrl(u.trim())) out.add(u.trim())
  }
  return [...out]
}

export async function isFileReferencedInDb(fileUrl: string, excludeRecord?: { table: string; id: string }): Promise<boolean> {
  if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.trim()) return false
  const url = fileUrl.trim()
  const not = (table: string) => (excludeRecord?.table === table ? { id: { not: excludeRecord.id } } : {})
  const anyOf = (fields: string[]) => ({ OR: fields.map((f) => ({ [f]: url })) })

  const checks = await Promise.all([
    db.blog.count({ where: { ...not('blog'), OR: [{ featuredImage: url }, { images: { array_contains: [url] } as any }, { content: { contains: url } }] } }),
    db.banner.count({ where: { ...not('banner'), imageUrl: url } }),
    db.gallery.count({ where: { ...not('gallery'), ...anyOf(['fileUrl', 'thumbnail']) } }),
    db.placement.count({ where: { ...not('placement'), ...anyOf(['studentPhoto', 'companyLogo', 'videoUrl', 'videoThumbnail']) } }),
    db.testimonial.count({ where: { ...not('testimonial'), ...anyOf(['photo', 'videoUrl', 'videoThumbnail']) } }),
    db.studentReview.count({ where: { ...not('studentReview'), photo: url } }),
    db.user.count({ where: { profileImage: url } }),
  ])
  return checks.some((n) => n > 0)
}

/** Delete the stored file behind a URL (bucket object, DB-stored media or legacy /uploads file). */
export async function removeStoredMedia(url: string) {
  const objectPath = objectPathFromUrl(url)
  if (objectPath) {
    const s = storage()
    if (s) {
      const { error } = await s.from(BUCKET).remove([objectPath])
      if (error) console.error('[media] bucket remove failed', objectPath, error.message)
    }
    return
  }
  const m = url.match(/^\/media\/([0-9a-f-]{36})/i)
  if (m) {
    await (db as any).storedFile.deleteMany({ where: { id: m[1], ownerType: 'media' } })
    return
  }
  if (url.startsWith('/uploads/')) {
    const local = path.join(process.cwd(), 'public', url.replace(/^\//, '').split('?')[0])
    const root = path.join(process.cwd(), 'public', 'uploads')
    if (local.startsWith(root) && fs.existsSync(local)) {
      try {
        fs.unlinkSync(local)
      } catch {}
    }
  }
}

/** Removes a file from storage if nothing else uses it. Returns true when removed. */
export async function safeDeleteUnusedFile(fileUrl: string, excludeRecord?: { table: string; id: string }): Promise<boolean> {
  if (!fileUrl || typeof fileUrl !== 'string' || !isOwnMediaUrl(fileUrl.trim())) return false
  const url = fileUrl.trim()
  try {
    if (await isFileReferencedInDb(url, excludeRecord)) return false
    await removeStoredMedia(url)
    return true
  } catch (e) {
    console.error('[media] clean-up failed for', url, e)
    return false
  }
}

/** After a record changed: delete files it no longer uses. */
export async function cleanupReplacedMedia(table: string, before: any, after: any) {
  const keep = new Set(mediaUrlsOf(table, after))
  for (const u of mediaUrlsOf(table, before)) if (!keep.has(u)) await safeDeleteUnusedFile(u)
}

/** After records were permanently deleted: delete their files. */
export async function purgeRecordsMedia(table: string, rows: any[]) {
  for (const row of rows) for (const u of mediaUrlsOf(table, row)) await safeDeleteUnusedFile(u)
}
