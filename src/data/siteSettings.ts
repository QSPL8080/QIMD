/**
 * Fixed website settings (header, footer, social links).
 * These used to be edited from the admin panel; they now live here.
 * Values are the ones the live site was using.
 */
import { siteConfig } from '@/data'

export const siteSettings = {
  websiteName: 'QIMD - Quickup Institute of Marketing & Design',
  email: siteConfig.email,
  phone: siteConfig.phone,
  whatsapp: siteConfig.whatsapp,
  address: siteConfig.address,
  teamGroupPhoto: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80',
  googleMap: 'https://maps.app.goo.gl/QKcQMTiHX9P47hGy9',

  header: {
    logo: '/images/logo/qimd-logo.png',
    logoAltText: 'QIMD Institute Logo',
    logoLink: '/',
    logoActive: true,
    showSocialLinks: true,
    hireFromUs: { text: 'Hire From Us', url: '/hire-from-us', openInNewTab: false, active: true },
    enquireNow: { text: 'Enquire Now', url: '/contact', openInNewTab: false, active: true },
    whatsapp: { text: 'WhatsApp', number: '+91 7410-106608', active: true },
    phones: [{ id: 'h-phone-1', label: 'Phone', value: '+91 7410-106608', displayOrder: 1 }],
    emails: [{ id: 'h-email-1', label: 'Official Email', value: 'info@quickuppinstitute.com', displayOrder: 1 }],
    extraTopBarButtons: [] as Array<{ id: string; text: string; url: string; active?: boolean }>,
    extraHeaderCtaButtons: [] as Array<{ id: string; text: string; url: string; active?: boolean }>,
  },

  footer: {
    logo: '/images/logo/footer-qimd.png',
    logoAltText: 'QIMD Footer Logo',
    logoLink: '/',
    logoActive: true,
    showSocialIcons: true,
    address: {
      label: 'Physical Institute Address',
      fullAddress: siteConfig.address,
      googleMapsUrl: 'https://maps.app.goo.gl/QKcQMTiHX9P47hGy9',
      active: true,
    },
    whatsapp: { text: 'Chat with Us on WhatsApp', number: '+91 7410-106608', active: true },
    showScrollToTop: true,
    copyrightText: '© 2026 QIMD Institute. All Rights Reserved.',
    showBottomLinks: false,
    phones: [{ id: 'f-phone-1', label: 'Phone', value: '+91 7410-106608', displayOrder: 0 }],
    emails: [{ id: 'f-email-1', label: 'Email', value: 'info@quickuppinstitute.com', displayOrder: 1 }],
    columns: [
      {
        id: 'quick-links',
        title: 'Quick Links',
        displayOrder: 2,
        links: [
          { id: 'ql-1', title: 'Home', url: '/', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 1 },
          { id: 'ql-2', title: 'About', url: '/about', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 2 },
          { id: 'ql-3', title: 'Programs', url: '/courses', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 3 },
          { id: 'ql-4', title: 'Blogs', url: '/blog', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 4 },
          { id: 'ql-5', title: 'Career', url: '/careers', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 5 },
          { id: 'ql-6', title: 'Contact Us', url: '/contact', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 6 },
        ],
      },
      {
        id: 'our-programs',
        title: 'Our Programs',
        displayOrder: 3,
        links: [
          { id: 'op-1', title: 'Digital Marketing Courses in Pune', url: '/digital-marketing-courses-pune', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 0 },
          { id: 'op-2', title: 'Graphic Design Courses in Pune', url: '/graphic-design-courses-pune', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 1 },
          { id: 'op-3', title: 'Video Editing Courses in Pune', url: '/video-editing-courses-pune', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 2 },
          { id: 'op-all', title: 'View All Programs', url: '/courses', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 3 },
        ],
      },
      {
        id: 'information',
        title: 'Information',
        displayOrder: 4,
        links: [
          { id: 'in-1', title: 'Privacy Policy', url: '/privacy-policy', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 1 },
          { id: 'in-2', title: 'Terms & Conditions', url: '/terms-and-conditions', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 2 },
          { id: 'in-3', title: 'Refund & Cancellation', url: '/refund-policy', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 3 },
          { id: 'in-4', title: 'Hire From Us', url: '/hire-from-us', linkType: 'INTERNAL', openInNewTab: false, displayOrder: 4 },
        ],
      },
    ],
  },

  socialLinks: {
    instagram: 'https://www.instagram.com/quickupp.institute/',
    facebook: 'https://www.facebook.com/profile.php?id=61591834097665',
    linkedin: 'https://www.linkedin.com/company/133377696/',
    youtube: 'https://www.youtube.com/@QuickuppInstitute',
    twitter: '',
    whatsapp: 'https://wa.me/917410106608',
    activeStatus: { twitter: false, youtube: true, facebook: true, linkedin: true, instagram: true } as Record<string, boolean>,
    headerStatus: { twitter: false, youtube: true, facebook: true, linkedin: true, instagram: true } as Record<string, boolean>,
    footerStatus: { twitter: false, youtube: true, facebook: true, linkedin: true, instagram: true } as Record<string, boolean>,
    customLinks: [] as Array<{ id: string; name: string; icon: string; url: string; active?: boolean; showHeader?: boolean; showFooter?: boolean }>,
  },
}

export type SiteSettings = typeof siteSettings
export type CustomSocialLink = SiteSettings['socialLinks']['customLinks'][number]
