import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { todayIST, ymdOf } from '@/lib/dates'
import { admissionFormOptions } from '@/lib/admissionFormData'
import { PageHeader } from '@/components/Admin/ui'
import AdmissionForm, { type AdmissionFormValues } from '../../AdmissionForm'

export const dynamic = 'force-dynamic'

export default async function EditAdmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  const { id } = await params
  if (!can(session.roleName, 'admissions', 'edit', session.moduleAccess)) redirect(`/admin/admissions/${id}`)
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const a = await (db as any).admission.findFirst({ where: { id, isDeleted: false }, include: { installments: { orderBy: [{ sortOrder: 'asc' }, { dueDate: 'asc' }] } } })
  if (!a) notFound()
  const [{ courses, counsellors }, payments] = await Promise.all([admissionFormOptions(), (db as any).payment.count({ where: { admissionId: id } })])
  const s = (v: unknown) => (v === null || v === undefined ? '' : String(v))

  const initial: AdmissionFormValues = {
    courseName: a.courseName,
    courseDurationMonths: s(a.courseDurationMonths),
    batchTiming: s(a.batchTiming),
    practicalBatchTiming: s(a.practicalBatchTiming),
    admissionDate: ymdOf(a.admissionDate),
    expectedCompletion: ymdOf(a.expectedCompletion),
    studentName: a.studentName,
    guardianName: s(a.guardianName),
    gender: s(a.gender),
    dateOfBirth: ymdOf(a.dateOfBirth),
    mobile: a.mobile,
    whatsapp: s(a.whatsapp),
    email: s(a.email),
    currentAddress: s(a.currentAddress),
    permanentAddress: s(a.permanentAddress),
    highestQualification: s(a.highestQualification),
    qualificationOther: s(a.qualificationOther),
    collegeSchool: s(a.collegeSchool),
    yearOfPassing: s(a.yearOfPassing),
    currentStatus: s(a.currentStatus),
    collegeCompany: s(a.collegeCompany),
    counsellorId: s(a.counsellorId),
    totalFee: String(Number(a.totalFee)),
    registrationFee: a.registrationFee == null ? '' : String(Number(a.registrationFee)),
    feeNote: s(a.feeNote),
    documentsSubmitted: Array.isArray(a.documentsSubmitted) ? a.documentsSubmitted : [],
    emergencyName: s(a.emergencyName),
    emergencyRelation: s(a.emergencyRelation),
    emergencyMobile: s(a.emergencyMobile),
    declarationAccepted: Boolean(a.declarationAccepted),
    status: a.status,
    installments: a.installments.map((i: any) => ({ id: i.id, label: i.label, dueDate: ymdOf(i.dueDate), amount: String(Number(i.amount)) })),
  }
  // A counsellor no longer active still shows on the form
  const list = a.counsellorId && !counsellors.some((c) => c.id === a.counsellorId) ? [...counsellors, { id: a.counsellorId, fullName: `${a.counsellorName || 'Former user'} (inactive)` }] : counsellors

  return (
    <div>
      <PageHeader back={{ href: `/admin/admissions/${id}`, label: a.admissionCode }} title={`Edit ${a.admissionCode}`} subtitle={`${a.studentName} · every change is kept in the history.`} />
      <AdmissionForm mode="edit" admissionId={id} initial={initial} courses={courses} counsellors={list} today={todayIST()} hasPayments={payments > 0} />
    </div>
  )
}
