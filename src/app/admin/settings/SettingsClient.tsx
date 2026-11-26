'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Card, Field, INPUT, BTN_PRIMARY, BTN_SECONDARY, BTN_GHOST_DANGER, Badge } from '@/components/Admin/ui'
import { Msg } from '@/components/Admin/Modal'
import { saveSettingAction } from '@/app/actions/settingsActions'
import type { SettingsShape } from '@/lib/settings'

type M = { ok: boolean; text: string } | null

function useSave(key: Parameters<typeof saveSettingAction>[0]) {
  const router = useRouter()
  const [msg, setMsg] = useState<M>(null)
  const [busy, setBusy] = useState(false)
  const save = async (value: unknown) => {
    setBusy(true)
    const r = await saveSettingAction(key, value)
    setBusy(false)
    setMsg({ ok: r.success, text: r.success ? 'Saved.' : r.error || 'Could not save.' })
    if (r.success) router.refresh()
  }
  return { msg, busy, save }
}

export default function SettingsClient({ settings, superAdmin, env }: { settings: SettingsShape; superAdmin: boolean; env: { mail: boolean; cron: boolean; meta: boolean; siteUrl: string; payments: boolean; storage: boolean } }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Institute initial={settings.institute} locked={!superAdmin} />
      <div className="space-y-4">
        <LeadEmail initial={settings.leadNotifyEmail} locked={!superAdmin} />
        <Card title="Integrations">
          <ul className="space-y-2 text-sm">
            <Row ok={env.mail} label="Email (SMTP)" hint="Receipts, reminders, password resets and enquiry emails. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS." />
            <Row ok={Boolean(env.siteUrl)} label="Website address" hint={env.siteUrl || 'Set NEXT_PUBLIC_SITE_URL so receipt and reset links point to the live site.'} />
            <Row ok={env.cron} label="Scheduled reminders" hint="Reminders also run when staff open the dashboard. For exact timing, call /api/cron/reminders hourly with CRON_SECRET." />
            <Row ok={env.meta} label="Meta Lead Ads" hint="Set META_VERIFY_TOKEN, META_APP_SECRET and META_PAGE_ACCESS_TOKEN, then point the webhook to /api/webhooks/meta." />
            <Row ok={env.storage} label="Media storage (Supabase bucket)" hint="Website photos and videos. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY; without them, uploads are kept in the database." />
            <Row ok={env.payments} label="Online payments API" hint="Set PAYMENTS_API_KEY (16+ characters). Your gateway or payment page then calls POST /api/payments/record to add the payment and email the receipt." />
            <Row ok={false} label="SMS" hint="Needs an SMS provider and approved (DLT) templates." />
          </ul>
        </Card>
      </div>
      <Courses initial={settings.courses} />
      <Categories initial={settings.expenseCategories} />
    </div>
  )
}

function Row({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
  return (
    <li className="flex items-start gap-3">
      <Icon icon={ok ? 'ion:checkmark-circle' : 'ion:ellipse-outline'} className={`w-5 h-5 flex-shrink-0 ${ok ? 'text-emerald-600' : 'text-slate-400'}`} />
      <span>
        <span className="font-semibold text-slate-900">{label}</span> <Badge tone={ok ? 'green' : 'slate'}>{ok ? 'Connected' : 'Not set up'}</Badge>
        <span className="block text-xs text-slate-500 break-words">{hint}</span>
      </span>
    </li>
  )
}

function Institute({ initial, locked }: { initial: SettingsShape['institute']; locked: boolean }) {
  const [v, setV] = useState(initial)
  const { msg, busy, save } = useSave('institute')
  const f = (k: keyof typeof v, label: string, wide = false) => (
    <Field label={label} className={wide ? 'sm:col-span-2' : ''}>
      <input className={INPUT} value={v[k]} disabled={locked} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
    </Field>
  )
  return (
    <Card title="Institute details" actions={locked ? <Badge>Super Admin only</Badge> : null}>
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          save(v)
        }}
      >
        {f('name', 'Institute name *', true)}
        {f('shortName', 'Short name')}
        {f('phone', 'Phone')}
        {f('address', 'Address', true)}
        {f('email', 'Email')}
        {f('website', 'Website')}
        {f('receiptFooter', 'Receipt footer note', true)}
        {!locked && (
          <div className="sm:col-span-2 flex items-center justify-end gap-3">
            <Msg msg={msg} />
            <button className={BTN_PRIMARY} disabled={busy}>
              Save
            </button>
          </div>
        )}
      </form>
    </Card>
  )
}

