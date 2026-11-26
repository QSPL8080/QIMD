import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can, leadSourceLabel, leadStatusLabel, leadTypeLabel, type Module } from '@/lib/permissions'
import { buildLeadWhere, pickLeadQuery } from '@/lib/leadFilters'
import { pickAdmissionQuery, queryAdmissions } from '@/lib/admissionFilters'
import { toCsv, csvResponse } from '@/lib/csv'
import { buildPaymentWhere, pickPaymentQuery } from '@/lib/paymentFilters'
import { fmtDate, fmtDateTime, isYmd, istEnd, istStart, todayIST } from '@/lib/dates'
import { admissionStatusLabel, FEE_STATUS_LABEL, PAYMENT_KIND_LABEL, paymentModeLabel } from '@/lib/fees'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const MODULE: Record<string, Module> = { leads: 'leads', admissions: 'admissions', payments: 'fees', expenses: 'expenses', audit: 'audit' }

export async function GET(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params
  const session = await getAdminSession()
  const mod = MODULE[kind]
  if (!session) return new Response('Please sign in.', { status: 401 })
  // Only Super Admin, Admin and (for leads) Sales Manager can export — SRS §13.4
  if (!mod || !can(session.roleName, mod, 'export', session.moduleAccess)) return new Response('Your role cannot export this data.', { status: 403 })

  const sp = Object.fromEntries(new URL(request.url).searchParams.entries())
  const stamp = todayIST()
  let csv = ''
  let count = 0

  if (kind === 'leads') {
    const rows = await (db as any).lead.findMany({
      where: buildLeadWhere(session, pickLeadQuery(sp)),
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { fullName: true } } },
    })
    count = rows.length
    csv = toCsv(
      ['Lead ID', 'Received', 'Source', 'Enquiry Type', 'Name', 'Mobile', 'Email', 'Course', 'City', 'Qualification', 'Subject', 'Message', 'Status', 'Status Reason', 'Counsellor', 'Assigned At', 'Next Follow-up', 'Last Contacted', 'Possible Duplicate', 'Campaign', 'Ad ID', 'Form ID'],
      rows.map((l: any) => [
        l.leadCode, fmtDateTime(l.createdAt), leadSourceLabel(l.source), leadTypeLabel(l.enquiryType), l.fullName, l.phone, l.email, l.course, l.city, l.qualification, l.subject, l.message,
        leadStatusLabel(l.status), l.statusReason, l.assignedTo?.fullName || 'Unassigned', l.assignedAt ? fmtDateTime(l.assignedAt) : '', l.nextFollowUpAt ? fmtDateTime(l.nextFollowUpAt) : '',
        l.lastContactedAt ? fmtDateTime(l.lastContactedAt) : '', l.duplicateOfId ? 'Yes' : '', l.campaign, l.adId, l.formId,
      ]),
    )
  } else if (kind === 'admissions') {
    const rows = await queryAdmissions(pickAdmissionQuery(sp), {
      admissionCode: true, admissionDate: true, studentName: true, mobile: true, email: true, courseName: true, counsellorName: true, batchTiming: true, registrationFee: true,
    })
    count = rows.length
    csv = toCsv(
      ['Admission ID', 'Admission Date', 'Student', 'Mobile', 'Email', 'Course', 'Batch', 'Counsellor', 'Admission Status', 'Total Fee', 'Collected', 'Adjustments', 'Balance', 'Fee Status', 'Next Due Date', 'Next Due Amount', 'Overdue Amount'],
      rows.map((a: any) => [
        a.admissionCode, fmtDate(a.admissionDate), a.studentName, a.mobile, a.email, a.courseName, a.batchTiming, a.counsellorName, admissionStatusLabel(a.status),
        a.ledger.totalFee, a.ledger.collected, a.ledger.adjustments, a.ledger.balance, FEE_STATUS_LABEL[a.ledger.status as keyof typeof FEE_STATUS_LABEL],
        a.ledger.nextDue ? fmtDate(a.ledger.nextDue.dueDate) : '', a.ledger.nextDue?.amount ?? '', a.ledger.overdueAmount,
      ]),
    )
  } else if (kind === 'payments') {
    const rows = await (db as any).payment.findMany({ where: buildPaymentWhere(pickPaymentQuery(sp)), orderBy: { paidAt: 'desc' }, include: { admission: { select: { admissionCode: true, studentName: true, courseName: true } } } })
    count = rows.length
    csv = toCsv(
      ['Payment ID', 'Receipt No.', 'Type', 'Status', 'Date', 'Admission ID', 'Student', 'Course', 'Amount', 'Mode', 'Loan Bank', 'Reference', 'Notes', 'Recorded By', 'Recorded At', 'Receipt Email'],
      rows.map((p: any) => [
        p.paymentCode, p.receiptNo, PAYMENT_KIND_LABEL[p.kind] || p.kind, p.status, fmtDateTime(p.paidAt), p.admission.admissionCode, p.admission.studentName, p.admission.courseName,
        Number(p.amount), paymentModeLabel(p.mode), p.loanBank, p.reference, p.notes, p.recordedByName, fmtDateTime(p.createdAt), p.receiptEmailStatus,
      ]),
    )
  } else if (kind === 'expenses') {
    const and: any[] = [{ isDeleted: false }]
    if (isYmd(sp.from)) and.push({ expenseAt: { gte: istStart(sp.from) } })
    if (isYmd(sp.to)) and.push({ expenseAt: { lte: istEnd(sp.to) } })
    if (sp.mode) and.push({ paymentMode: sp.mode })
    if (sp.category) and.push({ category: sp.category })
    if (sp.q) and.push({ OR: [{ description: { contains: sp.q, mode: 'insensitive' } }, { expenseCode: { contains: sp.q, mode: 'insensitive' } }, { reference: { contains: sp.q, mode: 'insensitive' } }] })
    const rows = await (db as any).expense.findMany({ where: { AND: and }, orderBy: { expenseAt: 'desc' } })
    count = rows.length
    csv = toCsv(
      ['Expense ID', 'Date', 'Category', 'Description', 'Amount', 'Payment Mode', 'Reference', 'Created By', 'Updated By', 'Updated At'],
      rows.map((e: any) => [e.expenseCode, fmtDateTime(e.expenseAt), e.category, e.description, Number(e.amount), paymentModeLabel(e.paymentMode), e.reference, e.createdByName, e.updatedByName, fmtDateTime(e.updatedAt)]),
    )
  } else if (kind === 'audit') {
    const and: any[] = []
    if (isYmd(sp.from)) and.push({ createdAt: { gte: istStart(sp.from) } })
    if (isYmd(sp.to)) and.push({ createdAt: { lte: istEnd(sp.to) } })
    if (sp.action) and.push({ action: sp.action })
    if (sp.entity) and.push({ entityType: sp.entity })
    if (sp.q) and.push({ OR: [{ summary: { contains: sp.q, mode: 'insensitive' } }, { actorName: { contains: sp.q, mode: 'insensitive' } }] })
    const rows = await (db as any).auditLog.findMany({ where: { AND: and }, orderBy: { createdAt: 'desc' }, take: 50000 })
    count = rows.length
    csv = toCsv(
      ['Time', 'User', 'Role', 'Action', 'Record Type', 'Record', 'Summary', 'Before', 'After', 'IP'],
      rows.map((a: any) => [fmtDateTime(a.createdAt), a.actorName, a.actorRole, a.action, a.entityType, a.entityId, a.summary, a.before ? JSON.stringify(a.before) : '', a.after ? JSON.stringify(a.after) : '', a.ip]),
    )
  }

  await audit(session, 'EXPORT', kind, null, `Exported ${count} ${kind} record(s) to CSV`, { after: { filters: sp } })
  return csvResponse(`qimd-${kind}-${stamp}.csv`, csv)
}
