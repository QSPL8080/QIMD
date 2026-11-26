'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requirePermission, requireSuperAdminSession } from '@/lib/auth'
import { normalizePhone, normalizeEmail } from '@/lib/leads'
import { audit, diff } from '@/lib/audit'
import { notifyRoles } from '@/lib/notifications'
import { recordTrash, clearTrash } from '@/lib/trash'
import { ADMISSION_STATUSES, PAYMENT_MODES } from '@/lib/fees'
import { dateOnly, isYmd, istStart, todayIST, ymdOf } from '@/lib/dates'
import { recordPaymentInternal } from '@/lib/payments'
import { GENDERS, QUALIFICATIONS, CURRENT_STATUSES, DOCUMENTS } from '@/lib/admissionForm'

type Result = { success: boolean; message?: string; error?: string; id?: string; warning?: string }

const str = (v: unknown, max: number) => {
  const s = String(v ?? '').trim()
  return s ? s.slice(0, max) : null
}
const isUuid = (v: unknown) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v)
const money = (v: unknown) => {
  const n = Number(String(v ?? '').replace(/,/g, ''))
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN
}
const fail = (err: any): Result => ({ success: false, error: String(err?.message || err).replace(/^(UNAUTHORIZED|FORBIDDEN): /, '') })

type InstallmentInput = { id?: string; label: string; dueDate: string; amount: string | number }

function refresh(id?: string) {
  revalidatePath('/admin/admissions')
  revalidatePath('/admin/fees')
  revalidatePath('/admin/dashboard')
  if (id) revalidatePath(`/admin/admissions/${id}`)
}

