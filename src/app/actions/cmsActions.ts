'use server'

import { db } from '@/lib/db'
import {
  courseSchema,
  trainerSchema,
  blogSchema,
  placementSchema,
  testimonialSchema,
  faqSchema,
  categorySchema,
  websiteSettingsSchema,
} from '@/lib/validations'
import { requireAdminSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

// --- COURSE CATEGORIES CMS ---
export async function saveCategoryAction(data: any, id?: string) {
  const session = await requireAdminSession()
  try {
    const validated = categorySchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    if (id) {
      await db.courseCategory.update({
        where: { id },
        data: validated.data,
      })
      await createAuditLog({ userId: session.id, module: 'CMS_CATEGORIES', action: 'UPDATE_CATEGORY', recordId: id })
    } else {
      const created = await db.courseCategory.create({
        data: validated.data,
      })
      await createAuditLog({ userId: session.id, module: 'CMS_CATEGORIES', action: 'CREATE_CATEGORY', recordId: created.id })
    }

    revalidatePath('/courses')
    revalidatePath('/admin/course-categories')
    revalidatePath('/admin/courses')
    return { success: true, message: 'Category saved successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save category' }
  }
}

export async function trashCategoryAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.courseCategory.update({ where: { id }, data: { isDeleted: true } })
    await createAuditLog({ userId: session.id, module: 'CMS_CATEGORIES', action: 'TRASH_CATEGORY', recordId: id })
    revalidatePath('/admin/course-categories')
    return { success: true, message: 'Category moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash category' }
  }
}

export async function restoreCategoryAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.courseCategory.update({ where: { id }, data: { isDeleted: false } })
    await createAuditLog({ userId: session.id, module: 'CMS_CATEGORIES', action: 'RESTORE_CATEGORY', recordId: id })
    revalidatePath('/admin/course-categories')
    return { success: true, message: 'Category restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore category' }
  }
}

export async function deleteCategoryPermanentlyAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.courseCategory.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'CMS_CATEGORIES', action: 'PERMANENT_DELETE_CATEGORY', recordId: id })
    revalidatePath('/admin/course-categories')
    return { success: true, message: 'Category permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete category' }
  }
}

// --- COURSES CMS ---
export async function saveCourseAction(data: any, id?: string) {
  const session = await requireAdminSession()
  try {
    const validated = courseSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')

    let catId = validated.data.categoryId
    if (!catId) {
      const firstCat = await db.courseCategory.findFirst({ where: { isDeleted: false } })
      if (firstCat) catId = firstCat.id
    }

    const coursePayload = {
      ...validated.data,
      categoryId: catId || '',
      trainerId: validated.data.trainerId || null,
    }

    if (id) {
      const oldCourse = await db.course.findUnique({ where: { id } })
      await db.course.update({
        where: { id },
        data: coursePayload,
      })
      await createAuditLog({ userId: session.id, module: 'CMS_COURSES', action: 'UPDATE_COURSE', recordId: id })

      // If banner changed, safely delete old banner if unused
      if (oldCourse?.bannerImage && oldCourse.bannerImage !== validated.data.bannerImage) {
        await safeDeleteUnusedFile(oldCourse.bannerImage, { table: 'course', id })
      }
    } else {
      const created = await db.course.create({
        data: coursePayload,
      })
      await createAuditLog({ userId: session.id, module: 'CMS_COURSES', action: 'CREATE_COURSE', recordId: created.id })
    }

    // Index new course banner in MediaLibrary under 'Courses'
    if (coursePayload.bannerImage) {
      const cleanUrl = coursePayload.bannerImage.trim()
      const existingMedia = await db.mediaLibrary.findFirst({ where: { fileUrl: cleanUrl } })
      if (!existingMedia) {
        const fileName = cleanUrl.split('/').pop() || `${coursePayload.courseName}-banner.png`
        await db.mediaLibrary.create({
          data: {
            fileName,
            fileType: 'image/png',
            fileSize: BigInt(100000),
            fileUrl: cleanUrl,
            thumbnailUrl: cleanUrl,
            folder: 'Courses',
            altText: `${coursePayload.courseName} Banner`,
            uploadedById: session.id,
          },
        })
      } else {
        await db.mediaLibrary.update({
          where: { id: existingMedia.id },
          data: {
            folder: 'Courses',
            altText: `${coursePayload.courseName} Banner`,
          },
        })
      }
    }

    revalidatePath('/')
    revalidatePath('/courses')
    revalidatePath('/admin/courses')
    if (validated.data.slug) {
      revalidatePath(`/courses/${validated.data.slug}`)
    }
    revalidatePath('/courses/[slug]', 'page')
    return { success: true, message: 'Course saved successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save course' }
  }
}

