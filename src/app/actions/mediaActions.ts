'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'

export async function uploadMediaAction(formData: FormData) {
  const session = await requireAdminSession()

  try {
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'General'
    const altText = (formData.get('altText') as string) || ''

    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided.' }
    }

    // 2 MB Size Validation (SRS NFR-FILE-001 & SC-FILE-001)
    const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'File size exceeds 2 MB upload limit specified in SRS requirements.' }
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
    ]

    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Unsupported file format. Allowed: JPG, JPEG, PNG, WebP, SVG, PDF.' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder.toLowerCase().replace(/[^a-z0-9]/g, '-'))
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const ext = path.extname(file.name) || (file.type === 'application/pdf' ? '.pdf' : '.jpg')
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`
    const filePath = path.join(uploadsDir, uniqueName)

    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/uploads/${folder.toLowerCase().replace(/[^a-z0-9]/g, '-')}/${uniqueName}`

    const mediaRecord = await db.mediaLibrary.create({
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: BigInt(file.size),
        fileUrl: publicUrl,
        thumbnailUrl: file.type.startsWith('image/') ? publicUrl : null,
        folder,
        altText,
        uploadedById: session.id,
      },
    })

    await createAuditLog({
      userId: session.id,
      module: 'MEDIA_LIBRARY',
      action: 'UPLOAD_FILE',
      recordId: mediaRecord.id,
    })

    revalidatePath('/admin/media-library')
    return {
      success: true,
      message: 'File uploaded successfully',
      fileUrl: publicUrl,
      mediaId: mediaRecord.id,
    }
  } catch (err: any) {
    console.error('File upload error:', err)
    return { success: false, error: err.message || 'File upload failed.' }
  }
}

export async function trashMediaAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.mediaLibrary.update({
      where: { id },
      data: { isDeleted: true },
    })
    await createAuditLog({ userId: session.id, module: 'MEDIA_LIBRARY', action: 'TRASH_MEDIA', recordId: id })
    revalidatePath('/admin/media-library')
    return { success: true, message: 'Media moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash media' }
  }
}

export async function restoreMediaAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.mediaLibrary.update({
      where: { id },
      data: { isDeleted: false },
    })
    await createAuditLog({ userId: session.id, module: 'MEDIA_LIBRARY', action: 'RESTORE_MEDIA', recordId: id })
    revalidatePath('/admin/media-library')
    return { success: true, message: 'Media restored from Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore media' }
  }
}

export async function deleteMediaPermanentlyAction(id: string) {
  const session = await requireAdminSession()
  try {
    const media = await db.mediaLibrary.findUnique({ where: { id } })
    if (media?.fileUrl && media.fileUrl.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), 'public', media.fileUrl)
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath)
        } catch (e) {
          console.error('File deletion error:', e)
        }
      }
    }

    await db.mediaLibrary.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'MEDIA_LIBRARY', action: 'PERMANENT_DELETE_MEDIA', recordId: id })
    revalidatePath('/admin/media-library')
    return { success: true, message: 'Media permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete media' }
  }
}

export async function deleteUnusedImageAction(fileUrl: string) {
  await requireAdminSession()
  try {
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const deleted = await safeDeleteUnusedFile(fileUrl)
    return { success: true, deleted }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete image' }
  }
}