/** Validate the admission form. Returns clean data for the database or an error message. */
function validate(d: any) {
  const studentName = str(d.studentName, 150)
  if (!studentName) return { error: 'Student name is required.' }
  const mobile = str(d.mobile, 30)
  if (!mobile || (normalizePhone(mobile) || '').length < 10) return { error: 'Enter a valid 10-digit mobile number.' }
  const whatsapp = str(d.whatsapp, 30)
  if (whatsapp && (normalizePhone(whatsapp) || '').length < 10) return { error: 'Enter a valid WhatsApp number.' }
  const email = normalizeEmail(d.email)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' }
  const courseName = str(d.courseName, 200)
  if (!courseName) return { error: 'Choose the course.' }
  if (!isYmd(d.admissionDate)) return { error: 'Admission date is required.' }
  if (d.dateOfBirth && !isYmd(d.dateOfBirth)) return { error: 'Date of birth is not valid.' }
  if (d.dateOfBirth && d.dateOfBirth > todayIST()) return { error: 'Date of birth cannot be in the future.' }
  if (d.expectedCompletion && !isYmd(d.expectedCompletion)) return { error: 'Expected completion date is not valid.' }
  if (d.expectedCompletion && d.expectedCompletion < d.admissionDate) return { error: 'Expected completion must be after the admission date.' }
  const duration = d.courseDurationMonths === '' || d.courseDurationMonths == null ? null : Math.round(Number(d.courseDurationMonths))
  if (duration !== null && (!Number.isFinite(duration) || duration < 1 || duration > 60)) return { error: 'Course duration must be between 1 and 60 months.' }
  const totalFee = money(d.totalFee)
  if (!Number.isFinite(totalFee) || totalFee <= 0) return { error: 'Enter the total course fee.' }
  const registrationFee = d.registrationFee === '' || d.registrationFee == null ? null : money(d.registrationFee)
  if (registrationFee !== null && (!Number.isFinite(registrationFee) || registrationFee < 0 || registrationFee > totalFee)) return { error: 'Registration fee must be between 0 and the total fee.' }
  if (d.gender && !GENDERS.includes(d.gender)) return { error: 'Choose a valid gender.' }
  if (d.highestQualification && !QUALIFICATIONS.includes(d.highestQualification)) return { error: 'Choose a valid qualification.' }
  if (d.currentStatus && !CURRENT_STATUSES.includes(d.currentStatus)) return { error: 'Choose a valid current status.' }
  if (d.yearOfPassing && !/^\d{4}$/.test(String(d.yearOfPassing))) return { error: 'Year of passing must be 4 digits.' }
  const emergencyMobile = str(d.emergencyMobile, 30)
  if (emergencyMobile && (normalizePhone(emergencyMobile) || '').length < 10) return { error: 'Enter a valid emergency contact number.' }
  if (!d.declarationAccepted) return { error: 'The student declaration must be confirmed.' }
  const docs = Array.isArray(d.documentsSubmitted) ? d.documentsSubmitted.filter((x: unknown) => DOCUMENTS.includes(String(x))) : []

  // Fee schedule
  const rows: InstallmentInput[] = Array.isArray(d.installments) ? d.installments : []
  const installments = []
  for (const [i, r] of rows.entries()) {
    const amount = money(r.amount)
    const label = str(r.label, 100) || `Instalment ${i + 1}`
    if (!isYmd(r.dueDate)) return { error: `${label}: enter a due date.` }
    if (!Number.isFinite(amount) || amount <= 0) return { error: `${label}: enter an amount greater than 0.` }
    installments.push({ id: isUuid(r.id) ? r.id : undefined, label, dueDate: r.dueDate, amount, sortOrder: i })
  }
  const scheduled = installments.reduce((s, r) => s + r.amount, 0)
  if (Math.round(scheduled * 100) > Math.round(totalFee * 100)) return { error: `Instalments add up to ₹${scheduled.toLocaleString('en-IN')}, more than the total fee.` }

  return {
    data: {
      courseName,
      courseDurationMonths: duration,
      batchTiming: str(d.batchTiming, 120),
      practicalBatchTiming: str(d.practicalBatchTiming, 120),
      admissionDate: dateOnly(d.admissionDate),
      expectedCompletion: d.expectedCompletion ? dateOnly(d.expectedCompletion) : null,
      studentName,
      guardianName: str(d.guardianName, 150),
      gender: str(d.gender, 20),
      dateOfBirth: d.dateOfBirth ? dateOnly(d.dateOfBirth) : null,
      mobile,
      mobileNormalized: normalizePhone(mobile),
      whatsapp,
      email,
      currentAddress: str(d.currentAddress, 1000),
      permanentAddress: str(d.permanentAddress, 1000),
      highestQualification: str(d.highestQualification, 60),
      qualificationOther: d.highestQualification === 'Other' ? str(d.qualificationOther, 150) : null,
      collegeSchool: str(d.collegeSchool, 200),
      yearOfPassing: str(d.yearOfPassing, 10),
      currentStatus: str(d.currentStatus, 60),
      collegeCompany: str(d.collegeCompany, 200),
      totalFee,
      registrationFee,
      feeNote: str(d.feeNote, 2000),
      documentsSubmitted: docs,
      emergencyName: str(d.emergencyName, 150),
      emergencyRelation: str(d.emergencyRelation, 80),
      emergencyMobile,
      declarationAccepted: true,
    },
    installments,
  }
}

async function counsellorFields(counsellorId: unknown) {
  if (!isUuid(counsellorId)) return { counsellorId: null, counsellorName: null }
  const u = await db.user.findFirst({ where: { id: counsellorId as string, isDeleted: false } })
  return u ? { counsellorId: u.id, counsellorName: u.fullName } : { counsellorId: null, counsellorName: null }
}

