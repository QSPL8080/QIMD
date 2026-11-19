'use server'

import { db } from '@/lib/db'
import {
  blogSchema,
  placementSchema,
  testimonialSchema,
  faqSchema,
} from '@/lib/validations'
import { requireAdminSession, requireBlogEditorSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// --- BLOGS CMS ---
export async function saveBlogAction(data: any, id?: string) {
  const session = await requireBlogEditorSession()
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
  const session = await requireBlogEditorSession()
  try {
    await db.blog.update({ where: { id }, data: { isDeleted: true } })
    revalidatePath('/blog')
    revalidatePath('/admin/blogs')
    return { success: true, message: 'Blog moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash blog' }
  }
}

export async function restoreBlogAction(id: string) {
  const session = await requireBlogEditorSession()
  try {
    await db.blog.update({ where: { id }, data: { isDeleted: false } })
    revalidatePath('/blog')
    revalidatePath('/admin/blogs')
    return { success: true, message: 'Blog restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore blog' }
  }
}

export async function deleteBlogAction(id: string) {
  const session = await requireBlogEditorSession()
  try {
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const blog = await db.blog.findUnique({ where: { id } })

    await db.blog.delete({ where: { id } })

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

      // Clean up old student photo if replaced or deleted
      if (oldPlacement?.studentPhoto && oldPlacement.studentPhoto !== validated.data.studentPhoto) {
        await safeDeleteUnusedFile(oldPlacement.studentPhoto, { table: 'placement', id })
      }
      if (oldPlacement?.companyLogo && oldPlacement.companyLogo !== validated.data.companyLogo) {
        await safeDeleteUnusedFile(oldPlacement.companyLogo, { table: 'placement', id })
      }
    } else {
      const created = await db.placement.create({ data: validated.data })
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
    } else {
      const created = await db.faq.create({
        data: {
          ...validated.data,
          createdById: session.id,
        },
      })
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
    revalidatePath('/faqs')
    revalidatePath('/admin/faqs')
    return { success: true, message: 'FAQ permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete FAQ' }
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

// 3. Blogs Bulk Actions
export async function bulkTrashBlogsAction(ids: string[]) {
  const session = await requireBlogEditorSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.blog.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    })
    revalidatePath('/blog')
    revalidatePath('/admin/blogs')
    return { success: true, message: `${ids.length} blogs moved to Trash` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash blogs' }
  }
}

export async function bulkRestoreBlogsAction(ids: string[]) {
  const session = await requireBlogEditorSession()
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'No items selected' }
    await db.blog.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: false },
    })
    revalidatePath('/blog')
    revalidatePath('/admin/blogs')
    return { success: true, message: `${ids.length} blogs restored` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore blogs' }
  }
}

export async function bulkDeleteBlogsPermanentlyAction(ids: string[]) {
  const session = await requireBlogEditorSession()
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
    revalidatePath('/faqs')
    revalidatePath('/admin/faqs')
    return { success: true, message: `${ids.length} FAQs permanently deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete FAQs' }
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
    revalidatePath('/')
    revalidatePath('/gallery')
    revalidatePath('/admin/gallery')
    return { success: true, message: `${ids.length} gallery items deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete gallery items' }
  }
}

