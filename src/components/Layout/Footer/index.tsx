'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import { siteConfig } from '@/data'
import { siteSettings } from '@/data/siteSettings'
import { getSocialItems } from '../socials'

type FooterLinkItem = { id: string; title: string; url: string; openInNewTab?: boolean; linkType?: string }
type FooterColumn = { id: string; title: string; description?: string | null; icon?: string | null; links: FooterLinkItem[] }

// Used only when no columns are configured in Admin → Footer
const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    id: 'quick',
    title: 'Quick Links',
    links: [
      { id: 'q1', title: 'Home', url: '/' },
      { id: 'q2', title: 'About QIMD', url: '/about/about-qimd' },
      { id: 'q3', title: 'Programs', url: '/courses' },
      { id: 'q4', title: 'Blogs', url: '/blog' },
      { id: 'q5', title: 'Career', url: '/careers' },
      { id: 'q6', title: 'Contact Us', url: '/contact' },
    ],
  },
  {
    id: 'programs',
    title: 'Our Programs',
    links: [
      { id: 'p1', title: 'AI Powered Digital Marketing Program', url: '/courses/ai-digital-marketing' },
      { id: 'p2', title: 'AI Powered Graphic Design Program', url: '/courses/ai-graphic-design' },
      { id: 'p3', title: 'AI Powered Video Editing Program', url: '/courses/ai-video-editing' },
    ],
  },
  {
    id: 'info',
    title: 'Information',
    links: [
      { id: 'i1', title: 'Privacy Policy', url: '/privacy-policy' },
      { id: 'i2', title: 'Terms & Conditions', url: '/terms-and-conditions' },
      { id: 'i3', title: 'Refund & Cancellation', url: '/refund-policy' },
    ],
  },
]

// Legal pages shown in the footer bottom bar
const LEGAL_LINKS = [
  { href: '/privacy-policy', label: 'Privacy Policy', icon: 'solar:shield-user-linear' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions', icon: 'solar:document-text-linear' },
  { href: '/refund-policy', label: 'Refund Policy', icon: 'solar:wallet-money-linear' },
  { href: '/privacy-policy#cookies', label: 'Cookie Policy', icon: 'solar:cookie-linear' },
  { href: '/sitemap', label: 'Sitemap', icon: 'solar:map-arrow-square-linear' },
]

// Extra contact emails always shown in the footer (skipped if already added in Admin → Footer)
const EXTRA_FOOTER_EMAILS = [{ id: 'careers-email', label: 'Careers', value: 'career@quickuppinstitute.com' }]

const FALLBACK_FOOTER_LOGO = '/images/logo/footer-qimd.png'

// Footer logo with automatic fallback if the configured image is missing
const FooterLogo: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_FOOTER_LOGO)
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => setImgSrc(src || FALLBACK_FOOTER_LOGO), [src])
  // Also catch images that already failed before hydration
  useEffect(() => {
    const img = ref.current
    if (img && img.complete && img.naturalWidth === 0 && imgSrc !== FALLBACK_FOOTER_LOGO) {
      setImgSrc(FALLBACK_FOOTER_LOGO)
    }
  }, [imgSrc])
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== FALLBACK_FOOTER_LOGO) setImgSrc(FALLBACK_FOOTER_LOGO)
      }}
    />
  )
}

