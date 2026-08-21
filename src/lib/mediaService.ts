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

  // 2. Check Courses (bannerImage, gallery)
  const courses = await db.course.findMany({
    where: excludeRecord?.table === 'course' ? { id: { not: excludeRecord.id } } : {},
    select: { id: true, bannerImage: true, gallery: true },
  })
  for (const c of courses) {
    if (c.bannerImage === cleanUrl) return true
    if (Array.isArray(c.gallery) && (c.gallery as string[]).includes(cleanUrl)) return true
  }

  // 3. Check Trainers (photo)
  const trainers = await db.trainer.findMany({
    where: excludeRecord?.table === 'trainer' ? { id: { not: excludeRecord.id } } : {},
    select: { id: true, photo: true },
  })
  for (const t of trainers) {
    if (t.photo === cleanUrl) return true
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

  // 7. Check Partners (logo)
  const partners = await db.partner.findMany({
    where: excludeRecord?.table === 'partner' ? { id: { not: excludeRecord.id } } : {},
    select: { id: true, logo: true },
  })
  for (const p of partners) {
    if (p.logo === cleanUrl) return true
  }

  // 8. Check EmiPartners (logo)
  const emiPartners = await db.emiPartner.findMany({
    where: excludeRecord?.table === 'emiPartner' ? { id: { not: excludeRecord.id } } : {},
    select: { id: true, logo: true },
  })
  for (const e of emiPartners) {
    if (e.logo === cleanUrl) return true
  }

  // 9. Check WebsiteSettings (logo, favicon)
  const settings = await db.websiteSettings.findMany({
    select: { logo: true, favicon: true },
  })
  for (const s of settings) {
    if (s.logo === cleanUrl || s.favicon === cleanUrl) return true
  }

  // 10. Check PageSections (image)
  const sections = await db.pageSection.findMany({
    select: { image: true },
  })
  for (const sec of sections) {
    if (sec.image === cleanUrl) return true
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
  }

  return true
}