export async function trashCourseAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.course.update({ where: { id }, data: { isDeleted: true } })
    await createAuditLog({ userId: session.id, module: 'CMS_COURSES', action: 'TRASH_COURSE', recordId: id })
    revalidatePath('/courses')
    revalidatePath('/admin/courses')
    return { success: true, message: 'Course moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash course' }
  }
}

export async function restoreCourseAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.course.update({ where: { id }, data: { isDeleted: false } })
    await createAuditLog({ userId: session.id, module: 'CMS_COURSES', action: 'RESTORE_COURSE', recordId: id })
    revalidatePath('/courses')
    revalidatePath('/admin/courses')
    return { success: true, message: 'Course restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore course' }
  }
}

export async function deleteCourseAction(id: string) {
  const session = await requireAdminSession()
  try {
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const course = await db.course.findUnique({ where: { id } })

    await db.course.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'CMS_COURSES', action: 'PERMANENT_DELETE_COURSE', recordId: id })

    if (course?.bannerImage) {
      await safeDeleteUnusedFile(course.bannerImage, { table: 'course', id })
    }

    revalidatePath('/courses')
    revalidatePath('/admin/courses')
    return { success: true, message: 'Course permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete course' }
  }
}

// --- TRAINERS & TEAMS CMS ---
export async function saveTrainerAction(data: any, id?: string) {
  const session = await requireAdminSession()
  try {
    const validated = trainerSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')

    const { category, ...cleanTrainerData } = validated.data as any

    if (id) {
      const oldTrainer = await db.trainer.findUnique({ where: { id } })
      await db.trainer.update({ where: { id }, data: cleanTrainerData })
      
      // Sync to teams table
      const teamMemberExists = await db.teamMember.findUnique({ where: { id } })
      if (teamMemberExists) {
        await db.teamMember.update({ where: { id }, data: cleanTrainerData })
      } else {
        await db.teamMember.create({ data: { id, ...cleanTrainerData } })
      }

      await createAuditLog({ userId: session.id, module: 'CMS_TRAINERS', action: 'UPDATE_TRAINER', recordId: id })

      if (oldTrainer?.photo && oldTrainer.photo !== validated.data.photo) {
        await safeDeleteUnusedFile(oldTrainer.photo, { table: 'trainer', id })
      }
    } else {
      const created = await db.trainer.create({ data: cleanTrainerData })
      await db.teamMember.create({ data: { id: created.id, ...cleanTrainerData } })
      await createAuditLog({ userId: session.id, module: 'CMS_TRAINERS', action: 'CREATE_TRAINER', recordId: created.id })
    }

    revalidatePath('/trainers')
    revalidatePath('/about/our-team')
    revalidatePath('/admin/trainers')
    revalidatePath('/admin/team')
    return { success: true, message: 'Team member saved successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save trainer' }
  }
}

export async function trashTrainerAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.trainer.update({ where: { id }, data: { isDeleted: true } })
    await db.teamMember.update({ where: { id }, data: { isDeleted: true } }).catch(() => null)
    await createAuditLog({ userId: session.id, module: 'CMS_TRAINERS', action: 'TRASH_TRAINER', recordId: id })
    revalidatePath('/trainers')
    revalidatePath('/about/our-team')
    revalidatePath('/admin/trainers')
    revalidatePath('/admin/team')
    return { success: true, message: 'Team member moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash trainer' }
  }
}

