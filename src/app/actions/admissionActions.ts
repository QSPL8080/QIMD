'use server'

import { db } from '@/lib/db'
import {
  requireAdmissionHeadSession,
  requireAdminSession,
  getAdminSession,
  canManageAdmissions,
  canDeleteRecords,
} from '@/lib/auth'
import { revalidatePath } from 'next/cache'

/**
 * Generate a sequential, unique Admission ID: QIMD-ADM-YYYY-XXXX
 */
async function generateAdmissionNumber(): Promise<string> {
  const currentYear = new Date().getFullYear()
  const prefix = `QIMD-ADM-${currentYear}-`

  const latest = await db.admission.findFirst({
    where: {
      admissionNumber: { startsWith: prefix },
    },
    orderBy: { createdAt: 'desc' },
    select: { admissionNumber: true },
  })

  let nextSequence = 1
  if (latest && latest.admissionNumber) {
    const parts = latest.admissionNumber.split('-')
    const lastNum = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(lastNum)) {
      nextSequence = lastNum + 1
    }
  }

  const padded = String(nextSequence).padStart(4, '0')
  return `${prefix}${padded}`
}

/**
 * Fetch all admissions with optional filtering.
 */
export async function getAdmissionsAction() {
  const session = await requireAdmissionHeadSession()

  try {
    const admissions = await db.admission.findMany({
      where: { isDeleted: false },
      include: {
        counsellor: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        verifiedBy: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        lead: {
          select: { id: true, studentName: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      admissions,
      currentUser: {
        id: session.id,
        role: session.roleName,
        name: session.fullName,
      },
    }
  } catch (err: any) {
    console.error('Error fetching admissions:', err)
    return { success: false, error: err.message || 'Failed to fetch admissions', admissions: [] }
  }
}

/**
 * Create a new student admission record.
 */
export async function createAdmissionAction(data: {
  studentName: string
  email: string
  phone: string
  courseName: string
  batchTiming?: string
  city?: string
  qualification?: string
  leadId?: string
  counsellorId?: string
  remarks?: string
  documents?: any
}) {
  const session = await requireAdmissionHeadSession()

  if (!data.studentName?.trim() || !data.email?.trim() || !data.phone?.trim() || !data.courseName?.trim()) {
    return { success: false, error: 'Student Name, Email, Phone, and Course Name are required' }
  }

  try {
    const admissionNumber = await generateAdmissionNumber()

    const admission = await db.admission.create({
      data: {
        admissionNumber,
        studentName: data.studentName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        courseName: data.courseName.trim(),
        batchTiming: data.batchTiming || 'Regular Weekday (10 AM - 1 PM)',
        city: data.city || null,
        qualification: data.qualification || null,
        leadId: data.leadId || null,
        counsellorId: data.counsellorId || null,
        remarks: data.remarks || null,
        documents: data.documents || null,
        status: 'VERIFICATION_PENDING',
      },
    })

    // If linked to a lead, update the lead status to ADMISSION_CLOSED
    if (data.leadId) {
      await db.admissionEnquiry.update({
        where: { id: data.leadId },
        data: { status: 'ADMISSION_CLOSED', remarks: `Converted to Student Admission #${admissionNumber}` },
      }).catch((e) => console.error('Failed to link lead status:', e))

      await db.leadFollowUp.create({
        data: {
          enquiryType: 'admission',
          enquiryId: data.leadId,
          remarks: `Student officially enrolled. Generated Admission ID: ${admissionNumber}`,
          status: 'ADMISSION_CLOSED',
          createdById: session.id,
          createdByName: session.fullName,
          createdByRole: session.roleName,
        },
      }).catch((e) => console.error('Failed to create conversion follow-up:', e))
    }

    revalidatePath('/admin/admissions')
    revalidatePath('/admin/enquiries/admission')
    return { success: true, message: `Admission created successfully with ID ${admissionNumber}`, admission }
  } catch (err: any) {
    console.error('Error creating admission:', err)
    return { success: false, error: err.message || 'Failed to create admission' }
  }
}

/**
 * Verify and activate student admission (Admission Head or Admin).
 */
export async function verifyAdmissionAction(id: string, remarks?: string) {
  const session = await requireAdmissionHeadSession()

  try {
    const updated = await db.admission.update({
      where: { id },
      data: {
        status: 'VERIFIED_ACTIVE',
        verifiedById: session.id,
        verifiedAt: new Date(),
        remarks: remarks ? remarks.trim() : undefined,
      },
    })

    revalidatePath('/admin/admissions')
    return { success: true, message: `Admission ${updated.admissionNumber} verified and activated`, admission: updated }
  } catch (err: any) {
    console.error('Error verifying admission:', err)
    return { success: false, error: err.message || 'Failed to verify admission' }
  }
}

/**
 * Update student admission details or status.
 */
export async function updateAdmissionAction(
  id: string,
  data: Partial<{
    studentName: string
    email: string
    phone: string
    courseName: string
    batchTiming: string
    city: string
    qualification: string
    status: 'VERIFICATION_PENDING' | 'VERIFIED_ACTIVE' | 'CANCELLED'
    remarks: string
    counsellorId: string
  }>
) {
  await requireAdmissionHeadSession()

  try {
    const updated = await db.admission.update({
      where: { id },
      data: {
        studentName: data.studentName?.trim(),
        email: data.email?.trim().toLowerCase(),
        phone: data.phone?.trim(),
        courseName: data.courseName?.trim(),
        batchTiming: data.batchTiming,
        city: data.city,
        qualification: data.qualification,
        status: data.status,
        remarks: data.remarks,
        counsellorId: data.counsellorId || undefined,
      },
    })

    revalidatePath('/admin/admissions')
    return { success: true, message: 'Admission details updated', admission: updated }
  } catch (err: any) {
    console.error('Error updating admission:', err)
    return { success: false, error: err.message || 'Failed to update admission' }
  }
}

/**
 * Soft delete admission (Admin or Super Admin).
 */
export async function deleteAdmissionAction(id: string) {
  const session = await requireAdminSession()

  try {
    await db.admission.update({
      where: { id },
      data: { isDeleted: true },
    })

    revalidatePath('/admin/admissions')
    return { success: true, message: 'Admission record moved to Bin' }
  } catch (err: any) {
    console.error('Error deleting admission:', err)
    return { success: false, error: err.message || 'Failed to delete admission' }
  }
}
