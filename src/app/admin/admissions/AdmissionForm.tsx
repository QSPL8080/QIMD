'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Card, Field, INPUT, BTN_PRIMARY, BTN_SECONDARY, LABEL } from '@/components/Admin/ui'
import { Msg } from '@/components/Admin/Modal'
import { confirmDialog } from '@/components/Admin/confirmDialog'
import { GENDERS, QUALIFICATIONS, CURRENT_STATUSES, DOCUMENTS, DECLARATION } from '@/lib/admissionForm'
import { PAYMENT_MODES } from '@/lib/fees'
import { createAdmissionAction, updateAdmissionAction } from '@/app/actions/admissionActions'

export type AdmissionFormValues = {
  courseName: string
  courseDurationMonths: string
  batchTiming: string
  practicalBatchTiming: string
  admissionDate: string
  expectedCompletion: string
  studentName: string
  guardianName: string
  gender: string
  dateOfBirth: string
  mobile: string
  whatsapp: string
  email: string
  currentAddress: string
  permanentAddress: string
  highestQualification: string
  qualificationOther: string
  collegeSchool: string
  yearOfPassing: string
  currentStatus: string
  collegeCompany: string
  counsellorId: string
  totalFee: string
  registrationFee: string
  feeNote: string
  documentsSubmitted: string[]
  emergencyName: string
  emergencyRelation: string
  emergencyMobile: string
  declarationAccepted: boolean
  status: string
  installments: { id?: string; label: string; dueDate: string; amount: string }[]
}

type Props = {
  mode: 'create' | 'edit'
  admissionId?: string
  leadId?: string
  initial: AdmissionFormValues
  courses: { name: string; durationMonths: number | null; fee: number | null }[]
  counsellors: { id: string; fullName: string }[]
  today: string
  hasPayments?: boolean
}