export async function restoreTrainerAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.trainer.update({ where: { id }, data: { isDeleted: false } })
    await db.teamMember.update({ where: { id }, data: { isDeleted: false } }).catch(() => null)
    await createAuditLog({ userId: session.id, module: 'CMS_TRAINERS', action: 'RESTORE_TRAINER', recordId: id })
    revalidatePath('/trainers')
    revalidatePath('/about/our-team')
    revalidatePath('/admin/trainers')
    revalidatePath('/admin/team')
    return { success: true, message: 'Team member restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore trainer' }
  }
}

export async function deleteTrainerAction(id: string) {
  const session = await requireAdminSession()
  try {
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const trainer = await db.trainer.findUnique({ where: { id } })

    await db.trainer.delete({ where: { id } })
    await db.teamMember.delete({ where: { id } }).catch(() => null)
    await createAuditLog({ userId: session.id, module: 'CMS_TRAINERS', action: 'PERMANENT_DELETE_TRAINER', recordId: id })

    if (trainer?.photo) {
      await safeDeleteUnusedFile(trainer.photo, { table: 'trainer', id })
    }

    revalidatePath('/trainers')
    revalidatePath('/about/our-team')
    revalidatePath('/admin/trainers')
    revalidatePath('/admin/team')
    return { success: true, message: 'Team member permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete trainer' }
  }
}

// --- BLOGS CMS ---
export async function saveBlogAction(data: any, id?: string) {
  const session = await requireAdminSession()
  try {
    const validated = blogSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')

    const blogData = {
      ...validated.data,
      images: validated.data.images ? (validated.data.images as any) : [],
    }

    if (id) {
      const oldBlog = await db.blog.findUnique({ where: { id } })
      await db.blog.update({
        where: { id },
        data: blogData,
      })
      await createAuditLog({ userId: session.id, module: 'CMS_BLOGS', action: 'UPDATE_BLOG', recordId: id })

      // Clean up old featuredImage if replaced
      if (oldBlog?.featuredImage && oldBlog.featuredImage !== validated.data.featuredImage) {
        await safeDeleteUnusedFile(oldBlog.featuredImage, { table: 'blog', id })
      }

      // Clean up removed content images
      if (oldBlog && Array.isArray(oldBlog.images)) {
        const oldImages = oldBlog.images as string[]
        const newImages = (validated.data.images as string[]) || []
        for (const imgUrl of oldImages) {
          if (!newImages.includes(imgUrl) && imgUrl !== validated.data.featuredImage) {
            await safeDeleteUnusedFile(imgUrl, { table: 'blog', id })
          }
        }
      }
    } else {
      const created = await db.blog.create({
        data: {
          ...blogData,
          authorId: session.id,
        },
      })
      await createAuditLog({ userId: session.id, module: 'CMS_BLOGS', action: 'CREATE_BLOG', recordId: created.id })
    }

    revalidatePath('/blog')
    revalidatePath('/admin/blogs')
    return { success: true, message: 'Blog post saved successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save blog' }
  }
}

export async function trashBlogAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.blog.update({ where: { id }, data: { isDeleted: true } })
    await createAuditLog({ userId: session.id, module: 'CMS_BLOGS', action: 'TRASH_BLOG', recordId: id })
    revalidatePath('/blog')
    revalidatePath('/admin/blogs')
    return { success: true, message: 'Blog moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash blog' }
  }
}

export async function restoreBlogAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.blog.update({ where: { id }, data: { isDeleted: false } })
    await createAuditLog({ userId: session.id, module: 'CMS_BLOGS', action: 'RESTORE_BLOG', recordId: id })
    revalidatePath('/blog')
    revalidatePath('/admin/blogs')
    return { success: true, message: 'Blog restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore blog' }
  }
}

export async function deleteBlogAction(id: string) {
  const session = await requireAdminSession()
  try {
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const blog = await db.blog.findUnique({ where: { id } })

    await db.blog.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'CMS_BLOGS', action: 'PERMANENT_DELETE_BLOG', recordId: id })

    if (blog?.featuredImage) {
      await safeDeleteUnusedFile(blog.featuredImage, { table: 'blog', id })
    }
    if (blog && Array.isArray(blog.images)) {
      for (const imgUrl of blog.images as string[]) {
        await safeDeleteUnusedFile(imgUrl, { table: 'blog', id })
      }
    }

    revalidatePath('/blog')
    revalidatePath('/admin/blogs')
    return { success: true, message: 'Blog permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete blog' }
  }
}

