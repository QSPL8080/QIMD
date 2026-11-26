'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requirePermission, requireSuperAdminSession, type SessionUser } from '@/lib/auth'
import { LEAD_STATUSES, LEAD_TYPES, isLeadScopedToAssignee, normalizeRole } from '@/lib/permissions'
import { createLead, normalizeEmail, normalizePhone } from '@/lib/leads'
import { findLeadForUser } from '@/lib/leadAccess'
import { audit, diff } from '@/lib/audit'
import { notifyUser } from '@/lib/notifications'
import { recordTrash, clearTrash } from '@/lib/trash'
import { istLocalToDate } from '@/lib/dates'

type Result = { success: boolean; message?: string; error?: string; id?: string }

const STATUS_VALUES = LEAD_STATUSES.map((s) => s.value) as string[]
const str = (v: unknown, max: number) => {
  const s = String(v ?? '').trim()
  return s ? s.slice(0, max) : null
}
const isUuid = (v: unknown) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v)
const fail = (err: any): Result => ({ success: false, error: String(err?.message || err).replace(/^(UNAUTHORIZED|FORBIDDEN): /, '') })

function refresh(id?: string) {
  revalidatePath('/admin/leads')
  if (id) revalidatePath(`/admin/leads/${id}`)
  revalidatePath('/admin/dashboard')
}

function validLeadFields(d: any) {
  const fullName = str(d.fullName, 150)
  if (!fullName) return { error: 'Name is required.' }
  const phone = str(d.phone, 30)
  const email = normalizeEmail(d.email)
  if (!phone && !email) return { error: 'Enter a mobile number or an email address.' }
  if (phone && (normalizePhone(phone) || '').length < 7) return { error: 'Enter a valid mobile number.' }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' }
  const enquiryType = (LEAD_TYPES.map((t) => t.value) as string[]).includes(d.enquiryType) ? d.enquiryType : 'ADMISSION'
  return {
    data: {
      fullName,
      phone,
      email,
      enquiryType,
      course: str(d.course, 200),
      city: str(d.city, 120),
      qualification: str(d.qualification, 150),
      subject: str(d.subject, 255),
      message: str(d.message, 5000),
    },
  }
}

/** Sales Manager / Admin: add a lead by hand (walk-in, phone call…). */
export async function createManualLeadAction(input: any): Promise<Result> {
  try {
    const session = await requirePermission('leads', 'add')
    const v = validLeadFields(input)
    if (v.error) return { success: false, error: v.error }
    const lead = await createLead({ source: 'MANUAL', ...(v.data as any), createdBy: { id: session.id, fullName: session.fullName } })
    if (!lead) return { success: false, error: 'Lead could not be saved.' }
    await audit(session, 'LEAD_CREATE', 'lead', lead.id, `Created manual lead ${lead.leadCode} (${lead.fullName})`, { after: lead })
    if (isUuid(input.assignToId)) await assignLeadsAction([lead.id], input.assignToId)
    refresh()
    return { success: true, message: `Lead ${lead.leadCode} added.`, id: lead.id }
  } catch (err) {
    return fail(err)
  }
}

/** Edit contact/enquiry details (not counsellors — they update status, remarks and follow-ups only). */
export async function updateLeadDetailsAction(id: string, input: any): Promise<Result> {
  try {
    const session = await requirePermission('leads', 'edit')
    if (isLeadScopedToAssignee(session.roleName)) return { success: false, error: 'Your role can update status and follow-ups only.' }
    const lead = await findLeadForUser(session, id)
    if (!lead) return { success: false, error: 'Lead not found.' }
    const v = validLeadFields({ ...input, enquiryType: input.enquiryType || lead.enquiryType })
    if (v.error) return { success: false, error: v.error }
    const data = { ...(v.data as any), phoneNormalized: normalizePhone(v.data!.phone), updatedById: session.id, updatedByName: session.fullName }
    const updated = await (db as any).lead.update({ where: { id }, data })
    const d = diff(lead, updated)
    if (d.changed.length) await audit(session, 'LEAD_UPDATE', 'lead', id, `Updated ${lead.leadCode}: ${d.changed.join(', ')}`, d)
    refresh(id)
    return { success: true, message: 'Lead updated.' }
  } catch (err) {
    return fail(err)
  }
}

