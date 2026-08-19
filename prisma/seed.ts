import { PrismaClient } from '@prisma/client'
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
  jobOpeningsData,
} from '../src/data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting QIMD Full Website Migration to PostgreSQL Database...')

  // 1. Course Categories & Courses
  let defaultCategory = await prisma.courseCategory.findFirst({
    where: { slug: 'ai-courses' },
  })
  if (!defaultCategory) {
    defaultCategory = await prisma.courseCategory.create({
      data: {
        name: 'AI Practical Courses',
        slug: 'ai-courses',
        description: 'Industry-Oriented AI Powered Training Programs',
        status: true,
      },
    })
  }

  for (const c of coursesData) {
    const existing = await prisma.course.findFirst({
      where: { slug: c.slug },
    })
    if (!existing) {
      await prisma.course.create({
        data: {
          courseName: c.title,
          slug: c.slug,
          categoryId: defaultCategory.id,
          description: c.description || c.title,
          bannerImage: c.image,
          duration: c.duration || '6 Months',
          fees: 45000,
          discountPrice: 35000,
          learningOutcomes: Array.isArray(c.outcomes) ? c.outcomes.join('\n') : '',
          status: 'PUBLISHED',
          isActive: true,
        },
      })
    }
  }

  // 2. Trainers Migration & Teams Migration (Strict 3 Team Members in teams table & trainers table)
  const validTrainerNames = trainersData.map(t => t.fullName)
  await prisma.trainer.deleteMany({
    where: {
      fullName: { notIn: validTrainerNames }
    }
  })
  await prisma.teamMember.deleteMany({
    where: {
      fullName: { notIn: validTrainerNames }
    }
  })

  for (let i = 0; i < trainersData.length; i++) {
    const t = trainersData[i]
    
    // Seed trainers table
    const existingTrainer = await prisma.trainer.findFirst({
      where: { fullName: t.name || t.fullName },
    })
    if (!existingTrainer) {
      await prisma.trainer.create({
        data: {
          fullName: t.name || t.fullName,
          photo: t.photo,
          designation: t.designation,
          qualification: t.qualification,
          experience: t.experience,
          biography: t.biography,
          skills: [t.specialization || 'AI Tools'],
          linkedin: t.linkedin || '#',
          displayOrder: i + 1,
          isActive: true,
        },
      })
    } else {
      await prisma.trainer.update({
        where: { id: existingTrainer.id },
        data: {
          designation: t.designation,
          qualification: t.qualification,
          experience: t.experience,
          biography: t.biography,
          photo: t.photo,
          displayOrder: i + 1,
          isDeleted: false,
          isActive: true,
        }
      })
    }

    // Seed teams table
    const existingTeamMember = await prisma.teamMember.findFirst({
      where: { fullName: t.name || t.fullName },
    })
    if (!existingTeamMember) {
      await prisma.teamMember.create({
        data: {
          fullName: t.name || t.fullName,
          photo: t.photo,
          designation: t.designation,
          qualification: t.qualification,
          experience: t.experience,
          biography: t.biography,
          skills: [t.specialization || 'AI Tools'],
          linkedin: t.linkedin || '#',
          displayOrder: i + 1,
          isActive: true,
        },
      })
    } else {
      await prisma.teamMember.update({
        where: { id: existingTeamMember.id },
        data: {
          designation: t.designation,
          qualification: t.qualification,
          experience: t.experience,
          biography: t.biography,
          photo: t.photo,
          displayOrder: i + 1,
          isDeleted: false,
          isActive: true,
        }
      })
    }
  }

  // 3. Blogs Migration
  for (const b of blogsData) {
    const existing = await prisma.blog.findFirst({
      where: { slug: b.slug },
    })
    if (!existing) {
      await prisma.blog.create({
        data: {
          title: b.title,
          slug: b.slug,
          category: b.category || 'General',
          excerpt: b.excerpt,
          featuredImage: b.coverImage,
          images: b.images || [],
          author: b.author || 'QIMD Team',
          readingTime: parseInt(b.readTime || '5') || 5,
          content: b.content || '',
          status: 'PUBLISHED',
          isActive: true,
        },
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
          courseName: p.course || 'AI Practical Course',
          location: p.location || 'Pune',
          joiningYear: p.joiningYear || '2024',
          displayOrder: i + 1,
          isActive: true,
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

  // 8. Hiring Partners Migration
  for (let i = 0; i < placementPartnersData.length; i++) {
    const partner = placementPartnersData[i]
    const existing = await prisma.partner.findFirst({
      where: { name: partner.name },
    })
    if (!existing) {
      await prisma.partner.create({
        data: {
          name: partner.name,
          logo: partner.logo,
          type: 'HIRING',
          displayOrder: i + 1,
          isActive: true,
        },
      })
    }
  }

  // 9. EMI Partners Migration
  for (let i = 0; i < emiPartnersData.length; i++) {
    const emi = emiPartnersData[i]
    const existing = await prisma.emiPartner.findFirst({
      where: { name: emi.name },
    })
    if (!existing) {
      await prisma.emiPartner.create({
        data: {
          name: emi.name,
          logo: emi.logo,
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

  console.log('✅ Successful Full Website Content Migration to PostgreSQL Database!')
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
