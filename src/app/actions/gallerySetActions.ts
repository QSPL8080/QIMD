'use server'

import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireSuperAdminSession } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { getSetting } from '@/lib/settings'
import { BUCKET, ensurePublicBucket, newObjectPath, publicUrl, storage } from '@/lib/storage'
import { galleryPhotoSet, GALLERY_SET_FLAG } from '@/lib/gallerySet'

/**
 * Replace the whole website gallery with the photo set shipped in /gallery-set
 * (one folder per category). Old gallery items are deleted from the database and
 * their files from the storage bucket. New photos are uploaded to the bucket.
 */
export async function installGallerySetAction(): Promise<{ success: boolean; message?: string; error?: string }> {
  const session = await requireSuperAdminSession()
  const set = galleryPhotoSet()
  if (set.length === 0) return { success: false, error: 'The new photo set is not on the server.' }

  // 1. Upload all new photos first, so nothing is removed if an upload fails
  const uploaded: { category: string; url: string; order: number; n: number }[] = []
  const s = storage()
  try {
    if (s) await ensurePublicBucket()
    for (const [i, p] of set.entries()) {
      const buffer = fs.readFileSync(p.file)
      let url: string
      if (s) {
        const objectPath = newObjectPath(`gallery/${p.category}`, path.basename(p.file))
        const { error } = await s.from(BUCKET).upload(objectPath, buffer, { contentType: 'image/webp', cacheControl: '31536000', upsert: false })
        if (error) throw new Error(`${path.basename(p.file)}: ${error.message}`)
        url = publicUrl(objectPath)
      } else {
        const row = await (db as any).storedFile.create({
          data: { ownerType: 'media', label: `gallery/${p.category}`, originalName: path.basename(p.file), mimeType: 'image/webp', size: buffer.length, data: buffer, uploadedById: session.id, uploadedByName: session.fullName },
          select: { id: true },
        })
        url = `/media/${row.id}/${path.basename(p.file)}`
      }
      uploaded.push({ category: p.category, url, order: i + 1, n: p.n })
    }
  } catch (err: any) {
    // Remove what was uploaded in this attempt
    const { removeStoredMedia } = await import('@/lib/mediaService')
    for (const u of uploaded) await removeStoredMedia(u.url)
    return { success: false, error: `Upload failed, nothing was changed. ${err?.message || ''}`.trim() }
  }

  // 2. Delete every old gallery item (live and in the Bin); their files are removed from storage
  const old = await db.gallery.count()
  await db.gallery.deleteMany({})
  await (db as any).trashEntry.deleteMany({ where: { entityType: 'gallery' } }).catch(() => {})

  // 3. Add the new photos
  await db.gallery.createMany({
    data: uploaded.map((u) => ({
      album: u.category,
      category: u.category,
      mediaType: 'IMAGE' as const,
      fileUrl: u.url,
      thumbnail: u.url,
      altText: `QIMD ${u.category}`,
      caption: null,
      featured: false,
      displayOrder: u.order,
      createdById: session.id,
    })),
  })

  // Make sure every category exists in the gallery category list
  const cats = await getSetting('galleryCategories')
  const merged = [...cats]
  for (const u of uploaded) if (!merged.includes(u.category)) merged.push(u.category)
  await (db as any).appSetting.upsert({ where: { key: 'galleryCategories' }, create: { key: 'galleryCategories', value: merged }, update: { value: merged } })
  const flag = { installedAt: new Date().toISOString(), by: session.fullName, count: uploaded.length }
  await (db as any).appSetting.upsert({ where: { key: GALLERY_SET_FLAG }, create: { key: GALLERY_SET_FLAG, value: flag }, update: { value: flag } })

  await audit(session, 'GALLERY_REPLACED', 'gallery', null, `Replaced the website gallery: removed ${old} old item(s), added ${uploaded.length} new photos`)
  revalidatePath('/')
  revalidatePath('/gallery')
  revalidatePath('/admin/gallery')
  return { success: true, message: `Gallery replaced: ${old} old item(s) removed, ${uploaded.length} new photos added.` }
}