async function assigneeOrError(userId: string | null) {
  if (userId === null) return { user: null }
  if (!isUuid(userId)) return { error: 'Choose a counsellor.' }
  const user = await db.user.findFirst({ where: { id: userId, status: true, isDeleted: false } })
  if (!user) return { error: 'That user is not active.' }
  if (!['COUNSELLOR', 'SALES_MANAGER'].includes(normalizeRole(user.role))) return { error: 'Leads can only be assigned to a Counsellor or Sales Manager.' }
  return { user }
}

/** Assign / reassign one or more leads; every change is kept in the assignment history. Pass null to unassign. */
export async function assignLeadsAction(ids: string[], userId: string | null): Promise<Result> {
  try {
    const session = await requirePermission('leads', 'assign')
    const list = (ids || []).filter(isUuid)
    if (list.length === 0) return { success: false, error: 'Select at least one lead.' }
    const a = await assigneeOrError(userId)
    if ('error' in a && a.error) return { success: false, error: a.error }
    const to = (a as any).user as { id: string; fullName: string } | null

    const leads = await (db as any).lead.findMany({ where: { id: { in: list }, isDeleted: false }, include: { assignedTo: { select: { fullName: true } } } })
    let changed = 0
    for (const l of leads) {
      if ((l.assignedToId || null) === (to?.id || null)) continue
      await db.$transaction([
        (db as any).lead.update({
          where: { id: l.id },
          data: { assignedToId: to?.id || null, assignedAt: to ? new Date() : null, updatedById: session.id, updatedByName: session.fullName },
        }),
        (db as any).leadAssignment.create({
          data: {
            leadId: l.id,
            fromUserId: l.assignedToId,
            fromUserName: l.assignedTo?.fullName || null,
            toUserId: to?.id || null,
            toUserName: to?.fullName || null,
            assignedById: session.id,
            assignedByName: session.fullName,
          },
        }),
      ])
      changed++
      await audit(session, l.assignedToId ? 'LEAD_REASSIGN' : 'LEAD_ASSIGN', 'lead', l.id, `${l.leadCode}: ${l.assignedTo?.fullName || 'Unassigned'} → ${to?.fullName || 'Unassigned'}`, {
        before: { assignedTo: l.assignedTo?.fullName || null },
        after: { assignedTo: to?.fullName || null },
      })
    }
    if (to && changed > 0) {
      await notifyUser(to.id, {
        type: 'LEAD_ASSIGNED',
        title: changed === 1 ? `${session.fullName} assigned you a lead: ${leads.find((l: any) => l.assignedToId !== to.id)?.fullName || ''}` : `${session.fullName} assigned you ${changed} leads`,
        link: changed === 1 ? `/admin/leads/${leads.find((l: any) => l.assignedToId !== to.id)?.id}` : '/admin/leads?assigned=me',
        actor: { id: session.id, fullName: session.fullName, email: session.email, role: session.roleName },
      })
    }
    refresh()
    list.forEach((i) => revalidatePath(`/admin/leads/${i}`))
    return { success: true, message: changed ? `${changed} lead(s) ${to ? `assigned to ${to.fullName}` : 'unassigned'}.` : 'No change.' }
  } catch (err) {
    return fail(err)
  }
}

async function writeFollowUp(session: SessionUser, lead: any, f: { followedAt: Date; remarks: string; status: string | null; nextFollowUpAt: Date | null; reason?: string | null }) {
  const statusChanged = f.status && f.status !== lead.status
  await db.$transaction([
    (db as any).leadFollowUp.create({
      data: {
        leadId: lead.id,
        followedAt: f.followedAt,
        remarks: f.remarks,
        statusAfter: f.status || lead.status,
        nextFollowUpAt: f.nextFollowUpAt,
        createdById: session.id,
        createdByName: session.fullName,
      },
    }),
    (db as any).lead.update({
      where: { id: lead.id },
      data: {
        ...(f.status ? { status: f.status } : {}),
        ...(f.status === 'INVALID' ? { statusReason: f.reason || f.remarks.slice(0, 255) } : statusChanged ? { statusReason: null } : {}),
        nextFollowUpAt: f.nextFollowUpAt,
        ...((f.status || lead.status) !== 'NEW' ? { lastContactedAt: f.followedAt } : {}),
        updatedById: session.id,
        updatedByName: session.fullName,
      },
    }),
  ])
  if (statusChanged) {
    await audit(session, 'LEAD_STATUS', 'lead', lead.id, `${lead.leadCode}: status ${lead.status} → ${f.status}`, { before: { status: lead.status }, after: { status: f.status } })
  }
}

