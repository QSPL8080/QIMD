import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can, isLeadScopedToAssignee, LEAD_SOURCES, LEAD_STATUSES, LEAD_TYPES, leadSourceLabel, leadStatusLabel, leadTypeLabel } from '@/lib/permissions'
import { buildLeadWhere, pickLeadQuery } from '@/lib/leadFilters'
import { leadScope } from '@/lib/leadAccess'
import { fmtDateTime, istEnd, istStart, monthStart, todayIST } from '@/lib/dates'
import { PageHeader, Stat, Card, Pagination } from '@/components/Admin/ui'
import FilterBar from '@/components/Admin/FilterBar'
import LeadsTable from './LeadsTable'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 25

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.roleName, 'leads', 'view', session.moduleAccess)) redirect('/admin/dashboard')

  const sp = await searchParams
  const f = pickLeadQuery(sp)
  const page = Math.max(1, Number(f.page) || 1)
  const where = buildLeadWhere(session, f)
  const scope = { isDeleted: false, ...leadScope(session) }
  const today = todayIST()
  const counsellorView = isLeadScopedToAssignee(session.roleName)

  const [rows, total, totalAll, newCount, unassigned, dueToday, thisMonth, courses, assignees] = await Promise.all([
    (db as any).lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { assignedTo: { select: { id: true, fullName: true } } },
    }),
    (db as any).lead.count({ where }),
    (db as any).lead.count({ where: scope }),
    (db as any).lead.count({ where: { ...scope, status: 'NEW' } }),
    counsellorView ? Promise.resolve(0) : (db as any).lead.count({ where: { ...scope, assignedToId: null } }),
    (db as any).lead.count({ where: { ...scope, nextFollowUpAt: { gte: istStart(today), lte: istEnd(today) } } }),
    (db as any).lead.count({ where: { ...scope, createdAt: { gte: istStart(monthStart(today)) } } }),
    (db as any).lead.findMany({ where: { ...scope, course: { not: null } }, distinct: ['course'], select: { course: true }, orderBy: { course: 'asc' } }),
    counsellorView
      ? Promise.resolve([])
      : db.user.findMany({ where: { status: true, isDeleted: false, role: { in: ['COUNSELLOR', 'SALES_MANAGER'] } }, select: { id: true, fullName: true, role: true }, orderBy: { fullName: 'asc' } }),
  ])

  const perms = {
    add: can(session.roleName, 'leads', 'add', session.moduleAccess),
    edit: can(session.roleName, 'leads', 'edit', session.moduleAccess) && !counsellorView,
    assign: can(session.roleName, 'leads', 'assign', session.moduleAccess),
    remove: can(session.roleName, 'leads', 'delete', session.moduleAccess),
    export: can(session.roleName, 'leads', 'export', session.moduleAccess),
  }

  const items = rows.map((l: any) => ({
    id: l.id,
    leadCode: l.leadCode,
    fullName: l.fullName,
    phone: l.phone,
    email: l.email,
    course: l.course,
    source: leadSourceLabel(l.source),
    type: leadTypeLabel(l.enquiryType),
    status: l.status,
    statusLabel: leadStatusLabel(l.status),
    assignedTo: l.assignedTo?.fullName || null,
    nextFollowUp: l.nextFollowUpAt ? fmtDateTime(l.nextFollowUpAt) : null,
    overdue: l.nextFollowUpAt ? new Date(l.nextFollowUpAt).getTime() < Date.now() && !['NOT_INTERESTED', 'ADMISSION_CLOSED', 'INVALID'].includes(l.status) : false,
    duplicate: Boolean(l.duplicateOfId),
    createdAt: fmtDateTime(l.createdAt),
  }))

  const base = '/admin/leads'
  return (
    <div>
      <PageHeader
        title={counsellorView ? 'My Leads' : 'Leads'}
        subtitle={counsellorView ? 'Leads assigned to you. Open a lead to log a follow-up.' : 'Website admission & contact enquiries, Meta leads and manual leads.'}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <Stat label="Total leads" value={totalAll} icon="ion:layers-outline" href={base} />
        <Stat label="This month" value={thisMonth} icon="ion:calendar-outline" hint={new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })} href={`${base}?from=${monthStart(today)}`} />
        <Stat label="New" value={newCount} icon="ion:sparkles-outline" tone="blue" href={`${base}?status=NEW`} />
        {!counsellorView && <Stat label="Unassigned" value={unassigned} icon="ion:person-remove-outline" tone="amber" href={`${base}?assigned=unassigned`} />}
        <Stat label="Follow-ups today" value={dueToday} icon="ion:alarm-outline" tone="purple" href={`${base}?followup=today`} />
      </div>

      <FilterBar
        exportHref={perms.export ? '/api/admin/export/leads' : undefined}
        fields={[
          { type: 'search', name: 'q', placeholder: 'Name, mobile, email or Lead ID' },
          { type: 'select', name: 'status', label: 'Status', options: LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label })) },
          { type: 'select', name: 'source', label: 'Source', options: LEAD_SOURCES.map((s) => ({ value: s.value, label: s.label })) },
          { type: 'select', name: 'type', label: 'Enquiry type', options: LEAD_TYPES.map((s) => ({ value: s.value, label: s.label })) },
          { type: 'select', name: 'course', label: 'Course', options: courses.map((c: any) => ({ value: c.course, label: c.course })) },
          ...(counsellorView
            ? []
            : [
                {
                  type: 'select' as const,
                  name: 'assigned',
                  label: 'Counsellor',
                  options: [{ value: 'unassigned', label: 'Unassigned' }, ...assignees.map((u: any) => ({ value: u.id, label: u.fullName }))],
                },
              ]),
          {
            type: 'select',
            name: 'followup',
            label: 'Follow-up',
            options: [
              { value: 'today', label: 'Due today' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'upcoming', label: 'Upcoming' },
            ],
          },
          { type: 'select', name: 'dup', label: 'Duplicates', all: 'All leads', options: [{ value: '1', label: 'Possible duplicates' }] },
          { type: 'date', name: 'from', label: 'From date' },
          { type: 'date', name: 'to', label: 'To date' },
        ]}
      />

      <Card pad={false}>
        <LeadsTable openAdd={sp.add === '1'} items={items} perms={perms} assignees={assignees.map((u: any) => ({ id: u.id, fullName: u.fullName }))} />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} params={f as any} basePath={base} />
      </Card>
      {total === 0 && totalAll === 0 && (
        <p className="text-xs text-slate-500 mt-3">
          New website enquiries appear here automatically. {perms.add ? 'You can also add a lead by hand.' : ''} {counsellorView ? '' : <Link className="underline" href="/admin/enquiries/careers">Other enquiries</Link>}
        </p>
      )}
    </div>
  )
}
