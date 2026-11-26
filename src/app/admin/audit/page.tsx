import React from 'react'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can, roleLabel } from '@/lib/permissions'
import { fmtDateTime, isYmd, istEnd, istStart } from '@/lib/dates'
import { PageHeader, Card, Badge, Pagination } from '@/components/Admin/ui'
import FilterBar from '@/components/Admin/FilterBar'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 50

const ENTITY_LABEL: Record<string, string> = {
  lead: 'Lead',
  admission: 'Admission',
  payment: 'Payment',
  expense: 'Expense',
  user: 'User',
  auth: 'Sign-in',
  setting: 'Settings',
  leads: 'Leads export',
  admissions: 'Admissions export',
  payments: 'Payments export',
  expenses: 'Expenses export',
  audit: 'Audit export',
  enquiry: 'Enquiry',
}

function fmtVal(v: unknown) {
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return v.join(', ') || '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.roleName, 'audit', 'view', session.moduleAccess)) redirect('/admin/dashboard')
  const sp = await searchParams
  const one = (k: string) => {
    const v = sp[k]
    const s = Array.isArray(v) ? v[0] : v
    return s ? String(s).slice(0, 100) : undefined
  }
  const f = { q: one('q'), action: one('action'), entity: one('entity'), from: one('from'), to: one('to'), page: one('page') }
  const page = Math.max(1, Number(f.page) || 1)

  const and: any[] = []
  if (isYmd(f.from)) and.push({ createdAt: { gte: istStart(f.from) } })
  if (isYmd(f.to)) and.push({ createdAt: { lte: istEnd(f.to) } })
  if (f.action) and.push({ action: f.action })
  if (f.entity) and.push({ entityType: f.entity })
  if (f.q?.trim()) and.push({ OR: [{ summary: { contains: f.q.trim(), mode: 'insensitive' } }, { actorName: { contains: f.q.trim(), mode: 'insensitive' } }] })
  const where = { AND: and }

  const [total, rows, actions, entities] = await Promise.all([
    (db as any).auditLog.count({ where }),
    (db as any).auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    (db as any).auditLog.groupBy({ by: ['action'], orderBy: { action: 'asc' } }),
    (db as any).auditLog.groupBy({ by: ['entityType'], orderBy: { entityType: 'asc' } }),
  ])

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Every important action: who did it, when (IST), and what changed. Entries cannot be edited or deleted." />
      <FilterBar
        exportHref={can(session.roleName, 'audit', 'export', session.moduleAccess) ? '/api/admin/export/audit' : undefined}
        fields={[
          { type: 'search', name: 'q', placeholder: 'User name or description' },
          { type: 'select', name: 'action', label: 'Action', options: actions.map((a: any) => ({ value: a.action, label: a.action.replace(/_/g, ' ').toLowerCase() })) },
          { type: 'select', name: 'entity', label: 'Record type', options: entities.map((e: any) => ({ value: e.entityType, label: ENTITY_LABEL[e.entityType] || e.entityType })) },
          { type: 'date', name: 'from', label: 'From' },
          { type: 'date', name: 'to', label: 'To' },
        ]}
      />
      <Card pad={false}>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No entries found.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((h: any) => {
              const keys = h.after && typeof h.after === 'object' && !Array.isArray(h.after) && h.before ? Object.keys(h.after).slice(0, 15) : []
              return (
                <li key={h.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <strong className="text-slate-800">{fmtDateTime(h.createdAt)}</strong>
                    <span className="font-semibold text-slate-700">{h.actorName || 'System'}</span>
                    {h.actorRole && <span>({roleLabel(h.actorRole)})</span>}
                    <Badge>{h.action.replace(/_/g, ' ').toLowerCase()}</Badge>
                    {h.entityType && <Badge tone="blue">{ENTITY_LABEL[h.entityType] || h.entityType}</Badge>}
                    {h.ip && <span className="text-slate-400">IP {h.ip}</span>}
                  </div>
                  <p className="text-sm text-slate-800 mt-0.5 break-words">{h.summary}</p>
                  {keys.length > 0 && (
                    <details className="mt-1">
                      <summary className="text-[11px] font-semibold text-zinc-900 cursor-pointer">Show changes</summary>
                      <div className="mt-1 text-xs text-slate-600 space-y-0.5">
                        {keys.map((k) => (
                          <div key={k} className="break-words">
                            <span className="font-semibold">{k}</span>: <span className="line-through text-slate-400">{fmtVal(h.before?.[k])}</span> → {fmtVal(h.after[k])}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} params={f as any} basePath="/admin/audit" />
      </Card>
    </div>
  )
}
