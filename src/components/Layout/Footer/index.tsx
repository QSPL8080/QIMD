'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import { siteConfig } from '@/data'
import Logo from '../Header/Logo'
import { useWebsiteSettings } from '@/app/context/WebsiteSettingsContext'

const Footer: React.FC = () => {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()
  const { footer, socialLinks, phone } = useWebsiteSettings()

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/brochure')) return null

  const whatsappNum = (footer?.whatsapp?.number || socialLinks?.whatsapp || siteConfig.whatsapp || '').replace(/[^\d+]/g, '')
  const whatsappUrl = whatsappNum.startsWith('+')
    ? `https://wa.me/${whatsappNum.replace('+', '')}`
    : `https://wa.me/${whatsappNum}`

  // How many dynamic columns do we have? (brand is always 1 extra)
  const dynCols = footer?.columns?.length ?? 3

  return (
    <footer
      className="relative overflow-hidden w-full text-white font-sans"
      style={{
        background: `
          radial-gradient(ellipse 130% 80% at 50% 85%, rgba(118, 77, 255, 0.42) 0%, rgba(189, 105, 242, 0.28) 40%, rgba(0, 210, 255, 0.18) 75%, transparent 100%),
          linear-gradient(180deg, #0e1020 0%, #0d0e1c 35%, #161230 75%, #0f0b22 100%)
        `
      }}
    >
      {/* ── Seamless Full-Width Background Gradient Lights — QIMD Institute Colors (#00D2FF → #764DFF → #BD69F2) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
        {/* Full-width horizontal gradient wash across the lower footer */}
        <div
          className="absolute inset-x-0 bottom-0 h-[60%] w-full pointer-events-none opacity-70"
          style={{
            background: 'linear-gradient(90deg, rgba(0, 210, 255, 0.2) 0%, rgba(118, 77, 255, 0.45) 45%, rgba(189, 105, 242, 0.4) 80%, rgba(236, 72, 153, 0.25) 100%)',
            filter: 'blur(50px)'
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[220px] rounded-full bg-[#764DFF]/15 blur-[120px]" />
      </div>

      {/* Main Footer Links */}
      <div className="relative z-10 container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 pt-16 pb-8 sm:pb-10 lg:pb-12">
        {/*
          Mobile: single column stack
          Tablet (sm): 2-column grid
          Desktop (lg+): fully dynamic — 1 brand col (wider) + N link columns
          We use inline style to apply gridTemplateColumns only on lg via a scoped CSS var.
        */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr_1fr] gap-8 lg:gap-12"
        >
          {/* Brand Column */}
          <div className="space-y-5">

            {/* Social Links — controlled by Footer CMS "Show Social Icons" toggle */}
            {footer?.showSocialIcons !== false && socialLinks && (
              <div className="flex items-center gap-3 pt-1 flex-wrap">
                {socialLinks.activeStatus?.instagram !== false && socialLinks.footerStatus?.instagram !== false && socialLinks.instagram && (
                  <Link
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="QIMD Instagram"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs border-0 border-none"
                  >
                    <Icon icon="skill-icons:instagram" className="text-xl" />
                  </Link>
                )}
                {socialLinks.activeStatus?.facebook !== false && socialLinks.footerStatus?.facebook !== false && socialLinks.facebook && (
                  <Link
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="QIMD Facebook"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs border-0 border-none"
                  >
                    <Icon icon="logos:facebook" className="text-lg" />
                  </Link>
                )}
                {socialLinks.activeStatus?.youtube !== false && socialLinks.footerStatus?.youtube !== false && socialLinks.youtube && (
                  <Link
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="QIMD YouTube"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs border-0 border-none"
                  >
                    <Icon icon="logos:youtube-icon" className="text-lg" />
                  </Link>
                )}
                {socialLinks.activeStatus?.linkedin !== false && socialLinks.footerStatus?.linkedin !== false && socialLinks.linkedin && (
                  <Link
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="QIMD LinkedIn"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs border-0 border-none"
                  >
                    <Icon icon="skill-icons:linkedin" className="text-xl" />
                  </Link>
                )}
                {socialLinks.activeStatus?.twitter !== false && socialLinks.footerStatus?.twitter !== false && Boolean(socialLinks.twitter) && (
                  <Link
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="QIMD Twitter/X"
                    className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs border-0 border-none"
                  >
                    <Icon icon="line-md:twitter-x-alt" className="text-base" />
                  </Link>
                )}
                {/* WhatsApp Icon */}
                {footer?.whatsapp?.active !== false && socialLinks.activeStatus?.whatsapp !== false && socialLinks.footerStatus?.whatsapp !== false && (
                  <Link
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="QIMD WhatsApp"
                    className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md hover:bg-[#22c55e] hover:scale-110 transition-all duration-200 border-0 border-none"
                  >
                    <Icon icon="logos:whatsapp-icon" className="text-xl" />
                  </Link>
                )}
                {socialLinks.customLinks && socialLinks.customLinks.length > 0 && (
                  socialLinks.customLinks.map((customBtn) => (
                    customBtn.active !== false && customBtn.showFooter !== false && (
                      <Link
                        key={customBtn.id}
                        href={customBtn.url || '#'}
                        target={customBtn.url && customBtn.url.startsWith('http') ? '_blank' : '_self'}
                        rel={customBtn.url && customBtn.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        aria-label={customBtn.name}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 border-0 border-none"
                      >
                        <Icon icon={customBtn.icon || 'ion:link-outline'} className="text-lg" />
                      </Link>
                    )
                  ))
                )}
              </div>
            )}

            {/* Address, Phones, Emails */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              {footer?.address?.active !== false && footer?.address?.fullAddress && (
                <div className="flex items-start gap-3 text-sm text-white/80">
                  <Icon icon="mdi:map-marker" className="text-secondary flex-shrink-0 mt-0.5 text-base" />
                  <div>
                    {footer.address.googleMapsUrl ? (
                      <a
                        href={footer.address.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-secondary transition-colors"
                      >
                        {footer.address.fullAddress}
                      </a>
                    ) : (
                      <span>{footer.address.fullAddress}</span>
                    )}
                  </div>
                </div>
              )}

              {(() => {
                if (footer?.phones !== undefined) {
                  const activePhones = footer.phones.filter((p: any) => p.isActive !== false)
                  return activePhones.map((phoneItem: any) => (
                    <Link
                      key={phoneItem.id}
                      href={`tel:${phoneItem.value.replace(/\s+/g, '')}`}
                      className="flex items-center gap-3 text-sm text-white/80 hover:text-secondary transition-colors"
                    >
                      <Icon icon="mdi:phone" className="text-secondary flex-shrink-0 text-base" />
                      <span>{phoneItem.value}</span>
                    </Link>
                  ))
                }
                if (phone) {
                  return (
                    <Link
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="flex items-center gap-3 text-sm text-white/80 hover:text-secondary transition-colors"
                    >
                      <Icon icon="mdi:phone" className="text-secondary flex-shrink-0 text-base" />
                      <span>{phone}</span>
                    </Link>
                  )
                }
                return null
              })()}

              {(() => {
                if (footer?.emails !== undefined) {
                  const activeEmails = footer.emails.filter((e: any) => e.isActive !== false)
                  return activeEmails.map((email: any) => (
                    <Link
                      key={email.id}
                      href={`mailto:${email.value}`}
                      className="flex items-center gap-3 text-sm text-white/80 hover:text-secondary transition-colors"
                    >
                      <Icon icon="mdi:email" className="text-secondary flex-shrink-0 text-base" />
                      <span>{email.value}</span>
                    </Link>
                  ))
                }
                if (siteConfig.email) {
                  return (
                    <Link
                      href={`mailto:${siteConfig.email}`}
                      className="flex items-center gap-3 text-sm text-white/80 hover:text-secondary transition-colors"
                    >
                      <Icon icon="mdi:email" className="text-secondary flex-shrink-0 text-base" />
                      <span>{siteConfig.email}</span>
                    </Link>
                  )
                }
                return null
              })()}
            </div>
          </div>

          {/* DYNAMIC FOOTER COLUMNS - renders ALL columns from CMS */}
          {footer?.columns && footer.columns.length > 0 ? (
            <>
              {footer.columns.map((col) => (
                <div key={col.id} className="flex flex-col">
                  <h4 className="text-base font-semibold text-white mb-5 relative flex items-center gap-2">
                    {col.icon && <Icon icon={col.icon} className="text-secondary text-lg" />}
                    <span>{col.title}</span>
                    <span className="absolute bottom-[-8px] left-0 w-10 h-0.5 bg-secondary rounded-full" />
                  </h4>

                  {col.description && (
                    <p className="text-xs text-white/60 mb-3">{col.description}</p>
                  )}

                  {/* Plain links */}
                  <ul className="mt-4 space-y-3 flex-1">
                    {col.links && col.links.filter((l: any) => l.linkType !== 'BUTTON').map((link: any) => (
                      <li key={link.id}>
                        <Link
                          href={link.url}
                          target={link.openInNewTab ? '_blank' : '_self'}
                          rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                          className="text-sm text-white/70 hover:text-secondary transition-colors flex items-center gap-2 group"
                        >
                          <Icon
                            icon="mdi:chevron-right"
                            className="text-secondary flex-shrink-0 group-hover:translate-x-1 transition-transform"
                          />
                          <span>{link.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Buttons (linkType === 'BUTTON') */}
                  {col.links && col.links.filter((l: any) => l.linkType === 'BUTTON').length > 0 && (
                    <div className="mt-5 space-y-2">
                      {col.links.filter((l: any) => l.linkType === 'BUTTON').map((link: any) => {
                        const isWhatsApp = link.url?.includes('wa.me') || link.url?.includes('whatsapp')
                        return (
                          <Link
                            key={link.id}
                            href={link.url}
                            target={link.openInNewTab ? '_blank' : '_self'}
                            rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                            className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm px-4 py-3 rounded-xl font-medium hover:bg-[#22c55e] transition-all duration-200 w-full justify-center shadow-md text-center"
                          >
                            <Icon icon={isWhatsApp ? 'mdi:whatsapp' : 'mdi:link-variant'} className="text-xl shrink-0" />
                            <span>{link.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            // Default Columns Fallback
            <>
              <div>
                <h4 className="text-base font-semibold text-white mb-5 relative">
                  Quick Links
                  <span className="absolute bottom-[-8px] left-0 w-10 h-0.5 bg-secondary rounded-full" />
                </h4>
                <ul className="mt-4 space-y-3">
                  <li><Link href="/" className="text-sm text-white/70 hover:text-secondary">Home</Link></li>
                  <li><Link href="/about" className="text-sm text-white/70 hover:text-secondary">About Us</Link></li>
                  <li><Link href="/courses" className="text-sm text-white/70 hover:text-secondary">Courses</Link></li>
                  <li><Link href="/blog" className="text-sm text-white/70 hover:text-secondary">Blogs</Link></li>
                  <li><Link href="/careers" className="text-sm text-white/70 hover:text-secondary">Career</Link></li>
                  <li><Link href="/contact" className="text-sm text-white/70 hover:text-secondary">Contact Us</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-base font-semibold text-white mb-5 relative">
                  Our Courses
                  <span className="absolute bottom-[-8px] left-0 w-10 h-0.5 bg-secondary rounded-full" />
                </h4>
                <ul className="mt-4 space-y-3">
                  <li><Link href="/courses/ai-digital-marketing" className="text-sm text-white/70 hover:text-secondary">AI Powered Digital Marketing Course</Link></li>
                  <li><Link href="/courses/ai-graphic-design" className="text-sm text-white/70 hover:text-secondary">AI Powered Graphic Design Course</Link></li>
                  <li><Link href="/courses/ai-video-editing" className="text-sm text-white/70 hover:text-secondary">AI Powered Video Editing Course</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-base font-semibold text-white mb-5 relative">
                  Information
                  <span className="absolute bottom-[-8px] left-0 w-10 h-0.5 bg-secondary rounded-full" />
                </h4>
                <ul className="mt-4 space-y-3">
                  <li><Link href="/privacy-policy" className="text-sm text-white/70 hover:text-secondary">Privacy Policy</Link></li>
                  <li><Link href="/terms-and-conditions" className="text-sm text-white/70 hover:text-secondary">Terms & Conditions</Link></li>
                  <li><Link href="/refund-policy" className="text-sm text-white/70 hover:text-secondary">Refund Policy</Link></li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Large Wide Footer Brand Logo Section — Full-Width Ambient Glow without box borders */}
      {footer?.logoActive !== false && (
        <div className="relative z-10 w-full container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 pt-6 pb-14 sm:pb-16 flex items-center justify-center">
          <Link
            href={footer?.logoLink || '/'}
            className="w-full flex items-center justify-center transition-all duration-300 hover:scale-[1.015]"
            aria-label="QIMD Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={footer?.logo || '/images/logo/footer-qimd.png'}
              alt={footer?.logoAltText || 'Quickupp / QIMD'}
              className="w-full max-w-5xl md:max-w-6xl h-auto max-h-[220px] sm:max-h-[280px] md:max-h-[340px] lg:max-h-[380px] object-contain mx-auto select-none drop-shadow-[0_12px_40px_rgba(118,77,255,0.35)] brightness-105"
            />
          </Link>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10 bg-black/15 backdrop-blur-xs">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 py-5 flex items-center justify-center">
          <p className="text-sm text-white/70 text-center font-medium" suppressHydrationWarning>
            {footer?.copyrightText || `© ${currentYear} ${siteConfig.name}. All Rights Reserved.`}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