function LeadEmail({ initial, locked }: { initial: string; locked: boolean }) {
  const [v, setV] = useState(initial)
  const { msg, busy, save } = useSave('leadNotifyEmail')
  return (
    <Card title="Website enquiry emails" actions={locked ? <Badge>Super Admin only</Badge> : null}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          save(v)
        }}
      >
        <Field label="Send every website form submission to" hint="Separate more than one address with commas.">
          <input className={INPUT} value={v} disabled={locked} onChange={(e) => setV(e.target.value)} />
        </Field>
        {!locked && (
          <div className="flex items-center justify-end gap-3">
            <Msg msg={msg} />
            <button className={BTN_PRIMARY} disabled={busy}>
              Save
            </button>
          </div>
        )}
      </form>
    </Card>
  )
}

function Courses({ initial }: { initial: SettingsShape['courses'] }) {
  const [rows, setRows] = useState(initial.map((c) => ({ name: c.name, durationMonths: c.durationMonths == null ? '' : String(c.durationMonths), fee: c.fee == null ? '' : String(c.fee) })))
  const { msg, busy, save } = useSave('courses')
  return (
    <Card title="Courses" actions={<span className="text-[11px] text-slate-500">Shown on the admission form</span>}>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          save(rows)
        }}
      >
        <div className="hidden sm:grid grid-cols-[1fr_110px_130px_36px] gap-2 text-[11px] font-semibold text-slate-500 uppercase">
          <span>Course</span>
          <span>Months</span>
          <span>Default fee (₹)</span>
          <span />
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_110px_130px_36px] gap-2">
            <input className={`${INPUT} col-span-2 sm:col-span-1`} value={r.name} placeholder="Course name" onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <input className={INPUT} value={r.durationMonths} inputMode="numeric" placeholder="Months" onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, durationMonths: e.target.value } : x)))} />
            <input className={INPUT} value={r.fee} inputMode="decimal" placeholder="Fee" onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, fee: e.target.value } : x)))} />
            <button type="button" className={`${BTN_GHOST_DANGER} px-2`} aria-label="Remove course" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
              <Icon icon="ion:close" className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button type="button" className={BTN_SECONDARY} onClick={() => setRows([...rows, { name: '', durationMonths: '', fee: '' }])}>
            Add course
          </button>
          <span className="flex items-center gap-3">
            <Msg msg={msg} />
            <button className={BTN_PRIMARY} disabled={busy}>
              Save courses
            </button>
          </span>
        </div>
        <p className="text-[11px] text-slate-500">Renaming a course does not change past admissions; they keep the course name they were saved with.</p>
      </form>
    </Card>
  )
}

function Categories({ initial }: { initial: string[] }) {
  const [rows, setRows] = useState(initial)
  const [add, setAdd] = useState('')
  const { msg, busy, save } = useSave('expenseCategories')
  return (
    <Card title="Expense categories">
      <div className="flex flex-wrap gap-2 mb-3">
        {rows.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {c}
            <button type="button" aria-label={`Remove ${c}`} className="text-slate-400 hover:text-rose-600" onClick={() => setRows(rows.filter((x) => x !== c))}>
              <Icon icon="ion:close" className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const v = add.trim()
          if (v && !rows.some((x) => x.toLowerCase() === v.toLowerCase())) setRows([...rows, v])
          setAdd('')
        }}
      >
        <input className={`${INPUT} flex-1 min-w-[160px]`} value={add} placeholder="New category" onChange={(e) => setAdd(e.target.value)} />
        <button className={BTN_SECONDARY}>Add</button>
      </form>
      <div className="flex items-center justify-end gap-3 mt-3">
        <Msg msg={msg} />
        <button type="button" className={BTN_PRIMARY} disabled={busy} onClick={() => save(rows)}>
          Save categories
        </button>
      </div>
    </Card>
  )
}
