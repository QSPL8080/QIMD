import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { pickAdmissionQuery, queryAdmissions } from '@/lib/admissionFilters'
import { ADMISSION_STATUSES, FEE_STATUS_LABEL, admissionStatusLabel } from '@/lib/fees'
import { dateOnly, fmtDate, fmtMoney, monthStart, todayIST } from '@/lib/dates'
import { getSetting } from '@/lib/settings'
import { PageHeader, Stat, Card, Badge, Pagination, BTN_PRIMARY, ADMISSION_STATUS_TONE, FEE_STATUS_TONE } from '@/components/Admin/ui'
import FilterBar from '@/components/Admin/FilterBar'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 25

export default async function AdmissionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.roleName, 'admissions', 'view', session.moduleAccess)) redirect('/admin/dashboard')
  const f = pickAdmissionQuery(await searchParams)
  const page = Math.max(1, Number(f.page) || 1)
  const today = todayIST()

  const [rows, courses, counsellors, todayCount, monthCount, pending, totalAll] = await Promise.all([
    queryAdmissions(f, { admissionCode: true, studentName: true, mobile: true, courseName: true, admissionDate: true, counsellorName: true }),
    getSetting('courses'),
    db.user.findMany({ where: { isDeleted: false, counselledAdmissions: { some: {} } } as any, select: { id: true, fullName: true }, orderBy: { fullName: 'asc' } }),
    (db as any).admission.count({ where: { isDeleted: false, admissionDate: dateOnly(today) } }),
    (db as any).admission.count({ where: { isDeleted: false, admissionDate: { gte: dateOnly(monthStart(today)) } } }),
    (db as any).admission.count({ where: { isDeleted: false, status: 'VERIFICATION_PENDING' } }),
    (db as any).admission.count({ where: { isDeleted: false } }),
  ])
  const total = rows.length
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const canAdd = can(session.roleName, 'admissions', 'add', session.moduleAccess)
  const canExport = can(session.roleName, 'admissions', 'export', session.moduleAccess)
  const canFees = can(session.roleName, 'fees', 'view', session.moduleAccess)
  const base = '/admin/admissions'

  return (
    <div>
      <PageHeader
        title="Admissions"
        subtitle="Verified student admissions. Search by name, mobile number or Admission ID."
        actions={
          canAdd ? (
            <Link href="/admin/admissions/new" className={BTN_PRIMARY}>
              New admission
            </Link>
          ) : null
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Total admissions" value={totalAll} icon="ion:school-outline" href={base} />
        <Stat label="Today" value={todayCount} icon="ion:today-outline" tone="blue" href={`${base}?from=${today}&to=${today}`} />
        <Stat label="This month" value={monthCount} icon="ion:calendar-outline" href={`${base}?from=${monthStart(today)}`} />
        <Stat label="Verification pending" value={pending} icon="ion:hourglass-outline" tone="amber" href={`${base}?status=VERIFICATION_PENDING`} />
      </div>
      <FilterBar
        exportHref={canExport ? '/api/admin/export/admissions' : undefined}
        fields={[
          { type: 'search', name: 'q', placeholder: 'Student name, mobile or Admission ID' },
          { type: 'select', name: 'status', label: 'Admission status', options: ADMISSION_STATUSES.map((s) => ({ value: s.value, label: s.label })) },
          { type: 'select', name: 'course', label: 'Course', options: courses.map((c) => ({ value: c.name, label: c.name })) },
          { type: 'select', name: 'counsellor', label: 'Counsellor', options: counsellors.map((c) => ({ value: c.id, label: c.fullName })) },
          ...(canFees ? [{ type: 'select' as const, name: 'fee', label: 'Fee status', options: Object.entries(FEE_STATUS_LABEL).map(([value, label]) => ({ value, label })) }] : []),
          { type: 'date', name: 'from', label: 'Admission from' },
          { type: 'date', name: 'to', label: 'Admission to' },
        ]}
      />
      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Course</th>
                <th className="p-3">Admission date</th>
                <th className="p-3">Counsellor</th>
                <th className="p-3">Status</th>
                {canFees && <th className="p-3 text-right">Fee / Balance</th>}
                {canFees && <th className="p-3">Fee status</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No admissions match these filters.
                  </td>
                </tr>
              ) : (
                pageRows.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <Link href={`/admin/admissions/${a.id}`} className="font-semibold text-slate-900 hover:text-black">
                        {a.studentName}
                      </Link>
                      <div className="text-[11px] text-slate-500">
                        {a.admissionCode} · {a.mobile}
                      </div>
                    </td>
                    <td className="p-3 text-xs">{a.courseName}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{fmtDate(a.admissionDate)}</td>
                    <td className="p-3 text-xs">{a.counsellorName || '—'}</td>
                    <td className="p-3">
                      <Badge tone={ADMISSION_STATUS_TONE[a.status] || 'slate'}>{admissionStatusLabel(a.status)}</Badge>
                    </td>
                    {canFees && (
                      <td className="p-3 text-xs text-right whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{fmtMoney(a.ledger.totalFee)}</div>
                        <div className={a.ledger.balance > 0 ? 'text-rose-600' : 'text-emerald-700'}>{fmtMoney(a.ledger.balance)} due</div>
                      </td>
                    )}
                    {canFees && (
                      <td className="p-3">
                        <Badge tone={FEE_STATUS_TONE[a.ledger.status]}>{FEE_STATUS_LABEL[a.ledger.status as keyof typeof FEE_STATUS_LABEL]}</Badge>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} params={f as any} basePath={base} />
      </Card>
    </div>
  )
}
