import { PrismaClient } from '@prisma/client'
import {
  blogsData,
  placedStudentsData,
  testimonialsData,
  faqsData,
  galleryData,
  jobOpeningsData,
} from '../src/data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting QIMD Full Website Migration to PostgreSQL Database...')

  // 3. Blogs Migration (Clean and seed 4 official blogs)
  const validSlugs = blogsData.map(b => b.slug)
  await prisma.blog.deleteMany({
    where: {
      slug: { notIn: validSlugs }
    }
  })

  // Load rich content from update-blogs
  const { newBlogsData } = await import('../scripts/update-blogs')

  for (const b of newBlogsData) {
    const existing = await prisma.blog.findFirst({
      where: { slug: b.slug },
    })
    if (!existing) {
      await prisma.blog.create({
        data: {
          title: b.title,
          slug: b.slug,
          category: b.category,
          excerpt: b.metaDescription,
          featuredImage: b.featuredImage,
          images: b.images || [b.featuredImage],
          author: b.author,
          readingTime: b.readingTime,
          content: b.content,
          metaTitle: b.metaTitle,
          metaDescription: b.metaDescription,
          canonicalUrl: b.canonicalUrl,
          tags: b.tags,
          status: 'PUBLISHED',
          isActive: true,
        },
      })
    } else {
      await prisma.blog.update({
        where: { id: existing.id },
        data: {
          title: b.title,
          category: b.category,
          excerpt: b.metaDescription,
          featuredImage: b.featuredImage,
          images: b.images || [b.featuredImage],
          author: b.author,
          readingTime: b.readingTime,
          content: b.content,
          metaTitle: b.metaTitle,
          metaDescription: b.metaDescription,
          canonicalUrl: b.canonicalUrl,
          tags: b.tags,
          isDeleted: false,
          isActive: true,
        }
      })
    }
  }

  // 4. Job Openings Migration
  for (let i = 0; i < jobOpeningsData.length; i++) {
    const j = jobOpeningsData[i]
    const existing = await prisma.jobOpening.findFirst({
      where: { title: j.title },
    })
    if (!existing) {
      await prisma.jobOpening.create({
        data: {
          title: j.title,
          department: j.department || 'Academics',
          location: j.location || 'Offline Hinjewadi',
          jobType: j.type || 'Full-Time',
          description: j.description,
          requirements: Array.isArray(j.requirements) ? j.requirements.join('\n') : j.requirements || '',
          displayOrder: i + 1,
          status: 'PUBLISHED',
          isActive: true,
        },
      })
    }
  }

  // 5. Placements Migration
  for (let i = 0; i < placedStudentsData.length; i++) {
    const p = placedStudentsData[i]
    const existing = await prisma.placement.findFirst({
      where: { studentName: p.name },
    })
    if (!existing) {
      await prisma.placement.create({
        data: {
          studentName: p.name,
          studentPhoto: p.image,
          companyName: p.company,
          companyLogo: p.companyLogo,
          package: p.package,
          designation: p.role,
          courseName: p.course || 'AI Practical Program',
          location: p.location || 'Pune',
          joiningYear: p.joiningYear || '2024',
          displayOrder: i + 1,
          isActive: true,
        },
      })
    } else {
      await prisma.placement.update({
        where: { id: existing.id },
        data: {
          courseName: p.course || 'AI Practical Program',
          companyName: p.company,
          package: p.package,
          designation: p.role,
        },
      })
    }
  }

  // 6. Testimonials Migration
  for (let i = 0; i < testimonialsData.length; i++) {
    const tm = testimonialsData[i]
    const existing = await prisma.testimonial.findFirst({
      where: { studentName: tm.studentName },
    })
    if (!existing) {
      await prisma.testimonial.create({
        data: {
          studentName: tm.studentName,
          heading: tm.heading,
          photo: tm.image,
          course: tm.courseTaken,
          role: tm.role,
          company: tm.company,
          rating: tm.rating || 5,
          review: tm.review,
          isVideo: tm.isVideo ?? false,
          videoUrl: tm.videoUrl,
          videoThumbnail: tm.videoThumbnail,
          studentStory: tm.studentStory,
          featured: tm.isFeatured ?? false,
          displayOrder: i + 1,
          isActive: true,
        },
      })
    } else {
      await prisma.testimonial.update({
        where: { id: existing.id },
        data: {
          course: tm.courseTaken,
          heading: tm.heading,
          review: tm.review,
        },
      })
    }
  }

  // 7. FAQs Migration
  for (let i = 0; i < faqsData.length; i++) {
    const f = faqsData[i]
    const existing = await prisma.faq.findFirst({
      where: { question: f.question },
    })
    if (!existing) {
      await prisma.faq.create({
        data: {
          question: f.question,
          answer: f.answer,
          displayOrder: i + 1,
          isActive: true,
        },
      })
    }
  }

  // 10. Gallery Migration
  for (let i = 0; i < galleryData.length; i++) {
    const g = galleryData[i] as any
    const gUrl = g.src || g.fileUrl || g.imageUrl || g.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'
    const existing = await prisma.gallery.findFirst({
      where: { fileUrl: gUrl },
    })
    if (!existing) {
      await prisma.gallery.create({
        data: {
          album: g.category || 'Campus',
          category: g.category || 'Classroom',
          fileUrl: gUrl,
          altText: g.alt || g.caption || 'QIMD Gallery Image',
          caption: g.caption || 'QIMD Practical Session',
          displayOrder: i + 1,
        },
      })
    }
  }

  // 11. Banners Migration
  const defaultBanners = [
    {
      title: 'Digital Marketing Program Banner',
      imageUrl: '/images/Banner/web banner_digital marketing 2.jpg.jpeg',
      displayOrder: 1,
      isActive: true,
      badge: 'CAREER BOOSTER',
      tag: '100% Job Assistance'
    },
    {
      title: 'Graphic Designer Program Banner',
      imageUrl: '/images/Banner/web banner_graphic designer  2.jpg.jpeg',
      displayOrder: 2,
      isActive: true,
      badge: 'CAREER BOOSTER',
      tag: '100% Job Assistance'
    },
    {
      title: 'Video Editor Program Banner',
      imageUrl: '/images/Banner/web banner_video editor  2.jpg.jpeg',
      displayOrder: 3,
      isActive: true,
      badge: 'CAREER BOOSTER',
      tag: '100% Job Assistance'
    }
  ]

  for (const b of defaultBanners) {
    const existing = await prisma.banner.findFirst({ where: { imageUrl: b.imageUrl } })
    if (!existing) {
      await prisma.banner.create({ data: b })
    }
  }

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Migration Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
