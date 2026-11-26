import React from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can, isLeadScopedToAssignee, leadSourceLabel, leadStatusLabel, leadTypeLabel } from '@/lib/permissions'
import { findLeadForUser } from '@/lib/leadAccess'
import { findPossibleDuplicates } from '@/lib/leads'
import { fmtDateTime, toIstLocal } from '@/lib/dates'
import { admissionStatusLabel } from '@/lib/fees'
import { PageHeader, Card, Badge, Detail, LEAD_STATUS_TONE, BTN_PRIMARY, ADMISSION_STATUS_TONE } from '@/components/Admin/ui'
import LeadActions from './LeadActions'

export const dynamic = 'force-dynamic'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.roleName, 'leads', 'view', session.moduleAccess)) redirect('/admin/dashboard')
  const { id } = await params
  const lead = await findLeadForUser(session, id)
  if (!lead) notFound()

  const counsellorView = isLeadScopedToAssignee(session.roleName)
  const [full, original, possible, admissions, assignees] = await Promise.all([
    (db as any).lead.findUnique({
      where: { id: lead.id },
      include: {
        assignedTo: { select: { id: true, fullName: true } },
        followUps: { orderBy: [{ followedAt: 'asc' }, { createdAt: 'asc' }] },
        assignments: { orderBy: { createdAt: 'asc' } },
      },
    }),
    !counsellorView && lead.duplicateOfId ? (db as any).lead.findUnique({ where: { id: lead.duplicateOfId }, select: { id: true, leadCode: true, fullName: true, createdAt: true, source: true } }) : null,
    counsellorView ? [] : findPossibleDuplicates(lead.phoneNormalized, lead.email, lead.id),
    (db as any).admission.findMany({ where: { leadId: lead.id, isDeleted: false }, select: { id: true, admissionCode: true, status: true, courseName: true, createdAt: true } }),
    counsellorView ? [] : db.user.findMany({ where: { status: true, isDeleted: false, role: { in: ['COUNSELLOR', 'SALES_MANAGER'] } }, select: { id: true, fullName: true }, orderBy: { fullName: 'asc' } }),
  ])

  const perms = {
    followUp: can(session.roleName, 'leads', 'edit', session.moduleAccess),
    editDetails: can(session.roleName, 'leads', 'edit', session.moduleAccess) && !counsellorView,
    assign: can(session.roleName, 'leads', 'assign', session.moduleAccess),
    createAdmission: can(session.roleName, 'admissions', 'add', session.moduleAccess),
  }
  const canSeeAdmission = can(session.roleName, 'admissions', 'view', session.moduleAccess)

  return (
    <div>
      <PageHeader
        back={{ href: '/admin/leads', label: 'Leads' }}
        title={full.fullName}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {full.leadCode} · {leadSourceLabel(full.source)} · {leadTypeLabel(full.enquiryType)} · received {fmtDateTime(full.createdAt)}
            <Badge tone={LEAD_STATUS_TONE[full.status] || 'slate'}>{leadStatusLabel(full.status)}</Badge>
          </span>
        }
        actions={
          perms.createAdmission && admissions.length === 0 ? (
            <Link href={`/admin/admissions/new?leadId=${full.id}`} className={BTN_PRIMARY}>
              Create admission
            </Link>
          ) : null
        }
      />

      {full.status === 'ADMISSION_CLOSED' && admissions.length === 0 && (
        <div className="mb-4 rounded-xl bg-amber-50 text-amber-900 text-sm px-4 py-3">
          Counsellor reported this lead as converted. The admission is created only after the Admission Head verifies the form, documents and payment.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4 min-w-0">
          <Card title="Enquiry details">
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Detail label="Mobile" value={full.phone} />
              <Detail label="Email" value={full.email} />
              <Detail label="Course of interest" value={full.course} />
              <Detail label="City" value={full.city} />
              <Detail label="Qualification" value={full.qualification} />
              <Detail label="Subject" value={full.subject} />
              <Detail label="Assigned counsellor" value={full.assignedTo?.fullName || 'Unassigned'} />
              <Detail label="Next follow-up" value={full.nextFollowUpAt ? fmtDateTime(full.nextFollowUpAt) : null} />
              <Detail label="Last contacted" value={full.lastContactedAt ? fmtDateTime(full.lastContactedAt) : null} />
              {full.statusReason && <Detail label="Status reason" value={full.statusReason} />}
              {(full.campaign || full.adId || full.formId) && <Detail label="Campaign / Ad / Form" value={[full.campaign, full.adId, full.formId].filter(Boolean).join(' · ')} />}
              <Detail label="Created by" value={full.createdByName || 'Website'} />
            </dl>
            {full.message && (
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Message</p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap mt-1">{full.message}</p>
              </div>
            )}
          </Card>

          <Card title={`Follow-up history (${full.followUps.length})`}>
            {full.followUps.length === 0 ? (
              <p className="text-sm text-slate-500">No follow-ups yet.</p>
            ) : (
              <ol className="relative border-l border-slate-200 ml-2 space-y-4">
                {full.followUps.map((f: any) => (
                  <li key={f.id} className="ml-4">
                    <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <strong className="text-slate-800">{fmtDateTime(f.followedAt)}</strong>
                      {f.statusAfter && <Badge tone={LEAD_STATUS_TONE[f.statusAfter] || 'slate'}>{leadStatusLabel(f.statusAfter)}</Badge>}
                      <span>by {f.createdByName || '—'}</span>
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap mt-1">{f.remarks}</p>
                    {f.nextFollowUpAt && <p className="text-xs text-slate-500 mt-0.5">Next follow-up: {fmtDateTime(f.nextFollowUpAt)}</p>}
                    <p className="text-[10.5px] text-slate-400">Logged {fmtDateTime(f.createdAt)}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-4 min-w-0">
          <LeadActions
            lead={{
              id: full.id,
              leadCode: full.leadCode,
              status: full.status,
              fullName: full.fullName,
              phone: full.phone || '',
              email: full.email || '',
              course: full.course || '',
              city: full.city || '',
              qualification: full.qualification || '',
              subject: full.subject || '',
              message: full.message || '',
              enquiryType: full.enquiryType,
              assignedToId: full.assignedTo?.id || '',
              duplicateOf: original ? { id: original.id, leadCode: original.leadCode, fullName: original.fullName } : null,
              nowLocal: toIstLocal(new Date()),
            }}
            perms={perms}
            assignees={assignees}
          />

          {admissions.length > 0 && (
            <Card title="Admission">
              {admissions.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    {canSeeAdmission ? (
                      <Link href={`/admin/admissions/${a.id}`} className="font-semibold text-zinc-900">
                        {a.admissionCode}
                      </Link>
                    ) : (
                      <strong>{a.admissionCode}</strong>
                    )}{' '}
                    · {a.courseName}
                  </span>
                  <Badge tone={ADMISSION_STATUS_TONE[a.status] || 'slate'}>{admissionStatusLabel(a.status)}</Badge>
                </div>
              ))}
            </Card>
          )}

          {!counsellorView && (possible.length > 0 || original) && (
            <Card title="Possible duplicates">
              <p className="text-xs text-slate-500 mb-2">Same mobile number or email. Nothing is deleted — link it to the original or mark it Invalid / Duplicate.</p>
              <ul className="space-y-2">
                {possible.map((d: any) => (
                  <li key={d.id} className="text-xs flex flex-wrap items-center justify-between gap-1 border-b border-slate-100 pb-2">
                    <Link href={`/admin/leads/${d.id}`} className="font-semibold text-zinc-900">
                      {d.leadCode} · {d.fullName}
                    </Link>
                    <span className="text-slate-500">
                      {leadSourceLabel(d.source)} · {fmtDateTime(d.createdAt)} · {leadStatusLabel(d.status)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {!counsellorView && (
            <Card title="Assignment history">
              {full.assignments.length === 0 ? (
                <p className="text-sm text-slate-500">Never assigned.</p>
              ) : (
                <ul className="space-y-2">
                  {full.assignments.map((a: any) => (
                    <li key={a.id} className="text-xs">
                      <strong className="text-slate-800">
                        {a.fromUserName || 'Unassigned'} → {a.toUserName || 'Unassigned'}
                      </strong>
                      <div className="text-slate-500">
                        by {a.assignedByName || '—'} · {fmtDateTime(a.createdAt)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
