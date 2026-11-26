'use client'

import React, { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Icon } from '@iconify/react'
import { BTN_PRIMARY, BTN_SECONDARY, INPUT, LABEL } from './ui'

export type FilterField =
  | { type: 'search'; name: string; placeholder: string }
  | { type: 'select'; name: string; label: string; options: { value: string; label: string }[]; all?: string }
  | { type: 'date'; name: string; label: string }

/** Filters that live in the URL, so the server filters, paginates and exports the same records. */
export default function FilterBar({ fields, exportHref }: { fields: FilterField[]; exportHref?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.name, sp.get(f.name) || ''])))

  const apply = (next: Record<string, string>) => {
    const q = new URLSearchParams(sp.toString())
    Object.entries(next).forEach(([k, v]) => (v ? q.set(k, v) : q.delete(k)))
    q.delete('page')
    router.push(`${pathname}${q.toString() ? `?${q}` : ''}`)
  }
  const active = fields.some((f) => sp.get(f.name))
  const dates = fields.filter((f) => f.type === 'date').map((f) => f.name)
  const badRange = dates.length === 2 && values[dates[0]] && values[dates[1]] && values[dates[0]] > values[dates[1]]

  const exportUrl = exportHref ? `${exportHref}${exportHref.includes('?') ? '&' : '?'}${sp.toString()}` : null

  return (
    <form
      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!badRange) apply(values)
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 items-end">
        {fields.map((f) => {
          if (f.type === 'search')
            return (
              <label key={f.name} className="sm:col-span-2">
                <span className={LABEL}>Search</span>
                <span className="relative block">
                  <input value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} placeholder={f.placeholder} className={`${INPUT} pl-9`} />
                  <Icon icon="ion:search-outline" className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                </span>
              </label>
            )
          if (f.type === 'select')
            return (
              <label key={f.name}>
                <span className={LABEL}>{f.label}</span>
                <select value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} className={INPUT}>
                  <option value="">{f.all || 'All'}</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            )
          return (
            <label key={f.name}>
              <span className={LABEL}>{f.label}</span>
              <input type="date" value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} className={INPUT} />
            </label>
          )
        })}
      </div>
      {badRange && <p className="text-xs font-semibold text-rose-600 mt-2">From date must be on or before To date.</p>}
      <div className="flex flex-wrap gap-2 mt-3">
        <button type="submit" className={BTN_PRIMARY} disabled={Boolean(badRange)}>
          <Icon icon="ion:filter-outline" className="w-4 h-4" />
          Apply
        </button>
        {active && (
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => {
              const cleared = Object.fromEntries(fields.map((f) => [f.name, '']))
              setValues(cleared)
              apply(cleared)
            }}
          >
            Clear
          </button>
        )}
        {exportUrl && (
          <a href={exportUrl} className={`${BTN_SECONDARY} ml-auto`}>
            <Icon icon="ion:download-outline" className="w-4 h-4" />
            Export CSV
          </a>
        )}
      </div>
    </form>
  )
}