/** Admission Head / Admin: create the official admission after verifying the form, documents and payment evidence. */
export async function createAdmissionAction(input: any): Promise<Result> {
  try {
    const session = await requirePermission('admissions', 'add')
    const v = validate(input)
    if (v.error) return { success: false, error: v.error }
    const data = v.data!

    // Linked lead (conversion reference)
    let leadId: string | null = null
    if (input.leadId) {
      const lead = await (db as any).lead.findFirst({ where: { id: isUuid(input.leadId) ? input.leadId : '00000000-0000-0000-0000-000000000000', isDeleted: false } })
      if (!lead) return { success: false, error: 'The linked lead was not found.' }
      const existing = await (db as any).admission.findFirst({ where: { leadId: lead.id, isDeleted: false, status: { not: 'CANCELLED' } } })
      if (existing) return { success: false, error: `This lead already has admission ${existing.admissionCode}.` }
      leadId = lead.id
    }

    // Same student already admitted to the same course?
    if (!input.confirmDuplicate) {
      const dup = await (db as any).admission.findFirst({
        where: { mobileNormalized: data.mobileNormalized, courseName: data.courseName, isDeleted: false, status: { not: 'CANCELLED' } },
      })
      if (dup) return { success: false, warning: 'duplicate', error: `${dup.studentName} (${dup.admissionCode}) is already admitted to ${dup.courseName} with this mobile number. Save anyway?` }
    }

    // Registration fee paid now → recorded as the first payment (with receipt)
    const reg = input.registrationPayment || {}
    const recordReg = Boolean(reg.record) && Number(data.registrationFee || 0) > 0
    if (recordReg) {
      if (!PAYMENT_MODES.some((m) => m.value === reg.mode)) return { success: false, error: 'Choose how the registration fee was paid.' }
      if (!isYmd(reg.paidDate)) return { success: false, error: 'Enter the registration fee paid date.' }
      if (reg.paidDate > todayIST()) return { success: false, error: 'Registration fee paid date cannot be in the future.' }
    }

    const status = ADMISSION_STATUSES.some((s) => s.value === input.status) ? input.status : 'VERIFICATION_PENDING'
    const admission = await (db as any).admission.create({
      data: {
        ...data,
        documentsSubmitted: data.documentsSubmitted,
        leadId,
        ...(await counsellorFields(input.counsellorId)),
        status,
        ...(status === 'ACTIVE' ? { verifiedById: session.id, verifiedByName: session.fullName, verifiedAt: new Date() } : {}),
        createdById: session.id,
        createdByName: session.fullName,
        updatedById: session.id,
        updatedByName: session.fullName,
        installments: {
          create: v.installments!.map((i) => ({ label: i.label, dueDate: dateOnly(i.dueDate), amount: i.amount, sortOrder: i.sortOrder })),
        },
      },
    })
    await audit(session, 'ADMISSION_CREATE', 'admission', admission.id, `Created admission ${admission.admissionCode} for ${admission.studentName} (${admission.courseName})`, { after: admission })
    await notifyRoles(
      ['SUPER_ADMIN', 'ADMIN', 'ADMISSION_HEAD'],
      { type: 'ADMISSION_CREATED', title: `Admission ${admission.admissionCode} created: ${admission.studentName} — ${admission.courseName}`, link: `/admin/admissions/${admission.id}`, actor: { id: session.id, fullName: session.fullName, email: session.email, role: session.roleName } },
      session.id,
    )

    let message = `Admission ${admission.admissionCode} created.`
    if (recordReg) {
      const paid = await recordPaymentInternal(session, admission.id, {
        amount: Number(data.registrationFee),
        paidAt: istStart(reg.paidDate),
        mode: reg.mode,
        reference: str(reg.reference, 150),
        loanBank: reg.mode === 'LOAN' ? str(reg.loanBank, 150) : null,
        notes: 'Registration fee',
      })
      message += paid.success ? ` Registration fee recorded (${paid.message}).` : ` Registration fee NOT recorded: ${paid.error}`
    }
    refresh(admission.id)
    if (leadId) revalidatePath(`/admin/leads/${leadId}`)
    return { success: true, message, id: admission.id }
  } catch (err) {
    return fail(err)
  }
}

