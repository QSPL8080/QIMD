import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Icon } from '@iconify/react'
import { db } from '@/lib/db'
import { getAdminSession, isSuperAdminRole } from '@/lib/auth'
import { can, leadStatusLabel, leadSourceLabel, normalizeRole, roleLabel } from '@/lib/permissions'
import { leadScope } from '@/lib/leadAccess'
import { loadLedgers, LIVE_ADMISSION } from '@/lib/admissionData'
import { netCollection } from '@/lib/paymentFilters'
import { admissionStatusLabel } from '@/lib/fees'
import { addDays, daysBetween, dateOnly, fmtDate, fmtDateTime, fmtMoney, istEnd, istStart, monthStart, todayIST } from '@/lib/dates'
import { Stat, Card, Badge, LEAD_STATUS_TONE, ADMISSION_STATUS_TONE } from '@/components/Admin/ui'

export const dynamic = 'force-dynamic'

const GREETING: Record<string, string> = {
  SUPER_ADMIN: 'Everything across leads, admissions, fees and the website.',
  ADMIN: 'Daily operations across leads, admissions, fees and the website.',
  SEO: 'Website content you manage.',
  SALES_MANAGER: 'Lead pipeline, assignment and counsellor follow-ups.',
  COUNSELLOR: 'Your assigned leads and follow-ups.',
  ADMISSION_HEAD: 'Admissions, fee collection and dues.',
  VIEWER: 'Read-only view of the sections you can access.',
}