const addMonths = (ymd: string, months: number) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd) || !months) return ''
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString().slice(0, 10)
}
const num = (v: string) => {
  const n = Number(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}
const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function AdmissionForm({ mode, admissionId, leadId, initial, courses, counsellors, today, hasPayments }: Props) {
  const router = useRouter()
  const [f, setF] = useState<AdmissionFormValues>(initial)
  const [reg, setReg] = useState({ record: mode === 'create', mode: 'CASH', paidDate: today, reference: '', loanBank: '' })
  const [sameAddress, setSameAddress] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const set = (k: keyof AdmissionFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value })
  const isOtherCourse = f.courseName !== '' && !courses.some((c) => c.name === f.courseName)
  const [otherCourse, setOtherCourse] = useState(isOtherCourse)

  const pickCourse = (name: string) => {
    const c = courses.find((x) => x.name === name)
    setOtherCourse(false)
    const dur = c?.durationMonths ? String(c.durationMonths) : f.courseDurationMonths
    setF({
      ...f,
      courseName: name,
      courseDurationMonths: dur,
      totalFee: c?.fee && !f.totalFee ? String(c.fee) : f.totalFee,
      expectedCompletion: addMonths(f.admissionDate, Number(dur)) || f.expectedCompletion,
    })
  }

  const scheduled = useMemo(() => f.installments.reduce((s, i) => s + num(i.amount), 0), [f.installments])
  const total = num(f.totalFee)
  const regFee = num(f.registrationFee)
  const unscheduled = Math.round((total - scheduled) * 100) / 100

  const setInst = (i: number, k: 'label' | 'dueDate' | 'amount', v: string) => setF({ ...f, installments: f.installments.map((x, j) => (j === i ? { ...x, [k]: v } : x)) })

  const fillSchedule = () => {
    const rows: AdmissionFormValues['installments'] = []
    if (regFee > 0) rows.push({ label: 'Registration fee', dueDate: f.admissionDate || today, amount: String(regFee) })
    const balance = Math.round((total - regFee) * 100) / 100
    if (balance > 0) rows.push({ label: 'Balance fee', dueDate: '', amount: String(balance) })
    setF({ ...f, installments: rows })
  }

  const submit = async (confirmDuplicate = false) => {
    setBusy(true)
    setMsg(null)
    const payload = { ...f, permanentAddress: sameAddress ? f.currentAddress : f.permanentAddress, leadId, confirmDuplicate, registrationPayment: reg }
    const r = mode === 'create' ? await createAdmissionAction(payload) : await updateAdmissionAction(admissionId!, payload)
    setBusy(false)
    if (r.success && r.id) {
      router.push(`/admin/admissions/${r.id}${mode === 'create' ? '?created=1' : ''}`)
      router.refresh()
      return
    }
    if ((r as any).warning === 'duplicate' && (await confirmDialog(r.error || 'Possible duplicate. Save anyway?', { confirmText: 'Save anyway', danger: false }))) return submit(true)
    setMsg({ ok: false, text: r.error || 'Could not save.' })
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  const radio = (name: string, value: string, current: string, onPick: (v: string) => void) => (
    <label key={value} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer ${current === value ? 'border-zinc-900 bg-zinc-100 text-slate-900 font-semibold' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
      <input type="radio" name={name} value={value} checked={current === value} onChange={() => onPick(value)} className="sr-only" />
      {value}
    </label>
  )

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <Card title="Course applying for">
        <div className="flex flex-wrap gap-2">
          {courses.map((c) => (
            <label key={c.name} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer ${!otherCourse && f.courseName === c.name ? 'border-zinc-900 bg-zinc-100 font-semibold text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              <input type="radio" name="course" className="sr-only" checked={!otherCourse && f.courseName === c.name} onChange={() => pickCourse(c.name)} />
              {c.name}
              {c.durationMonths ? <span className="text-xs text-slate-500">({c.durationMonths} months)</span> : null}
            </label>
          ))}
          <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer ${otherCourse ? 'border-zinc-900 bg-zinc-100 font-semibold' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            <input
              type="radio"
              name="course"
              className="sr-only"
              checked={otherCourse}
              onChange={() => {
                setOtherCourse(true)
                setF({ ...f, courseName: '' })
              }}
            />
            Other
          </label>
        </div>
        {otherCourse && (
          <Field label="Course name *" className="mt-3 max-w-md">
            <input className={INPUT} value={f.courseName} onChange={set('courseName')} required />
          </Field>
        )}
      </Card>

      <Card title="Personal details">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="Student name *">
            <input className={INPUT} value={f.studentName} onChange={set('studentName')} required />
          </Field>
          <Field label="Father's / Mother's / Guardian's name">
            <input className={INPUT} value={f.guardianName} onChange={set('guardianName')} />
          </Field>
          <Field label="Date of birth">
            <input type="date" className={INPUT} value={f.dateOfBirth} max={today} onChange={set('dateOfBirth')} />
          </Field>
          <div>
            <span className={LABEL}>Gender</span>
            <div className="flex flex-wrap gap-2">{GENDERS.map((g) => radio('gender', g, f.gender, (v) => setF({ ...f, gender: v })))}</div>
          </div>
          <Field label="Mobile number *">
            <input className={INPUT} value={f.mobile} onChange={set('mobile')} inputMode="tel" required />
          </Field>
          <Field label="WhatsApp number">
            <span className="flex gap-2">
              <input className={INPUT} value={f.whatsapp} onChange={set('whatsapp')} inputMode="tel" />
              <button type="button" className={BTN_SECONDARY} onClick={() => setF({ ...f, whatsapp: f.mobile })} title="Same as mobile">
                Same
              </button>
            </span>
          </Field>
          <Field label="Email ID" hint="Receipts and reminders are emailed here.">
            <input type="email" className={INPUT} value={f.email} onChange={set('email')} />
          </Field>
          <Field label="Current address" className="sm:col-span-2 lg:col-span-3">
            <textarea className={INPUT} rows={2} value={f.currentAddress} onChange={set('currentAddress')} />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1">
              <input type="checkbox" checked={sameAddress} onChange={(e) => setSameAddress(e.target.checked)} /> Permanent address same as current
            </label>
            {!sameAddress && <textarea className={INPUT} rows={2} placeholder="Permanent address" value={f.permanentAddress} onChange={set('permanentAddress')} />}
          </div>
        </div>
      </Card>

      <Card title="Educational details (highest qualification)">
        <div className="flex flex-wrap gap-2 mb-3">{QUALIFICATIONS.map((q) => radio('qualification', q, f.highestQualification, (v) => setF({ ...f, highestQualification: v })))}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {f.highestQualification === 'Other' && (
            <Field label="Other qualification">
              <input className={INPUT} value={f.qualificationOther} onChange={set('qualificationOther')} />
            </Field>
          )}
          <Field label="College / School name">
            <input className={INPUT} value={f.collegeSchool} onChange={set('collegeSchool')} />
          </Field>
          <Field label="Year of passing">
            <input className={INPUT} value={f.yearOfPassing} onChange={set('yearOfPassing')} inputMode="numeric" maxLength={4} placeholder="YYYY" />
          </Field>
        </div>
      </Card>

      <Card title="Professional details (current status)">
        <div className="flex flex-wrap gap-2 mb-3">{CURRENT_STATUSES.map((s) => radio('currentStatus', s, f.currentStatus, (v) => setF({ ...f, currentStatus: v })))}</div>
        <Field label="College / Company name" className="max-w-md">
          <input className={INPUT} value={f.collegeCompany} onChange={set('collegeCompany')} />
        </Field>
      </Card>

      <Card title="Course details">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="Course duration (months)">
            <input
              className={INPUT}
              value={f.courseDurationMonths}
              inputMode="numeric"
              onChange={(e) => setF({ ...f, courseDurationMonths: e.target.value, expectedCompletion: addMonths(f.admissionDate, Number(e.target.value)) || f.expectedCompletion })}
            />
          </Field>
          <Field label="Training batch timing">
            <input className={INPUT} value={f.batchTiming} onChange={set('batchTiming')} placeholder="e.g. Mon–Fri 10am–12pm" />
          </Field>
          <Field label="Practical batch timing">
            <input className={INPUT} value={f.practicalBatchTiming} onChange={set('practicalBatchTiming')} />
          </Field>
          <Field label="Admission date *">
            <input
              type="date"
              className={INPUT}
              value={f.admissionDate}
              onChange={(e) => setF({ ...f, admissionDate: e.target.value, expectedCompletion: addMonths(e.target.value, Number(f.courseDurationMonths)) || f.expectedCompletion })}
              required
            />
          </Field>
          <Field label="Expected course completion">
            <input type="date" className={INPUT} value={f.expectedCompletion} min={f.admissionDate} onChange={set('expectedCompletion')} />
          </Field>
          <Field label="Counsellor">
            <select className={INPUT} value={f.counsellorId} onChange={set('counsellorId')}>
              <option value="">—</option>
              {counsellors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Fee details">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="Total course fee (₹) *">
            <input className={INPUT} value={f.totalFee} onChange={set('totalFee')} inputMode="decimal" required />
          </Field>
          <Field label="Registration fee amount (₹)">
            <input className={INPUT} value={f.registrationFee} onChange={set('registrationFee')} inputMode="decimal" />
          </Field>
        </div>

        {mode === 'create' && regFee > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 p-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
              <input type="checkbox" checked={reg.record} onChange={(e) => setReg({ ...reg, record: e.target.checked })} />
              Registration fee received — record it as a payment and email the receipt
            </label>
            {reg.record && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                <Field label="Mode of payment *">
                  <select className={INPUT} value={reg.mode} onChange={(e) => setReg({ ...reg, mode: e.target.value })}>
                    {PAYMENT_MODES.filter((m) => m.value !== 'GATEWAY').map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Paid date *">
                  <input type="date" className={INPUT} value={reg.paidDate} max={today} onChange={(e) => setReg({ ...reg, paidDate: e.target.value })} />
                </Field>
                {reg.mode === 'LOAN' && (
                  <Field label="Loan bank name *">
                    <input className={INPUT} value={reg.loanBank} onChange={(e) => setReg({ ...reg, loanBank: e.target.value })} />
                  </Field>
                )}
                {reg.mode !== 'CASH' && (
                  <Field label={`Reference no.${['UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD'].includes(reg.mode) ? ' *' : ''}`}>
                    <input className={INPUT} value={reg.reference} onChange={(e) => setReg({ ...reg, reference: e.target.value })} />
                  </Field>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-sm font-bold text-slate-900">Payment schedule (due dates)</span>
            <span className="flex gap-2">
              <button type="button" className={BTN_SECONDARY} onClick={fillSchedule} disabled={total <= 0}>
                Fill from fees
              </button>
              <button type="button" className={BTN_SECONDARY} onClick={() => setF({ ...f, installments: [...f.installments, { label: `Instalment ${f.installments.length + 1}`, dueDate: '', amount: '' }] })}>
                <Icon icon="ion:add-outline" className="w-4 h-4" /> Add instalment
              </button>
            </span>
          </div>
          {f.installments.length === 0 ? (
            <p className="text-xs text-slate-500">No due dates yet. Add the registration fee and balance fee (or several instalments) so reminders go out on time.</p>
          ) : (
            <div className="space-y-2">
              {f.installments.map((r, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input className={`${INPUT} col-span-12 sm:col-span-5`} value={r.label} onChange={(e) => setInst(i, 'label', e.target.value)} aria-label="Instalment name" />
                  <input type="date" className={`${INPUT} col-span-6 sm:col-span-3`} value={r.dueDate} onChange={(e) => setInst(i, 'dueDate', e.target.value)} aria-label="Due date" required />
                  <input className={`${INPUT} col-span-4 sm:col-span-3`} value={r.amount} inputMode="decimal" onChange={(e) => setInst(i, 'amount', e.target.value)} aria-label="Amount" placeholder="₹" required />
                  <button type="button" className="col-span-2 sm:col-span-1 text-slate-400 hover:text-rose-600 justify-self-center" onClick={() => setF({ ...f, installments: f.installments.filter((_, j) => j !== i) })} aria-label="Remove instalment">
                    <Icon icon="ion:close-circle-outline" className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className={`text-xs mt-2 ${unscheduled < 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
            Scheduled {inr(scheduled)} of {inr(total)}
            {unscheduled > 0 ? ` · ${inr(unscheduled)} has no due date yet` : unscheduled < 0 ? ' · schedule is more than the total fee' : ' · fully scheduled'}
          </p>
          {hasPayments && <p className="text-xs text-slate-500 mt-1">Payments already recorded are applied to the schedule in due-date order.</p>}
        </div>

        <Field label="Note" className="mt-4">
          <textarea className={INPUT} rows={2} value={f.feeNote} onChange={set('feeNote')} placeholder="Balance fee mode, loan bank, discount approval, etc." />
        </Field>
      </Card>

      <Card title="Documents submitted">
        <p className="text-xs text-slate-500 mb-2">Self-attested photocopies received (2 passport size photographs and address proof — any one). Upload scans from the admission page after saving.</p>
        <div className="flex flex-wrap gap-2">
          {DOCUMENTS.map((d) => {
            const on = f.documentsSubmitted.includes(d)
            return (
              <label key={d} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer ${on ? 'border-zinc-900 bg-zinc-100 font-semibold' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                <input type="checkbox" checked={on} onChange={() => setF({ ...f, documentsSubmitted: on ? f.documentsSubmitted.filter((x) => x !== d) : [...f.documentsSubmitted, d] })} />
                {d}
              </label>
            )
          })}
        </div>
      </Card>

      <Card title="Emergency contact">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Name">
            <input className={INPUT} value={f.emergencyName} onChange={set('emergencyName')} />
          </Field>
          <Field label="Relationship">
            <input className={INPUT} value={f.emergencyRelation} onChange={set('emergencyRelation')} />
          </Field>
          <Field label="Mobile number">
            <input className={INPUT} value={f.emergencyMobile} onChange={set('emergencyMobile')} inputMode="tel" />
          </Field>
        </div>
      </Card>

      <Card title="Student declaration & verification">
        <p className="text-sm text-slate-700 italic">“{DECLARATION}”</p>
        <label className="inline-flex items-start gap-2 text-sm font-semibold text-slate-800 mt-3">
          <input type="checkbox" className="mt-1" checked={f.declarationAccepted} onChange={(e) => setF({ ...f, declarationAccepted: e.target.checked })} />
          The student has signed the declaration on the physical admission form.
        </label>
        {mode === 'create' && (
          <div className="mt-3">
            <span className={LABEL}>Admission status</span>
            <div className="flex flex-wrap gap-2">
              {[
                { v: 'VERIFICATION_PENDING', l: 'Verification pending' },
                { v: 'ACTIVE', l: 'Verified — Active' },
              ].map((o) => (
                <label key={o.v} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer ${f.status === o.v ? 'border-zinc-900 bg-zinc-100 font-semibold' : 'border-slate-200 bg-slate-50'}`}>
                  <input type="radio" className="sr-only" checked={f.status === o.v} onChange={() => setF({ ...f, status: o.v })} />
                  {o.l}
                </label>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-end gap-2">
        <Msg msg={msg} />
        <button type="button" className={BTN_SECONDARY} onClick={() => router.back()}>
          Cancel
        </button>
        <button type="submit" className={BTN_PRIMARY} disabled={busy}>
          {busy ? 'Saving…' : mode === 'create' ? 'Create admission' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
