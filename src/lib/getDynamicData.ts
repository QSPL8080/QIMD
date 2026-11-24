import { db } from './db'
import {
  blogsData,
  placedStudentsData,
  testimonialsData,
  faqsData,
  galleryData,
} from '@/data'


function cleanBlogExcerpt(content: string, metaDescription?: string | null): string {
  if (metaDescription && metaDescription.trim().length > 10) {
    return metaDescription.trim()
  }
  const cleaned = content
    .replace(/^##\s*Summary\s*/im, '')
    .replace(/^#+\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^[\*\-\•]\s+/gm, '')
    .replace(/\r\n/g, '\n')
    .trim()

  return cleaned.substring(0, 160) + '...'
}

export async function getDynamicBlogs() {
  try {
    const dbBlogs = await db.blog.findMany({
      where: { isActive: true, status: 'PUBLISHED', isDeleted: false },
      orderBy: { createdAt: 'desc' },
    })

    if (dbBlogs.length > 0) {
      return dbBlogs.map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        category: b.category || 'General',
        coverImage: b.featuredImage || '/images/blog/blog-1.jpg',
        images: Array.isArray(b.images) ? (b.images as string[]) : [],
        author: b.author || 'QIMD Team',
        readTime: `${b.readingTime} min read`,
        content: b.content,
        excerpt: cleanBlogExcerpt(b.content, b.metaDescription),
        publishedAt: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][b.createdAt.getMonth()]} ${b.createdAt.getDate()}, ${b.createdAt.getFullYear()}`,
        featured: b.featured,
      }))
    }
  } catch (err) {
    console.error('Error fetching dynamic blogs:', err)
  }
  return blogsData
}

export async function getDynamicPlacements() {
  try {
    const dbPlacements = await db.placement.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })

    if (dbPlacements.length > 0) {
      return dbPlacements.map((p) => ({
        id: p.id,
        name: p.studentName || 'Placed Student',
        studentName: p.studentName || 'Placed Student',
        image: p.studentPhoto || '',
        studentPhoto: p.studentPhoto || '',
        company: p.companyName || 'Hiring Partner',
        companyName: p.companyName || 'Hiring Partner',
        companyLogo: p.companyLogo || '',
        package: p.package || '',
        role: p.designation || 'Specialist',
        designation: p.designation || 'Specialist',
        course: (p.courseName || 'AI Practical Program').replace(/\bCourses\b/gi, 'Programs').replace(/\bCourse\b/gi, 'Program'),
        location: p.location || '',
        joiningYear: p.joiningYear || '',
        isVideo: p.isVideo || false,
        videoUrl: p.videoUrl || null,
        videoThumbnail: p.videoThumbnail || null,
        isVerified: p.isVerified !== undefined ? p.isVerified : true,
        shortSuccessStory: p.successStory || '',
        quote: p.successStory || '',
      }))
    }

  } catch (err) {
    console.error('Error fetching dynamic placements:', err)
  }
  return placedStudentsData
}

export async function getDynamicTestimonials() {
  try {
    const dbTestimonials = await db.testimonial.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })

    if (dbTestimonials.length > 0) {
      return dbTestimonials.map((t) => {
        const safeCourse = (t.course || 'AI Practical Program').replace(/\bCourses\b/gi, 'Programs').replace(/\bCourse\b/gi, 'Program');
        const safeHeading = t.heading ? t.heading.replace(/\bCourses\b/gi, 'Programs').replace(/\bCourse\b/gi, 'Program') : undefined;
        return {
          id: t.id,
          name: t.studentName || 'QIMD Student',
          studentName: t.studentName || 'QIMD Student',
          heading: safeHeading,
          image: t.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
          photo: t.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
          courseTaken: safeCourse,
          course: safeCourse,
          role: t.role || 'Alumnus',
          company: t.company || '',
          rating: t.rating || 5,
          review: t.review || '',
          isVideo: t.isVideo || false,
          videoUrl: t.videoUrl || null,
          videoThumbnail: t.videoThumbnail || null,
          studentStory: t.studentStory || null,
          isFeatured: t.featured || false,
        }
      })
    }
  } catch (err) {
    console.error('Error fetching dynamic testimonials:', err)
  }
  return testimonialsData
}


export async function getDynamicFaqs() {
  try {
    const dbFaqs = await db.faq.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })

    if (dbFaqs.length > 0) {
      return dbFaqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      }))
    }
  } catch (err) {
    console.error('Error fetching dynamic FAQs:', err)
  }
  return faqsData
}

export async function getDynamicJobOpenings() {
  try {
    const dbJobs = await db.jobOpening.findMany({
      where: { isActive: true, status: 'PUBLISHED', isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })
    return dbJobs
  } catch (err) {
    console.error('Error fetching dynamic job openings:', err)
  }
  return []
}

export async function getDynamicGallery() {
  try {
    const gallery = await db.gallery.findMany({
      where: { isDeleted: false },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    })
    if (gallery.length > 0) {
      return gallery.map((g) => ({
        id: g.id,
        src: g.fileUrl,
        fileUrl: g.fileUrl,
        alt: g.altText || 'QIMD Gallery Image',
        category: g.category || 'Classroom',
        caption: g.caption || '',
        mediaType: g.mediaType || 'IMAGE',
      }))
    }
  } catch (err) {
    console.error('Error fetching dynamic gallery:', err)
  }
  return galleryData
}

export async function getDynamicStudentReviews() {
  try {
    const dbReviews = await db.studentReview.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    })
    if (dbReviews.length > 0) {
      return dbReviews.map((r) => ({
        id: r.id,
        name: r.studentName,
        studentName: r.studentName,
        initial: r.studentName ? r.studentName.trim().charAt(0).toUpperCase() : 'S',
        program: (r.course || 'AI Practical Program').replace(/\bCourses\b/gi, 'Programs').replace(/\bCourse\b/gi, 'Program'),
        course: (r.course || 'AI Practical Program').replace(/\bCourses\b/gi, 'Programs').replace(/\bCourse\b/gi, 'Program'),
        rating: r.rating || 5,
        review: r.review,
        company: r.company || '',
      }))
    }
  } catch (err) {
    console.error('Error fetching dynamic student reviews:', err)
  }
  return []
}
