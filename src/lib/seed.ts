import { db } from './db'
import { hashPassword } from './auth'
import {
  blogsData,
  testimonialsData,
  placedStudentsData,
  placementPartnersData,
  galleryData,
  faqsData,
  emiPartnersData,
  jobOpeningsData,
} from '@/data'


export async function seedDatabase() {
  console.log('--- Starting Database Seeding ---')

  // 1. Seed Roles (Support both exact enum role codes & display names)
  const superAdminRole = await db.role.upsert({
    where: { roleName: 'SUPER_ADMIN' },
    update: {},
    create: {
      roleName: 'SUPER_ADMIN',
      description: 'Super Administrator with full access to CMS, CRM, settings, and user management',
    },
  })

  const adminRole = await db.role.upsert({
    where: { roleName: 'ADMIN' },
    update: {},
    create: {
      roleName: 'ADMIN',
      description: 'Administrator with access to CMS and CRM management',
    },
  })

  const employeeRole = await db.role.upsert({
    where: { roleName: 'EMPLOYEE' },
    update: {},
    create: {
      roleName: 'EMPLOYEE',
      description: 'Employee account with operational access',
    },
  })

  const contentManagerRole = await db.role.upsert({
    where: { roleName: 'CONTENT_MANAGER' },
    update: {},
    create: {
      roleName: 'CONTENT_MANAGER',
      description: 'Content Manager with access to pages, sections, courses, blogs, gallery, and media',
    },
  })

  // 2. Remove Old Admin Accounts (keep ONLY the 4 requested accounts active)
  const activeEmails = ['superadmin@gmail.com', 'admin@gmail.com', 'employee@gmail.com', 'cm@gmail.com']
  await db.user.deleteMany({
    where: {
      email: { notIn: activeEmails },
    },
  })

  // 3. Seed ONLY the 4 active accounts with securely hashed passwords
  const superadminHash = await hashPassword('Superadmin@123')
  const adminHash = await hashPassword('Admin@123')
  const employeeHash = await hashPassword('Employee@123')
  const cmHash = await hashPassword('Content@123')

  // Account 1: Super Admin
  const adminUser = await db.user.upsert({
    where: { email: 'superadmin@gmail.com' },
    update: {
      passwordHash: superadminHash,
      status: true,
      roleId: superAdminRole.id,
    },
    create: {
      fullName: 'Super Admin',
      email: 'superadmin@gmail.com',
      passwordHash: superadminHash,
      phone: '+919000000000',
      roleId: superAdminRole.id,
      status: true,
    },
  })

  // Account 2: Admin
  await db.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      passwordHash: adminHash,
      status: true,
      roleId: adminRole.id,
    },
    create: {
      fullName: 'Administrator',
      email: 'admin@gmail.com',
      passwordHash: adminHash,
      phone: '+919000000001',
      roleId: adminRole.id,
      status: true,
    },
  })

  // Account 3: Employee
  await db.user.upsert({
    where: { email: 'employee@gmail.com' },
    update: {
      passwordHash: employeeHash,
      status: true,
      roleId: employeeRole.id,
    },
    create: {
      fullName: 'Staff Employee',
      email: 'employee@gmail.com',
      passwordHash: employeeHash,
      phone: '+919000000002',
      roleId: employeeRole.id,
      status: true,
    },
  })

  // Account 4: Content Manager
  await db.user.upsert({
    where: { email: 'cm@gmail.com' },
    update: {
      passwordHash: cmHash,
      status: true,
      roleId: contentManagerRole.id,
    },
    create: {
      fullName: 'Content Manager',
      email: 'cm@gmail.com',
      passwordHash: cmHash,
      phone: '+919000000003',
      roleId: contentManagerRole.id,
      status: true,
    },
  })

  console.log('Active CMS/CRM user accounts seeded successfully (superadmin@gmail.com, admin@gmail.com, employee@gmail.com, cm@gmail.com)')


  // 3. Seed Course Categories
  const categoryMarketing = await db.courseCategory.upsert({
    where: { slug: 'digital-marketing' },
    update: {},
    create: {
      name: 'Digital Marketing',
      slug: 'digital-marketing',
      description: 'AI-powered digital marketing practical programs',
      displayOrder: 1,
    },
  })

  const categoryDesign = await db.courseCategory.upsert({
    where: { slug: 'graphic-design' },
    update: {},
    create: {
      name: 'Graphic Design',
      slug: 'graphic-design',
      description: 'AI-driven visual design & branding programs',
      displayOrder: 2,
    },
  })

  const categoryVideo = await db.courseCategory.upsert({
    where: { slug: 'video-editing' },
    update: {},
    create: {
      name: 'Video Editing',
      slug: 'video-editing',
      description: 'AI video production, motion design & post-production',
      displayOrder: 3,
    },
  })

  // 4. Seed Trainers
  const trainer1 = await db.trainer.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      fullName: 'Expert Industry Mentor',
      photo: '/images/trainers/trainer1.jpg',
      designation: 'Lead AI Digital Marketing Specialist',
      qualification: 'MBA Marketing, Certified Performance Marketer',
      experience: '10+ Years',
      biography: 'Specialized in performance marketing, AI prompt engineering, SEO, and paid media strategy.',
      skills: ['Performance Marketing', 'SEO', 'AI Tools', 'Google Ads', 'Meta Ads'],
      email: 'mentors@qimd.in',
      phone: '+919000000000',
      featured: true,
      displayOrder: 1,
    },
  })

  // 5. Seed Courses
  const course1 = await db.course.upsert({
    where: { slug: 'ai-powered-digital-marketing-course' },
    update: {},
    create: {
      courseName: 'AI Powered Digital Marketing Course',
      slug: 'ai-powered-digital-marketing-course',
      categoryId: categoryMarketing.id,
      trainerId: trainer1.id,
      shortDescription: 'Join QIMD’s AI-Powered & Performance-Driven Practical Training Program in Digital Marketing with 100% Job Assistance & Placement Opportunities.',
      description: 'Comprehensive 6-month offline practical training covering SEO, SEM, Social Media Marketing, AI Marketing Tools, Content Strategy, Analytics, and Live Client Projects.',
      bannerImage: '/images/courses/marketing-banner.jpg',
      duration: '6 Months',
      fees: 45000,
      discountPrice: 35000,
      eligibility: '10th / 12th / Graduate / Working Professional',
      courseMode: 'Offline',
      level: 'Beginner to Advanced',
      syllabus: 'Module 1: Fundamentals of Marketing\nModule 2: AI Tools for Digital Marketing\nModule 3: Website Creation & SEO\nModule 4: Google Ads & Meta Ads\nModule 5: Live Client Case Studies',
      learningOutcomes: 'Master AI marketing tools, manage live budgets, earn industry certifications, and gain guaranteed placement assistance.',
      certification: 'QIMD Industry Specialist Certificate + Google & Hubspot Certifications',
      featured: true,
      displayOrder: 1,
      status: 'PUBLISHED',
      isActive: true,
    },
  })

  await db.course.upsert({
    where: { slug: 'ai-powered-graphic-design-course' },
    update: {},
    create: {
      courseName: 'AI Powered Graphic Design Course',
      slug: 'ai-powered-graphic-design-course',
      categoryId: categoryDesign.id,
      trainerId: trainer1.id,
      shortDescription: 'Master visual branding, vector graphics, UI principles, and AI image generation with hands-on client projects.',
      description: 'Master Adobe Photoshop, Illustrator, InDesign, Midjourney, Canva AI, and branding workflows.',
      bannerImage: '/images/courses/design-banner.jpg',
      duration: '6 Months',
      fees: 40000,
      discountPrice: 32000,
      eligibility: 'Open for all design enthusiasts',
      courseMode: 'Offline',
      level: 'Beginner to Advanced',
      syllabus: 'Module 1: Graphic Design Principles\nModule 2: Adobe Photoshop & Illustrator\nModule 3: Generative AI for Designers\nModule 4: Portfolio Building',
      certification: 'QIMD Graphic Design Professional Certificate',
      featured: true,
      displayOrder: 2,
      status: 'PUBLISHED',
      isActive: true,
    },
  })

  await db.course.upsert({
    where: { slug: 'ai-powered-video-editing-course' },
    update: {},
    create: {
      courseName: 'AI Powered Video Editing Course',
      slug: 'ai-powered-video-editing-course',
      categoryId: categoryVideo.id,
      trainerId: trainer1.id,
      shortDescription: 'Learn Premiere Pro, After Effects, AI video enhancement, color grading, and commercial video creation.',
      description: 'Master non-linear editing, motion graphics, audio mastering, sound design, and automated AI video tools.',
      bannerImage: '/images/courses/video-banner.jpg',
      duration: '6 Months',
      fees: 45000,
      discountPrice: 36000,
      eligibility: 'Anyone interested in video production',
      courseMode: 'Offline',
      level: 'Beginner to Advanced',
      syllabus: 'Module 1: Video Editing Fundamentals\nModule 2: Premiere Pro & After Effects\nModule 3: Sound Design & Color Grading\nModule 4: Generative AI Video Tools',
      certification: 'QIMD Video Production Certificate',
      featured: true,
      displayOrder: 3,
      status: 'PUBLISHED',
      isActive: true,
    },
  })

  // Clear existing content tables to purge any unreflected or mock data
  await db.blog.deleteMany()
  await db.testimonial.deleteMany()
  await db.placement.deleteMany()
  await db.partner.deleteMany()
  await db.emiPartner.deleteMany()
  await db.gallery.deleteMany()
  await db.faq.deleteMany()
  await db.jobOpening.deleteMany()

  // 6. Seed Blogs strictly from website data (blogsData)
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
        readingTime: Number(b.readTime ? b.readTime.replace(/[^0-9]/g, '') : 5) || 5,
        content: b.excerpt + '\n\nIn our offline training program at QIMD Hinjewadi Pune, students get hands-on experience using these cutting-edge tools on live client projects.',
        status: 'PUBLISHED',
        isActive: true,
      },
    })
  }

  // 7. Seed Testimonials strictly from website data (testimonialsData)
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

  // 8. Seed FAQs strictly from website data (faqsData)
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

  // 9. Seed Placements strictly from website data (placedStudentsData)
  for (let i = 0; i < placedStudentsData.length; i++) {
    const p = placedStudentsData[i]
    await db.placement.create({
      data: {
        studentName: p.name,
        studentPhoto: p.image,
        companyName: p.company,
        companyLogo: p.image,
        package: p.package,
        designation: p.role,
        courseName: p.course,
        courseId: course1.id,
        location: p.location,
        joiningYear: p.joiningYear,
        isVideo: p.isVideo || false,
        videoUrl: p.videoUrl || null,
        videoThumbnail: p.videoThumbnail || null,
        isVerified: p.isVerified !== undefined ? p.isVerified : true,
        successStory: p.shortSuccessStory,
        featured: true,
        displayOrder: i + 1,
        isActive: true,
      },
    })
  }

  // 10. Seed Hiring Partners strictly from website data (placementPartnersData)
  for (let i = 0; i < placementPartnersData.length; i++) {
    const partner = placementPartnersData[i]
    await db.partner.create({
      data: {
        name: partner.name,
        logo: partner.logo,
        type: 'HIRING',
        displayOrder: i + 1,
        isActive: true,
      },
    })
  }

  // 11. Seed EMI Partners strictly from website data (emiPartnersData)
  for (let i = 0; i < emiPartnersData.length; i++) {
    const emi = emiPartnersData[i]
    await db.emiPartner.create({
      data: {
        name: emi.name,
        logo: emi.logo,
        description: '0% Interest EMI Option for QIMD Practical Courses',
        displayOrder: i + 1,
        isActive: true,
      },
    })
  }

  // 12. Seed Campus Gallery strictly from website data (galleryData)
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

  // 13. Seed Job Openings strictly from website data (jobOpeningsData)
  for (let i = 0; i < jobOpeningsData.length; i++) {
    const j = jobOpeningsData[i]
    await db.jobOpening.create({
      data: {
        title: j.title,
        department: j.department,
        location: j.location,
        jobType: j.type,
        description: j.description,
        requirements: Array.isArray(j.requirements) ? j.requirements.join('\n') : String(j.requirements || ''),
        displayOrder: i + 1,
        status: 'PUBLISHED',
        isActive: true,
      },
    })
  }



  // 11. Seed Website Settings
  const existingSettings = await db.websiteSettings.findFirst()
  if (!existingSettings) {
    await db.websiteSettings.create({
      data: {
        websiteName: 'QIMD - Quickup Institute of Marketing & Design',
        contactEmail: 'info@qimd.in',
        contactPhone: '+91 90000 00000',
        whatsappNumber: '+91 90000 00000',
        address: 'Hinjewadi Phase 1, Near IT Park, Pune, Maharashtra 411057',
        googleMap: 'https://maps.google.com',
        socialLinks: {
          instagram: 'https://instagram.com/qimd',
          facebook: 'https://facebook.com/qimd',
          youtube: 'https://youtube.com/qimd',
          linkedin: 'https://linkedin.com/company/qimd',
          twitter: 'https://twitter.com/qimd',
        },
        theme: 'LIGHT',
      },
    })
  }

  // 12. Seed 19 SRS Web Pages into PostgreSQL
  const defaultWebPages = [
    {
      pageName: 'Home Page',
      pageKey: 'HOME',
      slug: '/',
      description: 'QIMD Main Landing Page with hero banner, courses grid, statistics, placements, and lead capture form.',
      metaTitle: 'QIMD – AI-Powered Marketing & Design Institute Hinjewadi Pune',
      metaDescription: 'Join Quickup Institute of Marketing & Design (QIMD) for practical offline courses in AI Digital Marketing, Graphic Design, and Video Editing with 100% Job Assistance.',
      canonicalUrl: 'https://www.qimd.in/',
      ogImage: '/images/logo/qimd-logo.png',
    },
    {
      pageName: 'About Us',
      pageKey: 'ABOUT',
      slug: '/about',
      description: 'About QIMD, Vision, Mission, Founder Story, and Institute Core Values.',
      metaTitle: 'About Us – Quickup Institute of Marketing & Design (QIMD)',
      metaDescription: 'Learn about QIMD mission to bridge academic theory and real digital marketing agency execution in Pune.',
      canonicalUrl: 'https://www.qimd.in/about',
      ogImage: '/images/about-hero.jpg',
    },
    {
      pageName: 'Why QIMD',
      pageKey: 'WHY_QIMD',
      slug: '/why-qimd',
      description: 'Key advantages, practical learning approach, agency lab setup, and mentor benefits.',
      metaTitle: 'Why Choose QIMD – Pune’s Leading Practical Training Institute',
      metaDescription: 'Discover why students choose QIMD Hinjewadi Pune for offline hands-on skill development, live client campaign budgets, and placement support.',
      canonicalUrl: 'https://www.qimd.in/why-qimd',
      ogImage: '/images/why-qimd-hero.jpg',
    },
    {
      pageName: 'Courses & Programs',
      pageKey: 'COURSES',
      slug: '/courses',
      description: 'Complete listing of AI Digital Marketing, Graphic Design, and Video Editing courses.',
      metaTitle: 'AI-Powered Courses – Digital Marketing, Graphic Design & Video Editing',
      metaDescription: 'Explore industry-certified 6-month offline practical training courses with guaranteed placement assistance.',
      canonicalUrl: 'https://www.qimd.in/courses',
      ogImage: '/images/courses/marketing-banner.jpg',
    },
    {
      pageName: 'Trainers & Mentors',
      pageKey: 'TRAINERS',
      slug: '/trainers',
      description: 'Faculty profiles, industry experience, qualifications, and certifications.',
      metaTitle: 'Expert Industry Mentors & Faculty – QIMD Pune',
      metaDescription: 'Meet our senior marketing, graphic design, and video production mentors with 10+ years of digital agency experience.',
      canonicalUrl: 'https://www.qimd.in/trainers',
      ogImage: '/images/trainers/trainer1.jpg',
    },
    {
      pageName: 'Placements & Hiring',
      pageKey: 'PLACEMENTS',
      slug: '/placements',
      description: 'Student placement success stories, salary packages, and corporate hiring partners.',
      metaTitle: 'Placement Records & Alumni Success Stories – QIMD Pune',
      metaDescription: 'See our recent student placements in top digital marketing agencies and tech MNCs.',
      canonicalUrl: 'https://www.qimd.in/placements',
      ogImage: '/images/placements/student1.jpg',
    },
    {
      pageName: 'Campus Gallery',
      pageKey: 'GALLERY',
      slug: '/gallery',
      description: 'Classroom setup, computer labs, student events, and workshop photos.',
      metaTitle: 'Campus Gallery & Infrastructure – QIMD Hinjewadi Pune',
      metaDescription: 'Browse photos of QIMD Hinjewadi campus, practical lab setup, masterclasses, and student celebrations.',
      canonicalUrl: 'https://www.qimd.in/gallery',
      ogImage: '/images/gallery/lab1.jpg',
    },
    {
      pageName: 'Blogs & News',
      pageKey: 'BLOG',
      slug: '/blog',
      description: 'Industry insights, AI marketing trends, design tutorials, and career tips.',
      metaTitle: 'Digital Marketing & Design Blog – QIMD Insights',
      metaDescription: 'Read latest articles on AI marketing tools, performance ad strategies, graphic design techniques, and career growth.',
      canonicalUrl: 'https://www.qimd.in/blog',
      ogImage: '/images/blog/blog-1.jpg',
    },
    {
      pageName: 'Frequently Asked Questions',
      pageKey: 'FAQS',
      slug: '/faqs',
      description: 'Accordion of common questions on course duration, eligibility, fees, offline batches, and placements.',
      metaTitle: 'Frequently Asked Questions (FAQs) – QIMD Pune',
      metaDescription: 'Find quick answers regarding admissions, offline batch timings, practical projects, course fees, and 100% job assistance.',
      canonicalUrl: 'https://www.qimd.in/faqs',
      ogImage: '/images/logo/qimd-logo.png',
    },
    {
      pageName: 'Contact Us',
      pageKey: 'CONTACT',
      slug: '/contact',
      description: 'Contact form, campus address, phone number, email, and interactive Google map location.',
      metaTitle: 'Contact Us – QIMD Hinjewadi Pune Campus',
      metaDescription: 'Get in touch with QIMD admissions team, visit our Hinjewadi campus, or send us your enquiry.',
      canonicalUrl: 'https://www.qimd.in/contact',
      ogImage: '/images/logo/qimd-logo.png',
    },
    {
      pageName: 'Careers & Hiring Openings',
      pageKey: 'CAREERS',
      slug: '/careers',
      description: 'Open job vacancies at QIMD for trainers, counselors, and administrative staff.',
      metaTitle: 'Career Opportunities at QIMD – Join Our Team',
      metaDescription: 'Explore open teaching and management positions at QIMD Hinjewadi Pune.',
      canonicalUrl: 'https://www.qimd.in/careers',
      ogImage: '/images/logo/qimd-logo.png',
    },
    {
      pageName: 'Franchise Partnership',
      pageKey: 'FRANCHISE',
      slug: '/cause/franchise',
      description: 'Franchise opportunity overview, investment requirements, and partner inquiry form.',
      metaTitle: 'Franchise Partnership Opportunity – QIMD Expansion',
      metaDescription: 'Partner with QIMD to open an AI Digital Marketing & Design institute in your city.',
      canonicalUrl: 'https://www.qimd.in/cause/franchise',
      ogImage: '/images/logo/qimd-logo.png',
    },
    {
      pageName: 'Admission & Brochure Request',
      pageKey: 'ADMISSION',
      slug: '/admission',
      description: 'Online brochure download form and admission application gateway.',
      metaTitle: 'Admissions Open – Request Syllabus & Brochure – QIMD',
      metaDescription: 'Apply online for upcoming offline batches or download full course curriculum brochures.',
      canonicalUrl: 'https://www.qimd.in/admission',
      ogImage: '/images/logo/qimd-logo.png',
    },
    {
      pageName: 'Corporate Hiring (Hire From Us)',
      pageKey: 'HIRE_FROM_US',
      slug: '/hire-from-us',
      description: 'Portal for companies and digital agencies to hire trained QIMD graduates.',
      metaTitle: 'Hire Trained Digital Marketers & Designers – QIMD Placement Cell',
      metaDescription: 'Hire job-ready candidates trained on live agency client campaigns with zero recruitment fee.',
      canonicalUrl: 'https://www.qimd.in/hire-from-us',
      ogImage: '/images/logo/qimd-logo.png',
    },
    {
      pageName: 'Documentation & Guide',
      pageKey: 'DOCUMENTATION',
      slug: '/documentation',
      description: 'Student academic guidelines, code of conduct, and lab rules.',
      metaTitle: 'Student Documentation & Academic Rules – QIMD',
      metaDescription: 'Read QIMD academic policies, attendance requirements, and certification guidelines.',
      canonicalUrl: 'https://www.qimd.in/documentation',
      ogImage: '/images/logo/qimd-logo.png',
    },
    {
      pageName: 'Events & Masterclasses',
      pageKey: 'EVENTS',
      slug: '/events',
      description: 'Upcoming guest lectures, agency workshops, and student hackathons.',
      metaTitle: 'Upcoming Events & Industry Masterclasses – QIMD',
      metaDescription: 'Join free workshops and masterclasses on AI marketing and visual branding at QIMD Pune.',
      canonicalUrl: 'https://www.qimd.in/events',
      ogImage: '/images/logo/qimd-logo.png',
    },
    {
      pageName: 'Privacy Policy',
      pageKey: 'PRIVACY_POLICY',
      slug: '/privacy-policy',
      description: 'Privacy policy, data collection terms, and cookie usage.',
      metaTitle: 'Privacy Policy – QIMD',
      metaDescription: 'Read how QIMD protects user data and handles contact form information.',
      canonicalUrl: 'https://www.qimd.in/privacy-policy',
      ogImage: '/images/logo/qimd-logo.png',
    },
    {
      pageName: 'Terms & Conditions',
      pageKey: 'TERMS',
      slug: '/terms-and-conditions',
      description: 'Website terms of use, enrollment conditions, and institute rules.',
      metaTitle: 'Terms & Conditions – QIMD',
      metaDescription: 'Understand terms governing student enrollment, website usage, and training rules.',
      canonicalUrl: 'https://www.qimd.in/terms-and-conditions',
      ogImage: '/images/logo/qimd-logo.png',
    },
    {
      pageName: 'Refund Policy',
      pageKey: 'REFUND_POLICY',
      slug: '/refund-policy',
      description: 'Fee payment, installment schedules, and refund policy rules.',
      metaTitle: 'Refund Policy – QIMD',
      metaDescription: 'Read QIMD course fee payment terms and cancellation guidelines.',
      canonicalUrl: 'https://www.qimd.in/refund-policy',
      ogImage: '/images/logo/qimd-logo.png',
    },
  ]

  for (const page of defaultWebPages) {
    await db.webPage.upsert({
      where: { pageKey: page.pageKey },
      update: {
        pageName: page.pageName,
        slug: page.slug,
        description: page.description,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        canonicalUrl: page.canonicalUrl,
        ogImage: page.ogImage,
        status: 'PUBLISHED',
      },
      create: {
        pageName: page.pageName,
        pageKey: page.pageKey,
        slug: page.slug,
        description: page.description,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        canonicalUrl: page.canonicalUrl,
        ogImage: page.ogImage,
        status: 'PUBLISHED',
      },
    })
  }

  // Link PageSections to WebPages
  const webPagesMap = await db.webPage.findMany()
  const pageIdMap: Record<string, string> = {}
  webPagesMap.forEach((wp) => {
    pageIdMap[wp.pageKey] = wp.id
  })

  // Seed Default Page Sections
  const defaultPageSections = [
    {
      pageKey: 'HOME',
      sectionKey: 'HERO',
      sectionTitle: 'AI-Powered Practical Training in Digital Marketing & Design',
      subtitle: 'Master performance marketing, graphic design, video editing & AI tools with 100% placement support in Hinjewadi, Pune.',
      content: 'Join QIMD’s industry-focused practical classroom programs designed by digital agency leaders.',
      image: '/images/hero-banner.jpg',
      buttonText: 'Explore Courses',
      buttonUrl: '/courses',
      displayOrder: 1,
    },
    {
      pageKey: 'HOME',
      sectionKey: 'WHY_CHOOSE_US',
      sectionTitle: 'Why Choose Quickup Institute of Marketing & Design?',
      subtitle: 'Offline practical learning, live client budget execution, and dedicated mentor support.',
      content: 'We provide hands-on training with real budgets, software licenses, and direct interview opportunities.',
      image: '/images/why-choose-us.jpg',
      buttonText: 'Join Next Batch',
      buttonUrl: '/contact',
      displayOrder: 2,
    },
    {
      pageKey: 'HOME',
      sectionKey: 'PLACEMENT_BANNER',
      sectionTitle: '100% Job Assistance & Hiring Partners',
      subtitle: 'Over 500+ students placed in top digital agencies, tech firms, and MNCs.',
      content: 'Get resume building, mock interviews, portfolio review, and direct agency interview schedules.',
      image: '/images/placements-banner.jpg',
      buttonText: 'View Placements',
      buttonUrl: '/placements',
      displayOrder: 3,
    },
    {
      pageKey: 'ABOUT',
      sectionKey: 'HERO',
      sectionTitle: 'About Quickup Institute of Marketing & Design (QIMD)',
      subtitle: 'Pune’s premier institute for practical AI-driven skill education in marketing, graphic design & video production.',
      content: 'Founded to bridge the gap between academic theory and real agency requirements.',
      image: '/images/about-hero.jpg',
      buttonText: 'Learn More',
      buttonUrl: '/why-qimd',
      displayOrder: 1,
    },
    {
      pageKey: 'WHY_QIMD',
      sectionKey: 'HERO',
      sectionTitle: 'Why Choose QIMD Hinjewadi Pune?',
      subtitle: 'State-of-the-art classroom labs, live client campaigns, and direct industry exposure.',
      content: 'Located in the heart of Pune IT Hub - Hinjewadi Phase 1.',
      image: '/images/why-qimd-hero.jpg',
      buttonText: 'Book Free Demo Class',
      buttonUrl: '/contact',
      displayOrder: 1,
    },
    {
      pageKey: 'CONTACT',
      sectionKey: 'HERO',
      sectionTitle: 'Get in Touch with QIMD Admissions & Support',
      subtitle: 'Visit our Hinjewadi Pune campus or reach out via phone, email, or WhatsApp.',
      content: 'Hinjewadi Phase 1, Near IT Park, Pune, Maharashtra 411057.',
      image: '/images/contact-hero.jpg',
      buttonText: 'Get Directions',
      buttonUrl: 'https://maps.google.com',
      displayOrder: 1,
    },
  ]

  for (const ps of defaultPageSections) {
    const existingSection = await db.pageSection.findFirst({
      where: { pageKey: ps.pageKey, sectionKey: ps.sectionKey },
    })
    if (existingSection) {
      await db.pageSection.update({
        where: { id: existingSection.id },
        data: {
          pageId: pageIdMap[ps.pageKey] || null,
          sectionTitle: ps.sectionTitle,
          subtitle: ps.subtitle,
          content: ps.content,
          image: ps.image,
          buttonText: ps.buttonText,
          buttonUrl: ps.buttonUrl,
          displayOrder: ps.displayOrder,
          status: 'PUBLISHED',
          isActive: true,
        },
      })
    } else {
      await db.pageSection.create({
        data: {
          pageId: pageIdMap[ps.pageKey] || null,
          pageKey: ps.pageKey,
          sectionKey: ps.sectionKey,
          sectionTitle: ps.sectionTitle,
          subtitle: ps.subtitle,
          content: ps.content,
          image: ps.image,
          buttonText: ps.buttonText,
          buttonUrl: ps.buttonUrl,
          displayOrder: ps.displayOrder,
          status: 'PUBLISHED',
          isActive: true,
        },
      })
    }
  }

  console.log('--- Database Seeding Completed Successfully ---')
}



