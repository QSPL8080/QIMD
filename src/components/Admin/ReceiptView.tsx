import React from 'react'
import type { ReceiptData } from '@/lib/receipts'
import { fmtDateTime, fmtMoney } from '@/lib/dates'

/** Printable fee receipt (SRS §11). Same layout for staff and the student's secure link. */
export default function ReceiptView({ r }: { r: ReceiptData }) {
  const rows: [string, React.ReactNode][] = [
    ['Receipt No.', r.receiptNo],
    ['Payment ID', r.paymentCode],
    ['Payment date & time', fmtDateTime(r.paidAt)],
    ['Student name', r.studentName],
    ['Admission ID', r.admissionCode],
    ['Course', r.courseName],
    ['Payment mode', r.loanBank ? `${r.mode} (${r.loanBank})` : r.mode],
    ...(r.reference ? ([['Transaction / reference no.', r.reference]] as [string, React.ReactNode][]) : []),
    ['Received by', r.recordedByName || '—'],
  ]
  const summary: [string, string][] = [
    ['Total course fee', fmtMoney(r.totalFee)],
    ['Total paid (incl. this payment)', fmtMoney(r.collected)],
    ...(r.adjustments ? ([['Fee adjustments', fmtMoney(r.adjustments)]] as [string, string][]) : []),
    ['Balance due', fmtMoney(r.balance)],
  ]
  return (
    <article className="qrcpt bg-white text-[#15123A] rounded-xl border border-slate-200 max-w-[760px] mx-auto overflow-hidden">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-6 sm:px-8 py-6 border-b-4 border-[#5B3FD9]">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/qimd-logo.png" alt="" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-lg font-bold leading-tight">{r.institute.name}</h1>
            <p className="text-xs text-slate-600 mt-0.5">{r.institute.address}</p>
            <p className="text-xs text-slate-600">{[r.institute.phone, r.institute.email, r.institute.website].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Fee receipt</p>
          <p className="text-base font-bold">{r.receiptNo}</p>
        </div>
      </header>

      {r.reversed && (
        <p className="mx-6 sm:mx-8 mt-5 rounded-lg bg-rose-50 text-rose-800 text-sm font-semibold px-4 py-2.5">
          This payment was later reversed or refunded. Contact the institute for the current fee position.
        </p>
      )}

      <div className="px-6 sm:px-8 py-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        <dl className="md:col-span-3 grid grid-cols-1 gap-2.5 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[150px_1fr] gap-2">
              <dt className="text-slate-500">{k}</dt>
              <dd className="font-semibold break-words">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="md:col-span-2 rounded-lg bg-[#EEEAFB] p-4 self-start">
          <p className="text-[11px] uppercase tracking-wider text-[#4A31BD] font-semibold">Amount received</p>
          <p className="text-2xl font-extrabold mt-1">{fmtMoney(r.amount)}</p>
          <dl className="mt-4 space-y-1.5 text-xs">
            {summary.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-slate-600">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <footer className="px-6 sm:px-8 py-4 bg-[#F4F6FA] text-[11px] text-slate-600 flex flex-col sm:flex-row sm:justify-between gap-1">
        <span>{r.institute.receiptFooter}</span>
        <span>{r.institute.shortName || r.institute.name}</span>
      </footer>
    </article>
  )
}
