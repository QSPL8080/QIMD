import React from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can, normalizeRole } from '@/lib/permissions'
import { admissionLedger } from '@/lib/payments'
import { listFiles, canOpenFile } from '@/lib/files'
import { admissionStatusLabel, FEE_STATUS_LABEL, PAYMENT_KIND_LABEL, paymentModeLabel } from '@/lib/fees'
import { fmtDate, fmtDateTime, fmtMoney, toIstLocal } from '@/lib/dates'
import { mailConfigured } from '@/lib/mailer'
import { PageHeader, Card, Badge, Detail, Stat, BTN_SECONDARY, ADMISSION_STATUS_TONE, FEE_STATUS_TONE } from '@/components/Admin/ui'
import AdmissionControls from './AdmissionControls'
import FeesPanel from './FeesPanel'
import DocumentsPanel from './DocumentsPanel'

export const dynamic = 'force-dynamic'

export default async function AdmissionDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; created?: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.roleName, 'admissions', 'view', session.moduleAccess)) redirect('/admin/dashboard')
  const { id } = await params
  const { tab: tabParam, created } = await searchParams
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const found = await admissionLedger(id)
  if (!found || found.admission.isDeleted) notFound()
  const { admission: a, ledger } = found

  const canFees = can(session.roleName, 'fees', 'view', session.moduleAccess)
  const tabs = [
    { key: 'overview', label: 'Overview' },
    ...(canFees ? [{ key: 'fees', label: 'Fees & Payments' }] : []),
    { key: 'documents', label: 'Documents' },
    { key: 'history', label: 'History' },
  ]
  const tab = tabs.some((t) => t.key === tabParam) ? tabParam! : 'overview'

  const paymentIds = a.payments.map((p: any) => p.id)
  const [lead, files, history, reminders] = await Promise.all([
    a.leadId ? (db as any).lead.findUnique({ where: { id: a.leadId }, select: { id: true, leadCode: true, fullName: true } }) : null,
    tab === 'documents' ? listFiles('admission', id) : Promise.resolve([]),
    tab === 'history'
      ? (db as any).auditLog.findMany({
          where: { OR: [{ entityType: 'admission', entityId: id }, ...(paymentIds.length ? [{ entityType: 'payment', entityId: { in: paymentIds } }] : [])] },
          orderBy: { createdAt: 'desc' },
          take: 300,
        })
      : Promise.resolve([]),
    tab === 'fees' ? (db as any).reminderLog.findMany({ where: { admissionId: id }, orderBy: { createdAt: 'desc' }, take: 50 }) : Promise.resolve([]),
  ])

  const reversedOf = new Map<string, number>()
  for (const p of a.payments) if (['REVERSAL', 'REFUND'].includes(p.kind) && p.relatedPaymentId) reversedOf.set(p.relatedPaymentId, (reversedOf.get(p.relatedPaymentId) || 0) + Number(p.amount))

  const perms = {
    edit: can(session.roleName, 'admissions', 'edit', session.moduleAccess),
    remove: can(session.roleName, 'admissions', 'delete', session.moduleAccess),
    payAdd: can(session.roleName, 'fees', 'add', session.moduleAccess),
    payEdit: can(session.roleName, 'fees', 'edit', session.moduleAccess),
    payCorrect: can(session.roleName, 'fees', 'delete', session.moduleAccess),
    upload: can(session.roleName, 'admissions', 'add', session.moduleAccess) || can(session.roleName, 'admissions', 'edit', session.moduleAccess),
    openFiles: canOpenFile(session, 'admission'),
    removeFiles: can(session.roleName, 'admissions', 'delete', session.moduleAccess),
  }
  const canLead = can(session.roleName, 'leads', 'view', session.moduleAccess) && normalizeRole(session.roleName) !== 'COUNSELLOR'

  return (
    <div>
      <PageHeader
        back={{ href: '/admin/admissions', label: 'Admissions' }}
        title={a.studentName}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {a.admissionCode} · {a.courseName} · admitted {fmtDate(a.admissionDate)}
            <Badge tone={ADMISSION_STATUS_TONE[a.status] || 'slate'}>{admissionStatusLabel(a.status)}</Badge>
            {canFees && <Badge tone={FEE_STATUS_TONE[ledger.status]}>{FEE_STATUS_LABEL[ledger.status]}</Badge>}
          </span>
        }
        actions={
          <>
            {perms.edit && (
              <Link href={`/admin/admissions/${id}/edit`} className={BTN_SECONDARY}>
                Edit admission
              </Link>
            )}
            <AdmissionControls id={id} status={a.status} code={a.admissionCode} canEdit={perms.edit} canDelete={perms.remove} />
          </>
        }
      />

      {created && <div className="mb-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm px-4 py-3">Admission {a.admissionCode} created. Upload the scanned documents and photo from the Documents tab.</div>}
      {a.status === 'CANCELLED' && a.statusReason && <div className="mb-4 rounded-xl bg-rose-50 text-rose-800 text-sm px-4 py-3">Cancelled / withdrawn: {a.statusReason}</div>}

      {canFees && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Stat label="Total fee" value={fmtMoney(ledger.totalFee)} icon="ion:pricetag-outline" />
          <Stat label="Received" value={fmtMoney(ledger.collected)} icon="ion:checkmark-done-outline" tone="green" hint={ledger.adjustments ? `+ ${fmtMoney(ledger.adjustments)} adjusted` : undefined} />
          <Stat label="Balance" value={fmtMoney(ledger.balance)} icon="ion:wallet-outline" tone={ledger.balance > 0 ? 'amber' : 'green'} />
          <Stat
            label={ledger.overdueAmount > 0 ? 'Overdue' : 'Next due'}
            value={ledger.overdueAmount > 0 ? fmtMoney(ledger.overdueAmount) : ledger.nextDue ? fmtMoney(ledger.nextDue.amount) : '—'}
            hint={ledger.nextDue ? `${ledger.nextDue.label} · ${fmtDate(ledger.nextDue.dueDate)}` : ledger.unscheduled > 0 ? `${fmtMoney(ledger.unscheduled)} without a due date` : undefined}
            icon="ion:alarm-outline"
            tone={ledger.overdueAmount > 0 ? 'red' : 'slate'}
          />
        </div>
      )}

      <nav className="flex gap-1 border-b border-slate-200 mb-4 overflow-x-auto" aria-label="Admission sections">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/admissions/${id}?tab=${t.key}`}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px ${tab === t.key ? 'border-zinc-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card title="Personal details">
            <dl className="grid grid-cols-2 gap-4">
              <Detail label="Student name" value={a.studentName} />
              <Detail label="Guardian" value={a.guardianName} />
              <Detail label="Gender" value={a.gender} />
              <Detail label="Date of birth" value={a.dateOfBirth ? fmtDate(a.dateOfBirth) : null} />
              <Detail label="Mobile" value={a.mobile} />
              <Detail label="WhatsApp" value={a.whatsapp} />
              <Detail label="Email" value={a.email} />
              <Detail label="Current address" value={a.currentAddress} />
              <Detail label="Permanent address" value={a.permanentAddress} />
            </dl>
          </Card>
          <Card title="Course details">
            <dl className="grid grid-cols-2 gap-4">
              <Detail label="Course" value={a.courseName} />
              <Detail label="Duration" value={a.courseDurationMonths ? `${a.courseDurationMonths} months` : null} />
              <Detail label="Training batch" value={a.batchTiming} />
              <Detail label="Practical batch" value={a.practicalBatchTiming} />
              <Detail label="Admission date" value={fmtDate(a.admissionDate)} />
              <Detail label="Expected completion" value={a.expectedCompletion ? fmtDate(a.expectedCompletion) : null} />
              <Detail label="Counsellor" value={a.counsellorName} />
              <Detail
                label="From lead"
                value={lead ? canLead ? <Link className="text-zinc-900 font-semibold" href={`/admin/leads/${lead.id}`}>{lead.leadCode}</Link> : lead.leadCode : 'Walk-in / direct'}
              />
              <Detail label="Verified" value={a.verifiedAt ? `${a.verifiedByName} · ${fmtDateTime(a.verifiedAt)}` : 'Not yet'} />
            </dl>
          </Card>
          <Card title="Education & profession">
            <dl className="grid grid-cols-2 gap-4">
              <Detail label="Highest qualification" value={a.highestQualification === 'Other' ? a.qualificationOther || 'Other' : a.highestQualification} />
              <Detail label="College / School" value={a.collegeSchool} />
              <Detail label="Year of passing" value={a.yearOfPassing} />
              <Detail label="Current status" value={a.currentStatus} />
              <Detail label="College / Company" value={a.collegeCompany} />
            </dl>
          </Card>
          <Card title="Documents, emergency contact & declaration">
            <dl className="grid grid-cols-2 gap-4">
              <Detail label="Documents submitted" value={Array.isArray(a.documentsSubmitted) && a.documentsSubmitted.length ? a.documentsSubmitted.join(', ') : null} />
              <Detail label="Emergency contact" value={[a.emergencyName, a.emergencyRelation, a.emergencyMobile].filter(Boolean).join(' · ')} />
              <Detail label="Declaration signed" value={a.declarationAccepted ? 'Yes' : 'No'} />
              <Detail label="Fee note" value={a.feeNote} />
              <Detail label="Created" value={`${a.createdByName || '—'} · ${fmtDateTime(a.createdAt)}`} />
              <Detail label="Last updated" value={`${a.updatedByName || '—'} · ${fmtDateTime(a.updatedAt)}`} />
            </dl>
          </Card>
        </div>
      )}

      {tab === 'fees' && canFees && (
        <FeesPanel
          admissionId={id}
          cancelled={a.status === 'CANCELLED'}
          hasEmail={Boolean(a.email)}
          mailReady={mailConfigured()}
          nowLocal={toIstLocal(new Date())}
          perms={{ add: perms.payAdd, edit: perms.payEdit, correct: perms.payCorrect }}
          ledger={{ balance: ledger.balance, nextDue: ledger.nextDue }}
          installments={ledger.installments.map((i) => ({ ...i, dueLabel: fmtDate(i.dueDate) }))}
          payments={[...a.payments]
            .sort((x: any, y: any) => new Date(y.paidAt).getTime() - new Date(x.paidAt).getTime() || new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
            .map((p: any) => ({
              id: p.id,
              code: p.paymentCode,
              receiptNo: p.receiptNo,
              kind: p.kind,
              kindLabel: PAYMENT_KIND_LABEL[p.kind] || p.kind,
              status: p.status,
              amount: Number(p.amount),
              paidAt: fmtDateTime(p.paidAt),
              mode: paymentModeLabel(p.mode),
              reference: p.reference,
              loanBank: p.loanBank,
              notes: p.notes,
              recordedBy: p.recordedByName,
              emailStatus: p.receiptEmailStatus,
              emailError: p.receiptEmailError,
              reversed: reversedOf.get(p.id) || 0,
            }))}
          reminders={reminders.map((r: any) => ({
            id: r.id,
            when: fmtDateTime(r.createdAt),
            audience: r.audience,
            stage: r.stage,
            channel: r.channel,
            status: r.status,
            error: r.error,
            by: r.sentByName,
            due: r.dueDate ? `${fmtMoney(Number(r.amount || 0))} · ${fmtDate(r.dueDate)}` : r.amount ? fmtMoney(Number(r.amount)) : '',
          }))}
        />
      )}

      {tab === 'documents' && <DocumentsPanel admissionId={id} files={files} perms={{ upload: perms.upload, open: perms.openFiles, remove: perms.removeFiles }} />}

      {tab === 'history' && (
        <Card title="Change history">
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">No history yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {history.map((h: any) => (
                <li key={h.id} className="py-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <strong className="text-slate-800">{fmtDateTime(h.createdAt)}</strong>
                    <span>{h.actorName}</span>
                    <Badge>{h.action}</Badge>
                  </div>
                  <p className="text-sm text-slate-800 mt-0.5">{h.summary}</p>
                  {h.before && h.after && Object.keys(h.after).length > 0 && Object.keys(h.after).length <= 12 && (
                    <div className="mt-1 text-xs text-slate-600 space-y-0.5">
                      {Object.keys(h.after).map((k) => (
                        <div key={k}>
                          <span className="font-semibold">{k}</span>: <span className="line-through text-slate-400">{fmtVal(h.before[k])}</span> → {fmtVal(h.after[k])}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}

function fmtVal(v: unknown) {
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return v.join(', ') || '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}
