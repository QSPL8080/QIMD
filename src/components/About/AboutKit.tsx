'use client'

/**
 * AboutKit — shared bento-style UI for the About sub-pages:
 * /about/about-qimd · /about/our-team · /trainers
 */
import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'

const ABOUT_TABS = [
  { href: '/about/about-qimd', label: 'About QIMD', icon: 'mdi:information-outline' },
  { href: '/about/our-team', label: 'Our Team', icon: 'mdi:account-group-outline' },
  { href: '/trainers', label: 'Our Trainers', icon: 'mdi:account-star-outline' },
]

export function AboutTabs() {
  const path = usePathname()
  const rowRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const row = rowRef.current
    const active = row?.querySelector<HTMLElement>('.qa-tab.is-active')
    if (row && active && row.scrollWidth > row.clientWidth) row.scrollLeft = active.offsetLeft - 16
  }, [path])
  return (
    <div className="qa-tabs-bar">
      <div className="qa-wrap">
        <div ref={rowRef} className="qa-tabs" role="navigation" aria-label="About pages">
          {ABOUT_TABS.map((t) => (
            <Link key={t.href} href={t.href} className={`qa-tab ${path === t.href ? 'is-active' : ''}`}>
              <Icon icon={t.icon} />
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function QaKicker({ children, icon, light = false }: { children: React.ReactNode; icon?: string; light?: boolean }) {
  return (
    <span className={`qa-kicker ${light ? 'is-light' : ''}`}>
      <span className="qa-kicker-dot" aria-hidden="true" />
      {icon && <Icon icon={icon} />}
      <span>{children}</span>
    </span>
  )
}

export function QaHead({
  kicker,
  icon,
  title,
  desc,
  light = false,
  center = false,
}: {
  kicker: React.ReactNode
  icon?: string
  title: React.ReactNode
  desc?: React.ReactNode
  light?: boolean
  center?: boolean
}) {
  return (
    <div className={`qa-head ${light ? 'is-light' : ''} ${center ? 'is-center' : ''}`}>
      <QaKicker icon={icon} light={light}>
        {kicker}
      </QaKicker>
      <h2 className="qa-h2">{title}</h2>
      {desc && <div className="qa-desc">{desc}</div>}
    </div>
  )
}

export function QaCheck({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`qa-check ${light ? 'is-light' : ''}`}>
      <span className="qa-check-ic">
        <Icon icon="mdi:check-bold" />
      </span>
      <span>{children}</span>
    </div>
  )
}
