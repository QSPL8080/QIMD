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

const Header: React.FC = () => {
  const pathUrl = usePathname()
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [sticky, setSticky] = useState(false)

  const { header, socialLinks, phone } = useWebsiteSettings()

  if (pathUrl?.startsWith('/admin') || pathUrl?.startsWith('/brochure')) return null

  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    setSticky(window.scrollY >= 80)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClickOutside = (event: MouseEvent) => {
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      navbarOpen
    ) {
      setNavbarOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [navbarOpen])

  useEffect(() => {
    if (navbarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [navbarOpen])

  // Active navigation links (default fallback to static data if empty)
  const activeNavItems = headerData

  // Clean WhatsApp number to create generated wa.me URL
  const whatsappNum = (header?.whatsapp?.number || siteConfig.whatsapp || '').replace(/[^\d+]/g, '')
  const whatsappGeneratedUrl = whatsappNum.startsWith('+')
    ? `https://wa.me/${whatsappNum.replace('+', '')}`
    : `https://wa.me/${whatsappNum}`

  return (
    <>
      {/* ROW 1 — TOP BAR (Responsive across Mobile, Tablet, and Desktop) */}
      <div
        className="py-1.5 sm:py-2 border-b border-white/10 text-white"
        style={{
          background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
        }}
      >
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
          {/* Contact Phones & Emails */}
          <div className="flex items-center gap-3 sm:gap-6 text-white font-medium text-xs sm:text-sm overflow-hidden">
            {header?.phones && header.phones.length > 0 ? (
              header.phones.map((phoneItem) => (
                <Link
                  key={phoneItem.id}
                  href={`tel:${phoneItem.value.replace(/[^\d+]/g, '')}`}
                  className="flex items-center gap-1.5 hover:text-white/80 transition-colors whitespace-nowrap"
                >
                  <Icon icon="mdi:phone" className="text-cyan-300 text-sm sm:text-base flex-shrink-0" />
                  <span className="font-semibold">{phoneItem.value}</span>
                </Link>
              ))
            ) : phone ? (
              <Link
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                className="flex items-center gap-1.5 hover:text-white/80 transition-colors whitespace-nowrap"
              >
                <Icon icon="mdi:phone" className="text-cyan-300 text-sm sm:text-base flex-shrink-0" />
                <span className="font-semibold">{phone}</span>
              </Link>
            ) : null}

            {header?.emails && header.emails.length > 0 ? (
              header.emails.map((emailItem) => (
                <Link
                  key={emailItem.id}
                  href={`mailto:${emailItem.value}`}
                  className="hidden md:flex items-center gap-1.5 hover:text-white/80 transition-colors whitespace-nowrap"
                >
                  <Icon icon="mdi:email" className="text-cyan-300 text-sm sm:text-base flex-shrink-0" />
                  <span>{emailItem.value}</span>
                </Link>
              ))
            ) : siteConfig.email ? (
              <Link
                href={`mailto:${siteConfig.email}`}
                className="hidden md:flex items-center gap-1.5 hover:text-white/80 transition-colors whitespace-nowrap"
              >
                <Icon icon="mdi:email" className="text-cyan-300 text-sm sm:text-base flex-shrink-0" />
                <span>{siteConfig.email}</span>
              </Link>
            ) : null}
          </div>

          {/* Right Side: Hire From Us, Extra Buttons & High-Contrast Social Icons */}
          <div className="flex items-center gap-2 sm:gap-3 text-white flex-shrink-0">
            {header?.hireFromUs?.active !== false && (
              <Link
                href={header?.hireFromUs?.url || '/hire-from-us'}
                target={header?.hireFromUs?.openInNewTab ? '_blank' : '_self'}
                rel={header?.hireFromUs?.openInNewTab ? 'noopener noreferrer' : undefined}
                className="relative inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-black text-[#764DFF] bg-white hover:bg-slate-100 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ring-2 ring-white/60"
              >
                <Icon icon="mdi:briefcase-account" className="text-xs sm:text-sm text-[#764DFF]" />
                <span>{header?.hireFromUs?.text || 'Hire From Us'}</span>
              </Link>
            )}

            {/* Extra Custom Top Bar Buttons */}
            {header?.extraTopBarButtons && header.extraTopBarButtons.length > 0 && (
              header.extraTopBarButtons.map((btn: any, i: number) => (
                btn.active !== false && (
                  <Link
                    key={btn.id || i}
                    href={btn.url || '/contact'}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-full shadow-md transition-all border border-white/20"
                  >
                    <span>{btn.text}</span>
                  </Link>
                )
              ))
            )}

            {/* High-Visibility Official Social Icon Badges */}
            {header?.showSocialLinks !== false && socialLinks && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                {socialLinks.activeStatus?.instagram !== false && socialLinks.headerStatus?.instagram !== false && socialLinks.instagram && (
                  <Link
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs border border-white/20 backdrop-blur-xs flex-shrink-0"
                  >
                    <Icon icon="skill-icons:instagram" className="text-xs sm:text-sm" />
                  </Link>
                )}
                {socialLinks.activeStatus?.facebook !== false && socialLinks.headerStatus?.facebook !== false && socialLinks.facebook && (
                  <Link
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs border border-white/20 backdrop-blur-xs flex-shrink-0"
                  >
                    <Icon icon="logos:facebook" className="text-[11px] sm:text-xs" />
                  </Link>
                )}
                {socialLinks.activeStatus?.youtube !== false && socialLinks.headerStatus?.youtube !== false && socialLinks.youtube && (
                  <Link
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs border border-white/20 backdrop-blur-xs flex-shrink-0"
                  >
                    <Icon icon="logos:youtube-icon" className="text-[11px] sm:text-xs" />
                  </Link>
                )}
                {socialLinks.activeStatus?.linkedin !== false && socialLinks.headerStatus?.linkedin !== false && socialLinks.linkedin && (
                  <Link
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs border border-white/20 backdrop-blur-xs flex-shrink-0"
                  >
                    <Icon icon="logos:linkedin-icon" className="text-[11px] sm:text-xs" />
                  </Link>
                )}
                {socialLinks.activeStatus?.twitter !== false && socialLinks.headerStatus?.twitter !== false && socialLinks.twitter && (
                  <Link
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter (X)"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs border border-white/30 backdrop-blur-xs flex-shrink-0 text-white"
                  >
                    <Icon icon="line-md:twitter-x-alt" className="text-[10px] sm:text-xs" />
                  </Link>
                )}
                {socialLinks.customLinks && socialLinks.customLinks.length > 0 && (
                  socialLinks.customLinks.map((customBtn) => (
                    customBtn.active !== false && customBtn.showHeader !== false && (
                      <Link
                        key={customBtn.id}
                        href={customBtn.url || '#'}
                        target={customBtn.url && customBtn.url.startsWith('http') ? '_blank' : '_self'}
                        rel={customBtn.url && customBtn.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        aria-label={customBtn.name}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs border border-white/20 backdrop-blur-xs flex-shrink-0 text-white"
                      >
                        <Icon icon={customBtn.icon || 'ion:link-outline'} className="text-xs sm:text-sm" />
                      </Link>
                    )
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2 — MAIN NAVIGATION */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 border-b border-slate-200/60 dark:border-dark_border ${
          sticky ? 'shadow-md backdrop-blur-md' : 'shadow-xs'
        }`}
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 60%, #f4eeff 85%, #e8f2fe 100%)',
        }}
      >
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4">
          <div className="flex items-center justify-between py-2 sm:py-2.5 lg:py-3">
            {/* Header Logo */}
            <div className="flex-shrink-0">
              <Logo
                width={220}
                height={64}
                customSrc={header?.logoActive !== false ? header?.logo : '/images/logo/qimd-logo.png'}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center" aria-label="Main navigation">
              {activeNavItems.map((item: any, index: number) => (
                <HeaderLink key={index} item={item} />
              ))}
            </nav>

            {/* Desktop Action CTAs (WhatsApp & Enquire Now Buttons) */}
            <div className="hidden lg:flex items-center gap-3">
              {header?.whatsapp?.active !== false && (
                <Link
                  href={whatsappGeneratedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] text-white text-sm px-4 py-2.5 rounded-lg font-medium hover:bg-[#22c55e] transition-all duration-200 shadow-sm hover:shadow"
                >
                  <Icon icon="mdi:whatsapp" className="text-base" />
                  <span>{header?.whatsapp?.text || 'WhatsApp'}</span>
                </Link>
              )}

              {header?.enquireNow?.active !== false && (
                <Link
                  href={`tel:${phone}`}
                  className="bg-primary hover:bg-darkprimary text-white text-sm px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {header?.enquireNow?.text || 'Enquire Now'}
                </Link>
              )}

              {/* Extra Custom Navigation Header Buttons */}
              {header?.extraHeaderCtaButtons && header.extraHeaderCtaButtons.length > 0 && (
                header.extraHeaderCtaButtons.map((btn: any, i: number) => (
                  btn.active !== false && (
                    <Link
                      key={btn.id || i}
                      href={btn.url || '/contact'}
                      className="bg-primary/90 text-white text-sm px-4 py-2.5 rounded-lg font-medium hover:bg-primary transition-all duration-200 shadow-sm hover:shadow"
                    >
                      {btn.text}
                    </Link>
                  )
                ))
              )}
            </div>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="block lg:hidden p-2 rounded-lg hover:bg-light_grey dark:hover:bg-darklight transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={navbarOpen}
            >
              <span className={`block w-6 h-0.5 bg-midnight_text dark:bg-white transition-all duration-300 ${navbarOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-midnight_text dark:bg-white mt-1.5 transition-all duration-300 ${navbarOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-midnight_text dark:bg-white mt-1.5 transition-all duration-300 ${navbarOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Overlay */}
        {navbarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setNavbarOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-[300px] bg-white dark:bg-dark shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${
            navbarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark_border bg-white dark:bg-dark">
            <Logo variant="default" width={130} height={45} customSrc={header?.logoActive !== false ? header?.logo : undefined} />
            <button
              onClick={() => setNavbarOpen(false)}
              aria-label="Close mobile menu"
              className="text-midnight_text dark:text-white hover:text-primary transition-colors"
            >
              <Icon icon="mdi:close" className="text-2xl" />
            </button>
          </div>

          {/* Mobile Nav Links */}
          <nav className="flex flex-col p-4" aria-label="Mobile navigation">
            {activeNavItems.map((item: any, index: number) => (
              <MobileHeaderLink
                key={index}
                item={item}
                onClose={() => setNavbarOpen(false)}
              />
            ))}
          </nav>

          {/* Mobile Actions */}
          <div className="p-4 border-t border-border dark:border-dark_border space-y-3">
            {header?.hireFromUs?.active !== false && (
              <Link
                href={header?.hireFromUs?.url || '/hire-from-us'}
                target={header?.hireFromUs?.openInNewTab ? '_blank' : '_self'}
                rel={header?.hireFromUs?.openInNewTab ? 'noopener noreferrer' : undefined}
                onClick={() => setNavbarOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-darkprimary text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Icon icon="mdi:briefcase-account" className="text-lg" />
                {header?.hireFromUs?.text || 'Hire From Us'}
              </Link>
            )}

            {header?.whatsapp?.active !== false && (
              <Link
                href={whatsappGeneratedUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setNavbarOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-lg font-medium hover:bg-[#22c55e] transition-all duration-200 shadow-sm"
              >
                <Icon icon="mdi:whatsapp" className="text-lg" />
                {header?.whatsapp?.text || 'WhatsApp'}
              </Link>
            )}

            {header?.enquireNow?.active !== false && (
              <Link
                href={`tel:${phone}`}
                onClick={() => setNavbarOpen(false)}
                className="flex items-center justify-center w-full bg-primary hover:bg-darkprimary text-white py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              >
                {header?.enquireNow?.text || 'Enquire Now'}
              </Link>
            )}

            {header?.extraHeaderCtaButtons && header.extraHeaderCtaButtons.length > 0 && (
              header.extraHeaderCtaButtons.map((btn: any, i: number) => (
                btn.active !== false && (
                  <Link
                    key={btn.id || i}
                    href={btn.url || '/contact'}
                    onClick={() => setNavbarOpen(false)}
                    className="flex items-center justify-center w-full bg-primary hover:bg-darkprimary text-white py-3 rounded-lg font-medium shadow-sm transition-all duration-200"
                  >
                    {btn.text}
                  </Link>
                )
              ))
            )}

            {/* Social Links inside Mobile Drawer */}
            {header?.showSocialLinks !== false && socialLinks && (
              <div className="pt-3 border-t border-border dark:border-dark_border">
                <p className="text-xs font-semibold text-slate-600 dark:text-white/70 mb-2">Connect with us</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {socialLinks.activeStatus?.instagram !== false && socialLinks.headerStatus?.instagram !== false && socialLinks.instagram && (
                    <Link
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                    >
                      <Icon icon="skill-icons:instagram" className="text-sm" />
                    </Link>
                  )}
                  {socialLinks.activeStatus?.facebook !== false && socialLinks.headerStatus?.facebook !== false && socialLinks.facebook && (
                    <Link
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                    >
                      <Icon icon="logos:facebook" className="text-xs" />
                    </Link>
                  )}
                  {socialLinks.activeStatus?.youtube !== false && socialLinks.headerStatus?.youtube !== false && socialLinks.youtube && (
                    <Link
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                      className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                    >
                      <Icon icon="logos:youtube-icon" className="text-xs" />
                    </Link>
                  )}
                  {socialLinks.activeStatus?.linkedin !== false && socialLinks.headerStatus?.linkedin !== false && socialLinks.linkedin && (
                    <Link
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                    >
                      <Icon icon="logos:linkedin-icon" className="text-xs" />
                    </Link>
                  )}
                  {socialLinks.activeStatus?.twitter !== false && socialLinks.headerStatus?.twitter !== false && socialLinks.twitter && (
                    <Link
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter (X)"
                      className="w-8 h-8 rounded-full bg-slate-900 text-white hover:bg-black flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                    >
                      <Icon icon="line-md:twitter-x-alt" className="text-xs" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

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
