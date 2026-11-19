import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

/**
 * Checks if a given file URL is referenced anywhere in the database across all models.
 * Option to exclude a specific entity being edited or deleted.
 */
export async function isFileReferencedInDb(
  fileUrl: string,
  excludeRecord?: { table: string; id: string }
): Promise<boolean> {
  if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.trim()) {
    return false
  }
  const cleanUrl = fileUrl.trim()

  // 1. Check Blogs (featuredImage, images JSON, content)
  const blogs = await db.blog.findMany({
    where: excludeRecord?.table === 'blog' ? { id: { not: excludeRecord.id } } : {},
    select: { id: true, featuredImage: true, images: true, content: true },
  })
  for (const b of blogs) {
    if (b.featuredImage === cleanUrl) return true
    if (Array.isArray(b.images) && (b.images as string[]).includes(cleanUrl)) return true
    if (b.content && b.content.includes(cleanUrl)) return true
  }

  // 4. Check Placements (studentPhoto, companyLogo, videoThumbnail)
  const placements = await db.placement.findMany({
    where: excludeRecord?.table === 'placement' ? { id: { not: excludeRecord.id } } : {},
    select: { id: true, studentPhoto: true, companyLogo: true, videoThumbnail: true },
  })
  for (const p of placements) {
    if (p.studentPhoto === cleanUrl || p.companyLogo === cleanUrl || p.videoThumbnail === cleanUrl) return true
  }

  // 5. Check Testimonials (photo, videoThumbnail)
  const testimonials = await db.testimonial.findMany({
    where: excludeRecord?.table === 'testimonial' ? { id: { not: excludeRecord.id } } : {},
    select: { id: true, photo: true, videoThumbnail: true },
  })
  for (const t of testimonials) {
    if (t.photo === cleanUrl || t.videoThumbnail === cleanUrl) return true
  }

  // 6. Check Gallery (fileUrl, thumbnail)
  const galleryItems = await db.gallery.findMany({
    where: excludeRecord?.table === 'gallery' ? { id: { not: excludeRecord.id } } : {},
    select: { id: true, fileUrl: true, thumbnail: true },
  })
  for (const g of galleryItems) {
    if (g.fileUrl === cleanUrl || g.thumbnail === cleanUrl) return true
  }

  // 11. Check Users (profileImage)
  const users = await db.user.findMany({
    select: { profileImage: true },
  })
  for (const u of users) {
    if (u.profileImage === cleanUrl) return true
  }

  // 12. Check Banners (imageUrl)
  const banners = await db.banner.findMany({
    where: excludeRecord?.table === 'banner' ? { id: { not: excludeRecord.id } } : {},
    select: { id: true, imageUrl: true },
  })
  for (const b of banners) {
    if (b.imageUrl === cleanUrl) return true
  }

  return false
}

/**
 * Safely deletes an unused file from MediaLibrary DB and physical storage if no longer referenced.
 */
export async function safeDeleteUnusedFile(
  fileUrl: string,
  excludeRecord?: { table: string; id: string }
): Promise<boolean> {
  if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.trim()) {
    return false
  }

  const cleanUrl = fileUrl.trim()
  const isReferenced = await isFileReferencedInDb(cleanUrl, excludeRecord)
  if (isReferenced) {
    // Shared file, do NOT delete physical file or media library record
    return false
  }



  if (cleanUrl.startsWith('/uploads/')) {
    const localPath = path.join(process.cwd(), 'public', cleanUrl.replace(/^\//, ''))
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath)
        return true
      } catch (e) {
        console.error('Error unlinking physical file:', e)
      }
    }
  } else if (cleanUrl.includes('/qimd-media/')) {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase')
      const pathPart = cleanUrl.split('/qimd-media/')[1]
      if (pathPart && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        await supabaseAdmin.storage.from('qimd-media').remove([pathPart])
      }
    } catch (e) {
      console.error('Error removing file from Supabase storage:', e)
    }
  }

  return true
}

