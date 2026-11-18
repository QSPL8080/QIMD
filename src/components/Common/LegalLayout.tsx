'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'

interface LegalLayoutProps {
  /** Breadcrumb / page name, e.g. "Privacy Policy" */
  pageName: string
  /** Plain part of the heading */
  title: string
  /** Highlighted (gradient) part of the heading */
  highlight: string
  icon: string
  effectiveDate: string
  lastUpdated: string
  children: React.ReactNode
}

type TocItem = { id: string; label: string }

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&amp;|&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export default function LegalLayout({
  pageName,
  title,
  highlight,
  icon,
  effectiveDate,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Build "On this page" from the existing section headings
  useEffect(() => {
    const root = contentRef.current
    if (!root) return
    const headings = Array.from(root.querySelectorAll<HTMLHeadingElement>('h2'))
    const items = headings.map((h) => {
      if (!h.id) h.id = `section-${slugify(h.textContent || '')}`
      return { id: h.id, label: h.textContent || '' }
    })
    setToc(items)

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id)
      },
      { rootMargin: '-110px 0px -65% 0px', threshold: 0 }
    )
    headings.forEach((h) => io.observe(h))
    return () => io.disconnect()
  }, [])

  const tocLinks = (
    <ol className="ql-toc-list">
      {toc.map((t) => (
        <li key={t.id}>
          <a href={`#${t.id}`} className={activeId === t.id ? 'is-active' : ''}>
            {t.label}
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <div className="ql-page">
      {/* Hero — same style family as the Careers page */}
      <section className="ql-hero">
        <div className="container mx-auto max-w-5xl px-4 text-center relative z-10">
          <nav className="ql-crumb" aria-label="Breadcrumb">
            <Icon icon={icon} className="text-sm" />
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="ql-crumb-current">{pageName}</span>
          </nav>

          <h1 className="ql-title">
            {title} <span className="ql-title-accent">{highlight}</span>
          </h1>

          <div className="ql-meta">
            <span className="ql-meta-chip">
              <Icon icon="mdi:calendar-check-outline" />
              <span>
                <strong>Effective Date:</strong> {effectiveDate}
              </span>
            </span>
            <span className="ql-meta-chip">
              <Icon icon="mdi:update" />
              <span>
                <strong>Last Updated:</strong> {lastUpdated}
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="ql-body">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="ql-grid">
            {toc.length > 0 && (
              <aside className="ql-toc" aria-label="On this page">
                <div className="ql-toc-card">
                  <p className="ql-toc-title">
                    <Icon icon="mdi:format-list-numbered" /> On this page
                  </p>
                  {tocLinks}
                </div>
              </aside>
            )}

            <div className="min-w-0">
              {toc.length > 0 && (
                <details className="ql-toc-mobile">
                  <summary>
                    <Icon icon="mdi:format-list-numbered" /> On this page
                    <Icon icon="mdi:chevron-down" className="ql-toc-caret" />
                  </summary>
                  {tocLinks}
                </details>
              )}

              <article className="ql-card">
                <div ref={contentRef} className="ql-content">
                  {children}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