/** Edit an admission. Every change is kept in the audit history. */
export async function updateAdmissionAction(id: string, input: any): Promise<Result> {
  try {
    const session = await requirePermission('admissions', 'edit')
    const before = await (db as any).admission.findFirst({ where: { id, isDeleted: false }, include: { installments: true } })
    if (!before) return { success: false, error: 'Admission not found.' }
    const v = validate(input)
    if (v.error) return { success: false, error: v.error }
    const counsellor = await counsellorFields(input.counsellorId)

    // Keep unchanged instalments (so reminders already sent are not repeated); update/add/remove the rest
    const keep = v.installments!.filter((i) => i.id && before.installments.some((b: any) => b.id === i.id))
    const removeIds = before.installments.filter((b: any) => !keep.some((k) => k.id === b.id)).map((b: any) => b.id)
    const ops: any[] = [
      (db as any).admission.update({
        where: { id },
        data: { ...v.data, ...counsellor, updatedById: session.id, updatedByName: session.fullName },
      }),
      ...(removeIds.length ? [(db as any).feeInstallment.deleteMany({ where: { id: { in: removeIds }, admissionId: id } })] : []),
      ...keep.map((i) => (db as any).feeInstallment.update({ where: { id: i.id }, data: { label: i.label, dueDate: dateOnly(i.dueDate), amount: i.amount, sortOrder: i.sortOrder } })),
      ...v.installments!.filter((i) => !keep.includes(i)).map((i) => (db as any).feeInstallment.create({ data: { admissionId: id, label: i.label, dueDate: dateOnly(i.dueDate), amount: i.amount, sortOrder: i.sortOrder } })),
    ]
    await db.$transaction(ops)
    const after = await (db as any).admission.findUnique({ where: { id }, include: { installments: true } })

    const norm = (a: any) => ({
      ...a,
      installments: (a.installments || []).sort((x: any, y: any) => x.sortOrder - y.sortOrder).map((i: any) => `${i.label}: ₹${Number(i.amount)} due ${ymdOf(i.dueDate)}`),
      totalFee: Number(a.totalFee),
      registrationFee: a.registrationFee == null ? null : Number(a.registrationFee),
      admissionDate: ymdOf(a.admissionDate),
      expectedCompletion: ymdOf(a.expectedCompletion),
      dateOfBirth: ymdOf(a.dateOfBirth),
    })
    const d = diff(norm(before), norm(after))
    if (d.changed.length) await audit(session, 'ADMISSION_UPDATE', 'admission', id, `Updated ${before.admissionCode}: ${d.changed.join(', ')}`, d)
    refresh(id)
    return { success: true, message: 'Admission updated.', id }
  } catch (err) {
    return fail(err)
  }
}

/** Verification / status (Verification Pending → Active, Completed, Cancelled / Withdrawn). */
export async function setAdmissionStatusAction(id: string, status: string, reason?: string): Promise<Result> {
  try {
    const session = await requirePermission('admissions', 'edit')
    if (!ADMISSION_STATUSES.some((s) => s.value === status)) return { success: false, error: 'Choose a valid status.' }
    const a = await (db as any).admission.findFirst({ where: { id, isDeleted: false } })
    if (!a) return { success: false, error: 'Admission not found.' }
    if (a.status === status) return { success: true, message: 'No change.' }
    if (status === 'CANCELLED' && !str(reason, 255)) return { success: false, error: 'Give a reason for cancelling / withdrawing.' }
    await (db as any).admission.update({
      where: { id },
      data: {
        status,
        statusReason: str(reason, 255),
        ...(status === 'ACTIVE' && !a.verifiedAt ? { verifiedById: session.id, verifiedByName: session.fullName, verifiedAt: new Date() } : {}),
        updatedById: session.id,
        updatedByName: session.fullName,
      },
    })
    await audit(session, 'ADMISSION_STATUS', 'admission', id, `${a.admissionCode}: ${a.status} → ${status}${reason ? ` (${reason})` : ''}`, { before: { status: a.status }, after: { status, reason: reason || null } })
    await notifyRoles(
      ['SUPER_ADMIN', 'ADMIN', 'ADMISSION_HEAD'],
      { type: 'ADMISSION_UPDATED', title: `${a.admissionCode} (${a.studentName}) is now ${ADMISSION_STATUSES.find((s) => s.value === status)?.label}`, link: `/admin/admissions/${id}` },
      session.id,
    )
    refresh(id)
    return { success: true, message: 'Status updated.' }
  } catch (err) {
    return fail(err)
  }
}

