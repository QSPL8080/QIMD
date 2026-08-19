'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export interface PageSectionInput {
  id?: string
  pageKey: string
  sectionKey: string
  sectionType: string
  sectionTitle?: string
  subtitle?: string
  content?: string
  image?: string
  buttonText?: string
  buttonUrl?: string
  extraData?: any
  displayOrder?: number
  status?: 'DRAFT' | 'PUBLISHED'
  isActive?: boolean
}

const DEFAULT_PAGES = [
  { pageKey: 'HOME', pageName: 'Home', slug: '/' },
  { pageKey: 'ABOUT', pageName: 'About Us', slug: '/about' },
  { pageKey: 'COURSES', pageName: 'Courses', slug: '/courses' },
  { pageKey: 'WHY_QIMD', pageName: 'Why QIMD', slug: '/why-qimd' },
  { pageKey: 'BLOGS', pageName: 'Blogs', slug: '/blog' },
  { pageKey: 'CAREER', pageName: 'Career', slug: '/careers' },
  { pageKey: 'CONTACT', pageName: 'Contact Us', slug: '/contact' },
  { pageKey: 'PRIVACY_POLICY', pageName: 'Privacy Policy', slug: '/privacy-policy' },
  { pageKey: 'TERMS', pageName: 'Terms & Conditions', slug: '/terms-and-conditions' },
  { pageKey: 'REFUND_POLICY', pageName: 'Refund Policy', slug: '/refund-policy' },
  { pageKey: 'ADMISSION', pageName: 'Admission Information', slug: '/admission' },
  { pageKey: 'SITEMAP', pageName: 'Sitemap', slug: '/sitemap' },
]

