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

  if (pathname?.startsWith('/admin')) return null

  const whatsappNum = (socialLinks?.whatsapp || siteConfig.whatsapp || '').replace(/[^\d+]/g, '')
  const whatsappUrl = whatsappNum.startsWith('+')
    ? `https://wa.me/${whatsappNum.replace('+', '')}`
    : `https://wa.me/${whatsappNum}`

  // How many dynamic columns do we have? (brand is always 1 extra)
  const dynCols = footer?.columns?.length ?? 3

  return (
    <footer className="bg-midnight_text dark:bg-dark text-white font-sans">
      {/* Main Footer */}
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 pt-16 pb-10">
        {/*
          Mobile: single column stack
          Tablet (sm): 2-column grid
          Desktop (lg+): fully dynamic — 1 brand col (wider) + N link columns
          We use inline style to apply gridTemplateColumns only on lg via a scoped CSS var.
        */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10"
        >
          {/* Brand Column */}
          <div className="space-y-5">
            {/* Dynamic Footer Logo */}
            {footer?.logoActive !== false && (
              <Logo
                variant="white"
                width={180}
                height={58}
                customSrc={footer?.logo || '/images/logo/qimd-logo-white.png'}
              />
            )}

            <p className="text-sm text-white/70 leading-relaxed">
              Practical training with AI-powered tools, live projects, and placement support.
            </p>

            {/* Social Links — controlled by Footer CMS "Show Social Icons" toggle */}
            {footer?.showSocialIcons !== false && socialLinks && (
              <div className="flex items-center gap-3 pt-1">
                {socialLinks.activeStatus?.instagram !== false && socialLinks.footerStatus?.instagram !== false && socialLinks.instagram && (
                  <Link
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="QIMD Instagram"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-200"
                  >
                    <Icon icon="mdi:instagram" className="text-lg" />
                  </Link>
                )}
                {socialLinks.activeStatus?.facebook !== false && socialLinks.footerStatus?.facebook !== false && socialLinks.facebook && (
                  <Link
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="QIMD Facebook"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-200"
                  >
                    <Icon icon="ri:facebook-fill" className="text-lg" />
                  </Link>
                )}
                {socialLinks.activeStatus?.youtube !== false && socialLinks.footerStatus?.youtube !== false && socialLinks.youtube && (
                  <Link
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="QIMD YouTube"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-200"
                  >
                    <Icon icon="mdi:youtube" className="text-lg" />
                  </Link>
                )}
                {socialLinks.activeStatus?.linkedin !== false && socialLinks.footerStatus?.linkedin !== false && socialLinks.linkedin && (
                  <Link
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="QIMD LinkedIn"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-200"
                  >
                    <Icon icon="ri:linkedin-fill" className="text-lg" />
                  </Link>
                )}
                {socialLinks.activeStatus?.twitter !== false && socialLinks.footerStatus?.twitter !== false && socialLinks.twitter && (
                  <Link
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="QIMD Twitter/X"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-200"
                  >
                    <Icon icon="line-md:twitter-x-alt" className="text-base" />
                  </Link>
                )}
                {/* WhatsApp Icon aligned with social icons */}
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="QIMD WhatsApp"
                  className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md hover:bg-[#22c55e] hover:scale-105 transition-all duration-200"
                >
                  <Icon icon="mdi:whatsapp" className="text-xl" />
                </Link>
                {socialLinks.customLinks && socialLinks.customLinks.length > 0 && (
                  socialLinks.customLinks.map((customBtn) => (
                    customBtn.active !== false && customBtn.showFooter !== false && (
                      <Link
                        key={customBtn.id}
                        href={customBtn.url || '#'}
                        target={customBtn.url && customBtn.url.startsWith('http') ? '_blank' : '_self'}
                        rel={customBtn.url && customBtn.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        aria-label={customBtn.name}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-200"
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
                const activePhones = footer?.phones ? footer.phones.filter((p: any) => p.isActive !== false) : []
                if (activePhones.length > 0) {
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
                if (!footer?.phones && phone) {
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
                const activeEmails = footer?.emails ? footer.emails.filter((e: any) => e.isActive !== false) : []
                if (activeEmails.length > 0) {
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
                if (!footer?.emails && siteConfig.email) {
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

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 py-5 flex flex-col sm:flex-row items-center justify-center relative gap-3">
          <p className="text-sm text-white/60 text-center" suppressHydrationWarning>
            {footer?.copyrightText || `© ${currentYear} ${siteConfig.name}. All Rights Reserved.`}
          </p>
          {footer?.showBottomLinks && (
            <div className="flex items-center gap-4 text-xs text-white/50 sm:absolute sm:right-4">
              <Link href="/privacy-policy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms-and-conditions" className="hover:text-secondary transition-colors">Terms & Conditions</Link>
              <span>•</span>
              <Link href="/refund-policy" className="hover:text-secondary transition-colors">Refund Policy</Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer
