import React from 'react'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { getSetting } from '@/lib/settings'
import { canOpenFile } from '@/lib/files'
import { PAYMENT_MODES, paymentModeLabel } from '@/lib/fees'
import { fmtDateTime, fmtMoney, isYmd, istEnd, istStart, monthStart, toIstLocal, todayIST, weekStart } from '@/lib/dates'
import { PageHeader, Stat, Card, Pagination } from '@/components/Admin/ui'
import FilterBar from '@/components/Admin/FilterBar'
import ExpensesClient, { ExpenseRowActions } from './ExpensesClient'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 30

function pick(sp: Record<string, string | string[] | undefined>) {
  const g = (k: string) => {
    const v = sp[k]
    const s = Array.isArray(v) ? v[0] : v
    return s ? String(s).slice(0, 100) : undefined
  }
  return { q: g('q'), category: g('category'), mode: g('mode'), from: g('from'), to: g('to'), page: g('page') }
}

async function sumBetween(from?: Date, to?: Date) {
  const r = await (db as any).expense.aggregate({
    where: { isDeleted: false, ...(from || to ? { expenseAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
    _sum: { amount: true },
    _count: { _all: true },
  })
  return { total: Number(r._sum.amount || 0), count: r._count._all as number }
}

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.roleName, 'expenses', 'view', session.moduleAccess)) redirect('/admin/dashboard')
  const f = pick(await searchParams)
  const page = Math.max(1, Number(f.page) || 1)
  const today = todayIST()

  const and: any[] = [{ isDeleted: false }]
  if (isYmd(f.from)) and.push({ expenseAt: { gte: istStart(f.from) } })
  if (isYmd(f.to)) and.push({ expenseAt: { lte: istEnd(f.to) } })
  if (f.mode) and.push({ paymentMode: f.mode })
  if (f.category) and.push({ category: f.category })
  if (f.q?.trim()) {
    const q = f.q.trim()
    and.push({ OR: [{ description: { contains: q, mode: 'insensitive' } }, { expenseCode: { contains: q, mode: 'insensitive' } }, { reference: { contains: q, mode: 'insensitive' } }] })
  }
  const where = { AND: and }
  const filtered = and.length > 1

  const [categories, sToday, sWeek, sMonth, sAll, sFiltered, rows] = await Promise.all([
    getSetting('expenseCategories'),
    sumBetween(istStart(today), istEnd(today)),
    sumBetween(istStart(weekStart(today)), istEnd(today)),
    sumBetween(istStart(monthStart(today)), istEnd(today)),
    sumBetween(),
    filtered ? (db as any).expense.aggregate({ where, _sum: { amount: true }, _count: { _all: true } }) : null,
    (db as any).expense.findMany({ where, orderBy: [{ expenseAt: 'desc' }, { createdAt: 'desc' }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ])
  const fileIds = rows.map((r: any) => r.attachmentFileId).filter(Boolean)
  const files = fileIds.length ? await (db as any).storedFile.findMany({ where: { id: { in: fileIds }, isDeleted: false }, select: { id: true, originalName: true } }) : []
  const fileName = new Map<string, string>(files.map((x: any) => [x.id, x.originalName]))
  const total = filtered ? sFiltered._count._all : sAll.count

  const perms = {
    add: can(session.roleName, 'expenses', 'add', session.moduleAccess),
    edit: can(session.roleName, 'expenses', 'edit', session.moduleAccess),
    remove: can(session.roleName, 'expenses', 'delete', session.moduleAccess),
    openFiles: canOpenFile(session, 'expense'),
  }
  const options = { categories, modes: PAYMENT_MODES.map((m) => ({ value: m.value, label: m.label })), nowLocal: toIstLocal(new Date()) }

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Institute spending with bills. Totals exclude expenses in the Bin." actions={perms.add ? <ExpensesClient options={options} /> : null} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Today" value={fmtMoney(sToday.total)} hint={`${sToday.count} entr${sToday.count === 1 ? 'y' : 'ies'}`} icon="ion:today-outline" href={`/admin/expenses?from=${today}&to=${today}`} />
        <Stat label="This week" value={fmtMoney(sWeek.total)} icon="ion:calendar-outline" href={`/admin/expenses?from=${weekStart(today)}&to=${today}`} />
        <Stat label="This month" value={fmtMoney(sMonth.total)} icon="ion:calendar-number-outline" href={`/admin/expenses?from=${monthStart(today)}&to=${today}`} />
        <Stat label="All time" value={fmtMoney(sAll.total)} hint={`${sAll.count} entries`} icon="ion:receipt-outline" />
      </div>
      <FilterBar
        exportHref={can(session.roleName, 'expenses', 'export', session.moduleAccess) ? '/api/admin/export/expenses' : undefined}
        fields={[
          { type: 'search', name: 'q', placeholder: 'Description, Expense ID or reference' },
          { type: 'select', name: 'category', label: 'Category', options: categories.map((c) => ({ value: c, label: c })) },
          { type: 'select', name: 'mode', label: 'Payment mode', options: options.modes },
          { type: 'date', name: 'from', label: 'From' },
          { type: 'date', name: 'to', label: 'To' },
        ]}
      />
      <Card pad={false} title={filtered ? `Filtered total: ${fmtMoney(Number(sFiltered._sum.amount || 0))}` : undefined}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Mode</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Bill</th>
                <th className="p-3">Entered by</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                rows.map((e: any) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="p-3 text-xs whitespace-nowrap">{fmtDateTime(e.expenseAt)}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{e.description}</div>
                      <div className="text-[11px] text-slate-500">
                        {e.expenseCode}
                        {e.reference ? ` · Ref ${e.reference}` : ''}
                      </div>
                    </td>
                    <td className="p-3 text-xs">{e.category || '—'}</td>
                    <td className="p-3 text-xs">{paymentModeLabel(e.paymentMode)}</td>
                    <td className="p-3 text-right font-semibold whitespace-nowrap">{fmtMoney(Number(e.amount))}</td>
                    <td className="p-3 text-xs">
                      {e.attachmentFileId && fileName.has(e.attachmentFileId) ? (
                        perms.openFiles ? (
                          <a href={`/api/admin/files/${e.attachmentFileId}`} target="_blank" rel="noopener noreferrer" className="text-zinc-900 font-semibold hover:underline">
                            View bill
                          </a>
                        ) : (
                          'Attached'
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-xs">
                      {e.createdByName || '—'}
                      {e.updatedByName && e.updatedByName !== e.createdByName && <div className="text-slate-400">edited by {e.updatedByName}</div>}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <ExpenseRowActions
                        options={options}
                        perms={{ edit: perms.edit, remove: perms.remove }}
                        expense={{
                          id: e.id,
                          code: e.expenseCode,
                          expenseAt: toIstLocal(e.expenseAt),
                          category: e.category || '',
                          description: e.description,
                          amount: String(Number(e.amount)),
                          paymentMode: e.paymentMode,
                          reference: e.reference || '',
                          attachmentFileId: e.attachmentFileId || '',
                          attachmentName: e.attachmentFileId ? fileName.get(e.attachmentFileId) || '' : '',
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} params={f as any} basePath="/admin/expenses" />
      </Card>
    </div>
  )
}
