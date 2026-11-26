import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can, leadSourceLabel, LEAD_STATUSES, LEAD_SOURCES } from '@/lib/permissions'
import { loadLedgers } from '@/lib/admissionData'
import { netCollection } from '@/lib/paymentFilters'
import { paymentModeLabel, FEE_STATUS_LABEL, admissionStatusLabel } from '@/lib/fees'
import { addDays, dateOnly, fmtDate, fmtMoney, isYmd, istEnd, istStart, monthStart, todayIST } from '@/lib/dates'
import { PageHeader, Card, Stat, BTN_SECONDARY } from '@/components/Admin/ui'
import FilterBar from '@/components/Admin/FilterBar'

export const dynamic = 'force-dynamic'

function Bars({ rows, money = false, empty = 'No data in this period.' }: { rows: { label: string; value: number; hint?: string }[]; money?: boolean; empty?: string }) {
  const max = Math.max(0, ...rows.map((r) => r.value))
  if (!rows.length || max === 0) return <p className="text-sm text-slate-500">{empty}</p>
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between gap-3 text-xs mb-1">
            <span className="font-semibold text-slate-700 truncate">{r.label}</span>
            <span className="text-slate-900 font-semibold whitespace-nowrap">
              {money ? fmtMoney(r.value) : r.value}
              {r.hint ? <span className="text-slate-400 font-normal"> · {r.hint}</span> : null}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-zinc-900" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 1000) / 10}%` : '—')

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.roleName, 'reports', 'view', session.moduleAccess)) redirect('/admin/dashboard')
  const sp = await searchParams
  const today = todayIST()
  const one = (k: string) => (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined))
  let from = isYmd(one('from')) ? one('from')! : monthStart(today)
  let to = isYmd(one('to')) ? one('to')! : today
  if (from > to) [from, to] = [to, from]
  // Keep the period in the URL so the date boxes show it
  if (one('from') !== from || one('to') !== to) redirect(`/admin/reports?from=${from}&to=${to}`)
  const range = { gte: istStart(from), lte: istEnd(to) }
  const qs = `from=${from}&to=${to}`

  const show = {
    leads: can(session.roleName, 'leads', 'view', session.moduleAccess),
    admissions: can(session.roleName, 'admissions', 'view', session.moduleAccess),
    fees: can(session.roleName, 'fees', 'view', session.moduleAccess),
    expenses: can(session.roleName, 'expenses', 'view', session.moduleAccess),
  }
  const exportOk = (m: 'leads' | 'admissions' | 'fees' | 'expenses') => can(session.roleName, 'reports', 'export', session.moduleAccess) && can(session.roleName, m, 'export', session.moduleAccess)

  // ---------- Leads ----------
  let leadData: null | { total: number; bySource: any[]; byStatus: any[]; byCounsellor: { label: string; value: number; hint?: string }[]; converted: number } = null
  if (show.leads) {
    const where = { isDeleted: false, createdAt: range }
    const [total, bySource, byStatus, byUser, converted] = await Promise.all([
      (db as any).lead.count({ where }),
      (db as any).lead.groupBy({ by: ['source'], where, _count: { _all: true } }),
      (db as any).lead.groupBy({ by: ['status'], where, _count: { _all: true } }),
      (db as any).lead.groupBy({ by: ['assignedToId', 'status'], where, _count: { _all: true } }),
      (db as any).lead.count({ where: { ...where, OR: [{ status: 'ADMISSION_CLOSED' }, { admissions: { some: { isDeleted: false } } }] } }),
    ])
    const ids = [...new Set(byUser.map((r: any) => r.assignedToId).filter(Boolean))] as string[]
    const users = ids.length ? await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, fullName: true } }) : []
    const name = new Map<string, string>(users.map((u: any) => [u.id, u.fullName]))
    const per = new Map<string, { total: number; closed: number }>()
    for (const r of byUser) {
      const k = r.assignedToId || ''
      const x = per.get(k) || { total: 0, closed: 0 }
      x.total += r._count._all
      if (r.status === 'ADMISSION_CLOSED') x.closed += r._count._all
      per.set(k, x)
    }
    leadData = {
      total,
      converted,
      bySource: LEAD_SOURCES.map((s) => ({ label: leadSourceLabel(s.value), value: bySource.find((r: any) => r.source === s.value)?._count._all || 0 })),
      byStatus: LEAD_STATUSES.map((s) => ({ label: s.label, value: byStatus.find((r: any) => r.status === s.value)?._count._all || 0 })),
      byCounsellor: [...per.entries()]
        .map(([k, v]) => ({ label: k ? name.get(k) || 'Removed user' : 'Unassigned', value: v.total, hint: `${v.closed} admission${v.closed === 1 ? '' : 's'} · ${pct(v.closed, v.total)}` }))
        .sort((a, b) => b.value - a.value),
    }
  }

  // ---------- Admissions ----------
  let admData: null | { total: number; byCourse: any[]; byStatus: any[]; byCounsellor: any[]; feeStatus: any[]; billed: number } = null
  if (show.admissions) {
    const where = { isDeleted: false, admissionDate: { gte: dateOnly(from), lte: dateOnly(to) } }
    const rows = await (db as any).admission.findMany({ where, select: { id: true, totalFee: true, courseName: true, status: true, counsellorName: true } })
    const count = (key: (a: any) => string) => {
      const m = new Map<string, number>()
      rows.forEach((a: any) => m.set(key(a), (m.get(key(a)) || 0) + 1))
      return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
    }
    let feeStatus: any[] = []
    if (show.fees) {
      const ledgers = await loadLedgers(rows.filter((a: any) => a.status !== 'CANCELLED'), today)
      const m = new Map<string, number>()
      for (const l of ledgers.values()) m.set(l.status, (m.get(l.status) || 0) + 1)
      feeStatus = Object.entries(FEE_STATUS_LABEL).map(([k, label]) => ({ label, value: m.get(k) || 0 }))
    }
    admData = {
      total: rows.length,
      byCourse: count((a) => a.courseName),
      byStatus: count((a) => admissionStatusLabel(a.status)),
      byCounsellor: count((a) => a.counsellorName || 'Not set'),
      feeStatus,
      billed: rows.filter((a: any) => a.status !== 'CANCELLED').reduce((s: number, a: any) => s + Number(a.totalFee || 0), 0),
    }
  }

  // ---------- Money ----------
  let money: null | { collection: Awaited<ReturnType<typeof netCollection>>; byMode: any[]; adjustments: number; daily: { label: string; value: number }[] } = null
  if (show.fees) {
    const [collection, modes, adj, pays] = await Promise.all([
      netCollection(range.gte, range.lte),
      (db as any).payment.groupBy({ by: ['mode'], where: { status: 'SUCCESSFUL', kind: 'PAYMENT', paidAt: range }, _sum: { amount: true }, _count: { _all: true } }),
      (db as any).payment.aggregate({ where: { status: 'SUCCESSFUL', kind: 'ADJUSTMENT', paidAt: range }, _sum: { amount: true } }),
      (db as any).payment.findMany({ where: { status: 'SUCCESSFUL', kind: { in: ['PAYMENT', 'REFUND', 'REVERSAL'] }, paidAt: range }, select: { kind: true, amount: true, paidAt: true } }),
    ])
    // Net collection per IST day (only for ranges up to ~2 months, else per month)
    const days = Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1
    const bucket = (d: Date) => {
      const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
      return days <= 62 ? ymd : ymd.slice(0, 7)
    }
    const m = new Map<string, number>()
    for (const p of pays) {
      const k = bucket(new Date(p.paidAt))
      m.set(k, (m.get(k) || 0) + (p.kind === 'PAYMENT' ? 1 : -1) * Number(p.amount))
    }
    const keys: string[] = []
    if (days <= 62) for (let d = from; d <= to; d = addDays(d, 1)) keys.push(d)
    else for (let d = monthStart(from); d <= to; d = addDays(monthStart(addDays(d, 32)), 0)) keys.push(d.slice(0, 7))
    money = {
      collection,
      adjustments: Number(adj._sum.amount || 0),
      byMode: modes.map((r: any) => ({ label: paymentModeLabel(r.mode), value: Number(r._sum.amount || 0), hint: `${r._count._all}` })).sort((a: any, b: any) => b.value - a.value),
      daily: keys.map((k) => ({ label: k.length === 10 ? fmtDate(k) : new Date(`${k}-01T00:00:00Z`).toLocaleDateString('en-IN', { timeZone: 'UTC', month: 'short', year: 'numeric' }), value: Math.round((m.get(k) || 0) * 100) / 100 })),
    }
  }
  let exp: null | { total: number; byCategory: any[] } = null
  if (show.expenses) {
    const rows = await (db as any).expense.groupBy({ by: ['category'], where: { isDeleted: false, expenseAt: range }, _sum: { amount: true } })
    exp = {
      total: rows.reduce((s: number, r: any) => s + Number(r._sum.amount || 0), 0),
      byCategory: rows.map((r: any) => ({ label: r.category || 'Uncategorised', value: Number(r._sum.amount || 0) })).sort((a: any, b: any) => b.value - a.value),
    }
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle={`${fmtDate(from)} – ${fmtDate(to)} (IST). Choose a period below.`} />
      <FilterBar
        fields={[
          { type: 'date', name: 'from', label: 'From' },
          { type: 'date', name: 'to', label: 'To' },
        ]}
      />
      <div className="flex flex-wrap gap-2 mb-5 text-xs">
        {[
          { label: 'This month', f: monthStart(today), t: today },
          { label: 'Last 7 days', f: addDays(today, -6), t: today },
          { label: 'Last 30 days', f: addDays(today, -29), t: today },
          { label: 'Last month', f: monthStart(addDays(monthStart(today), -1)), t: addDays(monthStart(today), -1) },
          { label: 'This year', f: `${today.slice(0, 4)}-01-01`, t: today },
        ].map((p) => (
          <Link key={p.label} href={`/admin/reports?from=${p.f}&to=${p.t}`} className={`px-3 py-1.5 rounded-lg font-semibold border ${from === p.f && to === p.t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
            {p.label}
          </Link>
        ))}
      </div>

      {(money || exp) && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Financial summary</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
            {money && <Stat label="Fees received" value={fmtMoney(money.collection.received)} hint={`${money.collection.count} payments`} icon="ion:cash-outline" tone="green" />}
            {money && <Stat label="Refunds & reversals" value={fmtMoney(money.collection.returned)} icon="ion:return-down-back-outline" tone="red" />}
            {money && <Stat label="Net collection" value={fmtMoney(money.collection.net)} hint={money.adjustments ? `${fmtMoney(money.adjustments)} fee adjustments (not income)` : undefined} icon="ion:wallet-outline" tone="blue" />}
            {exp && <Stat label="Expenses" value={fmtMoney(exp.total)} icon="ion:receipt-outline" tone="amber" />}
            {money && exp && <Stat label="Net (collection − expenses)" value={fmtMoney(money.collection.net - exp.total)} icon="ion:analytics-outline" tone={money.collection.net - exp.total >= 0 ? 'green' : 'red'} />}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {money && (
              <Card title="Net collection over time" className="xl:col-span-2" actions={exportOk('fees') ? <a className={BTN_SECONDARY} href={`/api/admin/export/payments?${qs}`}>Export payments</a> : null}>
                <Bars rows={money.daily.filter((d) => d.value !== 0)} money empty="No collections in this period." />
              </Card>
            )}
            {money && (
              <Card title="Collections by payment mode">
                <Bars rows={money.byMode} money />
              </Card>
            )}
            {exp && (
              <Card title="Expenses by category" actions={exportOk('expenses') ? <a className={BTN_SECONDARY} href={`/api/admin/export/expenses?${qs}`}>Export expenses</a> : null}>
                <Bars rows={exp.byCategory} money empty="No expenses in this period." />
              </Card>
            )}
          </div>
        </section>
      )}

      {admData && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Admissions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Stat label="Admissions" value={admData.total} icon="ion:school-outline" href={`/admin/admissions?${qs}`} />
            {show.fees && <Stat label="Fees billed" value={fmtMoney(admData.billed)} hint="Excludes cancelled" icon="ion:pricetag-outline" />}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card title="By course" actions={exportOk('admissions') ? <a className={BTN_SECONDARY} href={`/api/admin/export/admissions?${qs}`}>Export</a> : null}>
              <Bars rows={admData.byCourse} />
            </Card>
            <Card title="By status">
              <Bars rows={admData.byStatus} />
            </Card>
            <Card title="By counsellor">
              <Bars rows={admData.byCounsellor} />
            </Card>
            {show.fees && (
              <Card title="Fee status">
                <Bars rows={admData.feeStatus} />
              </Card>
            )}
          </div>
        </section>
      )}

      {leadData && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Leads</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Stat label="Leads received" value={leadData.total} icon="ion:people-outline" href={`/admin/leads?${qs}`} />
            <Stat label="Converted to admission" value={leadData.converted} hint={pct(leadData.converted, leadData.total)} icon="ion:trending-up-outline" tone="green" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card title="By source" actions={exportOk('leads') ? <a className={BTN_SECONDARY} href={`/api/admin/export/leads?${qs}`}>Export</a> : null}>
              <Bars rows={leadData.bySource} />
            </Card>
            <Card title="By status">
              <Bars rows={leadData.byStatus} />
            </Card>
            <Card title="Counsellor performance">
              <Bars rows={leadData.byCounsellor} empty="No leads in this period." />
            </Card>
          </div>
        </section>
      )}
      {!leadData && !admData && !money && !exp && <p className="text-sm text-slate-500">Your role has no report sections.</p>}
      <p className="text-[11px] text-slate-400">Reports read live data. Leads, admissions and expenses in the Bin are excluded. Refunds and reversals reduce collections; fee adjustments reduce balances but are not income.</p>
    </div>
  )
}