const DEFAULT_SECTIONS: Record<string, PageSectionInput[]> = {
  HOME: [
    {
      pageKey: 'HOME',
      sectionKey: 'HERO',
      sectionType: 'HERO',
      sectionTitle: "India's #1 AI-Powered Digital Marketing & Design Institute",
      subtitle: 'Master Practical AI Tools & Launch Your Dream Career',
      content: 'Gain hands-on training with 50+ AI tools, live agency projects, 100% placement assistance, and industry-recognized certifications.',
      image: '/images/hero/hero-banner.jpg',
      buttonText: 'Explore Courses',
      buttonUrl: '/courses',
      extraData: {
        cta2Text: 'Book Free Demo Class',
        cta2Url: '/contact',
        showForm: true,
        formTitle: 'Book Your Free Trial Class',
        badge: 'NEW BATCH STARTING THIS WEEK',
      },
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'HOME',
      sectionKey: 'COURSES',
      sectionType: 'COURSES',
      sectionTitle: 'Explore Job-Oriented Industry Courses',
      subtitle: 'Curated by Top Marketing & Design Agency Experts',
      content: 'Choose from specialized programs embedded with modern AI workflows.',
      buttonText: 'View All Courses',
      buttonUrl: '/courses',
      extraData: { limit: 6, featuredOnly: true, categoryFilter: 'ALL', displayStyle: 'GRID' },
      displayOrder: 2,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'HOME',
      sectionKey: 'WHY_QIMD',
      sectionType: 'WHY_QIMD',
      sectionTitle: 'Why Choose QIMD Institute?',
      subtitle: 'The Edge You Need in Today’s AI-Driven World',
      content: 'We combine rigorous practical agency exposure with cutting-edge AI automation skills.',
      extraData: {
        cards: [
          { title: '100% Practical Training', description: 'Work on live agency accounts instead of theoretical lectures.', icon: 'ion:construct-outline' },
          { title: 'AI-Integrated Curriculum', description: 'Master ChatGPT, Midjourney, Adobe Firefly, Canva AI & video generators.', icon: 'ion:hardware-chip-outline' },
          { title: 'Dedicated Placement Cell', description: 'Resume crafting, mock interviews, and direct referral drives.', icon: 'ion:trophy-outline' },
          { title: 'Flexible EMI Plans', description: '0% interest EMI options starting at just ₹2,500/month.', icon: 'ion:card-outline' },
        ],
      },
      displayOrder: 3,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'HOME',
      sectionKey: 'TESTIMONIALS',
      sectionType: 'TESTIMONIALS',
      sectionTitle: 'What Our Students Say',
      subtitle: 'Real Success Stories from QIMD Alumni',
      content: 'Hear directly from students who transformed their careers with QIMD.',
      extraData: { limit: 6, showVideoToggle: true },
      displayOrder: 4,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'HOME',
      sectionKey: 'PLACEMENT',
      sectionType: 'PLACEMENT',
      sectionTitle: 'Our Placed Students & Success Stories',
      subtitle: 'Placed at Top Marketing Agencies & MNCs',
      content: 'Over 1,200+ students successfully placed across top corporate brands.',
      extraData: { limit: 8, showCompanyLogos: true },
      displayOrder: 5,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'HOME',
      sectionKey: 'PARTNERS',
      sectionType: 'PARTNERS',
      sectionTitle: 'Our 250+ Hiring Partners',
      subtitle: 'Leading Companies Hiring Fresh Talent from QIMD',
      content: 'Our recruitment network spans top digital agencies, tech firms, and eCommerce giants.',
      extraData: { style: 'SLIDER', limit: 20 },
      displayOrder: 6,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'HOME',
      sectionKey: 'EMI_PARTNERS',
      sectionType: 'EMI_PARTNERS',
      sectionTitle: 'Easy No-Cost EMI Financing Partners',
      subtitle: 'Quality Education Made Affordable for Everyone',
      content: 'We partner with leading financial institutions to provide instant fee approval.',
      extraData: { limit: 6 },
      displayOrder: 7,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'HOME',
      sectionKey: 'GALLERY',
      sectionType: 'GALLERY',
      sectionTitle: 'Life & Campus at QIMD Institute',
      subtitle: 'Workshops, Hackathons, Agency Visits & Events',
      content: 'Take a glimpse into our vibrant learning environment.',
      extraData: { limit: 8, layout: 'GRID' },
      displayOrder: 8,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'HOME',
      sectionKey: 'ENQUIRY_FORM',
      sectionType: 'FORM_SECTION',
      sectionTitle: 'Ready to Upgrade Your Career?',
      subtitle: 'Talk to Our Career Counsellor Today',
      content: 'Get personalized guidance on selecting the best course for your career background.',
      buttonText: 'Submit Enquiry',
      extraData: { formType: 'ADMISSION', successMsg: 'Thank you! Our counsellor will call you shortly.' },
      displayOrder: 9,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'HOME',
      sectionKey: 'FAQ',
      sectionType: 'FAQ',
      sectionTitle: 'Frequently Asked Questions',
      subtitle: 'Got Questions? We Have Answers',
      content: 'Find answers to common questions about admissions, fees, and placements.',
      extraData: { limit: 10 },
      displayOrder: 10,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
  ABOUT: [
    {
      pageKey: 'ABOUT',
      sectionKey: 'HERO',
      sectionType: 'HERO',
      sectionTitle: 'Empowering Next-Gen Marketers & Designers',
      subtitle: 'About QIMD - Quickup Institute of Marketing & Design',
      content: 'Founded with a mission to bridge the gap between traditional education and high-demand digital skills.',
      image: '/images/about/about-hero.jpg',
      buttonText: 'Download Brochure',
      buttonUrl: '/contact',
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'ABOUT',
      sectionKey: 'VISION_MISSION',
      sectionType: 'RICH_TEXT',
      sectionTitle: 'Our Vision & Mission',
      subtitle: 'Driving Innovation in Skill Education',
      content: '<p>At QIMD, our vision is to nurture world-class creative and analytical professionals who excel in the modern AI economy. We provide 100% project-based learning guided by seasoned industry practitioners.</p>',
      displayOrder: 2,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'ABOUT',
      sectionKey: 'WHY_QIMD',
      sectionType: 'WHY_QIMD',
      sectionTitle: 'Why Choose QIMD?',
      subtitle: 'What Makes Us Pune’s Top Rated Institute',
      content: 'Practical hands-on training, industry certification, and guaranteed job assistance.',
      displayOrder: 3,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'ABOUT',
      sectionKey: 'TRAINERS',
      sectionType: 'CTA_BANNER',
      sectionTitle: 'Learn From Industry Leaders',
      subtitle: 'Mentored by Professionals with 10+ Years Experience',
      content: 'Our trainers lead active marketing and design campaigns for national and global brands.',
      buttonText: 'Meet Our Mentors',
      buttonUrl: '/trainers',
      displayOrder: 4,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
  COURSES: [
    {
      pageKey: 'COURSES',
      sectionKey: 'HERO',
      sectionType: 'HERO',
      sectionTitle: 'Our Career-Oriented Training Programs',
      subtitle: 'Master Practical Digital Marketing, Design & AI Tools',
      content: 'Filter through our range of professional courses designed for students, job seekers, and working professionals.',
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'COURSES',
      sectionKey: 'COURSE_GRID',
      sectionType: 'COURSES',
      sectionTitle: 'All Available Courses',
      subtitle: 'Choose Your Specialization',
      content: 'Hands-on practical training with live client projects and 100% placement support.',
      extraData: { limit: 12, featuredOnly: false, categoryFilter: 'ALL', displayStyle: 'GRID' },
      displayOrder: 2,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'COURSES',
      sectionKey: 'FAQ',
      sectionType: 'FAQ',
      sectionTitle: 'Course & Admission FAQs',
      content: 'Have questions about course eligibility, fees, or duration?',
      displayOrder: 3,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
  WHY_QIMD: [
    {
      pageKey: 'WHY_QIMD',
      sectionKey: 'HERO',
      sectionType: 'HERO',
      sectionTitle: 'The QIMD Advantage',
      subtitle: 'Why 2000+ Students Trust QIMD For Their Career',
      content: 'Discover our unique methodology, AI integration, and agency-level practical environment.',
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'WHY_QIMD',
      sectionKey: 'FEATURES',
      sectionType: 'WHY_QIMD',
      sectionTitle: '10 Reasons to Join QIMD',
      content: 'Industry mentor network, 50+ AI tools, live agency projects, and job guarantee programs.',
      displayOrder: 2,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
  BLOGS: [
    {
      pageKey: 'BLOGS',
      sectionKey: 'HERO',
      sectionType: 'HERO',
      sectionTitle: 'QIMD Blog & Digital Insights',
      subtitle: 'Stay Ahead with Latest Marketing & Design Trends',
      content: 'Articles, tutorials, and career advice written by marketing strategists and design leaders.',
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
  CAREER: [
    {
      pageKey: 'CAREER',
      sectionKey: 'HERO',
      sectionType: 'HERO',
      sectionTitle: 'Join the QIMD Team',
      subtitle: 'Build Your Career with Pune’s Premier Institute',
      content: 'Explore open positions for trainers, counsellors, and digital marketing managers.',
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
  CONTACT: [
    {
      pageKey: 'CONTACT',
      sectionKey: 'HERO',
      sectionType: 'HERO',
      sectionTitle: 'Get In Touch With QIMD',
      subtitle: 'We Are Here To Help You Launch Your Digital Career',
      content: 'Visit our campus in Hinjewadi Phase 1, Pune, or drop us a message below.',
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'CONTACT',
      sectionKey: 'CONTACT_FORM',
      sectionType: 'FORM_SECTION',
      sectionTitle: 'Send Us A Message',
      subtitle: 'Our Counsellors Will Get Back To You Within 2 Hours',
      extraData: { formType: 'CONTACT' },
      displayOrder: 2,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
  PRIVACY_POLICY: [
    {
      pageKey: 'PRIVACY_POLICY',
      sectionKey: 'CONTENT',
      sectionType: 'RICH_TEXT',
      sectionTitle: 'Privacy Policy',
      content: '<h2>Privacy Policy for QIMD Institute</h2><p>At QIMD (Quickup Institute of Marketing & Design), accessible from www.qimd.in, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by QIMD and how we use it.</p><h3>Information Collection</h3><p>We collect information when you fill out an enquiry form, subscribe to our newsletter, or contact our support team.</p>',
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
  TERMS: [
    {
      pageKey: 'TERMS',
      sectionKey: 'CONTENT',
      sectionType: 'RICH_TEXT',
      sectionTitle: 'Terms & Conditions',
      content: '<h2>Terms and Conditions</h2><p>Welcome to QIMD Institute. By accessing or using our website and enrolling in our courses, you agree to comply with and be bound by the following terms and conditions.</p><h3>Course Enrollment & Fees</h3><p>Fees once paid are subject to our refund policy. Attendance and coursework submission are required for certification.</p>',
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
  REFUND_POLICY: [
    {
      pageKey: 'REFUND_POLICY',
      sectionKey: 'CONTENT',
      sectionType: 'RICH_TEXT',
      sectionTitle: 'Fee & Refund Policy',
      content: '<h2>Refund & Cancellation Policy</h2><p>Our refund policy is designed to be fair and transparent for all students enrolling at QIMD Institute.</p><h3>Cancellation Within 7 Days</h3><p>Students requesting refund within 7 days of batch registration before formal classes begin are eligible for partial refund minus registration charges.</p>',
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
  ADMISSION: [
    {
      pageKey: 'ADMISSION',
      sectionKey: 'HERO',
      sectionType: 'HERO',
      sectionTitle: 'Admission Process & Guidelines',
      subtitle: 'Simple 3-Step Online & Offline Admission Procedure',
      content: 'Check eligibility criteria, required documents, and submit your admission request online.',
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
    {
      pageKey: 'ADMISSION',
      sectionKey: 'ADMISSION_FORM',
      sectionType: 'FORM_SECTION',
      sectionTitle: 'Online Admission Application',
      subtitle: 'Secure Your Seat in the Upcoming Batch',
      extraData: { formType: 'ADMISSION' },
      displayOrder: 2,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
  SITEMAP: [
    {
      pageKey: 'SITEMAP',
      sectionKey: 'CONTENT',
      sectionType: 'RICH_TEXT',
      sectionTitle: 'Website Sitemap',
      subtitle: 'Overview of All Pages & Course Directories',
      content: '<p>Navigate through the complete structure of QIMD Institute website.</p>',
      displayOrder: 1,
      isActive: true,
      status: 'PUBLISHED',
    },
  ],
}

/**
 * Fetch all pages for page selector. If missing in DB, seeds them cleanly.
 */
export async function getWebsitePagesAction() {
  await requireAdminSession()

  try {
    let pages = await db.webPage.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'asc' },
    })

    if (pages.length === 0) {
      // Seed default pages
      for (const p of DEFAULT_PAGES) {
        await db.webPage.upsert({
          where: { pageKey: p.pageKey },
          update: {},
          create: {
            pageKey: p.pageKey,
            pageName: p.pageName,
            slug: p.slug,
            status: 'PUBLISHED',
          },
        })
      }
      pages = await db.webPage.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'asc' },
      })
    }

    return { success: true, pages }
  } catch (err: any) {
    console.error('Error fetching website pages:', err)
    return { success: false, error: err.message || 'Failed to load pages' }
  }
}

/**
 * Fetch page sections for a specific pageKey. If missing, seed baseline sections.
 */
export async function getWebsitePageSectionsAction(pageKey: string) {
  await requireAdminSession()
  const key = pageKey.toUpperCase()

  try {
    // Ensure WebPage record exists
    let webPage = await db.webPage.findFirst({
      where: { pageKey: key, isDeleted: false },
    })

    if (!webPage) {
      const matchDefault = DEFAULT_PAGES.find((p) => p.pageKey === key)
      if (matchDefault) {
        webPage = await db.webPage.create({
          data: {
            pageKey: key,
            pageName: matchDefault.pageName,
            slug: matchDefault.slug,
            status: 'PUBLISHED',
          },
        })
      }
    }

    let sections = await db.pageSection.findMany({
      where: { pageKey: key, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })

    if (sections.length === 0 && DEFAULT_SECTIONS[key]) {
      // Seed initial sections
      const seeds = DEFAULT_SECTIONS[key]
      for (const s of seeds) {
        await db.pageSection.create({
          data: {
            pageId: webPage?.id || null,
            pageKey: key,
            sectionKey: s.sectionKey,
            sectionType: s.sectionType,
            sectionTitle: s.sectionTitle || null,
            subtitle: s.subtitle || null,
            content: s.content || null,
            image: s.image || null,
            buttonText: s.buttonText || null,
            buttonUrl: s.buttonUrl || null,
            extraData: s.extraData || {},
            displayOrder: s.displayOrder || 0,
            isActive: s.isActive ?? true,
            status: s.status || 'PUBLISHED',
          },
        })
      }

      sections = await db.pageSection.findMany({
        where: { pageKey: key, isDeleted: false },
        orderBy: { displayOrder: 'asc' },
      })
    }

    return { success: true, webPage, sections }
  } catch (err: any) {
    console.error(`Error fetching page sections for ${pageKey}:`, err)
    return { success: false, error: err.message || 'Failed to load page sections' }
  }
}

/**
 * Save / Update a Page Section
 */
export async function savePageSectionAction(data: PageSectionInput) {
  const session = await requireAdminSession()
  const pageKey = data.pageKey.toUpperCase()

  try {
    const webPage = await db.webPage.findFirst({ where: { pageKey } })

    let section
    if (data.id) {
      section = await db.pageSection.update({
        where: { id: data.id },
        data: {
          sectionKey: data.sectionKey.toUpperCase(),
          sectionType: data.sectionType.toUpperCase(),
          sectionTitle: data.sectionTitle || null,
          subtitle: data.subtitle || null,
          content: data.content || null,
          image: data.image || null,
          buttonText: data.buttonText || null,
          buttonUrl: data.buttonUrl || null,
          extraData: data.extraData || {},
          displayOrder: data.displayOrder ?? 0,
          isActive: data.isActive ?? true,
          status: data.status || 'PUBLISHED',
        },
      })
    } else {
      section = await db.pageSection.create({
        data: {
          pageId: webPage?.id || null,
          pageKey,
          sectionKey: data.sectionKey.toUpperCase() || `SEC_${Date.now()}`,
          sectionType: data.sectionType.toUpperCase(),
          sectionTitle: data.sectionTitle || null,
          subtitle: data.subtitle || null,
          content: data.content || null,
          image: data.image || null,
          buttonText: data.buttonText || null,
          buttonUrl: data.buttonUrl || null,
          extraData: data.extraData || {},
          displayOrder: data.displayOrder ?? 0,
          isActive: data.isActive ?? true,
          status: data.status || 'PUBLISHED',
        },
      })
    }

    await createAuditLog({
      userId: session.id,
      module: 'WEBSITE_MANAGEMENT',
      action: data.id ? 'UPDATE_PAGE_SECTION' : 'CREATE_PAGE_SECTION',
      recordId: section.id,
    })

    revalidatePath('/admin/website-management')
    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/courses')
    revalidatePath('/why-qimd')
    revalidatePath('/contact')
    revalidatePath('/privacy-policy')
    revalidatePath('/terms-and-conditions')
    revalidatePath('/refund-policy')

    return { success: true, message: 'Section saved successfully!', section }
  } catch (err: any) {
    console.error('Error saving section:', err)
    return { success: false, error: err.message || 'Failed to save section' }
  }
}

/**
 * Toggle Section Active Status (Enable / Disable)
 */
export async function toggleSectionActiveAction(sectionId: string, isActive: boolean) {
  const session = await requireAdminSession()

  try {
    const section = await db.pageSection.update({
      where: { id: sectionId },
      data: { isActive },
    })

    await createAuditLog({
      userId: session.id,
      module: 'WEBSITE_MANAGEMENT',
      action: isActive ? 'ENABLE_SECTION' : 'DISABLE_SECTION',
      recordId: sectionId,
    })

    revalidatePath('/admin/website-management')
    revalidatePath('/')

    return {
      success: true,
      message: `Section ${isActive ? 'enabled' : 'disabled'} successfully`,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update section status' }
  }
}

/**
 * Reorder Sections (Batch update displayOrder in PostgreSQL)
 */
export async function reorderPageSectionsAction(items: { id: string; displayOrder: number }[]) {
  const session = await requireAdminSession()

  try {
    await db.$transaction(
      items.map((item) =>
        db.pageSection.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    )

    await createAuditLog({
      userId: session.id,
      module: 'WEBSITE_MANAGEMENT',
      action: 'REORDER_PAGE_SECTIONS',
    })

    revalidatePath('/admin/website-management')
    revalidatePath('/')

    return { success: true, message: 'Section order saved successfully!' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reorder sections' }
  }
}

/**
 * Duplicate a section
 */
export async function duplicatePageSectionAction(sectionId: string) {
  const session = await requireAdminSession()

  try {
    const existing = await db.pageSection.findUnique({ where: { id: sectionId } })
    if (!existing) return { success: false, error: 'Section not found' }

    const newDisplayOrder = existing.displayOrder + 1

    const cloned = await db.pageSection.create({
      data: {
        pageId: existing.pageId,
        pageKey: existing.pageKey,
        sectionKey: `${existing.sectionKey}_COPY_${Date.now().toString().slice(-4)}`,
        sectionType: existing.sectionType,
        sectionTitle: existing.sectionTitle ? `${existing.sectionTitle} (Copy)` : 'Cloned Section',
        subtitle: existing.subtitle,
        content: existing.content,
        image: existing.image,
        buttonText: existing.buttonText,
        buttonUrl: existing.buttonUrl,
        extraData: existing.extraData ? (JSON.parse(JSON.stringify(existing.extraData))) : {},
        displayOrder: newDisplayOrder,
        isActive: existing.isActive,
        status: existing.status,
      },
    })

    await createAuditLog({
      userId: session.id,
      module: 'WEBSITE_MANAGEMENT',
      action: 'DUPLICATE_PAGE_SECTION',
      recordId: cloned.id,
    })

    revalidatePath('/admin/website-management')
    return { success: true, message: 'Section duplicated successfully!', section: cloned }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to duplicate section' }
  }
}

/**
 * Delete a section (soft delete)
 */
export async function deletePageSectionAction(sectionId: string) {
  const session = await requireAdminSession()

  try {
    await db.pageSection.update({
      where: { id: sectionId },
      data: { isDeleted: true },
    })

    await createAuditLog({
      userId: session.id,
      module: 'WEBSITE_MANAGEMENT',
      action: 'DELETE_PAGE_SECTION',
      recordId: sectionId,
    })

    revalidatePath('/admin/website-management')
    revalidatePath('/')

    return { success: true, message: 'Section deleted successfully!' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete section' }
  }
}

/**
 * Save Page-level Settings & SEO
 */
export async function savePageSettingsAndSEOAction(
  pageKey: string,
  data: {
    pageName: string
    slug: string
    description?: string
    status: 'DRAFT' | 'PUBLISHED'
    metaTitle?: string
    metaDescription?: string
    canonicalUrl?: string
    ogImage?: string
  }
) {
  const session = await requireAdminSession()
  const key = pageKey.toUpperCase()

  try {
    const page = await db.webPage.upsert({
      where: { pageKey: key },
      update: {
        pageName: data.pageName,
        slug: data.slug,
        description: data.description || null,
        status: data.status,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        canonicalUrl: data.canonicalUrl || null,
        ogImage: data.ogImage || null,
      },
      create: {
        pageKey: key,
        pageName: data.pageName,
        slug: data.slug,
        description: data.description || null,
        status: data.status,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        canonicalUrl: data.canonicalUrl || null,
        ogImage: data.ogImage || null,
      },
    })

    await createAuditLog({
      userId: session.id,
      module: 'WEBSITE_MANAGEMENT',
      action: 'UPDATE_PAGE_SEO',
      recordId: page.id,
    })

    revalidatePath('/admin/website-management')
    revalidatePath(data.slug)

    return { success: true, message: 'Page settings & SEO updated successfully!' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update page settings' }
  }
}

/**
 * Publish Page Changes
 */
export async function publishPageChangesAction(pageKey: string) {
  const session = await requireAdminSession()
  const key = pageKey.toUpperCase()

  try {
    // Publish page
    await db.webPage.updateMany({
      where: { pageKey: key },
      data: { status: 'PUBLISHED' },
    })

    // Publish all active sections on page
    await db.pageSection.updateMany({
      where: { pageKey: key, isDeleted: false },
      data: { status: 'PUBLISHED' },
    })

    await createAuditLog({
      userId: session.id,
      module: 'WEBSITE_MANAGEMENT',
      action: 'PUBLISH_PAGE',
    })

    revalidatePath('/admin/website-management')
    revalidatePath('/')

    return { success: true, message: 'Page and section changes published to public website!' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to publish page changes' }
  }
}

/**
 * Global Header Settings Management
 */
export async function getHeaderSettingsAction() {
  try {
    let settings = await db.websiteSettings.findFirst()
    if (!settings) {
      settings = await db.websiteSettings.create({
        data: {
          websiteName: 'QIMD - Quickup Institute of Marketing & Design',
        },
      })
    }
    return { success: true, settings }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function saveHeaderSettingsAction(data: {
  phone?: string
  email?: string
  whatsappNumber?: string
  logo?: string
  headerNavigation?: any[]
  topBarConfig?: {
    showPhone?: boolean
    showEmail?: boolean
    showHireFromUs?: boolean
    hireFromUsLabel?: string
    hireFromUsUrl?: string
  }
  topBarItems?: any[]
  mainHeaderConfig?: {
    logoUrl?: string
    ctasOrder?: 'ENQUIRE_FIRST' | 'WHATSAPP_FIRST'
    enquireCta?: { label: string; url: string; enabled: boolean }
    whatsappCta?: { label: string; url: string; enabled: boolean }
  }
  socialLinksList?: any[]
  socialLinks?: any
}) {
  const session = await requireAdminSession()

  try {
    let settings = await db.websiteSettings.findFirst()

    const homepageSectionsData = {
      headerData: data.headerNavigation || [],
      topBarConfig: data.topBarConfig || {},
      topBarItems: data.topBarItems || [],
      mainHeaderConfig: data.mainHeaderConfig || {},
      socialLinksList: data.socialLinksList || [],
      socialLinks: data.socialLinks || {},
    }

    if (settings) {
      settings = await db.websiteSettings.update({
        where: { id: settings.id },
        data: {
          contactPhone: data.phone || settings.contactPhone,
          contactEmail: data.email || settings.contactEmail,
          whatsappNumber: data.whatsappNumber || settings.whatsappNumber,
          logo: data.logo || settings.logo,
          homepageSections: homepageSectionsData,
          socialLinks: data.socialLinks || settings.socialLinks,
        },
      })
    } else {
      settings = await db.websiteSettings.create({
        data: {
          contactPhone: data.phone,
          contactEmail: data.email,
          whatsappNumber: data.whatsappNumber,
          logo: data.logo,
          homepageSections: homepageSectionsData,
          socialLinks: data.socialLinks,
        },
      })
    }

    await createAuditLog({
      userId: session.id,
      module: 'WEBSITE_MANAGEMENT',
      action: 'UPDATE_GLOBAL_HEADER',
      recordId: settings.id,
    })

    revalidatePath('/', 'layout')
    return { success: true, message: 'Global Header settings updated successfully!' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save header settings' }
  }
}

/**
 * Global Footer Settings Management
 */
export async function saveFooterSettingsAction(data: {
  footerLogo?: string
  footerDescription?: string
  address?: string
  phone?: string
  email?: string
  copyrightText?: string
  quickLinks?: { label: string; url: string }[]
  importantLinks?: { label: string; url: string }[]
  courseLinks?: { label: string; url: string }[]
}) {
  const session = await requireAdminSession()

  try {
    let settings = await db.websiteSettings.findFirst()

    const footerPayload = {
      logo: data.footerLogo,
      description: data.footerDescription,
      address: data.address,
      phone: data.phone,
      email: data.email,
      copyrightText: data.copyrightText,
      quickLinks: data.quickLinks || [],
      importantLinks: data.importantLinks || [],
      courseLinks: data.courseLinks || [],
    }

    if (settings) {
      settings = await db.websiteSettings.update({
        where: { id: settings.id },
        data: {
          footerContent: footerPayload,
          address: data.address || settings.address,
          contactPhone: data.phone || settings.contactPhone,
          contactEmail: data.email || settings.contactEmail,
        },
      })
    } else {
      settings = await db.websiteSettings.create({
        data: {
          footerContent: footerPayload,
          address: data.address,
          contactPhone: data.phone,
          contactEmail: data.email,
        },
      })
    }

    await createAuditLog({
      userId: session.id,
      module: 'WEBSITE_MANAGEMENT',
      action: 'UPDATE_GLOBAL_FOOTER',
      recordId: settings.id,
    })

    revalidatePath('/', 'layout')
    return { success: true, message: 'Global Footer settings updated successfully!' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save footer settings' }
  }
}
