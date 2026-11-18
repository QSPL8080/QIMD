'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { headerData, siteConfig } from '@/data'
import Logo from './Logo'
import HeaderLink from './Navigation/HeaderLink'
import MobileHeaderLink from './Navigation/MobileHeaderLink'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useWebsiteSettings } from '@/app/context/WebsiteSettingsContext'
import { getSocialItems } from '../socials'

const Header: React.FC = () => {
  const pathUrl = usePathname()
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [sticky, setSticky] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const { header, socialLinks, phone } = useWebsiteSettings()

  // Shrink + elevate the bar once the page scrolls
  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY >= 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && navbarOpen) {
        setNavbarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [navbarOpen])

  // Lock page scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = navbarOpen ? 'hidden' : ''
  }, [navbarOpen])

  // Close drawer after navigating
  useEffect(() => {
    setNavbarOpen(false)
  }, [pathUrl])

  if (pathUrl?.startsWith('/admin') || pathUrl?.startsWith('/brochure')) return null

  const activeNavItems = headerData

  // Clean WhatsApp number to create generated wa.me URL
  const whatsappNum = (header?.whatsapp?.number || siteConfig.whatsapp || '').replace(/[^\d+]/g, '')
  const whatsappGeneratedUrl = whatsappNum.startsWith('+')
    ? `https://wa.me/${whatsappNum.replace('+', '')}`
    : `https://wa.me/${whatsappNum}`

  const socials = header?.showSocialLinks !== false ? getSocialItems(socialLinks, 'header') : []

  const phoneItems =
    header?.phones && header.phones.length > 0
      ? header.phones.map((p) => ({ id: p.id, value: p.value }))
      : phone
      ? [{ id: 'fallback-phone', value: phone }]
      : []

  const emailItems =
    header?.emails && header.emails.length > 0
      ? header.emails.map((e) => ({ id: e.id, value: e.value }))
      : siteConfig.email
      ? [{ id: 'fallback-email', value: siteConfig.email }]
      : []

  return (
    <>
      {/* ── ROW 1 · UTILITY BAR ─────────────────────────────── */}
      <div className="qh-topbar">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-3 sm:px-4">
          <div className="flex items-center justify-between gap-3 min-h-[40px]">
            {/* Contact details */}
            <div className="flex items-center gap-4 sm:gap-6 min-w-0 overflow-hidden">
              {phoneItems.map((p) => (
                <Link key={p.id} href={`tel:${p.value.replace(/[^\d+]/g, '')}`} className="qh-contact">
                  <span className="qh-contact-ic">
                    <Icon icon="solar:phone-calling-bold" />
                  </span>
                  <span>{p.value}</span>
                </Link>
              ))}
              {emailItems.map((e) => (
                <Link key={e.id} href={`mailto:${e.value}`} className="qh-contact qh-contact-email">
                  <span className="qh-contact-ic">
                    <Icon icon="solar:letter-bold" />
                  </span>
                  <span>{e.value}</span>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {header?.hireFromUs?.active !== false && (
                <Link
                  href={header?.hireFromUs?.url || '/hire-from-us'}
                  target={header?.hireFromUs?.openInNewTab ? '_blank' : '_self'}
                  rel={header?.hireFromUs?.openInNewTab ? 'noopener noreferrer' : undefined}
                  className="qh-hire"
                >
                  <Icon icon="solar:case-round-bold" className="text-[13px]" />
                  <span>{header?.hireFromUs?.text || 'Hire From Us'}</span>
                </Link>
              )}

              {header?.extraTopBarButtons?.map(
                (btn: any, i: number) =>
                  btn.active !== false && (
                    <Link key={btn.id || i} href={btn.url || '/contact'} className="qh-ghost">
                      {btn.text}
                    </Link>
                  )
              )}

              {socials.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 pl-3 ml-1 border-l border-white/15">
                  {socials.map((s) => (
                    <Link
                      key={s.key}
                      href={s.href}
                      target={s.external ? '_blank' : '_self'}
                      rel={s.external ? 'noopener noreferrer' : undefined}
                      aria-label={s.label}
                      data-net={s.net}
                      className="qh-social"
                    >
                      <Icon icon={s.icon} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2 · MAIN NAVIGATION ─────────────────────────── */}
      <header className={`qh-main ${sticky ? 'is-stuck' : ''}`}>
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="qh-row">
            {/* Logo */}
            <div className="qh-logo flex-shrink-0">
              <Logo
                width={220}
                height={64}
                customSrc={header?.logoActive !== false ? header?.logo : '/images/logo/qimd-logo.png'}
              />
            </div>

            {/* Desktop navigation */}
            <nav className="qh-nav hidden lg:flex" aria-label="Main navigation">
              {activeNavItems.map((item: any, index: number) => (
                <HeaderLink key={index} item={item} />
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-2.5">
              {header?.whatsapp?.active !== false && (
                <Link
                  href={whatsappGeneratedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="qh-btn qh-btn-wa"
                  aria-label={header?.whatsapp?.text || 'WhatsApp'}
                >
                  <Icon icon="mdi:whatsapp" className="text-lg" />
                  <span className="hidden xl:inline">{header?.whatsapp?.text || 'WhatsApp'}</span>
                </Link>
              )}

              {header?.enquireNow?.active !== false && (
                <Link href={`tel:${phone}`} className="qh-btn qh-btn-primary">
                  <span>{header?.enquireNow?.text || 'Enquire Now'}</span>
                  <span className="qh-btn-arrow">
                    <Icon icon="solar:arrow-right-up-linear" />
                  </span>
                </Link>
              )}

              {header?.extraHeaderCtaButtons?.map(
                (btn: any, i: number) =>
                  btn.active !== false && (
                    <Link key={btn.id || i} href={btn.url || '/contact'} className="qh-btn qh-btn-soft">
                      {btn.text}
                    </Link>
                  )
              )}
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
              className={`qh-burger lg:hidden ${navbarOpen ? 'is-open' : ''}`}
              aria-label="Toggle mobile menu"
              aria-expanded={navbarOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <div className="qh-glow-line" aria-hidden="true" />

      </header>

      {/* Mobile overlay */}
      <div
        className={`qm-overlay lg:hidden ${navbarOpen ? 'is-open' : ''}`}
        onClick={() => setNavbarOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div ref={mobileMenuRef} className={`qm-drawer lg:hidden ${navbarOpen ? 'is-open' : ''}`} aria-hidden={!navbarOpen}>
        <div className="qm-drawer-head">
          <Logo variant="default" width={130} height={45} customSrc={header?.logoActive !== false ? header?.logo : undefined} />
          <button type="button" onClick={() => setNavbarOpen(false)} aria-label="Close mobile menu" className="qm-close">
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        <nav className="qm-nav" aria-label="Mobile navigation">
          {activeNavItems.map((item: any, index: number) => (
            <MobileHeaderLink key={index} item={item} onClose={() => setNavbarOpen(false)} />
          ))}
        </nav>

        <div className="qm-actions">
          {header?.enquireNow?.active !== false && (
            <Link href={`tel:${phone}`} onClick={() => setNavbarOpen(false)} className="qm-cta qm-cta-primary">
              <Icon icon="solar:phone-calling-bold" className="text-lg" />
              {header?.enquireNow?.text || 'Enquire Now'}
            </Link>
          )}

          {header?.whatsapp?.active !== false && (
            <Link
              href={whatsappGeneratedUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setNavbarOpen(false)}
              className="qm-cta qm-cta-wa"
            >
              <Icon icon="mdi:whatsapp" className="text-lg" />
              {header?.whatsapp?.text || 'WhatsApp'}
            </Link>
          )}

          {header?.hireFromUs?.active !== false && (
            <Link
              href={header?.hireFromUs?.url || '/hire-from-us'}
              target={header?.hireFromUs?.openInNewTab ? '_blank' : '_self'}
              rel={header?.hireFromUs?.openInNewTab ? 'noopener noreferrer' : undefined}
              onClick={() => setNavbarOpen(false)}
              className="qm-cta qm-cta-outline"
            >
              <Icon icon="solar:case-round-bold" className="text-lg" />
              {header?.hireFromUs?.text || 'Hire From Us'}
            </Link>
          )}

          {header?.extraHeaderCtaButtons?.map(
            (btn: any, i: number) =>
              btn.active !== false && (
                <Link key={btn.id || i} href={btn.url || '/contact'} onClick={() => setNavbarOpen(false)} className="qm-cta qm-cta-outline">
                  {btn.text}
                </Link>
              )
          )}

          {socials.length > 0 && (
            <div className="qm-socials">
              {socials.map((s) => (
                <Link
                  key={s.key}
                  href={s.href}
                  target={s.external ? '_blank' : '_self'}
                  rel={s.external ? 'noopener noreferrer' : undefined}
                  aria-label={s.label}
                  data-net={s.net}
                  className="qm-social"
                >
                  <Icon icon={s.icon} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      {header?.whatsapp?.active !== false && (
        <Link
          href={whatsappGeneratedUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with QIMD on WhatsApp"
          className="whatsapp-float"
        >
          <Icon icon="mdi:whatsapp" className="text-white text-3xl" />
        </Link>
      )}
    </>
  )
}

export default Header