/** Counsellor (own leads) / Sales Manager / Admin: log a follow-up. Earlier entries are never changed. */
export async function addFollowUpAction(leadId: string, input: { followedAt: string; remarks: string; status?: string; nextFollowUpAt?: string; reason?: string }): Promise<Result> {
  try {
    const session = await requirePermission('leads', 'edit')
    const lead = await findLeadForUser(session, leadId)
    if (!lead) return { success: false, error: 'Lead not found.' }
    const followedAt = istLocalToDate(input.followedAt || '')
    if (!followedAt) return { success: false, error: 'Enter the follow-up date and time.' }
    if (followedAt.getTime() > Date.now() + 5 * 60 * 1000) return { success: false, error: 'The follow-up date/time cannot be in the future. Use "Next follow-up" to schedule.' }
    const remarks = str(input.remarks, 5000)
    if (!remarks) return { success: false, error: 'Remarks are required.' }
    const status = input.status ? String(input.status) : null
    if (status && !STATUS_VALUES.includes(status)) return { success: false, error: 'Choose a valid status.' }
    if (status === 'INVALID' && !str(input.reason, 255)) return { success: false, error: 'Give a reason for Invalid / Duplicate.' }
    let next: Date | null = null
    if (input.nextFollowUpAt) {
      next = istLocalToDate(input.nextFollowUpAt)
      if (!next) return { success: false, error: 'Next follow-up date/time is not valid.' }
      if (next.getTime() < Date.now() - 60 * 1000) return { success: false, error: 'Next follow-up must be in the future.' }
    }
    await writeFollowUp(session, lead, { followedAt, remarks, status, nextFollowUpAt: next, reason: str(input.reason, 255) })
    await audit(session, 'FOLLOW_UP_ADD', 'lead', lead.id, `Follow-up added on ${lead.leadCode}`)
    refresh(lead.id)
    return { success: true, message: 'Follow-up saved.' }
  } catch (err) {
    return fail(err)
  }
}

/** Sales Manager / Admin: change status of several leads (each change is written to the lead's history). */
export async function bulkLeadStatusAction(ids: string[], status: string, reason?: string): Promise<Result> {
  try {
    const session = await requirePermission('leads', 'edit')
    if (isLeadScopedToAssignee(session.roleName)) return { success: false, error: 'Update status from the lead page with a follow-up.' }
    if (!STATUS_VALUES.includes(status)) return { success: false, error: 'Choose a valid status.' }
    if (status === 'INVALID' && !str(reason, 255)) return { success: false, error: 'Give a reason for Invalid / Duplicate.' }
    const leads = await (db as any).lead.findMany({ where: { id: { in: (ids || []).filter(isUuid) }, isDeleted: false } })
    if (leads.length === 0) return { success: false, error: 'Select at least one lead.' }
    const label = LEAD_STATUSES.find((s) => s.value === status)?.label
    for (const l of leads) {
      if (l.status === status) continue
      await writeFollowUp(session, l, { followedAt: new Date(), remarks: `Status changed to ${label}${reason ? ` — ${reason}` : ''}`, status, nextFollowUpAt: l.nextFollowUpAt, reason: str(reason, 255) })
    }
    refresh()
    return { success: true, message: `Status updated for ${leads.length} lead(s).` }
  } catch (err) {
    return fail(err)
  }
}

/** Link a lead to the original it duplicates (both records and their history are kept). */
export async function linkDuplicateAction(leadId: string, originalCode: string): Promise<Result> {
  try {
    const session = await requirePermission('leads', 'assign')
    const lead = await findLeadForUser(session, leadId)
    if (!lead) return { success: false, error: 'Lead not found.' }
    const code = String(originalCode || '').trim().toUpperCase()
    const original = await (db as any).lead.findFirst({ where: { OR: [{ leadCode: code }, ...(isUuid(originalCode) ? [{ id: originalCode }] : [])], isDeleted: false } })
    if (!original) return { success: false, error: `No lead found with ID ${code}.` }
    if (original.id === lead.id) return { success: false, error: 'A lead cannot duplicate itself.' }
    await (db as any).lead.update({ where: { id: lead.id }, data: { duplicateOfId: original.id, updatedById: session.id, updatedByName: session.fullName } })
    await audit(session, 'LEAD_DUPLICATE_LINK', 'lead', lead.id, `${lead.leadCode} linked as duplicate of ${original.leadCode}`)
    refresh(lead.id)
    return { success: true, message: `Linked to ${original.leadCode}.` }
  } catch (err) {
    return fail(err)
  }
}