// --- PLACEMENTS CMS ---
export async function savePlacementAction(data: any, id?: string) {
  const session = await requireAdminSession()
  try {
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')

    const rawVideoUrl = data.videoUrl || data.youtubeLink
    let isVideo = false
    let videoUrl: string | null = null

    if (rawVideoUrl && typeof rawVideoUrl === 'string' && rawVideoUrl.trim() !== '') {
      const cleanUrl = rawVideoUrl.trim()
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = cleanUrl.match(regExp)
      if (match && match[2] && match[2].length === 11) {
        videoUrl = `https://www.youtube.com/embed/${match[2]}`
        isVideo = true
      } else {
        videoUrl = cleanUrl
        isVideo = true
      }
    } else {
      isVideo = false
      videoUrl = null
    }

    const payload = {
      studentName: data.studentName,
      studentPhoto: data.studentPhoto || null,
      companyName: data.companyName,
      companyLogo: data.companyLogo || null,
      package: data.package || null,
      designation: data.designation || null,
      courseId: data.courseId || null,
      courseName: data.courseName || null,
      location: data.location || null,
      joiningYear: data.joiningYear || null,
      isVideo,
      videoUrl,
      successStory: data.successStory || null,
      featured: data.featured === true || data.featured === 'true',
      isActive: data.isActive === true || data.isActive === 'true',
    }

    const validated = placementSchema.safeParse(payload)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    if (id) {
      const oldPlacement = await db.placement.findUnique({ where: { id } })
      await db.placement.update({ where: { id }, data: validated.data })
      await createAuditLog({ userId: session.id, module: 'CMS_PLACEMENTS', action: 'UPDATE_PLACEMENT', recordId: id })

      // Clean up old student photo if replaced or deleted
      if (oldPlacement?.studentPhoto && oldPlacement.studentPhoto !== validated.data.studentPhoto) {
        await safeDeleteUnusedFile(oldPlacement.studentPhoto, { table: 'placement', id })
      }
      if (oldPlacement?.companyLogo && oldPlacement.companyLogo !== validated.data.companyLogo) {
        await safeDeleteUnusedFile(oldPlacement.companyLogo, { table: 'placement', id })
      }
    } else {
      const created = await db.placement.create({ data: validated.data })
      await createAuditLog({ userId: session.id, module: 'CMS_PLACEMENTS', action: 'CREATE_PLACEMENT', recordId: created.id })
    }

    revalidatePath('/placements')
    revalidatePath('/admin/placements')
    revalidatePath('/')
    return { success: true, message: 'Placement record saved' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save placement' }
  }
}

export async function trashPlacementAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.placement.update({ where: { id }, data: { isDeleted: true } })
    await createAuditLog({ userId: session.id, module: 'CMS_PLACEMENTS', action: 'TRASH_PLACEMENT', recordId: id })
    revalidatePath('/placements')
    revalidatePath('/admin/placements')
    revalidatePath('/')
    return { success: true, message: 'Placement moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash placement' }
  }
}

export async function restorePlacementAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.placement.update({ where: { id }, data: { isDeleted: false } })
    await createAuditLog({ userId: session.id, module: 'CMS_PLACEMENTS', action: 'RESTORE_PLACEMENT', recordId: id })
    revalidatePath('/placements')
    revalidatePath('/admin/placements')
    revalidatePath('/')
    return { success: true, message: 'Placement restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore placement' }
  }
}

export async function deletePlacementAction(id: string) {
  const session = await requireAdminSession()
  try {
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const placement = await db.placement.findUnique({ where: { id } })

    await db.placement.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'CMS_PLACEMENTS', action: 'PERMANENT_DELETE_PLACEMENT', recordId: id })

    if (placement?.studentPhoto) {
      await safeDeleteUnusedFile(placement.studentPhoto, { table: 'placement', id })
    }
    if (placement?.companyLogo) {
      await safeDeleteUnusedFile(placement.companyLogo, { table: 'placement', id })
    }

    revalidatePath('/placements')
    revalidatePath('/admin/placements')
    revalidatePath('/')
    return { success: true, message: 'Placement record permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete placement' }
  }
}

