import { db } from './db'
import type { TrashType } from './trash'

export type BinItem = {
  type: TrashType
  id: string
  title: string
  subtitle: string
  deletedByName: string | null
  deletedByRole: string | null
  deletedAt: string
}

export const BIN_TYPE_LABELS: Record<TrashType, string> = {
  admission: 'Admission Enquiry',
  contact: 'Contact Enquiry',
  career: 'Career Application',
  hire: 'Hire Request',
  franchise: 'Franchise Enquiry',
  blog: 'Blog',
  job: 'Job Opening',
  placement: 'Placed Student',
  testimonial: 'Testimonial',
  review: 'Student Review',
  faq: 'FAQ',
  gallery: 'Gallery Item',
  banner: 'Homepage Banner',
  user: 'Admin User',
  lead: 'Lead',
  admission_record: 'Admission Record',
  expense: 'Expense',
}

const deleted = { isDeleted: true }

/** Number of records currently in the Bin (all sections). */
export async function countBinItems(): Promise<number> {
  const counts = await Promise.all([
    db.admissionEnquiry.count({ where: deleted }),
    db.contactEnquiry.count({ where: deleted }),
    db.careerEnquiry.count({ where: deleted }),
    db.companyPlacementEnquiry.count({ where: deleted }),
    db.franchisePartnerEnquiry.count({ where: deleted }),
    db.blog.count({ where: deleted }),
    db.jobOpening.count({ where: deleted }),
    db.placement.count({ where: deleted }),
    db.testimonial.count({ where: deleted }),
    db.studentReview.count({ where: deleted }),
    db.faq.count({ where: deleted }),
    db.gallery.count({ where: deleted }),
    db.banner.count({ where: deleted }),
    db.user.count({ where: deleted }),
    (db as any).lead.count({ where: deleted }),
    (db as any).admission.count({ where: deleted }),
    (db as any).expense.count({ where: deleted }),
  ])
  return counts.reduce((a, b) => a + b, 0)
}

/** Everything in the Bin, newest first, with who deleted it and when. */
export async function getBinItems(): Promise<BinItem[]> {
  const [
    admissions, contacts, careers, hires, franchises, blogs, jobs,
    placements, testimonials, reviews, faqs, gallery, banners, users, entries,
    leads, admissionRecords, expenses,
  ] = await Promise.all([
    db.admissionEnquiry.findMany({ where: deleted, select: { id: true, studentName: true, email: true, updatedAt: true } }),
    db.contactEnquiry.findMany({ where: deleted, select: { id: true, fullName: true, email: true, updatedAt: true } }),
    db.careerEnquiry.findMany({ where: deleted, select: { id: true, fullName: true, jobTitle: true, updatedAt: true } }),
    db.companyPlacementEnquiry.findMany({ where: deleted, select: { id: true, companyName: true, contactPerson: true, updatedAt: true } }),
    db.franchisePartnerEnquiry.findMany({ where: deleted, select: { id: true, fullName: true, companyName: true, updatedAt: true } }),
    db.blog.findMany({ where: deleted, select: { id: true, title: true, updatedAt: true } }),
    db.jobOpening.findMany({ where: deleted, select: { id: true, title: true, updatedAt: true } }),
    db.placement.findMany({ where: deleted, select: { id: true, studentName: true, companyName: true, updatedAt: true } }),
    db.testimonial.findMany({ where: deleted, select: { id: true, studentName: true, updatedAt: true } }),
    db.studentReview.findMany({ where: deleted, select: { id: true, studentName: true, updatedAt: true } }),
    db.faq.findMany({ where: deleted, select: { id: true, question: true, updatedAt: true } }),
    db.gallery.findMany({ where: deleted, select: { id: true, caption: true, altText: true, fileUrl: true, updatedAt: true } }),
    db.banner.findMany({ where: deleted, select: { id: true, title: true, titleAccent: true, updatedAt: true } }),
    db.user.findMany({ where: deleted, select: { id: true, fullName: true, email: true, updatedAt: true } }),
    db.trashEntry.findMany(),
    (db as any).lead.findMany({ where: deleted, select: { id: true, leadCode: true, fullName: true, updatedAt: true } }),
    (db as any).admission.findMany({ where: deleted, select: { id: true, admissionCode: true, studentName: true, updatedAt: true } }),
    (db as any).expense.findMany({ where: deleted, select: { id: true, expenseCode: true, description: true, updatedAt: true } }),
  ])

  const log = new Map(entries.map((e: any) => [`${e.entityType}:${e.entityId}`, e]))
  const items: BinItem[] = []
  const push = (type: TrashType, id: string, title: string, subtitle: string, updatedAt: Date) => {
    const e: any = log.get(`${type}:${id}`)
    items.push({
      type,
      id,
      title: title || 'Untitled',
      subtitle: subtitle || '',
      deletedByName: e?.deletedByName ?? null,
      deletedByRole: e?.deletedByRole ?? null,
      deletedAt: new Date(e?.deletedAt ?? updatedAt ?? Date.now()).toISOString(),
    })
  }

  admissions.forEach((r: any) => push('admission', r.id, r.studentName, r.email, r.updatedAt))
  contacts.forEach((r: any) => push('contact', r.id, r.fullName, r.email, r.updatedAt))
  careers.forEach((r: any) => push('career', r.id, r.fullName, r.jobTitle, r.updatedAt))
  hires.forEach((r: any) => push('hire', r.id, r.companyName, r.contactPerson, r.updatedAt))
  franchises.forEach((r: any) => push('franchise', r.id, r.fullName, r.companyName, r.updatedAt))
  blogs.forEach((r: any) => push('blog', r.id, r.title, '', r.updatedAt))
  jobs.forEach((r: any) => push('job', r.id, r.title, '', r.updatedAt))
  placements.forEach((r: any) => push('placement', r.id, r.studentName, r.companyName, r.updatedAt))
  testimonials.forEach((r: any) => push('testimonial', r.id, r.studentName, '', r.updatedAt))
  reviews.forEach((r: any) => push('review', r.id, r.studentName, '', r.updatedAt))
  faqs.forEach((r: any) => push('faq', r.id, r.question, '', r.updatedAt))
  gallery.forEach((r: any) => push('gallery', r.id, r.caption || r.altText || 'Gallery image', r.fileUrl, r.updatedAt))
  banners.forEach((r: any) => push('banner', r.id, [r.title, r.titleAccent].filter(Boolean).join(' '), '', r.updatedAt))
  users.forEach((r: any) => push('user', r.id, r.fullName, r.email, r.updatedAt))
  leads.forEach((r: any) => push('lead', r.id, r.fullName, r.leadCode, r.updatedAt))
  admissionRecords.forEach((r: any) => push('admission_record', r.id, r.studentName, r.admissionCode, r.updatedAt))
  expenses.forEach((r: any) => push('expense', r.id, r.description, r.expenseCode, r.updatedAt))

  return items.sort((a, b) => (a.deletedAt < b.deletedAt ? 1 : -1))
}
