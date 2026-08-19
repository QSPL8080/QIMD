import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { siteConfig } from '@/data'

export async function GET() {
  try {
    const [headerSettings, headerPhones, headerEmails, footerSettings, footerPhones, footerEmails, footerColumns, websiteSettings] = await Promise.all([
      db.headerSettings.findFirst(),
      db.headerContactItem.findMany({ where: { type: 'PHONE', isActive: true }, orderBy: { displayOrder: 'asc' } }),
      db.headerContactItem.findMany({ where: { type: 'EMAIL', isActive: true }, orderBy: { displayOrder: 'asc' } }),
      db.footerSettings.findFirst(),
      db.footerContactItem.findMany({ where: { type: 'PHONE', isActive: true }, orderBy: { displayOrder: 'asc' } }),
      db.footerContactItem.findMany({ where: { type: 'EMAIL', isActive: true }, orderBy: { displayOrder: 'asc' } }),
      db.footerColumn.findMany({
        where: { isActive: true },
        include: {
          links: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { displayOrder: 'asc' },
      }),
      db.websiteSettings.findFirst(),
    ])

    const socialLinksData: any = websiteSettings?.socialLinks || {}

    return NextResponse.json({
      // Global technical settings
      websiteName: websiteSettings?.websiteName || siteConfig.name,
      teamGroupPhoto: (websiteSettings?.homepageSections as any)?.teamGroupPhoto || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80',
      favicon: websiteSettings?.favicon || '/images/logo/qimd-logo.png',
      googleMap: websiteSettings?.googleMap || '',
      googleAnalytics: websiteSettings?.googleAnalytics || '',
      searchConsole: websiteSettings?.searchConsole || '',
      robotsTxt: websiteSettings?.robotsTxt || '',

      // Header CMS
      header: {
        logo: headerSettings?.logo || websiteSettings?.logo || '/images/logo/qimd-logo.png',
        logoAltText: headerSettings?.logoAltText || 'QIMD Logo',
        logoLink: headerSettings?.logoLink || '/',
        logoActive: headerSettings?.logoActive ?? true,
        showSocialLinks: headerSettings?.showSocialLinks ?? true,
        hireFromUs: {
          text: headerSettings?.hireFromUsText || 'Hire From Us',
          url: headerSettings?.hireFromUsUrl || '/hire-from-us',
          openInNewTab: headerSettings?.hireFromUsNewTab ?? false,
          active: headerSettings?.hireFromUsActive ?? true,
        },
        enquireNow: {
          text: headerSettings?.enquireNowText || 'Enquire Now',
          url: headerSettings?.enquireNowUrl || '/contact',
          openInNewTab: headerSettings?.enquireNowNewTab ?? false,
          active: headerSettings?.enquireNowActive ?? true,
        },
        whatsapp: {
          text: headerSettings?.whatsappText || 'WhatsApp',
          number: websiteSettings?.whatsappNumber || siteConfig.whatsapp,
          active: headerSettings?.whatsappActive ?? true,
        },
        phones: headerPhones.length > 0 ? headerPhones : [
          { id: 'h-phone-1', label: 'Primary', value: websiteSettings?.contactPhone || siteConfig.phone, displayOrder: 1 }
        ],
        emails: headerEmails.length > 0 ? headerEmails : [
          { id: 'h-email-1', label: 'Official Email', value: websiteSettings?.contactEmail || siteConfig.email, displayOrder: 1 }
        ],
        extraTopBarButtons: (websiteSettings?.homepageSections as any)?.extraTopBarButtons || [],
        extraHeaderCtaButtons: (websiteSettings?.homepageSections as any)?.extraHeaderCtaButtons || [],
      },

      // Footer CMS
      footer: {
        logo: footerSettings?.logo || websiteSettings?.favicon || '/images/logo/qimd-logo-white.png',
        logoAltText: footerSettings?.logoAltText || 'QIMD Footer Logo',
        logoLink: footerSettings?.logoLink || '/',
        logoActive: footerSettings?.logoActive ?? true,
        showSocialIcons: footerSettings?.showSocialIcons ?? true,
        address: {
          label: footerSettings?.addressLabel || 'Physical Institute Address',
          fullAddress: footerSettings?.fullAddress || websiteSettings?.address || siteConfig.address,
          googleMapsUrl: footerSettings?.googleMapsUrl || websiteSettings?.googleMap || '',
          active: footerSettings?.addressActive ?? true,
        },
        whatsapp: {
          text: footerSettings?.whatsappText || 'Chat with Us on WhatsApp',
          number: websiteSettings?.whatsappNumber || siteConfig.whatsapp,
          active: footerSettings?.whatsappActive ?? true,
        },
        phones: footerPhones.length > 0 ? footerPhones : [
          { id: 'f-phone-1', label: 'Admissions', value: siteConfig.phone, displayOrder: 1 }
        ],
        emails: footerEmails.length > 0 ? footerEmails : [
          { id: 'f-email-1', label: 'General', value: siteConfig.email, displayOrder: 1 }
        ],
        columns: footerColumns,
      },

      // Social Links CMS (Single Source of Truth)
      socialLinks: {
        instagram: socialLinksData.instagram || siteConfig.socialLinks.instagram,
        facebook: socialLinksData.facebook || siteConfig.socialLinks.facebook,
        linkedin: socialLinksData.linkedin || siteConfig.socialLinks.linkedin,
        youtube: socialLinksData.youtube || siteConfig.socialLinks.youtube,
        twitter: socialLinksData.twitter || siteConfig.socialLinks.twitter,
        whatsapp: websiteSettings?.whatsappNumber 
          ? (websiteSettings.whatsappNumber.startsWith('http')
              ? websiteSettings.whatsappNumber
              : `https://wa.me/${websiteSettings.whatsappNumber.replace(/[^\d]/g, '')}`)
          : socialLinksData.whatsapp || siteConfig.socialLinks.whatsapp,
        activeStatus: socialLinksData.activeStatus || {
          instagram: true,
          facebook: true,
          linkedin: true,
          youtube: true,
          twitter: true,
          whatsapp: true,
        },
        headerStatus: socialLinksData.headerStatus || {
          instagram: true,
          facebook: true,
          linkedin: true,
          youtube: true,
          twitter: true,
          whatsapp: true,
        },
        footerStatus: socialLinksData.footerStatus || {
          instagram: true,
          facebook: true,
          linkedin: true,
          youtube: true,
          twitter: true,
          whatsapp: true,
        },
        customLinks: socialLinksData.customLinks || [],
      },
    })
  } catch (err: any) {
    console.error('Failed to fetch public website settings:', err)
    return NextResponse.json({
      websiteName: siteConfig.name,
      googleMap: '',
      header: {
        logo: '/images/logo/qimd-logo.png',
        logoAltText: 'QIMD Logo',
        logoLink: '/',
        logoActive: true,
        showSocialLinks: true,
        hireFromUs: { text: 'Hire From Us', url: '/hire-from-us', openInNewTab: false, active: true },
        enquireNow: { text: 'Enquire Now', url: '/contact', openInNewTab: false, active: true },
        whatsapp: { text: 'WhatsApp', number: siteConfig.whatsapp, active: true },
        phones: [{ id: '1', label: 'Primary Phone', value: siteConfig.phone, displayOrder: 1 }],
        emails: [{ id: '1', label: 'Official Email', value: siteConfig.email, displayOrder: 1 }],
      },
      footer: {
        logo: '/images/logo/qimd-logo-white.png',
        logoAltText: 'QIMD Footer Logo',
        logoLink: '/',
        logoActive: true,
        address: { label: 'Office Address', fullAddress: siteConfig.address, googleMapsUrl: '', active: true },
        phones: [{ id: '1', label: 'Admissions', value: siteConfig.phone, displayOrder: 1 }],
        emails: [{ id: '1', label: 'General', value: siteConfig.email, displayOrder: 1 }],
        columns: [],
      },
      socialLinks: {
        ...siteConfig.socialLinks,
        activeStatus: { instagram: true, facebook: true, linkedin: true, youtube: true, twitter: true, whatsapp: true },
      },
    })
  }
}