const Footer: React.FC = () => {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()
  const { footer, socialLinks, phone } = siteSettings

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/receipt/')) return null

  const whatsappNum = (footer?.whatsapp?.number || socialLinks?.whatsapp || siteConfig.whatsapp || '').replace(/[^\d+]/g, '')
  const whatsappUrl = whatsappNum.startsWith('+')
    ? `https://wa.me/${whatsappNum.replace('+', '')}`
    : `https://wa.me/${whatsappNum}`

  const showWhatsappIcon =
    footer?.whatsapp?.active !== false &&
    socialLinks?.activeStatus?.whatsapp !== false &&
    socialLinks?.footerStatus?.whatsapp !== false

  const socials =
    footer?.showSocialIcons !== false ? getSocialItems(socialLinks, 'footer', showWhatsappIcon ? whatsappUrl : null) : []

  // Contact data (same sources & rules as before)
  // Institute address — always shown (label & map link still come from the Footer CMS when set)
  const showAddress = true
  const addressText = siteConfig.address
  const addressMapUrl =
    footer?.address?.googleMapsUrl && footer.address.googleMapsUrl !== 'https://maps.google.com'
      ? footer.address.googleMapsUrl
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address)}`
  const phoneList: Array<{ id: string; label?: string; value: string }> =
    footer?.phones !== undefined
      ? footer.phones.filter((p: any) => p.isActive !== false)
      : phone
      ? [{ id: 'fallback-phone', value: phone }]
      : []
  const baseEmails: Array<{ id: string; label?: string; value: string }> =
    footer?.emails !== undefined
      ? footer.emails.filter((e: any) => e.isActive !== false)
      : siteConfig.email
      ? [{ id: 'fallback-email', value: siteConfig.email }]
      : []
  const emailList = [
    ...baseEmails,
    ...EXTRA_FOOTER_EMAILS.filter(
      (x) => !baseEmails.some((e) => e.value?.trim().toLowerCase() === x.value.toLowerCase())
    ),
  ]

  const columns: FooterColumn[] =
    footer?.columns && footer.columns.length > 0 ? (footer.columns as FooterColumn[]) : DEFAULT_COLUMNS

  return (
    <footer className="qf">
      {/* Decorative layers */}
      <div className="qf-bg" aria-hidden="true">
        <div className="qf-grid" />
        <div className="qf-orb qf-orb-1" />
        <div className="qf-orb qf-orb-2" />
      </div>
      <div className="qf-topline" aria-hidden="true" />

      <div className="relative z-10 container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
        {/* ── Contact cards ─────────────────────────────── */}
        {(showAddress || phoneList.length > 0 || emailList.length > 0) && (
          <div className="qf-contact-row">
            {showAddress && (
              <div className="qf-card">
                <span className="qf-card-ic">
                  <Icon icon="solar:map-point-bold" />
                </span>
                <div className="min-w-0">
                  {footer?.address?.label && <p className="qf-card-label">{footer.address.label}</p>}
                  <a href={addressMapUrl} target="_blank" rel="noopener noreferrer" className="qf-card-value">
                    {addressText}
                  </a>
                </div>
              </div>
            )}

            {phoneList.length > 0 && (
              <div className="qf-card">
                <span className="qf-card-ic">
                  <Icon icon="solar:phone-calling-bold" />
                </span>
                <div className="min-w-0">
                  {phoneList[0]?.label && <p className="qf-card-label">{phoneList[0].label}</p>}
                  {phoneList.map((p) => (
                    <Link key={p.id} href={`tel:${p.value.replace(/\s+/g, '')}`} className="qf-card-value block">
                      {p.value}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {emailList.length > 0 && (
              <div className="qf-card">
                <span className="qf-card-ic">
                  <Icon icon="solar:letter-bold" />
                </span>
                <div className="min-w-0">
                  {emailList[0]?.label && <p className="qf-card-label">{emailList[0].label}</p>}
                  {emailList.map((e, i) => (
                    <div key={e.id} className={i > 0 ? 'qf-mail-row' : undefined}>
                      {i > 0 && e.label && <p className="qf-card-label">{e.label}</p>}
                      <Link href={`mailto:${e.value}`} className="qf-card-value block break-all">
                        {e.value}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Brand + link columns ──────────────────────── */}
        <div className="qf-main">
          <div className="qf-brand">
            {footer?.logoActive !== false && (
              <Link href={footer?.logoLink || '/'} className="qf-brand-logo" aria-label="QIMD Home">
                <FooterLogo src={footer?.logo} alt={footer?.logoAltText || 'Quickupp / QIMD'} />
              </Link>
            )}
            <p className="qf-tagline">{siteConfig.tagline}</p>

            {socials.length > 0 && (
              <div className="qf-socials">
                {socials.map((s) => (
                  <Link
                    key={s.key}
                    href={s.href}
                    target={s.external ? '_blank' : '_self'}
                    rel={s.external ? 'noopener noreferrer' : undefined}
                    aria-label={`QIMD ${s.label}`}
                    data-net={s.net}
                    className="qf-social"
                  >
                    <Icon icon={s.icon} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="qf-cols" style={{ ['--qf-cols' as any]: Math.min(columns.length, 4) }}>
            {columns.map((col) => {
              const plainLinks = (col.links || []).filter((l) => l.linkType !== 'BUTTON')
              const buttonLinks = (col.links || []).filter((l) => l.linkType === 'BUTTON')
              return (
                <div key={col.id} className="qf-col">
                  <h4 className="qf-col-title">
                    {col.icon && <Icon icon={col.icon} className="qf-col-ic" />}
                    <span>{col.title}</span>
                  </h4>
                  {col.description && <p className="qf-col-desc">{col.description}</p>}

                  <ul className="qf-links">
                    {plainLinks.map((link) => (
                      <li key={link.id}>
                        <Link
                          href={link.url}
                          target={link.openInNewTab ? '_blank' : '_self'}
                          rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                          className="qf-link"
                        >
                          <Icon icon="solar:arrow-right-linear" className="qf-link-arrow" />
                          <span>{link.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {buttonLinks.length > 0 && (
                    <div className="mt-5 space-y-2">
                      {buttonLinks.map((link) => {
                        const isWhatsApp = link.url?.includes('wa.me') || link.url?.includes('whatsapp')
                        return (
                          <Link
                            key={link.id}
                            href={link.url}
                            target={link.openInNewTab ? '_blank' : '_self'}
                            rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                            className={`qf-cta ${isWhatsApp ? 'is-wa' : ''}`}
                          >
                            <Icon icon={isWhatsApp ? 'mdi:whatsapp' : 'mdi:link-variant'} className="text-lg shrink-0" />
                            <span>{link.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Giant brand watermark */}
      <div className="qf-watermark" aria-hidden="true">
        QIMD
      </div>

      {/* ── Bottom bar: copyright + legal ─────────────── */}
      <div className="qf-bottom">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="qf-bottom-row">
            <p className="qf-copy" suppressHydrationWarning>
              {footer?.copyrightText || `© ${currentYear} ${siteConfig.name}. All Rights Reserved.`}
            </p>
            <nav className="qf-legal" aria-label="Legal">
              {LEGAL_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={`qf-legal-link ${pathname === l.href ? 'is-active' : ''}`}>
                  <Icon icon={l.icon} className="qf-legal-ic" />
                  <span>{l.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
