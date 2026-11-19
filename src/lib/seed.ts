import { db } from './db'
import { hashPassword } from './auth'
import {
  blogsData,
  testimonialsData,
  placedStudentsData,
  galleryData,
  faqsData,
  jobOpeningsData,
} from '@/data'

export async function seedDatabase() {
  console.log('--- Starting Database Seeding ---')

  // ============================================================
  // 1. SEED CMS / CRM USERS
  // ============================================================

  const activeEmails = [
    'superadmin@gmail.com',
    'admin@gmail.com',
    'seo@qimd.com', // SEO blog editor (created separately; not reset here)
  ]

  // Remove all users except the required CMS/CRM accounts
  await db.user.deleteMany({
    where: {
      email: {
        notIn: activeEmails,
      },
    },
  })

  // Password hashes
  const superadminHash = await hashPassword('Superadmin@123')
  const adminHash = await hashPassword('Admin@123')

  // Super Admin
  const adminUser = await db.user.upsert({
    where: {
      email: 'superadmin@gmail.com',
    },
    update: {
      passwordHash: superadminHash,
      status: true,
      role: 'SUPER_ADMIN',
    },
    create: {
      fullName: 'Super Admin',
      email: 'superadmin@gmail.com',
      passwordHash: superadminHash,
      phone: '+919000000000',
      role: 'SUPER_ADMIN',
      status: true,
    },
  })

  // Admin
  await db.user.upsert({
    where: {
      email: 'admin@gmail.com',
    },
    update: {
      passwordHash: adminHash,
      status: true,
      role: 'ADMIN',
    },
    create: {
      fullName: 'Administrator',
      email: 'admin@gmail.com',
      passwordHash: adminHash,
      phone: '+919000000001',
      role: 'ADMIN',
      status: true,
    },
  })

  console.log(
    'CMS/CRM user accounts seeded successfully: superadmin@gmail.com, admin@gmail.com'
  )

  // ============================================================
  // 5. CLEAR OLD CMS CONTENT
  // ============================================================

  await db.blog.deleteMany()
  await db.testimonial.deleteMany()
  await db.studentReview.deleteMany()
  await db.placement.deleteMany()
  await db.gallery.deleteMany()
  await db.faq.deleteMany()
  await db.jobOpening.deleteMany()

  // ============================================================
  // 6. SEED BLOGS
  // ============================================================

  for (const b of blogsData) {
    await db.blog.create({
      data: {
        title: b.title,
        slug: b.slug,
        category: b.category,
        excerpt: b.excerpt,
        featuredImage: b.coverImage,
        images: b.images || [],
        tags: b.tags || [],
        author: b.author,
        authorId: adminUser.id,

        readingTime:
          Number(
            b.readTime
              ? b.readTime.replace(/[^0-9]/g, '')
              : 5
          ) || 5,

        content:
          b.excerpt +
          '\n\nIn our offline training program at QIMD Hinjewadi Pune, students get hands-on experience using these cutting-edge tools on live client projects.',

        status: 'PUBLISHED',
        isActive: true,
      },
    })
  }

  // ============================================================
  // 7. SEED TESTIMONIALS
  // ============================================================

  for (let i = 0; i < testimonialsData.length; i++) {
    const t = testimonialsData[i]

    await db.testimonial.create({
      data: {
        studentName: t.studentName,
        photo: t.image,
        course: t.courseTaken,
        role: t.role,
        company: t.company,
        rating: t.rating,
        review: t.review,

        isVideo: t.isVideo || false,
        videoUrl: t.videoUrl || null,
        videoThumbnail: t.videoThumbnail || null,
        studentStory: t.studentStory || null,

        featured: t.isFeatured || false,
        displayOrder: i + 1,

        createdById: adminUser.id,
        isActive: true,
      },
    })
  }

  // ============================================================
  // 8. SEED STUDENT REVIEWS
  // ============================================================

  const defaultStudentReviews = [
    {
      studentName: 'Rohan V.',
      course: 'Digital Marketing Master Program',
      review:
        'The practical training and live client projects helped me build confidence and prepare for interviews. The trainers were supportive throughout my learning journey.',
      rating: 5,
      company: 'Growth Media Agency',
      displayOrder: 1,
      isActive: true,
    },
    {
      studentName: 'Sneha M.',
      course: 'UI/UX & Graphic Design Course',
      review:
        'The AI-powered curriculum, internships, and placement guidance gave me the skills I needed to start my career with confidence.',
      rating: 5,
      company: 'Creative Studio',
      displayOrder: 2,
      isActive: true,
    },
    {
      studentName: 'Aniket K.',
      course: 'Video Editing & Content Creation',
      review:
        'Unlike traditional institutes, QIMD focuses on practical implementation. Every assignment and project helped me understand how the industry actually works.',
      rating: 5,
      company: 'Media House',
      displayOrder: 3,
      isActive: true,
    },
    {
      studentName: 'Pooja S.',
      course: 'Full-Stack Digital Marketing & AI',
      review:
        'From zero experience to working on real client projects, the journey at QIMD has been truly rewarding. I highly recommend it to anyone looking to build a career in the digital industry.',
      rating: 5,
      company: 'Tech Agency',
      displayOrder: 4,
      isActive: true,
    },
  ]

  for (const review of defaultStudentReviews) {
    await db.studentReview.create({
      data: review,
    })
  }

  // ============================================================
  // 9. SEED FAQs
  // ============================================================

  for (let i = 0; i < faqsData.length; i++) {
    const f = faqsData[i]

    await db.faq.create({
      data: {
        question: f.question,
        answer: f.answer,
        displayOrder: i + 1,
        createdById: adminUser.id,
        isActive: true,
      },
    })
  }

  // ============================================================
  // 10. SEED PLACEMENTS
  // ============================================================

  for (let i = 0; i < placedStudentsData.length; i++) {
    const p = placedStudentsData[i]

    await db.placement.create({
      data: {
        studentName: p.name,
        studentPhoto: p.image,

        companyName: p.company,

        // Kept for compatibility with existing schema.
        // If your new schema removes companyLogo, remove this field.
        companyLogo: p.image,

        package: p.package,
        designation: p.role,
        courseName: p.course,

        location: p.location,
        joiningYear: p.joiningYear,

        isVideo: p.isVideo || false,
        videoUrl: p.videoUrl || null,
        videoThumbnail: p.videoThumbnail || null,

        isVerified:
          p.isVerified !== undefined
            ? p.isVerified
            : true,

        successStory: p.shortSuccessStory,

        featured: true,
        displayOrder: i + 1,
        isActive: true,
      },
    })
  }

  // ============================================================
  // 13. SEED CAMPUS GALLERY
  // ============================================================

  for (let i = 0; i < galleryData.length; i++) {
    const g = galleryData[i]

    await db.gallery.create({
      data: {
        fileUrl: g.src,
        altText: g.alt,
        category: g.category,
        caption: g.caption,
        displayOrder: i + 1,
        createdById: adminUser.id,
      },
    })
  }

  // ============================================================
  // 14. SEED JOB OPENINGS
  // ============================================================

  for (let i = 0; i < jobOpeningsData.length; i++) {
    const j = jobOpeningsData[i]

    await db.jobOpening.create({
      data: {
        title: j.title,
        department: j.department,
        location: j.location,
        jobType: j.type,
        description: j.description,

        requirements: Array.isArray(j.requirements)
          ? j.requirements.join('\n')
          : String(j.requirements || ''),

        displayOrder: i + 1,
        status: 'PUBLISHED',
        isActive: true,
      },
    })
  }

  // ============================================================
  // COMPLETE
  // ============================================================

  console.log(
    '--- Database Seeding Completed Successfully ---'
  )
}