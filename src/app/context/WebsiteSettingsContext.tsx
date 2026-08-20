'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { siteConfig } from '@/data'

interface HeaderCMSContext {
  logo: string
  logoAltText: string
  logoLink: string
  logoActive: boolean
  showSocialLinks: boolean
  hireFromUs: { text: string; url: string; openInNewTab: boolean; active: boolean }
  enquireNow: { text: string; url: string; openInNewTab: boolean; active: boolean }
  whatsapp: { text: string; number: string; active: boolean }
  phones: Array<{ id: string; label: string; value: string; displayOrder: number }>
  emails: Array<{ id: string; label: string; value: string; displayOrder: number }>
  extraTopBarButtons?: Array<{ id: string; text: string; url: string; active?: boolean }>
  extraHeaderCtaButtons?: Array<{ id: string; text: string; url: string; active?: boolean }>
}

interface FooterCMSContext {
  logo: string
  logoAltText: string
  logoLink: string
  logoActive: boolean
  showSocialIcons: boolean
  address: { label: string; fullAddress: string; googleMapsUrl: string; active: boolean }
  whatsapp: { text: string; number: string; active: boolean }
  showScrollToTop?: boolean
  copyrightText?: string
  showBottomLinks?: boolean
  phones: Array<{ id: string; label: string; value: string; displayOrder: number }>
  emails: Array<{ id: string; label: string; value: string; displayOrder: number }>
  columns: Array<{
    id: string
    title: string
    description?: string | null
    icon?: string | null
    displayOrder: number
    links: Array<{
      id: string
      title: string
      url: string
      linkType: string
      openInNewTab: boolean
      displayOrder: number
    }>
  }>
}

export interface CustomSocialLink {
  id: string
  name: string
  icon: string
  url: string
  active?: boolean
  showHeader?: boolean
  showFooter?: boolean
}

interface SocialLinksData {
  instagram: string
  facebook: string
  linkedin: string
  youtube: string
  twitter: string
  whatsapp: string
  activeStatus: Record<string, boolean>
  headerStatus?: Record<string, boolean>
  footerStatus?: Record<string, boolean>
  customLinks?: CustomSocialLink[]
}

interface WebsiteSettingsContextType {
  email: string
  phone: string
  whatsapp: string
  address: string
  websiteName: string
  teamGroupPhoto: string
  favicon: string
  googleMap: string
  googleAnalytics: string
  searchConsole: string
  robotsTxt: string
  header: HeaderCMSContext
  footer: FooterCMSContext
  socialLinks: SocialLinksData
  loading: boolean
}

const defaultHeader: HeaderCMSContext = {
  logo: '/images/logo/qimd-logo.png',
  logoAltText: 'QIMD Institute Logo',
  logoLink: '/',
  logoActive: true,
  showSocialLinks: true,
  hireFromUs: { text: 'Hire From Us', url: '/hire-from-us', openInNewTab: false, active: true },
  enquireNow: { text: 'Enquire Now', url: '/contact', openInNewTab: false, active: true },
  whatsapp: { text: 'WhatsApp', number: siteConfig.whatsapp, active: true },
  phones: [{ id: 'default-1', label: 'Primary Phone', value: siteConfig.phone, displayOrder: 1 }],
  emails: [{ id: 'default-1', label: 'Official Email', value: siteConfig.email, displayOrder: 1 }],
}

const defaultFooter: FooterCMSContext = {
  logo: '/images/logo/qimd-logo-white.png',
  logoAltText: 'QIMD Footer Logo',
  logoLink: '/',
  logoActive: true,
  showSocialIcons: true,
  address: { label: 'Physical Institute Address', fullAddress: siteConfig.address, googleMapsUrl: '', active: true },
  whatsapp: { text: 'Chat with Us on WhatsApp', number: siteConfig.whatsapp, active: true },
  showScrollToTop: true,
  copyrightText: '© 2026 QIMD Institute. All Rights Reserved.',
  showBottomLinks: false,
  phones: [{ id: 'default-f1', label: 'Admissions', value: siteConfig.phone, displayOrder: 1 }],
  emails: [{ id: 'default-f1', label: 'General', value: siteConfig.email, displayOrder: 1 }],
  columns: [],
}

const defaultContext: WebsiteSettingsContextType = {
  email: siteConfig.email,
  phone: siteConfig.phone,
  whatsapp: siteConfig.whatsapp,
  address: siteConfig.address,
  websiteName: siteConfig.name,
  teamGroupPhoto: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80',
  favicon: '/images/logo/qimd-logo.png',
  googleMap: '',
  googleAnalytics: '',
  searchConsole: '',
  robotsTxt: '',
  header: defaultHeader,
  footer: defaultFooter,
  socialLinks: {
    ...siteConfig.socialLinks,
    activeStatus: {
      instagram: true,
      facebook: true,
      linkedin: true,
      youtube: true,
      twitter: true,
      whatsapp: true,
    },
  },
  loading: true,
}

const WebsiteSettingsContext = createContext<WebsiteSettingsContextType>(defaultContext)

export const WebsiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettingsContextType>(defaultContext)

  useEffect(() => {
    let isMounted = true
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data) {
            const h: HeaderCMSContext = data.header || defaultHeader
            const f: FooterCMSContext = data.footer || defaultFooter

            const firstEmail = h.emails?.[0]?.value || f.emails?.[0]?.value || siteConfig.email
            const firstPhone = h.phones?.[0]?.value || f.phones?.[0]?.value || siteConfig.phone
            const whatsappNum = h.whatsapp?.number || siteConfig.whatsapp
            const fullAddress = f.address?.fullAddress || siteConfig.address

            setSettings({
              email: firstEmail,
              phone: firstPhone,
              whatsapp: whatsappNum,
              address: fullAddress,
              websiteName: data.websiteName || siteConfig.name,
              teamGroupPhoto: data.teamGroupPhoto || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80',
              favicon: data.favicon || '/images/logo/qimd-logo.png',
              googleMap: data.googleMap || '',
              googleAnalytics: data.googleAnalytics || '',
              searchConsole: data.searchConsole || '',
              robotsTxt: data.robotsTxt || '',
              header: h,
              footer: f,
              socialLinks: data.socialLinks || defaultContext.socialLinks,
              loading: false,
            })

            const faviconUrl = data.favicon || '/images/logo/qimd-logo.png'
            const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon'], link[rel*='shortcut']")
            links.forEach((link) => {
              link.href = faviconUrl
            })
          }
        }
      } catch (err) {
        console.error('Failed to load website settings context:', err)
      } finally {
        if (isMounted) {
          setSettings((prev) => ({ ...prev, loading: false }))
        }
      }
    }

    fetchSettings()

    const handleCustomUpdate = () => {
      fetchSettings()
    }
    window.addEventListener('websiteSettingsUpdated', handleCustomUpdate)

    return () => {
      isMounted = false
      window.removeEventListener('websiteSettingsUpdated', handleCustomUpdate)
    }
  }, [])

  return (
    <WebsiteSettingsContext.Provider value={settings}>
      {children}
    </WebsiteSettingsContext.Provider>
  )
}

export const useWebsiteSettings = () => useContext(WebsiteSettingsContext)