function SectionTitle({ children, href, link }: { children: React.ReactNode; href?: string; link?: string }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-6 first:mt-0">
      <h2 className="text-sm font-bold text-slate-900">{children}</h2>
      {href && (
        <Link href={href} className="text-xs font-semibold text-zinc-900 hover:underline inline-flex items-center gap-1">
          {link || 'View all'} <Icon icon="ion:arrow-forward" className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  )
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  const role = normalizeRole(session.roleName)
  const p = (m: Parameters<typeof can>[1], a: Parameters<typeof can>[2] = 'view') => can(session.roleName, m, a, session.moduleAccess)
  const today = todayIST()
  const dayRange = { gte: istStart(today), lte: istEnd(today) }
  const monthRange = { gte: istStart(monthStart(today)), lte: istEnd(today) }
  const counsellor = role === 'COUNSELLOR'

  // ---------- Leads ----------
  const leads = p('leads')
    ? await (async () => {
        const scope = { isDeleted: false, ...leadScope(session) }
        const [total, todayN, monthN, unassigned, fuToday, fuOverdue, open, recent, followUps] = await Promise.all([
          (db as any).lead.count({ where: scope }),
          (db as any).lead.count({ where: { ...scope, createdAt: dayRange } }),
          (db as any).lead.count({ where: { ...scope, createdAt: monthRange } }),
          counsellor ? 0 : (db as any).lead.count({ where: { ...scope, assignedToId: null, status: { notIn: ['ADMISSION_CLOSED', 'INVALID', 'NOT_INTERESTED'] } } }),
          (db as any).lead.count({ where: { ...scope, nextFollowUpAt: dayRange } }),
          (db as any).lead.count({ where: { ...scope, nextFollowUpAt: { lt: istStart(today) }, status: { notIn: ['ADMISSION_CLOSED', 'INVALID', 'NOT_INTERESTED'] } } }),
          (db as any).lead.count({ where: { ...scope, status: 'NEW' } }),
          (db as any).lead.findMany({ where: scope, orderBy: { createdAt: 'desc' }, take: 6, include: { assignedTo: { select: { fullName: true } } } }),
          (db as any).lead.findMany({
            where: { ...scope, nextFollowUpAt: { lte: istEnd(today) }, status: { notIn: ['ADMISSION_CLOSED', 'INVALID', 'NOT_INTERESTED'] } },
            orderBy: { nextFollowUpAt: 'asc' },
            take: 8,
            select: { id: true, fullName: true, leadCode: true, phone: true, nextFollowUpAt: true, status: true },
          }),
        ])
        return { total, todayN, monthN, unassigned, fuToday, fuOverdue, open, recent, followUps }
      })()
    : null

  // ---------- Admissions ----------
  const adm = p('admissions')
    ? await (async () => {
        const [todayN, monthN, pending, active, recent] = await Promise.all([
          (db as any).admission.count({ where: { isDeleted: false, admissionDate: dateOnly(today) } }),
          (db as any).admission.count({ where: { isDeleted: false, admissionDate: { gte: dateOnly(monthStart(today)) } } }),
          (db as any).admission.count({ where: { isDeleted: false, status: 'VERIFICATION_PENDING' } }),
          (db as any).admission.count({ where: { isDeleted: false, status: 'ACTIVE' } }),
          (db as any).admission.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, admissionCode: true, studentName: true, courseName: true, admissionDate: true, status: true } }),
        ])
        return { todayN, monthN, pending, active, recent }
      })()
    : null

  // ---------- Fees ----------
  const fees = p('fees')
    ? await (async () => {
        const [cToday, cMonth, live] = await Promise.all([
          netCollection(dayRange.gte, dayRange.lte),
          netCollection(monthRange.gte, monthRange.lte),
          (db as any).admission.findMany({ where: LIVE_ADMISSION, select: { id: true, totalFee: true, studentName: true, admissionCode: true } }),
        ])
        const ledgers = await loadLedgers(live, today)
        let outstanding = 0
        let overdue = 0
        const dues: { id: string; name: string; code: string; label: string; due: string; amount: number; days: number }[] = []
        const horizon = addDays(today, 7)
        for (const a of live) {
          const l = ledgers.get(a.id)!
          outstanding += l.balance
          overdue += l.overdueAmount
          for (const i of l.installments) if (i.remaining > 0 && i.dueDate <= horizon) dues.push({ id: a.id, name: a.studentName, code: a.admissionCode, label: i.label, due: i.dueDate, amount: i.remaining, days: daysBetween(today, i.dueDate) })
        }
        dues.sort((x, y) => x.days - y.days)
        return { cToday, cMonth, outstanding, overdue, dues: dues.slice(0, 8), duesCount: dues.length }
      })()
    : null

  const expenseMonth = p('expenses')
    ? Number((await (db as any).expense.aggregate({ where: { isDeleted: false, expenseAt: monthRange }, _sum: { amount: true } }))._sum.amount || 0)
    : null

  // ---------- Website content & other enquiries ----------
  const content = p('content')
    ? await Promise.all([
        db.banner.count({ where: { isDeleted: false } }),
        db.blog.count({ where: { isDeleted: false } }),
        db.jobOpening.count({ where: { isDeleted: false } }),
        db.placement.count({ where: { isDeleted: false } }),
        db.testimonial.count({ where: { isDeleted: false } }),
        db.studentReview.count({ where: { isDeleted: false } }),
        db.faq.count({ where: { isDeleted: false } }),
        db.gallery.count({ where: { isDeleted: false } }),
        db.blog.findMany({ where: { isDeleted: false }, take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, status: true, createdAt: true } }),
      ])
    : null
  const enquiries = p('enquiries')
    ? await Promise.all([
        db.careerEnquiry.count({ where: { isDeleted: false } }),
        db.companyPlacementEnquiry.count({ where: { isDeleted: false } }),
        db.franchisePartnerEnquiry.count({ where: { isDeleted: false } }),
      ])
    : null
  const users = isSuperAdminRole(session.roleName) || role === 'ADMIN'
    ? await Promise.all([
        db.user.count({ where: { isDeleted: false, status: true } }),
        (db as any).user.count({ where: { isDeleted: false, lockedUntil: { gt: new Date() } } }),
      ])
    : null

  return (
    <div>
      <section className="rounded-2xl bg-white border border-slate-200 px-5 py-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{roleLabel(session.roleName)} dashboard</p>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Welcome back, {session.fullName}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {GREETING[role] || ''} {fmtDate(today)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {p('leads', 'add') && (
            <Link href="/admin/leads?add=1" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200">
              <Icon icon="ion:person-add-outline" className="w-4 h-4" /> Add lead
            </Link>
          )}
          {p('admissions', 'add') && (
            <Link href="/admin/admissions/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-black">
              <Icon icon="ion:school-outline" className="w-4 h-4" /> New admission
            </Link>
          )}
          {p('content', 'add') && (
            <Link href="/admin/blogs" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200">
              <Icon icon="ion:create-outline" className="w-4 h-4" /> New blog
            </Link>
          )}
          <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200">
            <Icon icon="ion:open-outline" className="w-4 h-4" /> View website
          </Link>
        </div>
      </section>

      {fees && (
        <>
          <SectionTitle href="/admin/fees">Fees</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3">
            <Stat label="Collected today" value={fmtMoney(fees.cToday.net)} hint={`${fees.cToday.count} payment${fees.cToday.count === 1 ? '' : 's'}`} icon="ion:cash-outline" tone="green" href={`/admin/fees?from=${today}&to=${today}`} />
            <Stat label="This month" value={fmtMoney(fees.cMonth.net)} icon="ion:calendar-number-outline" href={`/admin/fees?from=${monthStart(today)}&to=${today}`} />
            <Stat label="Outstanding" value={fmtMoney(fees.outstanding)} icon="ion:hourglass-outline" tone="amber" href="/admin/fees?view=dues&due=all" />
            <Stat label="Overdue" value={fmtMoney(fees.overdue)} icon="ion:alert-circle-outline" tone="red" href="/admin/fees?view=dues&due=overdue" />
            {expenseMonth !== null && <Stat label="Expenses (month)" value={fmtMoney(expenseMonth)} icon="ion:receipt-outline" href={`/admin/expenses?from=${monthStart(today)}&to=${today}`} />}
          </div>
        </>
      )}
      {!fees && expenseMonth !== null && (
        <>
          <SectionTitle href="/admin/expenses">Expenses</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Expenses this month" value={fmtMoney(expenseMonth)} icon="ion:receipt-outline" href="/admin/expenses" />
          </div>
        </>
      )}

      {adm && (
        <>
          <SectionTitle href="/admin/admissions">Admissions</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Today" value={adm.todayN} icon="ion:today-outline" tone="blue" href={`/admin/admissions?from=${today}&to=${today}`} />
            <Stat label="This month" value={adm.monthN} icon="ion:calendar-outline" href={`/admin/admissions?from=${monthStart(today)}`} />
            <Stat label="Verification pending" value={adm.pending} icon="ion:shield-checkmark-outline" tone="amber" href="/admin/admissions?status=VERIFICATION_PENDING" />
            <Stat label="Active students" value={adm.active} icon="ion:school-outline" tone="green" href="/admin/admissions?status=ACTIVE" />
          </div>
        </>
      )}

      {leads && (
        <>
          <SectionTitle href="/admin/leads">{counsellor ? 'My leads' : 'Leads'}</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-3">
            <Stat label={counsellor ? 'Assigned to me' : 'All leads'} value={leads.total} icon="ion:people-outline" href="/admin/leads" />
            <Stat label="New (not contacted)" value={leads.open} icon="ion:sparkles-outline" tone="blue" href="/admin/leads?status=NEW" />
            <Stat label="Received today" value={leads.todayN} icon="ion:today-outline" href={`/admin/leads?from=${today}&to=${today}`} />
            <Stat label="This month" value={leads.monthN} icon="ion:calendar-outline" href={`/admin/leads?from=${monthStart(today)}`} />
            <Stat label="Follow-ups today" value={leads.fuToday} icon="ion:call-outline" tone="amber" href="/admin/leads?followup=today" />
            <Stat label="Overdue follow-ups" value={leads.fuOverdue} icon="ion:alarm-outline" tone="red" href="/admin/leads?followup=overdue" />
            {!counsellor && <Stat label="Unassigned" value={leads.unassigned} icon="ion:person-remove-outline" tone="amber" href="/admin/leads?assigned=unassigned" />}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6">
        {leads && (
          <Card title="Follow-ups due" actions={<Link href="/admin/leads?followup=overdue" className="text-xs font-semibold text-zinc-900">Overdue</Link>}>
            {leads.followUps.length === 0 ? (
              <p className="text-sm text-slate-500">No follow-ups due today.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {leads.followUps.map((l: any) => {
                  const late = new Date(l.nextFollowUpAt) < istStart(today)
                  return (
                    <li key={l.id} className="py-2.5 flex items-center justify-between gap-3">
                      <Link href={`/admin/leads/${l.id}`} className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900 truncate">{l.fullName}</span>
                        <span className="block text-[11px] text-slate-500">
                          {l.leadCode} · {l.phone || '—'} · {leadStatusLabel(l.status)}
                        </span>
                      </Link>
                      <Badge tone={late ? 'red' : 'amber'}>{fmtDateTime(l.nextFollowUpAt)}</Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        )}
        {fees && (
          <Card title={`Dues in the next 7 days & overdue (${fees.duesCount})`} actions={<Link href="/admin/fees?view=dues&due=7" className="text-xs font-semibold text-zinc-900">All dues</Link>}>
            {fees.dues.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing due in the next 7 days.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {fees.dues.map((d, i) => (
                  <li key={`${d.id}-${i}`} className="py-2.5 flex items-center justify-between gap-3">
                    <Link href={`/admin/admissions/${d.id}?tab=fees`} className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900 truncate">{d.name}</span>
                      <span className="block text-[11px] text-slate-500">
                        {d.code} · {d.label} · {fmtDate(d.due)}
                      </span>
                    </Link>
                    <span className="text-right">
                      <span className="block text-sm font-semibold">{fmtMoney(d.amount)}</span>
                      <Badge tone={d.days < 0 ? 'red' : d.days === 0 ? 'amber' : 'blue'}>{d.days < 0 ? `${-d.days}d overdue` : d.days === 0 ? 'Today' : `In ${d.days}d`}</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        {leads && (
          <Card title="Latest leads" actions={<Link href="/admin/leads" className="text-xs font-semibold text-zinc-900">View all</Link>}>
            {leads.recent.length === 0 ? (
              <p className="text-sm text-slate-500">No leads yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {leads.recent.map((l: any) => (
                  <li key={l.id} className="py-2.5 flex items-center justify-between gap-3">
                    <Link href={`/admin/leads/${l.id}`} className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900 truncate">{l.fullName}</span>
                      <span className="block text-[11px] text-slate-500 truncate">
                        {leadSourceLabel(l.source)} · {l.course || 'Course not given'} · {fmtDateTime(l.createdAt)}
                        {!counsellor && ` · ${l.assignedTo?.fullName || 'Unassigned'}`}
                      </span>
                    </Link>
                    <Badge tone={LEAD_STATUS_TONE[l.status] || 'slate'}>{leadStatusLabel(l.status)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        {adm && (
          <Card title="Latest admissions" actions={<Link href="/admin/admissions" className="text-xs font-semibold text-zinc-900">View all</Link>}>
            {adm.recent.length === 0 ? (
              <p className="text-sm text-slate-500">No admissions yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {adm.recent.map((a: any) => (
                  <li key={a.id} className="py-2.5 flex items-center justify-between gap-3">
                    <Link href={`/admin/admissions/${a.id}`} className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900 truncate">{a.studentName}</span>
                      <span className="block text-[11px] text-slate-500">
                        {a.admissionCode} · {a.courseName} · {fmtDate(a.admissionDate)}
                      </span>
                    </Link>
                    <Badge tone={ADMISSION_STATUS_TONE[a.status] || 'slate'}>{admissionStatusLabel(a.status)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>

      {enquiries && (
        <>
          <SectionTitle>Other enquiries</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Stat label="Career applications" value={enquiries[0]} icon="ion:briefcase-outline" href="/admin/enquiries/careers" />
            <Stat label="Hire requests" value={enquiries[1]} icon="ion:business-outline" href="/admin/enquiries/hire" />
            <Stat label="Franchise enquiries" value={enquiries[2]} icon="ion:storefront-outline" href="/admin/enquiries/franchise" />
          </div>
        </>
      )}

      {content && (
        <>
          <SectionTitle>Website content</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['Homepage banners', content[0], '/admin/banners', 'ion:images-outline'],
              ['Blogs', content[1], '/admin/blogs', 'ion:document-text-outline'],
              ['Job openings', content[2], '/admin/careers', 'ion:clipboard-outline'],
              ['Placed students', content[3], '/admin/placements', 'ion:ribbon-outline'],
              ['Testimonials', content[4], '/admin/testimonials', 'ion:videocam-outline'],
              ['Student reviews', content[5], '/admin/reviews', 'ion:star-outline'],
              ['FAQs', content[6], '/admin/faqs', 'ion:help-circle-outline'],
              ['Gallery items', content[7], '/admin/gallery', 'ion:camera-outline'],
            ].map(([label, value, href, icon]) => (
              <Stat key={href as string} label={label as string} value={value as number} href={href as string} icon={icon as string} />
            ))}
          </div>
          <div className="mt-4">
            <Card title="Recent blogs" actions={<Link href="/admin/blogs" className="text-xs font-semibold text-zinc-900">Manage</Link>}>
              {content[8].length === 0 ? (
                <p className="text-sm text-slate-500">No blogs yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {content[8].map((b: any) => (
                    <li key={b.id} className="py-2.5 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900 truncate">{b.title}</span>
                      <span className="text-[11px] text-slate-500 whitespace-nowrap">
                        {b.status} · {fmtDate(b.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      {users && (
        <>
          <SectionTitle href="/admin/users" link="Manage users">
            Team
          </SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Active users" value={users[0]} icon="ion:people-circle-outline" href="/admin/users" />
            <Stat label="Locked accounts" value={users[1]} icon="ion:lock-closed-outline" tone={users[1] ? 'red' : 'slate'} href="/admin/users" />
          </div>
        </>
      )}
    </div>
  )
}
