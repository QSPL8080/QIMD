import { db } from './db'

async function verify() {
  console.log('=== VERIFYING POSTGRESQL DATABASE FOR QIMD ===')
  try {
    const counts = {
      roles: await db.role.count(),
      users: await db.user.count(),
      courseCategories: await db.courseCategory.count(),
      courses: await db.course.count(),
      trainers: await db.trainer.count(),
      blogs: await db.blog.count(),
      placements: await db.placement.count(),
      gallery: await db.gallery.count(),
      testimonials: await db.testimonial.count(),
      partners: await db.partner.count(),
      emiPartners: await db.emiPartner.count(),
      faqs: await db.faq.count(),
      contactEnquiries: await db.contactEnquiry.count(),
      admissionEnquiries: await db.admissionEnquiry.count(),
      jobOpenings: await db.jobOpening.count(),
      careerEnquiries: await db.careerEnquiry.count(),
      franchiseEnquiries: await db.franchisePartnerEnquiry.count(),
      companyPlacementEnquiries: await db.companyPlacementEnquiry.count(),
      mediaLibrary: await db.mediaLibrary.count(),
      websiteSettings: await db.websiteSettings.count(),
      reports: await db.report.count(),
      notificationLogs: await db.notificationLog.count(),
      auditLogs: await db.auditLog.count(),
      webPages: await db.webPage.count(),
      pageSections: await db.pageSection.count(),
    }
    
    console.log('Database Table Counts:', JSON.stringify(counts, null, 2))
    
    const roles = await db.role.findMany({ select: { id: true, roleName: true } })
    console.log('Roles in DB:', roles)
    
    const users = await db.user.findMany({ select: { id: true, fullName: true, email: true, role: { select: { roleName: true } } } })
    console.log('Users in DB:', users)
    
  } catch (error) {
    console.error('Error during DB verification:', error)
  } finally {
    await db.$disconnect()
  }
}

verify()