/** Super Admin / Admin: move an admission to the Bin (its payments stay untouched). */
export async function trashAdmissionAction(id: string): Promise<Result> {
  try {
    const session = await requirePermission('admissions', 'delete')
    const a = await (db as any).admission.findFirst({ where: { id, isDeleted: false } })
    if (!a) return { success: false, error: 'Admission not found.' }
    await (db as any).admission.update({ where: { id }, data: { isDeleted: true, updatedById: session.id, updatedByName: session.fullName } })
    await recordTrash('admission_record', id, session)
    await audit(session, 'ADMISSION_DELETE', 'admission', id, `Moved ${a.admissionCode} (${a.studentName}) to the Bin`)
    refresh()
    return { success: true, message: 'Admission moved to the Bin.' }
  } catch (err) {
    return fail(err)
  }
}

export async function restoreAdmissionAction(id: string): Promise<Result> {
  try {
    const session = await requireSuperAdminSession()
    const a = await (db as any).admission.update({ where: { id }, data: { isDeleted: false } })
    await clearTrash('admission_record', id)
    await audit(session, 'ADMISSION_RESTORE', 'admission', id, `Restored ${a.admissionCode} from the Bin`)
    refresh(id)
    return { success: true, message: 'Admission restored.' }
  } catch (err) {
    return fail(err)
  }
}

/** Permanent delete is only possible when no money was ever recorded against the admission. */
export async function deleteAdmissionForeverAction(id: string): Promise<Result> {
  try {
    const session = await requireSuperAdminSession()
    const a = await (db as any).admission.findUnique({ where: { id } })
    if (!a) return { success: false, error: 'Admission not found.' }
    const payments = await (db as any).payment.count({ where: { admissionId: id } })
    if (payments > 0) return { success: false, error: `${a.admissionCode} has payment records, which are financial history and cannot be erased. It stays in the Bin.` }
    await db.$transaction([
      (db as any).storedFile.deleteMany({ where: { ownerType: 'admission', ownerId: id } }),
      (db as any).admission.delete({ where: { id } }),
    ])
    await clearTrash('admission_record', id)
    await audit(session, 'ADMISSION_DELETE_PERMANENT', 'admission', id, `Permanently deleted ${a.admissionCode} (${a.studentName})`, { before: a })
    return { success: true, message: 'Admission deleted permanently.' }
  } catch (err) {
    return fail(err)
  }
}

/** Remove an uploaded document (Super Admin / Admin). The file is kept in the database, hidden, for recovery. */
export async function removeAdmissionFileAction(fileId: string): Promise<Result> {
  try {
    const session = await requirePermission('admissions', 'delete')
    const f = await (db as any).storedFile.findFirst({ where: { id: fileId, ownerType: 'admission', isDeleted: false }, select: { id: true, ownerId: true, originalName: true } })
    if (!f) return { success: false, error: 'File not found.' }
    await (db as any).storedFile.update({ where: { id: fileId }, data: { isDeleted: true } })
    await audit(session, 'FILE_REMOVE', 'admission', f.ownerId, `Removed document ${f.originalName}`)
    refresh(f.ownerId)
    return { success: true, message: 'Document removed.' }
  } catch (err) {
    return fail(err)
  }
}
