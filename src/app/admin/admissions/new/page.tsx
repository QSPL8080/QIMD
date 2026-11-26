import React from 'react'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { todayIST } from '@/lib/dates'
import { admissionFormOptions } from '@/lib/admissionFormData'
import { PageHeader } from '@/components/Admin/ui'
import AdmissionForm, { type AdmissionFormValues } from '../AdmissionForm'

export const dynamic = 'force-dynamic'

export default async function NewAdmissionPage({ searchParams }: { searchParams: Promise<{ leadId?: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.roleName, 'admissions', 'add', session.moduleAccess)) redirect('/admin/admissions')
  const { leadId } = await searchParams
  const { courses, counsellors } = await admissionFormOptions()
  const today = todayIST()

  const lead =
    leadId && /^[0-9a-f-]{36}$/i.test(leadId)
      ? await (db as any).lead.findFirst({ where: { id: leadId, isDeleted: false }, select: { id: true, leadCode: true, fullName: true, phone: true, email: true, course: true, assignedToId: true } })
      : null
  // Match the lead's course of interest to a configured course where possible
  const matched = lead?.course ? courses.find((c) => lead.course.toLowerCase().includes(c.name.toLowerCase())) : undefined
  const course = matched || courses[0]

  const initial: AdmissionFormValues = {
    courseName: course?.name || '',
    courseDurationMonths: course?.durationMonths ? String(course.durationMonths) : '',
    batchTiming: '',
    practicalBatchTiming: '',
    admissionDate: today,
    expectedCompletion: '',
    studentName: lead?.fullName || '',
    guardianName: '',
    gender: '',
    dateOfBirth: '',
    mobile: lead?.phone || '',
    whatsapp: '',
    email: lead?.email || '',
    currentAddress: '',
    permanentAddress: '',
    highestQualification: '',
    qualificationOther: '',
    collegeSchool: '',
    yearOfPassing: '',
    currentStatus: '',
    collegeCompany: '',
    counsellorId: lead?.assignedToId || '',
    totalFee: course?.fee ? String(course.fee) : '',
    registrationFee: '',
    feeNote: '',
    documentsSubmitted: [],
    emergencyName: '',
    emergencyRelation: '',
    emergencyMobile: '',
    declarationAccepted: false,
    status: 'VERIFICATION_PENDING',
    installments: [],
  }
  if (initial.courseDurationMonths) {
    const d = new Date(`${today}T00:00:00Z`)
    d.setUTCMonth(d.getUTCMonth() + Number(initial.courseDurationMonths))
    initial.expectedCompletion = d.toISOString().slice(0, 10)
  }

  return (
    <div>
      <PageHeader
        back={{ href: lead ? `/admin/leads/${lead.id}` : '/admin/admissions', label: lead ? `Lead ${lead.leadCode}` : 'Admissions' }}
        title="New admission"
        subtitle={lead ? `Converting lead ${lead.leadCode} (${lead.fullName}). Fill in the verified admission form.` : 'Enter the verified admission form. An Admission ID is created when you save.'}
      />
      <AdmissionForm mode="create" leadId={lead?.id} initial={initial} courses={courses} counsellors={counsellors} today={today} />
    </div>
  )
}
