'use server'

import { recordTrash, clearTrash } from '@/lib/trash'

import { db } from '@/lib/db'
import { coursesData } from '@/data'
import {
  contactEnquirySchema,
  admissionEnquirySchema,
  careerApplicationSchema,
  franchiseEnquirySchema,
  hireRequestSchema,
} from '@/lib/validations'
import { requirePermission, requireSuperAdminSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { sendLeadEmail, sendSubmitterAck } from '@/lib/leadMail'
import { createLead } from '@/lib/leads'

// --- PUBLIC FORM SUBMISSIONS ---

export async function submitContactEnquiryAction(data: {
  fullName: string
  email: string
  phone: string
  subject?: string
  message: string
}) {
  try {
    const validated = contactEnquirySchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    await createLead({
      source: 'WEBSITE',
      enquiryType: 'CONTACT',
      fullName: validated.data.fullName,
      email: validated.data.email,
      phone: validated.data.phone,
      subject: validated.data.subject || 'General Enquiry',
      message: validated.data.message,
    })

    return { success: true, message: 'Your enquiry has been submitted successfully! Our team will contact you shortly.' }
  } catch (err: any) {
    console.error('Contact enquiry submission error:', err)
    return { success: false, error: 'Failed to submit enquiry. Please try again.' }
  }
}

export async function submitAdmissionEnquiryAction(data: {
  studentName: string
  email: string
  phone: string
  courseId?: string
  city?: string
  qualification?: string
  message?: string
}) {
  try {
    const validated = admissionEnquirySchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    // Programs are fixed in the website code (coursesData); the lead keeps the program name in its message.
    let programTitle: string | null = null
    if (validated.data.courseId && validated.data.courseId.trim() !== '') {
      const rawInput = validated.data.courseId.trim()
      const program = coursesData.find((c) => c.slug === rawInput || c.title === rawInput)
      programTitle = program?.title || rawInput
    }

    const lead = await createLead({
      source: 'WEBSITE',
      enquiryType: 'ADMISSION',
      fullName: validated.data.studentName,
      email: validated.data.email,
      phone: validated.data.phone,
      course: programTitle,
      city: validated.data.city || null,
      qualification: validated.data.qualification || null,
      message: validated.data.message || null,
    })

    return {
      success: true,
      message: 'Thank you! Admission enquiry received.',
      enquiryId: lead?.id,
    }
  } catch (err: any) {
    console.error('Admission enquiry error:', err)
    return { success: false, error: 'Failed to submit admission enquiry. Please try again.' }
  }
}

export async function submitCareerApplicationAction(data: {
  fullName: string
  email: string
  phone: string
  jobTitle: string
  jobOpeningId?: string
  resume: string
  coverLetter?: string
}) {
  try {
    const validated = careerApplicationSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    await db.careerEnquiry.create({
      data: {
        fullName: validated.data.fullName,
        email: validated.data.email,
        phone: validated.data.phone,
        jobTitle: validated.data.jobTitle,
        jobOpeningId: validated.data.jobOpeningId || null,
        resume: validated.data.resume,
        coverLetter: validated.data.coverLetter || null,
        status: 'NEW',
      },
    })

    await sendLeadEmail(
      'career',
      [
        { label: 'Name', value: validated.data.fullName },
        { label: 'Email', value: validated.data.email },
        { label: 'Phone', value: validated.data.phone },
        { label: 'Applied For', value: validated.data.jobTitle },
        { label: 'Resume', value: validated.data.resume, link: true },
        { label: 'Cover Letter', value: validated.data.coverLetter },
      ],
      validated.data.email,
    )
    await sendSubmitterAck('career', validated.data.email, validated.data.fullName)

    return { success: true, message: 'Application submitted successfully! HR will review your application.' }
  } catch (err: any) {
    console.error('Career application error:', err)
    return { success: false, error: 'Failed to submit application. Please try again.' }
  }
}

export async function submitFranchiseEnquiryAction(data: {
  fullName: string
  companyName?: string
  email: string
  phone: string
  city?: string
  state?: string
  investmentCapacity?: string
  message?: string
}) {
  try {
    const validated = franchiseEnquirySchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    await db.franchisePartnerEnquiry.create({
      data: {
        fullName: validated.data.fullName,
        companyName: validated.data.companyName || null,
        email: validated.data.email,
        phone: validated.data.phone,
        city: validated.data.city || null,
        state: validated.data.state || null,
        investmentCapacity: validated.data.investmentCapacity || null,
        message: validated.data.message || null,
        status: 'NEW',
      },
    })

    await sendLeadEmail(
      'franchise',
      [
        { label: 'Name', value: validated.data.fullName },
        { label: 'Company', value: validated.data.companyName },
        { label: 'Email', value: validated.data.email },
        { label: 'Phone', value: validated.data.phone },
        { label: 'City / State', value: validated.data.state },
        { label: 'Preferred City', value: validated.data.city },
        { label: 'Current Profession', value: validated.data.investmentCapacity },
        { label: 'Message', value: validated.data.message },
      ],
      validated.data.email,
    )
    await sendSubmitterAck('franchise', validated.data.email, validated.data.fullName)

    return { success: true, message: 'Franchise partnership proposal received! Our expansion team will get in touch.' }
  } catch (err: any) {
    console.error('Franchise enquiry error:', err)
    return { success: false, error: 'Failed to submit proposal. Please try again.' }
  }
}

export async function submitHireRequestAction(data: {
  companyName: string
  contactPerson: string
  email: string
  phone: string
  jobRole: string
  requiredSkills?: string
  vacancies?: number
  jobLocation?: string
  message?: string
}) {
  try {
    const validated = hireRequestSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    await db.companyPlacementEnquiry.create({
      data: {
        companyName: validated.data.companyName,
        contactPerson: validated.data.contactPerson,
        email: validated.data.email,
        phone: validated.data.phone,
        jobRole: validated.data.jobRole,
        requiredSkills: validated.data.requiredSkills || null,
        vacancies: validated.data.vacancies || 1,
        jobLocation: validated.data.jobLocation || null,
        message: validated.data.message || null,
        status: 'NEW',
      },
    })

    await sendLeadEmail(
      'hire',
      [
        { label: 'Company', value: validated.data.companyName },
        { label: 'Contact Person', value: validated.data.contactPerson },
        { label: 'Email', value: validated.data.email },
        { label: 'Phone', value: validated.data.phone },
        { label: 'Job Role', value: validated.data.jobRole },
        { label: 'Required Skills', value: validated.data.requiredSkills },
        { label: 'Vacancies', value: validated.data.vacancies || 1 },
        { label: 'Job Location', value: validated.data.jobLocation },
        { label: 'Message', value: validated.data.message },
      ],
      validated.data.email,
    )
    await sendSubmitterAck('hire', validated.data.email, validated.data.contactPerson)

    return { success: true, message: 'Hiring request submitted! Our placement team will share top candidate profiles.' }
  } catch (err: any) {
    console.error('Hire request error:', err)
    return { success: false, error: 'Failed to submit hire request.' }
  }
}

// --- ADMIN CRM MANAGEMENT ACTIONS ---

/** Old admission/contact enquiries belong to Leads; the rest to Other Enquiries. */
const enquiryModule = (type: string) => (type === 'admission' || type === 'contact' ? 'leads' : 'enquiries')

export async function updateEnquiryStatusAction(
  type: 'contact' | 'admission' | 'career' | 'franchise' | 'hire',
  id: string,
  status: any,
  remarks?: string,
  assignedToId?: string
) {
  const session = await requirePermission(enquiryModule(type), 'edit')

  try {
    if (type === 'contact') {
      await db.contactEnquiry.update({
        where: { id },
        data: { status, remarks, assignedToId: assignedToId || undefined },
      })
    } else if (type === 'admission') {
      await db.admissionEnquiry.update({
        where: { id },
        data: { status, remarks, assignedToId: assignedToId || undefined },
      })
    } else if (type === 'career') {
      await db.careerEnquiry.update({
        where: { id },
        data: { status, remarks },
      })
    } else if (type === 'franchise') {
      await db.franchisePartnerEnquiry.update({
        where: { id },
        data: { status, remarks, assignedToId: assignedToId || undefined },
      })
    } else if (type === 'hire') {
      await db.companyPlacementEnquiry.update({
        where: { id },
        data: { status, remarks, assignedToId: assignedToId || undefined },
      })
    }


    revalidatePath(`/admin/enquiries/${type}`)
    return { success: true, message: 'Status updated successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update status' }
  }
}

export async function trashEnquiryAction(
  type: 'contact' | 'admission' | 'career' | 'franchise' | 'hire',
  id: string
) {
  const session = await requirePermission(enquiryModule(type), 'delete')

  try {
    if (type === 'contact') await db.contactEnquiry.update({ where: { id }, data: { isDeleted: true } })
    else if (type === 'admission') await db.admissionEnquiry.update({ where: { id }, data: { isDeleted: true } })
    else if (type === 'career') await db.careerEnquiry.update({ where: { id }, data: { isDeleted: true } })
    else if (type === 'franchise') await db.franchisePartnerEnquiry.update({ where: { id }, data: { isDeleted: true } })
    else if (type === 'hire') await db.companyPlacementEnquiry.update({ where: { id }, data: { isDeleted: true } })


    revalidatePath(`/admin/enquiries/${type}`)
    await recordTrash(type, id, session)
    return { success: true, message: 'Record moved to the Bin' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash record' }
  }
}

/** Move several enquiries to the Bin (any admin). */
export async function bulkTrashEnquiryAction(
  type: 'contact' | 'admission' | 'career' | 'franchise' | 'hire',
  ids: string[]
) {
  const session = await requirePermission(enquiryModule(type), 'delete')
  if (!ids || ids.length === 0) {
    return { success: false, error: 'No IDs provided' }
  }

  try {
    const where = { id: { in: ids } }
    const data = { isDeleted: true }
    if (type === 'contact') await db.contactEnquiry.updateMany({ where, data })
    else if (type === 'admission') await db.admissionEnquiry.updateMany({ where, data })
    else if (type === 'career') await db.careerEnquiry.updateMany({ where, data })
    else if (type === 'franchise') await db.franchisePartnerEnquiry.updateMany({ where, data })
    else if (type === 'hire') await db.companyPlacementEnquiry.updateMany({ where, data })

    revalidatePath(`/admin/enquiries/${type}`)
    await recordTrash(type, ids, session)
    return { success: true, message: `${ids.length} record(s) moved to the Bin` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to move records to the Bin' }
  }
}

export async function restoreEnquiryAction(
  type: 'contact' | 'admission' | 'career' | 'franchise' | 'hire',
  id: string
) {
  const session = await requireSuperAdminSession()

  try {
    if (type === 'contact') await db.contactEnquiry.update({ where: { id }, data: { isDeleted: false } })
    else if (type === 'admission') await db.admissionEnquiry.update({ where: { id }, data: { isDeleted: false } })
    else if (type === 'career') await db.careerEnquiry.update({ where: { id }, data: { isDeleted: false } })
    else if (type === 'franchise') await db.franchisePartnerEnquiry.update({ where: { id }, data: { isDeleted: false } })
    else if (type === 'hire') await db.companyPlacementEnquiry.update({ where: { id }, data: { isDeleted: false } })


    revalidatePath(`/admin/enquiries/${type}`)
    await clearTrash(type, id)
    return { success: true, message: 'Record restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore record' }
  }
}

export async function deleteEnquiryAction(
  type: 'contact' | 'admission' | 'career' | 'franchise' | 'hire',
  id: string
) {
  const session = await requireSuperAdminSession()

  try {
    if (type === 'contact') await db.contactEnquiry.delete({ where: { id } })
    else if (type === 'admission') await db.admissionEnquiry.delete({ where: { id } })
    else if (type === 'career') await db.careerEnquiry.delete({ where: { id } })
    else if (type === 'franchise') await db.franchisePartnerEnquiry.delete({ where: { id } })
    else if (type === 'hire') await db.companyPlacementEnquiry.delete({ where: { id } })


    revalidatePath(`/admin/enquiries/${type}`)
    await clearTrash(type, id)
    return { success: true, message: 'Record permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete record' }
  }
}

export const deleteEnquiryPermanentlyAction = deleteEnquiryAction

/** Bulk delete enquiries (any status). */
export async function bulkDeleteEnquiryAction(
  type: 'contact' | 'admission' | 'career' | 'franchise' | 'hire',
  ids: string[]
) {
  const session = await requireSuperAdminSession()

  if (!ids || ids.length === 0) {
    return { success: false, error: 'No IDs provided' }
  }

  try {
    let deletedCount = 0

    for (const id of ids) {
      if (type === 'contact') await db.contactEnquiry.delete({ where: { id } })
      else if (type === 'admission') await db.admissionEnquiry.delete({ where: { id } })
      else if (type === 'career') await db.careerEnquiry.delete({ where: { id } })
      else if (type === 'franchise') await db.franchisePartnerEnquiry.delete({ where: { id } })
      else if (type === 'hire') await db.companyPlacementEnquiry.delete({ where: { id } })

      deletedCount++
    }


    revalidatePath(`/admin/enquiries/${type}`)
    await clearTrash(type, ids)
    return { success: true, message: `${deletedCount} record(s) permanently deleted` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to bulk delete records' }
  }
}

/**
 * Bulk update status for enquiries.
 * Supports updating multiple selected leads to CONTACTED, CLOSED, PENDING, etc.
 */
export async function bulkUpdateEnquiryStatusAction(
  type: 'contact' | 'admission' | 'career' | 'franchise' | 'hire',
  ids: string[],
  status: any
) {
  const session = await requirePermission(enquiryModule(type), 'edit')

  if (!ids || ids.length === 0) {
    return { success: false, error: 'No items selected' }
  }

  try {
    if (type === 'contact') {
      await db.contactEnquiry.updateMany({
        where: { id: { in: ids } },
        data: { status },
      })
    } else if (type === 'admission') {
      await db.admissionEnquiry.updateMany({
        where: { id: { in: ids } },
        data: { status },
      })
    } else if (type === 'career') {
      await db.careerEnquiry.updateMany({
        where: { id: { in: ids } },
        data: { status },
      })
    } else if (type === 'franchise') {
      await db.franchisePartnerEnquiry.updateMany({
        where: { id: { in: ids } },
        data: { status },
      })
    } else if (type === 'hire') {
      await db.companyPlacementEnquiry.updateMany({
        where: { id: { in: ids } },
        data: { status },
      })
    }


    revalidatePath(`/admin/enquiries/${type}`)
    return { success: true, message: `Successfully marked ${ids.length} lead(s) as ${status}` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update leads status' }
  }
}


