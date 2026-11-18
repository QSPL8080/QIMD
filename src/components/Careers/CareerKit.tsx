'use client'

/**
 * CareerKit — shared, flat (no-gradient) UI for the Career sub-pages:
 * /careers, /hire-from-us, /qimd-franchise
 */
import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'

const CAREER_TABS = [
  { href: '/careers', label: 'Current Openings', icon: 'mdi:briefcase-outline' },
  { href: '/hire-from-us', label: 'Hire From QIMD', icon: 'mdi:account-tie-outline' },
  { href: '/qimd-franchise', label: 'QIMD Franchise', icon: 'mdi:handshake-outline' },
]

export function CareerTabs() {
  const path = usePathname()
  const rowRef = useRef<HTMLElement>(null)
  // On small screens, slide the active tab into view
  useEffect(() => {
    const row = rowRef.current
    const active = row?.querySelector<HTMLElement>('.qk-tab.is-active')
    if (row && active && row.scrollWidth > row.clientWidth) {
      row.scrollLeft = active.offsetLeft - 20
    }
  }, [path])
  return (
    <div className="qk-tabs">
      <div className="qk-wrap">
        <nav ref={rowRef} className="qk-tabs-row" aria-label="Career pages">
          <span className="qk-tabs-label">Career</span>
          {CAREER_TABS.map((t) => (
            <Link key={t.href} href={t.href} className={`qk-tab ${path === t.href ? 'is-active' : ''}`}>
              <Icon icon={t.icon} />
              <span>{t.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

export function CkEyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`qk-eyebrow ${light ? 'is-light' : ''}`}>{children}</span>
}

export function CkHero({
  eyebrow,
  title,
  subtitle,
  children,
  actions,
  aside,
}: {
  eyebrow: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <section className="qk-hero">
      <div className="qk-wrap">
        <div className="qk-hero-grid">
          <div className="qk-hero-main">
            <CkEyebrow>{eyebrow}</CkEyebrow>
            <h1 className="qk-h1">{title}</h1>
            {subtitle && <p className="qk-h1-sub">{subtitle}</p>}
            {children && <div className="qk-lead">{children}</div>}
            {actions && <div className="qk-actions">{actions}</div>}
          </div>
          {aside && <div className="qk-hero-aside">{aside}</div>}
        </div>
      </div>
    </section>
  )
}

export function CkPanel({
  label,
  title,
  badge,
  children,
}: {
  label: string
  title: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <div className="qk-panel">
      <div className="qk-panel-head">
        <div>
          <span className="qk-panel-label">{label}</span>
          <h3 className="qk-panel-title">{title}</h3>
        </div>
        {badge && <span className="qk-panel-badge">{badge}</span>}
      </div>
      <div className="qk-panel-body">{children}</div>
    </div>
  )
}

export function CkPanelRow({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="qk-panel-row">
      <span className="qk-panel-ic">
        <Icon icon={icon} />
      </span>
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </div>
  )
}

export function CkHead({
  index,
  eyebrow,
  title,
  desc,
  center = false,
  light = false,
}: {
  index?: string
  eyebrow: React.ReactNode
  title: React.ReactNode
  desc?: React.ReactNode
  center?: boolean
  light?: boolean
}) {
  return (
    <div className={`qk-head ${center ? 'qk-center' : ''} ${light ? 'is-light' : ''}`}>
      <div className="qk-head-top">
        {index && <span className="qk-num">{index}</span>}
        <CkEyebrow light={light}>{eyebrow}</CkEyebrow>
      </div>
      <h2 className="qk-h2">{title}</h2>
      {desc && <p className="qk-desc">{desc}</p>}
    </div>
  )
}

export function CkSteps({
  steps,
  light = false,
}: {
  steps: Array<{ step: string; title: string; desc: string; icon?: string }>
  light?: boolean
}) {
  return (
    <ol className={`qk-steps ${light ? 'is-light' : ''}`} style={{ ['--qk-n' as any]: steps.length }}>
      {steps.map((s, i) => (
        <li key={i} className="qk-step">
          <div className="qk-step-top">
            <span className="qk-step-num">{s.step}</span>
            {s.icon && <Icon icon={s.icon} className="qk-step-ic" />}
          </div>
          <h4>{s.title}</h4>
          <p>{s.desc}</p>
        </li>
      ))}
    </ol>
  )
}

export function CkChecks({ items, cols = 4 }: { items: string[]; cols?: 2 | 3 | 4 }) {
  return (
    <div className={`qk-checks cols-${cols}`}>
      {items.map((it, i) => (
        <div key={i} className="qk-check-item">
          <span className="qk-check-ic">
            <Icon icon="mdi:check-bold" />
          </span>
          <span>{it}</span>
        </div>
      ))}
    </div>
  )
}

export function CkSuccess({ title, text }: { title: string; text: string }) {
  return (
    <div className="qk-success" role="status">
      <span className="qk-success-ic">
        <Icon icon="mdi:check-bold" />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

export function CkConsent({
  id,
  checked,
  onChange,
  children,
}: {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <label htmlFor={id} className="qk-consent">
      <input type="checkbox" id={id} required checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="qk-consent-box" aria-hidden="true">
        <Icon icon="mdi:check-bold" />
      </span>
      <span>{children}</span>
    </label>
  )
}

export function CkUpload({
  id,
  file,
  onFile,
  placeholder,
}: {
  id: string
  file: File | null
  onFile: (f: File | null) => void
  placeholder: string
}) {
  return (
    <div className={`qk-upload ${file ? 'has-file' : ''}`}>
      <input type="file" accept=".pdf,.doc,.docx" id={id} className="hidden" onChange={(e) => onFile(e.target.files?.[0] || null)} />
      <label htmlFor={id}>
        <span className="qk-upload-ic">
          <Icon icon={file ? 'mdi:file-document-check-outline' : 'mdi:tray-arrow-up'} />
        </span>
        <span className="qk-upload-text">{file ? file.name : placeholder}</span>
        <span className="qk-upload-hint">Max file size 10MB</span>
      </label>
    </div>
  )
}

export function CkCta({
  eyebrow,
  icon,
  title,
  desc,
  actions,
  note,
}: {
  eyebrow: string
  icon: string
  title: React.ReactNode
  desc: React.ReactNode
  actions: React.ReactNode
  note?: React.ReactNode
}) {
  return (
    <section className="qk-cta">
      <div className="qk-wrap">
        <div className="qk-cta-grid">
          <div>
            <CkEyebrow light>
              <Icon icon={icon} /> {eyebrow}
            </CkEyebrow>
            <h2 className="qk-cta-title">{title}</h2>
            <p className="qk-cta-desc">{desc}</p>
          </div>
          <div className="qk-cta-side">
            <div className="qk-cta-actions">{actions}</div>
            {note && <p className="qk-cta-note">{note}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