export async function addVideoMediaAction(formData: FormData) {
  const session = await requireAdminSession()
  try {
    const videoUrl = formData.get('videoUrl') as string
    const fileName = formData.get('fileName') as string
    const folder = (formData.get('folder') as string) || 'Videos'
    const altText = (formData.get('altText') as string) || ''

    if (!videoUrl || !videoUrl.trim()) {
      return { success: false, error: 'Video URL is required.' }
    }

    const cleanUrl = videoUrl.trim()
    const cleanName = fileName?.trim() || cleanUrl.split('/').pop()?.split('?')[0] || 'Website Video'

    const mediaRecord = await db.mediaLibrary.create({
      data: {
        fileName: cleanName,
        fileType: cleanUrl.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'video/embed',
        fileSize: BigInt(0),
        fileUrl: cleanUrl,
        thumbnailUrl: null,
        folder,
        altText,
        uploadedById: session.id,
      },
    })

    await createAuditLog({
      userId: session.id,
      module: 'MEDIA_LIBRARY',
      action: 'ADD_VIDEO_MEDIA',
      recordId: mediaRecord.id,
    })

    revalidatePath('/admin/media-library')
    return { success: true, message: 'Video asset added successfully!', mediaId: mediaRecord.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add video asset.' }
  }
}

function doesFileExistOnDisk(fileUrl: string): boolean {
  if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.trim()) return false
  const cleanUrl = fileUrl.trim()
  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('data:')
  ) {
    return true
  }
  if (cleanUrl.startsWith('/')) {
    const localPath = path.join(process.cwd(), 'public', cleanUrl.replace(/^\//, ''))
    return fs.existsSync(localPath)
  }
  return false
}

export async function syncAllWebsiteMediaAction() {
  const session = await requireAdminSession()
  try {
    // 1. Deduplicate existing media library records by fileUrl and fileName
    const allRecords = await db.mediaLibrary.findMany({ orderBy: { createdAt: 'asc' } })
    const seenUrls = new Set<string>()
    const seenFileNames = new Set<string>()
    const duplicateIdsToDelete: string[] = []
    const missingFileIdsToDelete: string[] = []

    for (const rec of allRecords) {
      const cleanUrl = rec.fileUrl.trim()
      const cleanName = rec.fileName.trim().toLowerCase()
      if (seenUrls.has(cleanUrl) || seenFileNames.has(cleanName)) {
        duplicateIdsToDelete.push(rec.id)
      } else if (!doesFileExistOnDisk(cleanUrl)) {
        missingFileIdsToDelete.push(rec.id)
      } else {
        seenUrls.add(cleanUrl)
        seenFileNames.add(cleanName)
      }
    }

    const idsToRemove = Array.from(new Set([...duplicateIdsToDelete, ...missingFileIdsToDelete]))
    if (idsToRemove.length > 0) {
      await db.mediaLibrary.deleteMany({
        where: { id: { in: idsToRemove } },
      })
    }

    // 2. Ensure all logo & favicon files have folder set to 'Logos'
    await db.mediaLibrary.updateMany({
      where: {
        OR: [
          { fileName: { contains: 'logo', mode: 'insensitive' } },
          { fileUrl: { contains: 'logo', mode: 'insensitive' } },
          { fileName: { contains: 'favicon', mode: 'insensitive' } },
          { fileUrl: { contains: 'favicon', mode: 'insensitive' } },
        ],
      },
      data: { folder: 'Logos' },
    })

    const existingMedia = await db.mediaLibrary.findMany({ select: { fileUrl: true } })
    const existingUrls = new Set(existingMedia.map((m) => m.fileUrl))

    let addedCount = 0

    const helperAdd = async (
      url: string | null | undefined,
      folder: string,
      altText: string,
      fileType = 'image/png'
    ) => {
      if (!url || typeof url !== 'string' || !url.trim()) return
      const cleanUrl = url.trim()
      if (existingUrls.has(cleanUrl)) return
      if (!doesFileExistOnDisk(cleanUrl)) return // Skip broken / missing ghost file paths!

      let inferredType = fileType
      const lower = cleanUrl.toLowerCase()
      if (lower.endsWith('.svg')) inferredType = 'image/svg+xml'
      else if (lower.endsWith('.webp')) inferredType = 'image/webp'
      else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) inferredType = 'image/jpeg'
      else if (lower.endsWith('.png')) inferredType = 'image/png'
      else if (lower.endsWith('.pdf')) inferredType = 'application/pdf'
      else if (lower.endsWith('.mp4')) inferredType = 'video/mp4'
      else if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com'))
        inferredType = 'video/embed'

      const fileName = cleanUrl.split('/').pop()?.split('?')[0] || `${folder}_asset`

      await db.mediaLibrary.create({
        data: {
          fileName: fileName,
          fileType: inferredType,
          fileSize: BigInt(1024),
          fileUrl: cleanUrl,
          thumbnailUrl:
            inferredType.startsWith('image/') || inferredType === 'image/svg+xml' ? cleanUrl : null,
          folder: folder,
          altText: altText,
          uploadedById: session.id,
        },
      })
      existingUrls.add(cleanUrl)
      addedCount++
    }

    // 1. Website Settings & Branding Logos
    await helperAdd('/images/logo/qimd-logo.png', 'Logos', 'Website Header Logo')
    await helperAdd('/images/logo/qimd-logo-white.png', 'Logos', 'Website Footer White Logo')
    const settings = await db.websiteSettings.findFirst()
    if (settings) {
      if (settings.logo) await helperAdd(settings.logo, 'Logos', 'Website Header Logo')
      if (settings.favicon) await helperAdd(settings.favicon, 'Logos', 'Website Favicon')
    }

    // 2. Page Sections (Banners, Hero graphics)
    const sections = await db.pageSection.findMany()
    for (const sec of sections) {
      if (sec.image) await helperAdd(sec.image, 'Banners', `${sec.sectionTitle || sec.sectionKey} Banner`)
    }

    // 3. Courses (Banners, Brochures, Demo Videos, Gallery)
    const courses = await db.course.findMany()
    for (const c of courses) {
      if (c.bannerImage) await helperAdd(c.bannerImage, 'Courses', `${c.courseName} Banner`)
      if (c.brochure) await helperAdd(c.brochure, 'Documents', `${c.courseName} Syllabus Brochure`, 'application/pdf')
      if (c.demoVideo) await helperAdd(c.demoVideo, 'Videos', `${c.courseName} Demo Video`, 'video/embed')
      if (Array.isArray(c.gallery)) {
        for (const gUrl of c.gallery as string[]) {
          await helperAdd(gUrl, 'Courses', `${c.courseName} Gallery Asset`)
        }
      }
    }

    // 4. Gallery (Photos & Videos)
    const galleryItems = await db.gallery.findMany()
    for (const g of galleryItems) {
      const folderName = g.mediaType === 'VIDEO' ? 'Videos' : 'Gallery'
      await helperAdd(
        g.fileUrl,
        folderName,
        g.altText || g.caption || 'Gallery Media',
        g.mediaType === 'VIDEO' ? 'video/mp4' : 'image/png'
      )
      if (g.thumbnail) await helperAdd(g.thumbnail, 'Gallery', 'Gallery Thumbnail')
    }

    // 5. Blogs (Featured Images, Images array)
    const blogs = await db.blog.findMany()
    for (const b of blogs) {
      if (b.featuredImage) await helperAdd(b.featuredImage, 'Blogs', `${b.title} Featured Image`)
      if (Array.isArray(b.images)) {
        for (const imgUrl of b.images as string[]) {
          await helperAdd(imgUrl, 'Blogs', `${b.title} Blog Image`)
        }
      }
    }

    // 6. Placements & Testimonials
    const placements = await db.placement.findMany()
    for (const p of placements) {
      if (p.studentPhoto) await helperAdd(p.studentPhoto, 'People', `${p.studentName} Student Photo`)
      if (p.companyLogo) await helperAdd(p.companyLogo, 'Partners', `${p.companyName} Company Logo`)
      if (p.videoUrl) await helperAdd(p.videoUrl, 'Videos', `${p.studentName} Success Video`, 'video/embed')
      if (p.videoThumbnail) await helperAdd(p.videoThumbnail, 'Videos', `${p.studentName} Video Thumbnail`)
    }

    const testimonials = await db.testimonial.findMany()
    for (const t of testimonials) {
      if (t.photo) await helperAdd(t.photo, 'People', `${t.studentName} Testimonial Photo`)
      if (t.videoUrl) await helperAdd(t.videoUrl, 'Videos', `${t.studentName} Testimonial Video`, 'video/embed')
      if (t.videoThumbnail) await helperAdd(t.videoThumbnail, 'Videos', `${t.studentName} Video Thumbnail`)
    }

    // 7. Partners & EMI Partners
    const partners = await db.partner.findMany()
    for (const p of partners) {
      if (p.logo) await helperAdd(p.logo, 'Partners', `${p.name} Partner Logo`)
    }

    const emiPartners = await db.emiPartner.findMany()
    for (const e of emiPartners) {
      if (e.logo) await helperAdd(e.logo, 'Partners', `${e.name} EMI Partner Logo`)
    }

    // 8. Trainers
    const trainers = await db.trainer.findMany()
    for (const tr of trainers) {
      if (tr.photo) await helperAdd(tr.photo, 'People', `${tr.fullName} Trainer Photo`)
    }

    await createAuditLog({
      userId: session.id,
      module: 'MEDIA_LIBRARY',
      action: 'SYNC_ALL_WEBSITE_MEDIA',
    })

    revalidatePath('/admin/media-library')
    return {
      success: true,
      message:
        addedCount > 0
          ? `Successfully synced ${addedCount} website media items into Media Library!`
          : 'All website media assets are already indexed in the Media Library.',
      addedCount,
    }
  } catch (err: any) {
    console.error('Sync website media error:', err)
    return { success: false, error: err.message || 'Failed to sync website media.' }
  }
}

export async function purgeUnusedMediaAction() {
  const session = await requireAdminSession()
  try {
    const { isFileReferencedInDb, safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const allMedia = await db.mediaLibrary.findMany()

    let removedCount = 0
    for (const m of allMedia) {
      if (!doesFileExistOnDisk(m.fileUrl)) {
        await db.mediaLibrary.deleteMany({ where: { id: m.id } })
        removedCount++
        continue
      }
      const referenced = await isFileReferencedInDb(m.fileUrl)
      if (!referenced) {
        await safeDeleteUnusedFile(m.fileUrl)
        removedCount++
      }
    }

    await createAuditLog({
      userId: session.id,
      module: 'MEDIA_LIBRARY',
      action: 'PURGE_UNUSED_MEDIA',
    })

    revalidatePath('/admin/media-library')
    return {
      success: true,
      message:
        removedCount > 0
          ? `Successfully removed ${removedCount} unused media file(s).`
          : 'No unused media files found. All media assets are currently in use on the website.',
      removedCount,
    }
  } catch (err: any) {
    console.error('Purge unused media error:', err)
    return { success: false, error: err.message || 'Failed to purge unused media.' }
  }
}


