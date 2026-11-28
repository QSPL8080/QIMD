import { db } from './db'
import { sendLeadEmail, sendSubmitterAck } from './leadMail'
import { notifyRoles } from './notifications'

/** Last 10 digits of a mobile number, for duplicate matching. */
export function normalizePhone(phone?: string | null): string | null {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return null
  return digits.length > 10 ? digits.slice(-10) : digits
}

export function normalizeEmail(email?: string | null): string | null {
  const e = String(email || '').trim().toLowerCase()
  return e || null
}

/** Earlier leads with the same mobile number or email (possible duplicates). */
export async function findPossibleDuplicates(phoneNormalized: string | null, email: string | null, excludeId?: string) {
  const or: any[] = []
  if (phoneNormalized && phoneNormalized.length >= 7) or.push({ phoneNormalized })
  if (email) or.push({ email: { equals: email, mode: 'insensitive' } })
  if (or.length === 0) return []
  return (db as any).lead.findMany({
    where: { OR: or, isDeleted: false, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    select: { id: true, leadCode: true, fullName: true, phone: true, email: true, source: true, enquiryType: true, status: true, createdAt: true, assignedTo: { select: { fullName: true } } },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })
}

export type NewLeadInput = {
  source: 'WEBSITE' | 'META' | 'MANUAL'
  enquiryType: 'ADMISSION' | 'CONTACT'
  fullName: string
  phone?: string | null
  email?: string | null
  course?: string | null
  city?: string | null
  qualification?: string | null
  subject?: string | null
  message?: string | null
  campaign?: string | null
  adId?: string | null
  formId?: string | null
  sourceRef?: string | null
  rawPayload?: unknown
  createdBy?: { id: string; fullName: string } | null
}

/**
 * Save a lead from any source. Duplicates are never dropped: the new lead is
 * saved and linked to the earliest matching lead for review (SRS §7.4).
 * Returns null if this exact source submission was already saved (retry-safe).
 */
export async function createLead(input: NewLeadInput) {
  if (input.sourceRef) {
    const existing = await (db as any).lead.findUnique({ where: { sourceRef: input.sourceRef } })
    if (existing) return null
  }
  const phoneNormalized = normalizePhone(input.phone)
  const email = normalizeEmail(input.email)
  const dups = await findPossibleDuplicates(phoneNormalized, email)

  const lead = await (db as any).lead.create({
    data: {
      source: input.source,
      enquiryType: input.enquiryType,
      fullName: input.fullName.trim().slice(0, 150),
      phone: input.phone?.trim().slice(0, 30) || null,
      phoneNormalized,
      email,
      course: input.course?.trim().slice(0, 200) || null,
      city: input.city?.trim().slice(0, 120) || null,
      qualification: input.qualification?.trim().slice(0, 150) || null,
      subject: input.subject?.trim().slice(0, 255) || null,
      message: input.message?.trim() || null,
      campaign: input.campaign?.slice(0, 255) || null,
      adId: input.adId?.slice(0, 100) || null,
      formId: input.formId?.slice(0, 100) || null,
      sourceRef: input.sourceRef || null,
      rawPayload: input.rawPayload === undefined || input.rawPayload === null ? undefined : (input.rawPayload as any),
      duplicateOfId: dups[0]?.id || null,
      createdById: input.createdBy?.id || null,
      createdByName: input.createdBy?.fullName || (input.source === 'MANUAL' ? null : 'System'),
    },
  })

  // In-system alert for whoever allocates leads
  await notifyRoles(
    ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'],
    {
      type: 'LEAD_NEW',
      title: `New ${input.source === 'META' ? 'Meta' : input.source === 'MANUAL' ? 'manual' : 'website'} lead: ${lead.fullName}${dups.length ? ' (possible duplicate)' : ''}`,
      link: `/admin/leads/${lead.id}`,
    },
    input.createdBy?.id,
  )

  // Email alert for website and Meta leads
  if (input.source !== 'MANUAL') {
    await sendLeadEmail(
      input.source === 'META' ? 'meta' : input.enquiryType === 'ADMISSION' ? 'admission' : 'contact',
      [
        { label: 'Name', value: lead.fullName },
        { label: 'Lead ID', value: lead.leadCode },
        { label: 'Email', value: lead.email },
        { label: 'Phone', value: lead.phone },
        { label: 'Course', value: lead.course },
        { label: 'City', value: lead.city },
        { label: 'Qualification', value: lead.qualification },
        { label: 'Subject', value: lead.subject },
        { label: 'Message', value: lead.message },
        { label: 'Campaign', value: lead.campaign },
        { label: 'Possible duplicate of', value: dups[0] ? `${dups[0].leadCode} (${dups[0].fullName})` : null },
      ],
      lead.email,
      `/admin/leads/${lead.id}`,
    )
  }

  // "We received it" email to the person who filled in the website form
  if (input.source === 'WEBSITE') await sendSubmitterAck(input.enquiryType === 'ADMISSION' ? 'admission' : 'contact', lead.email, lead.fullName)

  return lead
}
