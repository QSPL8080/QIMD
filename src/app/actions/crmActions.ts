'use server'

import { db } from '@/lib/db'
import { coursesData } from '@/data'
import {
  contactEnquirySchema,
  admissionEnquirySchema,
  careerApplicationSchema,
  franchiseEnquirySchema,
  hireRequestSchema,
} from '@/lib/validations'
import { requireAdminSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

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

    const enquiry = await db.contactEnquiry.create({
      data: {
        fullName: validated.data.fullName,
        email: validated.data.email,
        phone: validated.data.phone,
        subject: validated.data.subject || 'General Enquiry',
        message: validated.data.message,
        status: 'NEW',
      },
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

    const programNote = programTitle ? `Program: ${programTitle}` : null
    const message = [programNote, validated.data.message].filter(Boolean).join('\n') || null

    const enquiry = await db.admissionEnquiry.create({
      data: {
        studentName: validated.data.studentName,
        email: validated.data.email,
        phone: validated.data.phone,
        city: validated.data.city || null,
        qualification: validated.data.qualification || null,
        message,
        status: 'NEW',
      },
    })


    try {
      revalidatePath('/admin/enquiries/admission')
    } catch {}

    return {
      success: true,
      message: 'Thank you! Admission enquiry received.',
      enquiryId: enquiry.id,
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


    return { success: true, message: 'Hiring request submitted! Our placement team will share top candidate profiles.' }
  } catch (err: any) {
    console.error('Hire request error:', err)
    return { success: false, error: 'Failed to submit hire request.' }
  }
}

// --- ADMIN CRM MANAGEMENT ACTIONS ---

export async function updateEnquiryStatusAction(
  type: 'contact' | 'admission' | 'career' | 'franchise' | 'hire',
  id: string,
  status: any,
  remarks?: string,
  assignedToId?: string
) {
  const session = await requireAdminSession()

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
  const session = await requireAdminSession()

  try {
    if (type === 'contact') await db.contactEnquiry.update({ where: { id }, data: { isDeleted: true } })
    else if (type === 'admission') await db.admissionEnquiry.update({ where: { id }, data: { isDeleted: true } })
    else if (type === 'career') await db.careerEnquiry.update({ where: { id }, data: { isDeleted: true } })
    else if (type === 'franchise') await db.franchisePartnerEnquiry.update({ where: { id }, data: { isDeleted: true } })
    else if (type === 'hire') await db.companyPlacementEnquiry.update({ where: { id }, data: { isDeleted: true } })


    revalidatePath(`/admin/enquiries/${type}`)
    return { success: true, message: 'Record moved to Trash' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash record' }
  }
}

export async function restoreEnquiryAction(
  type: 'contact' | 'admission' | 'career' | 'franchise' | 'hire',
  id: string
) {
  const session = await requireAdminSession()

  try {
    if (type === 'contact') await db.contactEnquiry.update({ where: { id }, data: { isDeleted: false } })
    else if (type === 'admission') await db.admissionEnquiry.update({ where: { id }, data: { isDeleted: false } })
    else if (type === 'career') await db.careerEnquiry.update({ where: { id }, data: { isDeleted: false } })
    else if (type === 'franchise') await db.franchisePartnerEnquiry.update({ where: { id }, data: { isDeleted: false } })
    else if (type === 'hire') await db.companyPlacementEnquiry.update({ where: { id }, data: { isDeleted: false } })


    revalidatePath(`/admin/enquiries/${type}`)
    return { success: true, message: 'Record restored' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore record' }
  }
}

export async function deleteEnquiryAction(
  type: 'contact' | 'admission' | 'career' | 'franchise' | 'hire',
  id: string
) {
  const session = await requireAdminSession()

  try {
    // Server-side: enforce that only CLOSED enquiries can be deleted
    let currentStatus: string | null = null

    if (type === 'contact') {
      const rec = await db.contactEnquiry.findUnique({ where: { id }, select: { status: true } })
      currentStatus = rec?.status || null
    } else if (type === 'admission') {
      const rec = await db.admissionEnquiry.findUnique({ where: { id }, select: { status: true } })
      currentStatus = rec?.status || null
    } else if (type === 'career') {
      const rec = await db.careerEnquiry.findUnique({ where: { id }, select: { status: true } })
      currentStatus = rec?.status || null
    } else if (type === 'franchise') {
      const rec = await db.franchisePartnerEnquiry.findUnique({ where: { id }, select: { status: true } })
      currentStatus = rec?.status || null
    } else if (type === 'hire') {
      const rec = await db.companyPlacementEnquiry.findUnique({ where: { id }, select: { status: true } })
      currentStatus = rec?.status || null
    }

    // Only allow deletion if status is CLOSED or REJECTED
    const allowedStatuses = ['CLOSED', 'REJECTED']
    if (!currentStatus || !allowedStatuses.includes(currentStatus)) {
      return {
        success: false,
        error: `Only CLOSED enquiries can be deleted. Current status: ${currentStatus || 'unknown'}`
      }
    }

    if (type === 'contact') await db.contactEnquiry.delete({ where: { id } })
    else if (type === 'admission') await db.admissionEnquiry.delete({ where: { id } })
    else if (type === 'career') await db.careerEnquiry.delete({ where: { id } })
    else if (type === 'franchise') await db.franchisePartnerEnquiry.delete({ where: { id } })
    else if (type === 'hire') await db.companyPlacementEnquiry.delete({ where: { id } })


    revalidatePath(`/admin/enquiries/${type}`)
    return { success: true, message: 'Record permanently deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete record' }
  }
}

export const deleteEnquiryPermanentlyAction = deleteEnquiryAction

/**
 * Bulk delete CLOSED enquiries only.
 * Server enforces that only records with CLOSED/REJECTED status are deleted.
 */
export async function bulkDeleteEnquiryAction(
  type: 'contact' | 'admission' | 'career' | 'franchise' | 'hire',
  ids: string[]
) {
  const session = await requireAdminSession()

  if (!ids || ids.length === 0) {
    return { success: false, error: 'No IDs provided' }
  }

  try {
    const allowedStatuses = ['CLOSED', 'REJECTED']
    let deletedCount = 0

    for (const id of ids) {
      let currentStatus: string | null = null

      if (type === 'contact') {
        const rec = await db.contactEnquiry.findUnique({ where: { id }, select: { status: true } })
        currentStatus = rec?.status || null
      } else if (type === 'admission') {
        const rec = await db.admissionEnquiry.findUnique({ where: { id }, select: { status: true } })
        currentStatus = rec?.status || null
      } else if (type === 'career') {
        const rec = await db.careerEnquiry.findUnique({ where: { id }, select: { status: true } })
        currentStatus = rec?.status || null
      } else if (type === 'franchise') {
        const rec = await db.franchisePartnerEnquiry.findUnique({ where: { id }, select: { status: true } })
        currentStatus = rec?.status || null
      } else if (type === 'hire') {
        const rec = await db.companyPlacementEnquiry.findUnique({ where: { id }, select: { status: true } })
        currentStatus = rec?.status || null
      }

      // Skip non-CLOSED records silently (server enforcement)
      if (!currentStatus || !allowedStatuses.includes(currentStatus)) {
        continue
      }

      if (type === 'contact') await db.contactEnquiry.delete({ where: { id } })
      else if (type === 'admission') await db.admissionEnquiry.delete({ where: { id } })
      else if (type === 'career') await db.careerEnquiry.delete({ where: { id } })
      else if (type === 'franchise') await db.franchisePartnerEnquiry.delete({ where: { id } })
      else if (type === 'hire') await db.companyPlacementEnquiry.delete({ where: { id } })

      deletedCount++
    }


    revalidatePath(`/admin/enquiries/${type}`)
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
  const session = await requireAdminSession()

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


