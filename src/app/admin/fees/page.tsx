import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { loadLedgers, LIVE_ADMISSION } from '@/lib/admissionData'
import { buildPaymentWhere, netCollection, pickPaymentQuery } from '@/lib/paymentFilters'
import { PAYMENT_KIND_LABEL, PAYMENT_MODES, paymentModeLabel } from '@/lib/fees'
import { addDays, daysBetween, fmtDate, fmtDateTime, fmtMoney, istEnd, istStart, monthStart, todayIST, weekStart } from '@/lib/dates'
import { PageHeader, Stat, Card, Badge, Pagination, BTN_SECONDARY } from '@/components/Admin/ui'
import FilterBar from '@/components/Admin/FilterBar'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 30
const DUE_WINDOWS = [
  { key: 'overdue', label: 'Overdue' },
  { key: '7', label: 'Next 7 days' },
  { key: '30', label: 'Next 30 days' },
  { key: 'all', label: 'All pending' },
]

export default async function FeesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.roleName, 'fees', 'view', session.moduleAccess)) redirect('/admin/dashboard')
  const sp = await searchParams
  const view = sp.view === 'dues' ? 'dues' : 'payments'
  const f = pickPaymentQuery(sp)
  const page = Math.max(1, Number(f.page) || 1)
  const today = todayIST()
  const canExport = can(session.roleName, 'fees', 'export', session.moduleAccess)

  const [cToday, cWeek, cMonth, cAll, live] = await Promise.all([
    netCollection(istStart(today), istEnd(today)),
    netCollection(istStart(weekStart(today)), istEnd(today)),
    netCollection(istStart(monthStart(today)), istEnd(today)),
    netCollection(),
    (db as any).admission.findMany({ where: LIVE_ADMISSION, select: { id: true, totalFee: true, studentName: true, admissionCode: true, mobile: true, courseName: true } }),
  ])
  const ledgers = await loadLedgers(live, today)
  let outstanding = 0
  let overdue = 0
  let overdueStudents = 0
  for (const l of ledgers.values()) {
    outstanding += l.balance
    overdue += l.overdueAmount
    if (l.overdueAmount > 0) overdueStudents++
  }

  return (
    <div>
      <PageHeader title="Fees & Payments" subtitle="Collections, receipts and pending dues. Record a payment from the student's admission." />
      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 mb-4">
        <Stat label="Collected today" value={fmtMoney(cToday.net)} hint={`${cToday.count} payment${cToday.count === 1 ? '' : 's'}`} icon="ion:today-outline" tone="green" href={`/admin/fees?from=${today}&to=${today}`} />
        <Stat label="This week" value={fmtMoney(cWeek.net)} icon="ion:calendar-outline" href={`/admin/fees?from=${weekStart(today)}&to=${today}`} />
        <Stat label="This month" value={fmtMoney(cMonth.net)} icon="ion:calendar-number-outline" href={`/admin/fees?from=${monthStart(today)}&to=${today}`} />
        <Stat label="Total collected" value={fmtMoney(cAll.net)} hint={cAll.returned ? `${fmtMoney(cAll.returned)} refunded / reversed` : undefined} icon="ion:wallet-outline" />
        <Stat label="Outstanding" value={fmtMoney(outstanding)} icon="ion:hourglass-outline" tone="amber" href="/admin/fees?view=dues&due=all" />
        <Stat label="Overdue" value={fmtMoney(overdue)} hint={`${overdueStudents} student${overdueStudents === 1 ? '' : 's'}`} icon="ion:alert-circle-outline" tone="red" href="/admin/fees?view=dues&due=overdue" />
      </div>

      <nav className="flex gap-1 border-b border-slate-200 mb-4" aria-label="Fees sections">
        {[
          { key: 'payments', label: 'Payments', href: '/admin/fees' },
          { key: 'dues', label: 'Pending dues', href: '/admin/fees?view=dues' },
        ].map((t) => (
          <Link key={t.key} href={t.href} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${view === t.key ? 'border-zinc-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      {view === 'payments' ? <PaymentsList f={f} page={page} canExport={canExport} /> : <DuesList live={live} ledgers={ledgers} today={today} window={String(sp.due || 'overdue')} />}
    </div>
  )
}

async function PaymentsList({ f, page, canExport }: { f: ReturnType<typeof pickPaymentQuery>; page: number; canExport: boolean }) {
  const where = buildPaymentWhere(f)
  const [total, rows] = await Promise.all([
    (db as any).payment.count({ where }),
    (db as any).payment.findMany({
      where,
      orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { admission: { select: { id: true, admissionCode: true, studentName: true, courseName: true } } },
    }),
  ])
  return (
    <>
      <FilterBar
        exportHref={canExport ? '/api/admin/export/payments' : undefined}
        fields={[
          { type: 'search', name: 'q', placeholder: 'Student, Admission ID, mobile, Payment ID or receipt no.' },
          { type: 'select', name: 'mode', label: 'Mode', options: PAYMENT_MODES.map((m) => ({ value: m.value, label: m.label })) },
          { type: 'select', name: 'kind', label: 'Type', options: Object.entries(PAYMENT_KIND_LABEL).map(([value, label]) => ({ value, label })) },
          { type: 'date', name: 'from', label: 'Paid from' },
          { type: 'date', name: 'to', label: 'Paid to' },
        ]}
      />
      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Student</th>
                <th className="p-3">Payment / Receipt</th>
                <th className="p-3">Mode</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Recorded by</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No payments match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((p: any) => {
                  const minus = p.kind === 'REFUND' || p.kind === 'REVERSAL'
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 text-xs whitespace-nowrap">{fmtDateTime(p.paidAt)}</td>
                      <td className="p-3">
                        <Link href={`/admin/admissions/${p.admission.id}?tab=fees`} className="font-semibold text-slate-900 hover:text-black">
                          {p.admission.studentName}
                        </Link>
                        <div className="text-[11px] text-slate-500">
                          {p.admission.admissionCode} · {p.admission.courseName}
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        <div className="font-semibold text-slate-800">{p.paymentCode}</div>
                        <div className="text-slate-500">{p.receiptNo || <Badge tone={minus ? 'red' : 'purple'}>{PAYMENT_KIND_LABEL[p.kind] || p.kind}</Badge>}</div>
                      </td>
                      <td className="p-3 text-xs">
                        {paymentModeLabel(p.mode)}
                        {p.reference && <div className="text-slate-500">Ref {p.reference}</div>}
                      </td>
                      <td className={`p-3 text-right font-semibold whitespace-nowrap ${minus ? 'text-rose-700' : p.kind === 'ADJUSTMENT' ? 'text-violet-700' : 'text-slate-900'}`}>
                        {minus ? '− ' : ''}
                        {fmtMoney(Number(p.amount))}
                      </td>
                      <td className="p-3 text-xs">{p.recordedByName || '—'}</td>
                      <td className="p-3 text-right">
                        {p.kind === 'PAYMENT' && p.receiptNo && (
                          <Link href={`/admin/receipts/${p.id}`} target="_blank" className={BTN_SECONDARY}>
                            Receipt
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} params={f as any} basePath="/admin/fees" />
      </Card>
    </>
  )
}

function DuesList({ live, ledgers, today, window }: { live: any[]; ledgers: Map<string, any>; today: string; window: string }) {
  const win = DUE_WINDOWS.some((w) => w.key === window) ? window : 'overdue'
  const limit = win === '7' ? addDays(today, 7) : win === '30' ? addDays(today, 30) : null
  const rows: { a: any; i: any; days: number }[] = []
  for (const a of live) {
    const l = ledgers.get(a.id)
    if (!l) continue
    for (const i of l.installments) {
      if (i.remaining <= 0) continue
      const days = daysBetween(today, i.dueDate)
      if (win === 'overdue' && days >= 0) continue
      if (limit && (i.dueDate < today || i.dueDate > limit)) continue
      rows.push({ a, i, days })
    }
    if (win === 'all' && l.unscheduled > 0) rows.push({ a, i: { id: `${a.id}-u`, label: 'No due date set', dueDate: '', remaining: l.unscheduled, state: 'DUE' }, days: 99999 })
  }
  rows.sort((x, y) => x.days - y.days)
  const sum = rows.reduce((s, r) => s + r.i.remaining, 0)

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {DUE_WINDOWS.map((w) => (
          <Link key={w.key} href={`/admin/fees?view=dues&due=${w.key}`} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${win === w.key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
            {w.label}
          </Link>
        ))}
      </div>
      <Card pad={false} title={`${rows.length} instalment${rows.length === 1 ? '' : 's'} · ${fmtMoney(sum)}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Instalment</th>
                <th className="p-3">Due date</th>
                <th className="p-3 text-right">Amount due</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nothing due in this window.
                  </td>
                </tr>
              ) : (
                rows.map(({ a, i, days }) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <Link href={`/admin/admissions/${a.id}?tab=fees`} className="font-semibold text-slate-900 hover:text-black">
                        {a.studentName}
                      </Link>
                      <div className="text-[11px] text-slate-500">
                        {a.admissionCode} · {a.mobile}
                      </div>
                    </td>
                    <td className="p-3 text-xs">{i.label}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{i.dueDate ? fmtDate(i.dueDate) : '—'}</td>
                    <td className="p-3 text-right font-semibold">{fmtMoney(i.remaining)}</td>
                    <td className="p-3">
                      {!i.dueDate ? (
                        <Badge>Not scheduled</Badge>
                      ) : days < 0 ? (
                        <Badge tone="red">{-days} day{days === -1 ? '' : 's'} overdue</Badge>
                      ) : days === 0 ? (
                        <Badge tone="amber">Due today</Badge>
                      ) : (
                        <Badge tone="blue">
                          In {days} day{days === 1 ? '' : 's'}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