export async function saveGalleryItemAction(data: {
  album?: string
  category?: string
  mediaType?: 'IMAGE' | 'VIDEO'
  fileUrl: string
  thumbnail?: string
  altText?: string
  caption?: string
  featured?: boolean
}, id?: string) {
  const session = await requireAdminSession()
  try {
    if (id) {
      const updated = await db.gallery.update({
        where: { id },
        data: {
          album: data.album || 'General',
          category: data.category || 'Classroom',
          mediaType: data.mediaType || 'IMAGE',
          fileUrl: data.fileUrl,
          thumbnail: data.thumbnail || data.fileUrl,
          altText: data.altText || 'QIMD Gallery Media',
          caption: data.caption || null,
          featured: data.featured || false,
        },
      })
      await createAuditLog({ userId: session.id, module: 'CMS_GALLERY', action: 'UPDATE_GALLERY_ITEM', recordId: id })
    } else {
      const created = await db.gallery.create({
        data: {
          album: data.album || 'General',
          category: data.category || 'Classroom',
          mediaType: data.mediaType || 'IMAGE',
          fileUrl: data.fileUrl,
          thumbnail: data.thumbnail || data.fileUrl,
          altText: data.altText || 'QIMD Gallery Media',
          caption: data.caption || null,
          featured: data.featured || false,
          createdById: session.id,
        },
      })
      await createAuditLog({ userId: session.id, module: 'CMS_GALLERY', action: 'ADD_GALLERY_ITEM', recordId: created.id })
    }
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')
    return { success: true, message: 'Gallery item saved successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save gallery item' }
  }
}

export async function trashGalleryItemAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.gallery.update({ where: { id }, data: { isDeleted: true } })
    await createAuditLog({ userId: session.id, module: 'CMS_GALLERY', action: 'TRASH_GALLERY_ITEM', recordId: id })
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')
    return { success: true, message: 'Gallery item moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash gallery item' }
  }
}

export async function restoreGalleryItemAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.gallery.update({ where: { id }, data: { isDeleted: false } })
    await createAuditLog({ userId: session.id, module: 'CMS_GALLERY', action: 'RESTORE_GALLERY_ITEM', recordId: id })
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')
    return { success: true, message: 'Gallery item restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore gallery item' }
  }
}

export async function deleteGalleryItemAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.gallery.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'CMS_GALLERY', action: 'PERMANENT_DELETE_GALLERY_ITEM', recordId: id })
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')
    return { success: true, message: 'Gallery item permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete gallery item' }
  }
}

// --- TESTIMONIALS CMS ---
export async function saveTestimonialAction(data: any, id?: string) {
  const session = await requireAdminSession()
  try {
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')

    // Dynamic Classification: IF youtubeLink exists -> VIDEO TESTIMONIAL, IF missing -> TEXT TESTIMONIAL
    const rawVideoUrl = data.videoUrl || data.youtubeLink
    let isVideo = false
    let videoUrl: string | null = null

    if (rawVideoUrl && typeof rawVideoUrl === 'string' && rawVideoUrl.trim() !== '') {
      const cleanUrl = rawVideoUrl.trim()
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = cleanUrl.match(regExp)
      if (match && match[2] && match[2].length === 11) {
        videoUrl = `https://www.youtube.com/embed/${match[2]}`
        isVideo = true
      } else {
        videoUrl = cleanUrl
        isVideo = true
      }
    } else {
      isVideo = false
      videoUrl = null
    }

    const payload = {
      studentName: data.studentName,
      heading: data.heading || null,
      photo: data.photo || null,
      course: data.course || null,
      company: data.company || null,
      rating: Number(data.rating) || 5,
      review: data.review,
      videoUrl,
      isVideo,
      featured: data.featured === true || data.featured === 'true',
      isActive: data.isActive === true || data.isActive === 'true',
    }

    const validated = testimonialSchema.safeParse(payload)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    if (id) {
      const oldTestimonial = await db.testimonial.findUnique({ where: { id } })
      await db.testimonial.update({ where: { id }, data: validated.data })
      await createAuditLog({ userId: session.id, module: 'CMS_TESTIMONIALS', action: 'UPDATE_TESTIMONIAL', recordId: id })

      if (oldTestimonial?.photo && oldTestimonial.photo !== validated.data.photo) {
        await safeDeleteUnusedFile(oldTestimonial.photo, { table: 'testimonial', id })
      }
    } else {
      const created = await db.testimonial.create({
        data: {
          ...validated.data,
          createdById: session.id,
        },
      })
      await createAuditLog({ userId: session.id, module: 'CMS_TESTIMONIALS', action: 'CREATE_TESTIMONIAL', recordId: created.id })
    }

    revalidatePath('/')
    revalidatePath('/placements')
    revalidatePath('/admin/testimonials')
    return { success: true, message: 'Testimonial saved successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save testimonial' }
  }
}

export async function trashTestimonialAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.testimonial.update({ where: { id }, data: { isDeleted: true } })
    await createAuditLog({ userId: session.id, module: 'CMS_TESTIMONIALS', action: 'TRASH_TESTIMONIAL', recordId: id })
    revalidatePath('/')
    revalidatePath('/admin/testimonials')
    return { success: true, message: 'Testimonial moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash testimonial' }
  }
}

export async function restoreTestimonialAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.testimonial.update({ where: { id }, data: { isDeleted: false } })
    await createAuditLog({ userId: session.id, module: 'CMS_TESTIMONIALS', action: 'RESTORE_TESTIMONIAL', recordId: id })
    revalidatePath('/')
    revalidatePath('/admin/testimonials')
    return { success: true, message: 'Testimonial restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore testimonial' }
  }
}

export async function deleteTestimonialAction(id: string) {
  const session = await requireAdminSession()
  try {
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const testimonial = await db.testimonial.findUnique({ where: { id } })

    await db.testimonial.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'CMS_TESTIMONIALS', action: 'PERMANENT_DELETE_TESTIMONIAL', recordId: id })

    if (testimonial?.photo) {
      await safeDeleteUnusedFile(testimonial.photo, { table: 'testimonial', id })
    }

    revalidatePath('/')
    revalidatePath('/placements')
    revalidatePath('/admin/testimonials')
    return { success: true, message: 'Testimonial permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete testimonial' }
  }
}

// --- FAQS CMS ---
export async function saveFaqAction(data: any, id?: string) {
  const session = await requireAdminSession()
  try {
    const validated = faqSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    if (id) {
      await db.faq.update({ where: { id }, data: validated.data })
      await createAuditLog({ userId: session.id, module: 'CMS_FAQS', action: 'UPDATE_FAQ', recordId: id })
    } else {
      const created = await db.faq.create({
        data: {
          ...validated.data,
          createdById: session.id,
        },
      })
      await createAuditLog({ userId: session.id, module: 'CMS_FAQS', action: 'CREATE_FAQ', recordId: created.id })
    }

    revalidatePath('/faqs')
    revalidatePath('/admin/faqs')
    return { success: true, message: 'FAQ saved' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save FAQ' }
  }
}

export async function trashFaqAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.faq.update({ where: { id }, data: { isDeleted: true } })
    await createAuditLog({ userId: session.id, module: 'CMS_FAQS', action: 'TRASH_FAQ', recordId: id })
    revalidatePath('/faqs')
    revalidatePath('/admin/faqs')
    return { success: true, message: 'FAQ moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash FAQ' }
  }
}

export async function restoreFaqAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.faq.update({ where: { id }, data: { isDeleted: false } })
    await createAuditLog({ userId: session.id, module: 'CMS_FAQS', action: 'RESTORE_FAQ', recordId: id })
    revalidatePath('/faqs')
    revalidatePath('/admin/faqs')
    return { success: true, message: 'FAQ restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore FAQ' }
  }
}

export async function deleteFaqAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.faq.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'CMS_FAQS', action: 'PERMANENT_DELETE_FAQ', recordId: id })
    revalidatePath('/faqs')
    revalidatePath('/admin/faqs')
    return { success: true, message: 'FAQ permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete FAQ' }
  }
}

// --- WEBSITE SETTINGS CMS ---
export async function updateWebsiteSettingsAction(data: any) {
  const session = await requireAdminSession()
  try {
    const validated = websiteSettingsSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const first = await db.websiteSettings.findFirst()
    if (first) {
      await db.websiteSettings.update({
        where: { id: first.id },
        data: validated.data,
      })
    } else {
      await db.websiteSettings.create({
        data: validated.data,
      })
    }

    await createAuditLog({ userId: session.id, module: 'SETTINGS', action: 'UPDATE_SETTINGS' })
    revalidatePath('/', 'layout')
    return { success: true, message: 'Settings updated successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update settings' }
  }
}

export async function updateSocialLinksAction(socialLinks: {
  instagram?: string
  facebook?: string
  linkedin?: string
  youtube?: string
  twitter?: string
  whatsapp?: string
}) {
  const session = await requireAdminSession()
  try {
    const first = await db.websiteSettings.findFirst()
    const updatePayload: any = { socialLinks }
    if (socialLinks.whatsapp) {
      const cleanNum = socialLinks.whatsapp.replace(/[^\d]/g, '')
      if (cleanNum) {
        updatePayload.whatsappNumber = '+' + cleanNum
      }
    }

    if (first) {
      await db.websiteSettings.update({
        where: { id: first.id },
        data: updatePayload,
      })
    } else {
      await db.websiteSettings.create({
        data: updatePayload,
      })
    }

    await createAuditLog({ userId: session.id, module: 'SETTINGS', action: 'UPDATE_SOCIAL_LINKS' })
    revalidatePath('/', 'layout')
    revalidatePath('/admin/social-links')
    return { success: true, message: 'Social media links updated successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update social links' }
  }
}

// --- STUDENT REVIEWS CMS ---
export async function saveStudentReviewAction(data: {
  studentName: string
  photo?: string | null
  course?: string
  rating?: number
  review: string
  company?: string
  displayOrder?: number
  isActive?: boolean
}, id?: string) {
  const session = await requireAdminSession()
  try {
    if (!data.studentName || !data.review) {
      return { success: false, error: 'Student name and review text are required' }
    }

    if (id) {
      await db.studentReview.update({
        where: { id },
        data: {
          studentName: data.studentName,
          photo: data.photo || null,
          course: data.course || 'AI Practical Course',
          rating: Number(data.rating) || 5,
          review: data.review,
          company: data.company || null,
          displayOrder: Number(data.displayOrder) || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      })
      await createAuditLog({ userId: session.id, module: 'CMS_REVIEWS', action: 'UPDATE_REVIEW', recordId: id })
    } else {
      const created = await db.studentReview.create({
        data: {
          studentName: data.studentName,
          photo: data.photo || null,
          course: data.course || 'AI Practical Course',
          rating: Number(data.rating) || 5,
          review: data.review,
          company: data.company || null,
          displayOrder: Number(data.displayOrder) || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      })
      await createAuditLog({ userId: session.id, module: 'CMS_REVIEWS', action: 'CREATE_REVIEW', recordId: created.id })
    }

    revalidatePath('/placements')
    revalidatePath('/admin/reviews')
    return { success: true, message: 'Student review saved successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save student review' }
  }
}

export async function trashStudentReviewAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.studentReview.update({ where: { id }, data: { isDeleted: true } })
    await createAuditLog({ userId: session.id, module: 'CMS_REVIEWS', action: 'TRASH_REVIEW', recordId: id })
    revalidatePath('/placements')
    revalidatePath('/admin/reviews')
    return { success: true, message: 'Student review moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash review' }
  }
}

export async function restoreStudentReviewAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.studentReview.update({ where: { id }, data: { isDeleted: false } })
    await createAuditLog({ userId: session.id, module: 'CMS_REVIEWS', action: 'RESTORE_REVIEW', recordId: id })
    revalidatePath('/placements')
    revalidatePath('/admin/reviews')
    return { success: true, message: 'Student review restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore review' }
  }
}

export async function deleteStudentReviewAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.studentReview.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'CMS_REVIEWS', action: 'PERMANENT_DELETE_REVIEW', recordId: id })
    revalidatePath('/placements')
    revalidatePath('/admin/reviews')
    return { success: true, message: 'Student review permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete review' }
  }
}
