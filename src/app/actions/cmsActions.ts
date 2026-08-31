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
  brochureSchema,
} from '@/lib/validations'
import { requireAdminSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// --- COURSE CATEGORIES CMS ---
export async function getCategoriesAction() {
  const session = await requireAdminSession()
  try {
    const categories = await db.courseCategory.findMany({
      include: { courses: true },
      orderBy: { displayOrder: 'asc' },
    })
    return { success: true, categories: JSON.parse(JSON.stringify(categories)) }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch categories' }
  }
}

export async function saveCategoryAction(data: any, id?: string) {
  const session = await requireAdminSession()
  try {
    const validated = categorySchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const categoryData = { ...validated.data }
    let resultCategory: any = null

    if (id && UUID_REGEX.test(id)) {
      const oldCat = await db.courseCategory.findUnique({ where: { id } })
      if (oldCat && oldCat.slug !== categoryData.slug) {
        const existing = await db.courseCategory.findUnique({ where: { slug: categoryData.slug } })
        if (existing) {
          return { success: false, error: `A category with slug '${categoryData.slug}' already exists.` }
        }
      }
      resultCategory = await db.courseCategory.update({
        where: { id },
        data: categoryData,
      })
      await createAuditLog({ userId: session.id, module: 'CMS_CATEGORIES', action: 'UPDATE_CATEGORY', recordId: id })
    } else {
      let uniqueSlug = categoryData.slug
      let counter = 1
      while (await db.courseCategory.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${categoryData.slug}-${counter}`
        counter++
      }
      categoryData.slug = uniqueSlug

      resultCategory = await db.courseCategory.create({
        data: categoryData,
      })
      await createAuditLog({ userId: session.id, module: 'CMS_CATEGORIES', action: 'CREATE_CATEGORY', recordId: resultCategory.id })
    }

    revalidatePath('/courses')
    revalidatePath('/admin/course-categories')
    revalidatePath('/admin/courses')
    return { success: true, message: 'Category saved successfully', category: JSON.parse(JSON.stringify(resultCategory)) }
  } catch (err: any) {
    if (err?.code === 'P2002' || err?.message?.includes('Unique constraint failed')) {
      return { success: false, error: 'A category with this slug already exists.' }
    }
    return { success: false, error: err.message || 'Failed to save category' }
  }
}

export async function trashCategoryAction(id: string) {
  const session = await requireAdminSession()
  try {
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: 'Invalid category ID' }
    }
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
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: 'Invalid category ID' }
    }
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
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: 'Invalid category ID' }
    }
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
      if (oldCourse && oldCourse.slug !== coursePayload.slug) {
        const existing = await db.course.findUnique({ where: { slug: coursePayload.slug } })
        if (existing) {
          return { success: false, error: `A course with slug '${coursePayload.slug}' already exists.` }
        }
      }
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
      let uniqueSlug = coursePayload.slug
      let counter = 1
      while (await db.course.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${coursePayload.slug}-${counter}`
        counter++
      }
      coursePayload.slug = uniqueSlug

      const created = await db.course.create({
        data: coursePayload,
      })
      await createAuditLog({ userId: session.id, module: 'CMS_COURSES', action: 'CREATE_COURSE', recordId: created.id })
    }

    // Sync active brochure if provided
    const targetCourseId = id || (await db.course.findFirst({ where: { slug: coursePayload.slug } }))?.id
    if (targetCourseId && validated.data.brochure && validated.data.brochure.trim()) {
      const brochureUrl = validated.data.brochure.trim()
      await db.brochure.updateMany({
        where: { courseId: targetCourseId },
        data: { isActive: false },
      })
      const existing = await db.brochure.findFirst({
        where: { courseId: targetCourseId, fileUrl: brochureUrl, isDeleted: false },
      })
      if (existing) {
        await db.brochure.update({
          where: { id: existing.id },
          data: { isActive: true },
        })
      } else {
        await db.brochure.create({
          data: {
            title: `${validated.data.courseName} Brochure`,
            courseId: targetCourseId,
            fileUrl: brochureUrl,
            isActive: true,
          },
        })
      }
    }

    try {
      revalidatePath('/')
      revalidatePath('/courses')
      revalidatePath('/admin/courses')
      revalidatePath('/admin/brochures')
      if (validated.data.slug) {
        revalidatePath(`/courses/${validated.data.slug}`)
      }
      revalidatePath('/courses/[slug]', 'page')
    } catch {}
    return { success: true, message: 'Course and brochure saved successfully' }
  } catch (err: any) {
    if (err?.code === 'P2002' || err?.message?.includes('Unique constraint failed')) {
      return { success: false, error: 'A course with this slug already exists.' }
    }
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
      if (oldBlog && oldBlog.slug !== blogData.slug) {
        const existingSlug = await db.blog.findUnique({ where: { slug: blogData.slug } })
        if (existingSlug) {
          return { success: false, error: `A blog post with slug '${blogData.slug}' already exists.` }
        }
      }
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
      let uniqueSlug = blogData.slug
      let counter = 1
      while (await db.blog.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${blogData.slug}-${counter}`
        counter++
      }
      blogData.slug = uniqueSlug

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
    if (err?.code === 'P2002' || err?.message?.includes('Unique constraint failed')) {
      return { success: false, error: 'A blog post with this slug already exists. Please choose a unique slug or title.' }
    }
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
    revalidatePath('/')
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
    revalidatePath('/')
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
    revalidatePath('/')
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
    revalidatePath('/')
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
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const item = await db.studentReview.findUnique({ where: { id } })
    if (item?.photo) {
      await safeDeleteUnusedFile(item.photo, { table: 'studentReview', id })
    }
    await db.studentReview.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'CMS_REVIEWS', action: 'PERMANENT_DELETE_REVIEW', recordId: id })
    revalidatePath('/placements')
    revalidatePath('/admin/reviews')
    return { success: true, message: 'Student review permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete review' }
  }
}

// ==========================================
// UNIFIED BULK OPERATIONS FOR ALL CMS MODULES
// ==========================================

// 1. Course Categories Bulk Actions
export async function bulkTrashCategoriesAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    const validIds = (ids || []).filter((id) => UUID_REGEX.test(id))
    if (validIds.length === 0) return { success: false, error: 'No valid categories selected' }
    await db.courseCategory.updateMany({
      where: { id: { in: validIds } },
      data: { isDeleted: true },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_CATEGORIES', action: 'BULK_TRASH_CATEGORIES', recordId: validIds.join(',') })
    revalidatePath('/admin/course-categories')
    return { success: true, message: `${validIds.length} categories moved to Trash` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash categories' }
  }
}

export async function bulkRestoreCategoriesAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    const validIds = (ids || []).filter((id) => UUID_REGEX.test(id))
    if (validIds.length === 0) return { success: false, error: 'No valid categories selected' }
    await db.courseCategory.updateMany({
      where: { id: { in: validIds } },
      data: { isDeleted: false },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_CATEGORIES', action: 'BULK_RESTORE_CATEGORIES', recordId: validIds.join(',') })
    revalidatePath('/admin/course-categories')
    return { success: true, message: `${validIds.length} categories restored` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore categories' }
  }
}

export async function bulkDeleteCategoriesPermanentlyAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    const validIds = (ids || []).filter((id) => UUID_REGEX.test(id))
    if (validIds.length === 0) return { success: false, error: 'No valid categories selected' }
    await db.courseCategory.deleteMany({
      where: { id: { in: validIds } },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_CATEGORIES', action: 'BULK_PERMANENT_DELETE_CATEGORIES', recordId: validIds.join(',') })
    revalidatePath('/admin/course-categories')
    return { success: true, message: `${validIds.length} categories permanently deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to permanently delete categories' }
  }
}

// 2. Courses Bulk Actions
export async function bulkTrashCoursesAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.course.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_COURSES', action: 'BULK_TRASH_COURSES', recordId: ids.join(',') })
    revalidatePath('/courses')
    revalidatePath('/admin/courses')
    return { success: true, message: `${ids.length} courses moved to Trash` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash courses' }
  }
}

export async function bulkRestoreCoursesAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.course.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: false },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_COURSES', action: 'BULK_RESTORE_COURSES', recordId: ids.join(',') })
    revalidatePath('/courses')
    revalidatePath('/admin/courses')
    return { success: true, message: `${ids.length} courses restored` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore courses' }
  }
}

export async function bulkDeleteCoursesPermanentlyAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const courses = await db.course.findMany({ where: { id: { in: ids } } })
    for (const c of courses) {
      if (c.bannerImage) {
        await safeDeleteUnusedFile(c.bannerImage, { table: 'course', id: c.id })
      }
    }
    await db.course.deleteMany({
      where: { id: { in: ids } },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_COURSES', action: 'BULK_PERMANENT_DELETE_COURSES', recordId: ids.join(',') })
    revalidatePath('/courses')
    revalidatePath('/admin/courses')
    return { success: true, message: `${ids.length} courses permanently deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete courses' }
  }
}

// 3. Blogs Bulk Actions
export async function bulkTrashBlogsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.blog.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_BLOGS', action: 'BULK_TRASH_BLOGS', recordId: ids.join(',') })
    revalidatePath('/blog')
    revalidatePath('/admin/blogs')
    return { success: true, message: `${ids.length} blogs moved to Trash` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash blogs' }
  }
}

export async function bulkRestoreBlogsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.blog.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: false },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_BLOGS', action: 'BULK_RESTORE_BLOGS', recordId: ids.join(',') })
    revalidatePath('/blog')
    revalidatePath('/admin/blogs')
    return { success: true, message: `${ids.length} blogs restored` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore blogs' }
  }
}

export async function bulkDeleteBlogsPermanentlyAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const blogs = await db.blog.findMany({ where: { id: { in: ids } } })
    for (const b of blogs) {
      if (b.featuredImage) {
        await safeDeleteUnusedFile(b.featuredImage, { table: 'blog', id: b.id })
      }
    }
    await db.blog.deleteMany({
      where: { id: { in: ids } },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_BLOGS', action: 'BULK_PERMANENT_DELETE_BLOGS', recordId: ids.join(',') })
    revalidatePath('/blog')
    revalidatePath('/admin/blogs')
    return { success: true, message: `${ids.length} blogs permanently deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete blogs' }
  }
}

// 4. Testimonials Bulk Actions
export async function bulkTrashTestimonialsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.testimonial.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_TESTIMONIALS', action: 'BULK_TRASH_TESTIMONIALS', recordId: ids.join(',') })
    revalidatePath('/placements')
    revalidatePath('/admin/testimonials')
    return { success: true, message: `${ids.length} testimonials moved to Trash` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash testimonials' }
  }
}

export async function bulkRestoreTestimonialsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.testimonial.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: false },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_TESTIMONIALS', action: 'BULK_RESTORE_TESTIMONIALS', recordId: ids.join(',') })
    revalidatePath('/placements')
    revalidatePath('/admin/testimonials')
    return { success: true, message: `${ids.length} testimonials restored` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore testimonials' }
  }
}

export async function bulkDeleteTestimonialsPermanentlyAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const items = await db.testimonial.findMany({ where: { id: { in: ids } } })
    for (const item of items) {
      if (item.photo) await safeDeleteUnusedFile(item.photo, { table: 'testimonial', id: item.id })
    }
    await db.testimonial.deleteMany({
      where: { id: { in: ids } },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_TESTIMONIALS', action: 'BULK_PERMANENT_DELETE_TESTIMONIALS', recordId: ids.join(',') })
    revalidatePath('/placements')
    revalidatePath('/admin/testimonials')
    return { success: true, message: `${ids.length} testimonials permanently deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete testimonials' }
  }
}

// 5. Student Reviews Bulk Actions
export async function bulkTrashReviewsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.studentReview.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_REVIEWS', action: 'BULK_TRASH_REVIEWS', recordId: ids.join(',') })
    revalidatePath('/placements')
    revalidatePath('/admin/reviews')
    return { success: true, message: `${ids.length} reviews moved to Trash` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash reviews' }
  }
}

export async function bulkRestoreReviewsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.studentReview.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: false },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_REVIEWS', action: 'BULK_RESTORE_REVIEWS', recordId: ids.join(',') })
    revalidatePath('/placements')
    revalidatePath('/admin/reviews')
    return { success: true, message: `${ids.length} reviews restored` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore reviews' }
  }
}

export async function bulkDeleteReviewsPermanentlyAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const items = await db.studentReview.findMany({ where: { id: { in: ids } } })
    for (const item of items) {
      if (item.photo) await safeDeleteUnusedFile(item.photo, { table: 'studentReview', id: item.id })
    }
    await db.studentReview.deleteMany({
      where: { id: { in: ids } },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_REVIEWS', action: 'BULK_PERMANENT_DELETE_REVIEWS', recordId: ids.join(',') })
    revalidatePath('/placements')
    revalidatePath('/admin/reviews')
    return { success: true, message: `${ids.length} reviews permanently deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete reviews' }
  }
}

// 6. Placements Bulk Actions
export async function bulkTrashPlacementsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.placement.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_PLACEMENTS', action: 'BULK_TRASH_PLACEMENTS', recordId: ids.join(',') })
    revalidatePath('/placements')
    revalidatePath('/admin/placements')
    return { success: true, message: `${ids.length} placement records moved to Trash` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash placements' }
  }
}

export async function bulkRestorePlacementsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.placement.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: false },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_PLACEMENTS', action: 'BULK_RESTORE_PLACEMENTS', recordId: ids.join(',') })
    revalidatePath('/placements')
    revalidatePath('/admin/placements')
    return { success: true, message: `${ids.length} placement records restored` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore placements' }
  }
}

export async function bulkDeletePlacementsPermanentlyAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const items = await db.placement.findMany({ where: { id: { in: ids } } })
    for (const item of items) {
      if (item.studentPhoto) await safeDeleteUnusedFile(item.studentPhoto, { table: 'placement', id: item.id })
      if (item.companyLogo) await safeDeleteUnusedFile(item.companyLogo, { table: 'placement', id: item.id })
    }
    await db.placement.deleteMany({
      where: { id: { in: ids } },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_PLACEMENTS', action: 'BULK_PERMANENT_DELETE_PLACEMENTS', recordId: ids.join(',') })
    revalidatePath('/placements')
    revalidatePath('/admin/placements')
    return { success: true, message: `${ids.length} placement records permanently deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete placements' }
  }
}

// 7. FAQs Bulk Actions
export async function bulkTrashFaqsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.faq.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_FAQS', action: 'BULK_TRASH_FAQS', recordId: ids.join(',') })
    revalidatePath('/faqs')
    revalidatePath('/admin/faqs')
    return { success: true, message: `${ids.length} FAQs moved to Trash` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash FAQs' }
  }
}

export async function bulkRestoreFaqsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.faq.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: false },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_FAQS', action: 'BULK_RESTORE_FAQS', recordId: ids.join(',') })
    revalidatePath('/faqs')
    revalidatePath('/admin/faqs')
    return { success: true, message: `${ids.length} FAQs restored` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore FAQs' }
  }
}

export async function bulkDeleteFaqsPermanentlyAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.faq.deleteMany({
      where: { id: { in: ids } },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_FAQS', action: 'BULK_PERMANENT_DELETE_FAQS', recordId: ids.join(',') })
    revalidatePath('/faqs')
    revalidatePath('/admin/faqs')
    return { success: true, message: `${ids.length} FAQs permanently deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete FAQs' }
  }
}

// 8. Partners Bulk Actions
export async function bulkDeletePartnersAction(ids: string[], type: 'HIRING' | 'EMI' = 'HIRING') {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    if (type === 'EMI') {
      const items = await db.emiPartner.findMany({ where: { id: { in: ids } } })
      for (const item of items) {
        if (item.logo) await safeDeleteUnusedFile(item.logo, { table: 'emiPartner', id: item.id })
      }
      await db.emiPartner.deleteMany({ where: { id: { in: ids } } })
    } else {
      const items = await db.partner.findMany({ where: { id: { in: ids } } })
      for (const item of items) {
        if (item.logo) await safeDeleteUnusedFile(item.logo, { table: 'partner', id: item.id })
      }
      await db.partner.deleteMany({ where: { id: { in: ids } } })
    }
    await createAuditLog({ userId: session.id, module: 'CMS_PARTNERS', action: 'BULK_DELETE_PARTNERS', recordId: ids.join(',') })
    revalidatePath('/placements')
    revalidatePath('/admin/partners')
    return { success: true, message: `${ids.length} partners deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete partners' }
  }
}

// 9. Gallery Bulk Actions
export async function bulkTrashGalleryItemsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.gallery.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_GALLERY', action: 'BULK_TRASH_GALLERY', recordId: ids.join(',') })
    revalidatePath('/')
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')
    return { success: true, message: `${ids.length} gallery items moved to Trash` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash gallery items' }
  }
}

export async function bulkRestoreGalleryItemsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.gallery.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: false },
    })
    await createAuditLog({ userId: session.id, module: 'CMS_GALLERY', action: 'BULK_RESTORE_GALLERY', recordId: ids.join(',') })
    revalidatePath('/')
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')
    return { success: true, message: `${ids.length} gallery items restored` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore gallery items' }
  }
}

export async function bulkDeleteGalleryItemsAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const items = await db.gallery.findMany({ where: { id: { in: ids } } })
    for (const item of items) {
      if (item.fileUrl) await safeDeleteUnusedFile(item.fileUrl, { table: 'gallery', id: item.id })
      if (item.thumbnail) await safeDeleteUnusedFile(item.thumbnail, { table: 'gallery', id: item.id })
    }
    await db.gallery.deleteMany({ where: { id: { in: ids } } })
    await createAuditLog({ userId: session.id, module: 'CMS_GALLERY', action: 'BULK_DELETE_GALLERY', recordId: ids.join(',') })
    revalidatePath('/')
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')
    return { success: true, message: `${ids.length} gallery items deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete gallery items' }
  }
}

// 10. Trainers & Team Bulk Actions
export async function bulkTrashTrainersAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    const validIds = (ids || []).filter((id) => UUID_REGEX.test(id))
    if (validIds.length === 0) return { success: false, error: 'No valid trainers/team members selected' }
    await db.trainer.updateMany({
      where: { id: { in: validIds } },
      data: { isDeleted: true },
    })
    await db.teamMember.updateMany({
      where: { id: { in: validIds } },
      data: { isDeleted: true },
    }).catch(() => null)
    await createAuditLog({ userId: session.id, module: 'CMS_TRAINERS', action: 'BULK_TRASH_TRAINERS', recordId: validIds.join(',') })
    revalidatePath('/trainers')
    revalidatePath('/about/our-team')
    revalidatePath('/admin/trainers')
    revalidatePath('/admin/team')
    return { success: true, message: `${validIds.length} members moved to Trash` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash trainers' }
  }
}

export async function bulkRestoreTrainersAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    const validIds = (ids || []).filter((id) => UUID_REGEX.test(id))
    if (validIds.length === 0) return { success: false, error: 'No valid trainers/team members selected' }
    await db.trainer.updateMany({
      where: { id: { in: validIds } },
      data: { isDeleted: false },
    })
    await db.teamMember.updateMany({
      where: { id: { in: validIds } },
      data: { isDeleted: false },
    }).catch(() => null)
    await createAuditLog({ userId: session.id, module: 'CMS_TRAINERS', action: 'BULK_RESTORE_TRAINERS', recordId: validIds.join(',') })
    revalidatePath('/trainers')
    revalidatePath('/about/our-team')
    revalidatePath('/admin/trainers')
    revalidatePath('/admin/team')
    return { success: true, message: `${validIds.length} members restored` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore trainers' }
  }
}

export async function bulkDeleteTrainersPermanentlyAction(ids: string[]) {
  const session = await requireAdminSession()
  try {
    const validIds = (ids || []).filter((id) => UUID_REGEX.test(id))
    if (validIds.length === 0) return { success: false, error: 'No valid trainers/team members selected' }
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const trainers = await db.trainer.findMany({ where: { id: { in: validIds } } })
    for (const t of trainers) {
      if (t.photo) await safeDeleteUnusedFile(t.photo, { table: 'trainer', id: t.id })
    }
    await db.trainer.deleteMany({ where: { id: { in: validIds } } })
    await db.teamMember.deleteMany({ where: { id: { in: validIds } } }).catch(() => null)
    await createAuditLog({ userId: session.id, module: 'CMS_TRAINERS', action: 'BULK_PERMANENT_DELETE_TRAINERS', recordId: validIds.join(',') })
    revalidatePath('/trainers')
    revalidatePath('/about/our-team')
    revalidatePath('/admin/trainers')
    revalidatePath('/admin/team')
    return { success: true, message: `${validIds.length} members permanently deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete trainers' }
  }
}

// --- BROCHURES CMS ---
export async function getBrochuresAction() {
  const session = await requireAdminSession()
  try {
    const brochures = await db.brochure.findMany({
      include: {
        course: {
          select: { id: true, courseName: true, slug: true },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    })
    return { success: true, brochures: JSON.parse(JSON.stringify(brochures)) }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch brochures' }
  }
}

export async function saveBrochureAction(data: any, id?: string) {
  const session = await requireAdminSession()
  try {
    const validated = brochureSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { title, courseId, fileUrl, fileSize, isActive } = validated.data

    // If activating this brochure, ensure only 1 active brochure per course
    if (isActive) {
      await db.brochure.updateMany({
        where: {
          courseId,
          ...(id && UUID_REGEX.test(id) ? { id: { not: id } } : {}),
        },
        data: { isActive: false },
      })
    }

    let savedBrochure: any = null

    if (id && UUID_REGEX.test(id)) {
      savedBrochure = await db.brochure.update({
        where: { id },
        data: {
          title,
          courseId,
          fileUrl,
          fileSize: fileSize || null,
          isActive,
        },
        include: { course: true },
      })
      await createAuditLog({
        userId: session.id,
        module: 'CMS_BROCHURES',
        action: 'UPDATE_BROCHURE',
        recordId: id,
      })
    } else {
      savedBrochure = await db.brochure.create({
        data: {
          title,
          courseId,
          fileUrl,
          fileSize: fileSize || null,
          isActive,
        },
        include: { course: true },
      })
      await createAuditLog({
        userId: session.id,
        module: 'CMS_BROCHURES',
        action: 'CREATE_BROCHURE',
        recordId: savedBrochure.id,
      })
    }

    try {
      revalidatePath('/')
      revalidatePath('/courses')
      revalidatePath('/admin/brochures')
    } catch {}
    return { success: true, message: 'Brochure saved successfully', brochure: JSON.parse(JSON.stringify(savedBrochure)) }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save brochure' }
  }
}

export async function toggleBrochureStatusAction(id: string, isActive: boolean) {
  const session = await requireAdminSession()
  try {
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: 'Invalid brochure ID' }
    }

    const target = await db.brochure.findUnique({ where: { id } })
    if (!target) return { success: false, error: 'Brochure not found' }

    if (isActive) {
      // Deactivate all other brochures for this course
      await db.brochure.updateMany({
        where: {
          courseId: target.courseId,
          id: { not: id },
        },
        data: { isActive: false },
      })
    }

    const updated = await db.brochure.update({
      where: { id },
      data: { isActive },
      include: { course: true },
    })

    await createAuditLog({
      userId: session.id,
      module: 'CMS_BROCHURES',
      action: isActive ? 'ACTIVATE_BROCHURE' : 'DEACTIVATE_BROCHURE',
      recordId: id,
    })

    try {
      revalidatePath('/')
      revalidatePath('/courses')
      revalidatePath('/admin/brochures')
    } catch {}
    return { success: true, message: `Brochure ${isActive ? 'activated' : 'deactivated'} successfully`, brochure: JSON.parse(JSON.stringify(updated)) }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update brochure status' }
  }
}

export async function trashBrochureAction(id: string) {
  const session = await requireAdminSession()
  try {
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: 'Invalid brochure ID' }
    }
    await db.brochure.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    })
    await createAuditLog({
      userId: session.id,
      module: 'CMS_BROCHURES',
      action: 'TRASH_BROCHURE',
      recordId: id,
    })
    try {
      revalidatePath('/admin/brochures')
    } catch {}
    return { success: true, message: 'Brochure moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash brochure' }
  }
}

export async function restoreBrochureAction(id: string) {
  const session = await requireAdminSession()
  try {
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: 'Invalid brochure ID' }
    }
    await db.brochure.update({
      where: { id },
      data: { isDeleted: false },
    })
    await createAuditLog({
      userId: session.id,
      module: 'CMS_BROCHURES',
      action: 'RESTORE_BROCHURE',
      recordId: id,
    })
    try {
      revalidatePath('/admin/brochures')
    } catch {}
    return { success: true, message: 'Brochure restored successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore brochure' }
  }
}

export async function deleteBrochureAction(id: string) {
  const session = await requireAdminSession()
  try {
    if (!id || !UUID_REGEX.test(id)) {
      return { success: false, error: 'Invalid brochure ID' }
    }
    const brochure = await db.brochure.findUnique({ where: { id } })
    if (!brochure) return { success: false, error: 'Brochure not found' }

    await db.brochure.delete({ where: { id } })

    await createAuditLog({
      userId: session.id,
      module: 'CMS_BROCHURES',
      action: 'PERMANENT_DELETE_BROCHURE',
      recordId: id,
    })

    try {
      revalidatePath('/')
      revalidatePath('/courses')
      revalidatePath('/admin/brochures')
    } catch {}
    return { success: true, message: 'Brochure permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete brochure' }
  }
}