export async function clearDuplicateAction(leadId: string): Promise<Result> {
  try {
    const session = await requirePermission('leads', 'assign')
    const lead = await findLeadForUser(session, leadId)
    if (!lead) return { success: false, error: 'Lead not found.' }
    await (db as any).lead.update({ where: { id: lead.id }, data: { duplicateOfId: null, updatedById: session.id, updatedByName: session.fullName } })
    await audit(session, 'LEAD_DUPLICATE_CLEAR', 'lead', lead.id, `${lead.leadCode} marked as not a duplicate`)
    refresh(lead.id)
    return { success: true, message: 'Duplicate flag cleared.' }
  } catch (err) {
    return fail(err)
  }
}

/** Super Admin / Admin: move leads to the Bin. */
export async function trashLeadsAction(ids: string[]): Promise<Result> {
  try {
    const session = await requirePermission('leads', 'delete')
    const list = (ids || []).filter(isUuid)
    const leads = await (db as any).lead.findMany({ where: { id: { in: list }, isDeleted: false }, select: { id: true, leadCode: true, fullName: true } })
    if (leads.length === 0) return { success: false, error: 'Select at least one lead.' }
    await (db as any).lead.updateMany({ where: { id: { in: leads.map((l: any) => l.id) } }, data: { isDeleted: true, updatedById: session.id, updatedByName: session.fullName } })
    await recordTrash('lead', leads.map((l: any) => l.id), session)
    for (const l of leads) await audit(session, 'LEAD_DELETE', 'lead', l.id, `Moved ${l.leadCode} (${l.fullName}) to the Bin`)
    refresh()
    return { success: true, message: `${leads.length} lead(s) moved to the Bin.` }
  } catch (err) {
    return fail(err)
  }
}

export async function restoreLeadAction(id: string): Promise<Result> {
  try {
    const session = await requireSuperAdminSession()
    const l = await (db as any).lead.update({ where: { id }, data: { isDeleted: false } })
    await clearTrash('lead', id)
    await audit(session, 'LEAD_RESTORE', 'lead', id, `Restored ${l.leadCode} from the Bin`)
    refresh()
    return { success: true, message: 'Lead restored.' }
  } catch (err) {
    return fail(err)
  }
}

export async function deleteLeadForeverAction(id: string): Promise<Result> {
  try {
    const session = await requireSuperAdminSession()
    const l = await (db as any).lead.findUnique({ where: { id } })
    if (!l) return { success: false, error: 'Lead not found.' }
    const admissions = await (db as any).admission.count({ where: { leadId: id } })
    if (admissions > 0) return { success: false, error: `${l.leadCode} is linked to an admission and is kept for history.` }
    await (db as any).lead.updateMany({ where: { duplicateOfId: id }, data: { duplicateOfId: null } })
    await (db as any).lead.delete({ where: { id } })
    await clearTrash('lead', id)
    await audit(session, 'LEAD_DELETE_PERMANENT', 'lead', id, `Permanently deleted ${l.leadCode} (${l.fullName})`, { before: l })
    return { success: true, message: 'Lead deleted permanently.' }
  } catch (err) {
    return fail(err)
  }
}

/** Active users that leads can be assigned to (for the assign picker). */
export async function listAssigneesAction() {
  const session = await requirePermission('leads', 'view')
  if (isLeadScopedToAssignee(session.roleName)) return []
  const users = await db.user.findMany({
    where: { status: true, isDeleted: false, role: { in: ['COUNSELLOR', 'SALES_MANAGER'] } },
    select: { id: true, fullName: true, role: true },
    orderBy: { fullName: 'asc' },
  })
  return users.map((u) => ({ id: u.id, fullName: u.fullName, role: normalizeRole(u.role) }))
}

