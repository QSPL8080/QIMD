import React from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

/** Shared admin building blocks (work in server and client components). */

export const BTN = 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
export const BTN_PRIMARY = `${BTN} bg-zinc-900 text-white hover:bg-black`
export const BTN_SECONDARY = `${BTN} bg-slate-100 text-slate-800 hover:bg-slate-200`
export const BTN_DANGER = `${BTN} bg-rose-600 text-white hover:bg-rose-700`
export const BTN_GHOST_DANGER = `${BTN} bg-rose-50 text-rose-700 hover:bg-rose-100`
export const INPUT = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-zinc-900 focus:bg-white disabled:opacity-60'
export const LABEL = 'block text-xs font-semibold text-slate-600 mb-1'

export function PageHeader({ title, subtitle, actions, back }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1.5">
            <Icon icon="ion:arrow-back-outline" className="w-3.5 h-3.5" />
            {back.label}
          </Link>
        )}
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, actions, children, className = '', pad = true }: { title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`bg-white border border-slate-200 rounded-2xl shadow-xs min-w-0 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-100">
          {title && <h2 className="text-sm font-bold text-slate-900">{title}</h2>}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </section>
  )
}

export function Stat({ label, value, hint, href, icon, tone = 'slate' }: { label: string; value: React.ReactNode; hint?: string; href?: string; icon?: string; tone?: Tone }) {
  const body = (
    <div className={`bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs min-w-0 h-full ${href ? 'hover:border-slate-400 transition-colors' : ''}`}>
      {icon && (
        <span className={`w-10 h-10 rounded-xl grid place-items-center flex-shrink-0 ${TONE_BG[tone]}`}>
          <Icon icon={icon} className="w-5 h-5" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-xl font-bold text-slate-900 leading-none truncate">{value}</span>
        <span className="block text-xs font-semibold text-slate-500 mt-1 truncate">{label}</span>
        {hint && <span className="block text-[11px] text-slate-400 truncate">{hint}</span>}
      </span>
    </div>
  )
  return href ? (
    <Link href={href} className="block min-w-0">
      {body}
    </Link>
  ) : (
    body
  )
}

export type Tone = 'slate' | 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'orange' | 'cyan' | 'pink' | 'black'
// Black-and-white admin: colour is kept for status meaning only
const TONE_BG: Record<Tone, string> = {
  slate: 'bg-zinc-100 text-zinc-700',
  green: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-900',
  red: 'bg-rose-100 text-rose-800',
  blue: 'bg-zinc-100 text-zinc-900',
  purple: 'bg-violet-100 text-violet-800',
  orange: 'bg-orange-100 text-orange-800',
  cyan: 'bg-cyan-100 text-cyan-900',
  pink: 'bg-pink-100 text-pink-800',
  black: 'bg-zinc-900 text-white',
}

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap ${TONE_BG[tone]}`}>{children}</span>
}

/** Each lead status has its own colour */
export const LEAD_STATUS_TONE: Record<string, Tone> = {
  NEW: 'purple',
  CONTACTED: 'cyan',
  INTERESTED: 'pink',
  FOLLOW_UP: 'amber',
  COUNSELLING_SCHEDULED: 'orange',
  NOT_INTERESTED: 'slate',
  ADMISSION_CLOSED: 'green',
  INVALID: 'red',
}

export const FEE_STATUS_TONE: Record<string, Tone> = { FULLY_PAID: 'green', PARTIALLY_PAID: 'amber', PENDING: 'slate', OVERDUE: 'red' }
export const ADMISSION_STATUS_TONE: Record<string, Tone> = { VERIFICATION_PENDING: 'amber', ACTIVE: 'green', COMPLETED: 'black', CANCELLED: 'red' }

/** Table wrapper with horizontal scroll on small screens. */
export function Table({ head, children, empty, colSpan }: { head: React.ReactNode; children: React.ReactNode; empty?: boolean; colSpan?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">{head}</thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {empty ? (
            <tr>
              <td colSpan={colSpan || 20} className="p-8 text-center text-slate-500 text-sm">
                Nothing found.
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  )
}

/** Server-side pagination links that keep the current filters. */
export function Pagination({ page, pageSize, total, params, basePath }: { page: number; pageSize: number; total: number; params: Record<string, string | undefined>; basePath: string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return <p className="px-4 py-3 text-xs text-slate-500">{total} record{total === 1 ? '' : 's'}</p>
  const href = (p: number) => {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v && k !== 'page' && q.set(k, v))
    q.set('page', String(p))
    return `${basePath}?${q.toString()}`
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-slate-100 text-xs">
      <span className="text-slate-500">
        {total} records · page {page} of {pages}
      </span>
      <div className="flex gap-1.5">
        {page > 1 ? (
          <Link className={BTN_SECONDARY} href={href(page - 1)}>
            Previous
          </Link>
        ) : (
          <span className={`${BTN_SECONDARY} opacity-50`}>Previous</span>
        )}
        {page < pages ? (
          <Link className={BTN_SECONDARY} href={href(page + 1)}>
            Next
          </Link>
        ) : (
          <span className={`${BTN_SECONDARY} opacity-50`}>Next</span>
        )}
      </div>
    </div>
  )
}

export function Notice({ tone = 'amber', children }: { tone?: Tone; children: React.ReactNode }) {
  return <div className={`rounded-xl px-4 py-3 text-sm ${TONE_BG[tone]} border border-current/10`}>{children}</div>
}

export function Field({ label, children, hint, className = '' }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className={LABEL}>{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
    </label>
  )
}

export function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-900 font-medium break-words">{value === null || value === undefined || value === '' ? '—' : value}</dd>
    </div>
  )
}
