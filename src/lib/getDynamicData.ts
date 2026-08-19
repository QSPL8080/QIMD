import { db } from './db'
import { unstable_cache } from 'next/cache'
import {
  coursesData,
  trainersData,
  blogsData,
  placedStudentsData,
  testimonialsData,
  faqsData,
  placementPartnersData,
  emiPartnersData,
  galleryData,
} from '@/data'


export const getDynamicCourses = unstable_cache(
  async () => {
    try {
      const dbCourses = await db.course.findMany({
        where: { isActive: true, status: 'PUBLISHED', isDeleted: false },
        include: { category: true, trainer: true },
        orderBy: { displayOrder: 'asc' },
      })

      if (dbCourses.length > 0) {
        return dbCourses.map((c) => {
          const staticMatch = coursesData.find((sc) => sc.slug === c.slug || c.slug.includes(sc.slug) || sc.slug.includes(c.slug));
          const courseImg = c.bannerImage || staticMatch?.image || '/images/courses/digital-marketing.jpg';
          return {
            id: c.id,
            title: c.courseName,
            slug: c.slug,
            category: c.category?.name || 'General',
            duration: c.duration || '6 Months',
            mode: c.courseMode || 'Offline Course',
            shortDescription: c.shortDescription || '',
            description: c.description || '',
            bannerImage: courseImg,
            image: courseImg,
            fees: c.fees ? Number(c.fees) : 45000,
            discountPrice: c.discountPrice ? Number(c.discountPrice) : 35000,
            eligibility: c.eligibility || 'Open for all',
            syllabus: c.syllabus ? c.syllabus.split('\n') : [],
            learningOutcomes: c.learningOutcomes ? c.learningOutcomes.split('\n') : [],
            outcomes: c.learningOutcomes ? c.learningOutcomes.split('\n') : [],
            featured: c.featured,
          }
        })
      }
    } catch (err) {
      console.error('Error fetching dynamic courses:', err)
    }
    return coursesData
  },
  ['dynamic-courses'],
  { revalidate: 60, tags: ['courses'] }
)

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
        excerpt: b.content.substring(0, 140) + '...',
        publishedAt: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][b.createdAt.getMonth()]} ${b.createdAt.getDate()}, ${b.createdAt.getFullYear()}`,
        featured: b.featured,
      }))
    }
  } catch (err) {
    console.error('Error fetching dynamic blogs:', err)
  }
  return blogsData
}

export async function getDynamicTrainers() {
  try {
    const dbTrainers = await db.trainer.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })

    if (dbTrainers.length > 0) {
      return dbTrainers.map((t) => ({
        id: t.id,
        name: t.fullName,
        photo: t.photo || '/images/trainers/trainer1.jpg',
        designation: t.designation || 'Senior Instructor',
        category: (t as any).category || 'MARKETING',
        qualification: t.qualification || '',
        experience: t.experience || '8+ Years',
        biography: t.biography || '',
        skills: Array.isArray(t.skills) ? t.skills : ['AI Tools', 'Practical Training'],
        linkedin: t.linkedin || '#',
        instagram: t.instagram || '#',
      }))
    }
  } catch (err) {
    console.error('Error fetching dynamic trainers:', err)
  }
  return trainersData
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
        course: p.courseName || 'AI Practical Course',
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
      return dbTestimonials.map((t) => ({
        id: t.id,
        name: t.studentName || 'QIMD Student',
        studentName: t.studentName || 'QIMD Student',
        heading: t.heading || undefined,
        image: t.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        photo: t.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        courseTaken: t.course || 'AI Practical Course',
        course: t.course || 'AI Practical Course',
        role: t.role || 'Alumnus',
        company: t.company || '',
        rating: t.rating || 5,
        review: t.review || '',
        isVideo: t.isVideo || false,
        videoUrl: t.videoUrl || null,
        videoThumbnail: t.videoThumbnail || null,
        studentStory: t.studentStory || null,
        isFeatured: t.featured || false,
      }))
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
      orderBy: { displayOrder: 'asc' },
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

export async function getDynamicHiringPartners() {
  try {
    const partners = await db.partner.findMany({
      where: { type: 'HIRING', isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })
    if (partners.length > 0) {
      return partners.map((p) => ({
        id: p.id,
        name: p.name,
        logo: p.logo,
      }))
    }
  } catch (err) {
    console.error('Error fetching dynamic hiring partners:', err)
  }
  return placementPartnersData
}

export async function getDynamicEmiPartners() {
  try {
    const emis = await db.emiPartner.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })
    if (emis.length > 0) {
      return emis.map((e) => ({
        id: e.id,
        name: e.name,
        logo: e.logo,
      }))
    }
  } catch (err) {
    console.error('Error fetching dynamic EMI partners:', err)
  }
  return emiPartnersData
}

export async function getDynamicGallery() {
  try {
    const gallery = await db.gallery.findMany({
      where: { isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })
    if (gallery.length > 0) {
      return gallery.map((g) => ({
        id: g.id,
        src: g.fileUrl,
        alt: g.altText || 'QIMD Gallery Image',
        category: g.category || 'Facilities',
        caption: g.caption || '',
      }))
    }
  } catch (err) {
    console.error('Error fetching dynamic gallery:', err)
  }
  return galleryData
}

export async function getDynamicPageSections(pageKey: string) {
  try {
    const sections = await db.pageSection.findMany({
      where: { pageKey: pageKey.toUpperCase(), status: 'PUBLISHED', isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })
    const sectionMap: Record<string, any> = {}
    sections.forEach((s) => {
      sectionMap[s.sectionKey] = s
    })
    return sectionMap
  } catch (err) {
    console.error(`Error fetching page sections for ${pageKey}:`, err)
    return {}
  }
}

export async function getDynamicOrderedPageSections(pageKey: string) {
  try {
    const sections = await db.pageSection.findMany({
      where: { pageKey: pageKey.toUpperCase(), status: 'PUBLISHED', isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })
    return sections
  } catch (err) {
    console.error(`Error fetching ordered page sections for ${pageKey}:`, err)
    return []
  }
}

export async function getDynamicPageData(pageKey: string) {
  try {
    const page = await db.webPage.findFirst({
      where: { pageKey: pageKey.toUpperCase(), status: 'PUBLISHED', isDeleted: false },
      include: {
        sections: {
          where: { status: 'PUBLISHED', isActive: true, isDeleted: false },
          orderBy: { displayOrder: 'asc' },
        },
      },
    })
    if (page) {
      const sectionMap: Record<string, any> = {}
      page.sections.forEach((s) => {
        sectionMap[s.sectionKey] = s
      })
      return { page, sections: sectionMap }
    }
  } catch (err) {
    console.error(`Error fetching dynamic page data for ${pageKey}:`, err)
  }
  return { page: null, sections: {} }
}



