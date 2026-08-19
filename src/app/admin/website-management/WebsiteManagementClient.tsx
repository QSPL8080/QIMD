'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import toast from 'react-hot-toast'
import {
  getWebsitePagesAction,
  getWebsitePageSectionsAction,
  savePageSectionAction,
  toggleSectionActiveAction,
  reorderPageSectionsAction,
  duplicatePageSectionAction,
  deletePageSectionAction,
  getHeaderSettingsAction,
  saveHeaderSettingsAction,
  saveFooterSettingsAction,
  PageSectionInput,
} from '@/app/actions/websiteManagementActions'

interface Props {
  session: {
    id: string
    fullName: string
    email: string
    roleName: string
  }
}

const PAGE_CATEGORIES = [
  {
    id: 'GLOBAL',
    name: 'Global Layout Modules',
    icon: 'ion:layers-outline',
    pages: [
      { key: 'HEADER', name: 'Header Settings', icon: 'ion:menu-outline' },
      { key: 'FOOTER', name: 'Footer Settings', icon: 'ion:subway-outline' },
    ],
  },
  {
    id: 'MAIN',
    name: 'Main & Important Pages',
    icon: 'ion:star-outline',
    pages: [
      { key: 'HOME', name: 'Home Page', icon: 'ion:home-outline' },
      { key: 'ABOUT', name: 'About Us', icon: 'ion:information-circle-outline' },
      { key: 'COURSES', name: 'Courses Directory', icon: 'ion:book-outline' },
      { key: 'WHY_QIMD', name: 'Why QIMD Page', icon: 'ion:star-outline' },
      { key: 'BLOGS', name: 'Blogs & Articles', icon: 'ion:document-text-outline' },
      { key: 'CAREER', name: 'Career / Openings', icon: 'ion:briefcase-outline' },
      { key: 'CONTACT', name: 'Contact Us Page', icon: 'ion:mail-outline' },
    ],
  },
  {
    id: 'LEGAL',
    name: 'Policy & Legal Pages',
    icon: 'ion:shield-checkmark-outline',
    pages: [
      { key: 'PRIVACY_POLICY', name: 'Privacy Policy', icon: 'ion:shield-checkmark-outline' },
      { key: 'TERMS', name: 'Terms & Conditions', icon: 'ion:newspaper-outline' },
      { key: 'REFUND_POLICY', name: 'Refund Policy', icon: 'ion:cash-outline' },
    ],
  },
  {
    id: 'UTILITY',
    name: 'Utility Pages',
    icon: 'ion:map-outline',
    pages: [
      { key: 'ADMISSION', name: 'Admission Info', icon: 'ion:school-outline' },
      { key: 'SITEMAP', name: 'Sitemap', icon: 'ion:map-outline' },
    ],
  },
]

const PAGE_OPTIONS = PAGE_CATEGORIES.flatMap((c) => c.pages)

const SECTION_TYPE_CATALOG = [
  { type: 'HERO', name: 'Hero Banner', category: 'CONTENT', icon: 'ion:flash-outline', desc: 'Main banner with heading, description, CTAs and background image.' },
  { type: 'RICH_TEXT', name: 'Rich Text / Content', category: 'CONTENT', icon: 'ion:document-text-outline', desc: 'Formatted paragraphs, policy details, or custom text.' },
  { type: 'IMAGE_TEXT', name: 'Image + Text', category: 'CONTENT', icon: 'ion:image-outline', desc: 'Side-by-side feature layout with image and text.' },
  { type: 'CTA_BANNER', name: 'CTA Banner', category: 'CONTENT', icon: 'ion:mega-phone-outline', desc: 'Call to action banner with background image and button.' },
  { type: 'WHY_QIMD', name: 'Why Choose QIMD', category: 'CONTENT', icon: 'ion:grid-outline', desc: 'Grid of feature cards with icons and descriptions.' },
  { type: 'TESTIMONIALS', name: 'Testimonials', category: 'CONTENT', icon: 'ion:chatbubbles-outline', desc: 'Student reviews and video testimonials slider/grid.' },
  { type: 'GALLERY', category: 'CONTENT', name: 'Campus Gallery', icon: 'ion:images-outline', desc: 'Photo and video campus gallery preview.' },
  { type: 'FAQ', category: 'CONTENT', name: 'FAQ Accordion', icon: 'ion:help-circle-outline', desc: 'Frequently asked questions accordion list.' },
  { type: 'COURSES', category: 'COURSES', name: 'Course Listing Grid', icon: 'ion:book-outline', desc: 'Job-oriented course cards connected to Course CMS.' },
  { type: 'PLACEMENT', category: 'PLACEMENT', name: 'Placed Students', icon: 'ion:trophy-outline', desc: 'Student placement stats and company hires.' },
  { type: 'PARTNERS', category: 'PARTNERS', name: 'Hiring Partners', icon: 'ion:briefcase-outline', desc: 'Recruitment partner logo slider.' },
  { type: 'EMI_PARTNERS', category: 'PARTNERS', name: 'EMI Financing Partners', icon: 'ion:card-outline', desc: '0% EMI loan partner logos.' },
  { type: 'FORM_SECTION', category: 'FORMS', name: 'Lead / Enquiry Form', icon: 'ion:mail-unread-outline', desc: 'CRM connected admission or contact form.' },
]

export default function WebsiteManagementClient({ session }: Props) {
  const [selectedPageKey, setSelectedPageKey] = useState<string>('HEADER')
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop')
  const [iframeKey, setIframeKey] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [pages, setPages] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState<any>(null)
  const [sections, setSections] = useState<any[]>([])

  // Modals
  const [addSectionModalOpen, setAddSectionModalOpen] = useState<boolean>(false)
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState<boolean>(false)
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null)

  // Header State
  const [headerState, setHeaderState] = useState<any>({
    phone: '+91 91300 00000',
    email: 'info@qimd.in',
    whatsappNumber: '+919130000000',
    logo: '/images/logo/qimd-logo.png',
    topBarConfig: {
      showPhone: true,
      showEmail: true,
      showHireFromUs: true,
      hireFromUsLabel: 'Hire From Us',
      hireFromUsUrl: '/hire-from-us',
    },
    topBarItems: [
      { id: 'phone', label: 'Top Phone Number', value: '+91 91300 00000', icon: 'ion:call-outline', active: true, alignment: 'LEFT' },
      { id: 'email', label: 'Top Email Address', value: 'info@qimd.in', icon: 'ion:mail-outline', active: true, alignment: 'LEFT' },
      { id: 'hireFromUs', label: '"Hire From Us" CTA Button', value: '/hire-from-us', icon: 'ion:briefcase-outline', active: true, alignment: 'RIGHT' },
    ],
    mainHeaderConfig: {
      logoUrl: '/images/logo/qimd-logo.png',
      ctasOrder: 'WHATSAPP_FIRST',
      enquireCta: { label: 'Enquire Now', url: '/contact', enabled: true },
      whatsappCta: { label: 'WhatsApp', url: 'https://wa.me/919876543210', enabled: true },
    },
    socialLinksList: [
      { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/qimdinstitute', active: true, icon: 'mdi:instagram', alignment: 'RIGHT' },
      { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/qimdinstitute', active: true, icon: 'ri:facebook-fill', alignment: 'RIGHT' },
      { platform: 'youtube', label: 'YouTube', url: 'https://youtube.com/@qimdinstitute', active: true, icon: 'mdi:youtube', alignment: 'RIGHT' },
      { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/qimdinstitute', active: true, icon: 'ri:linkedin-fill', alignment: 'RIGHT' },
      { platform: 'twitter', label: 'Twitter / X', url: 'https://twitter.com/qimdinstitute', active: true, icon: 'line-md:twitter-x-alt', alignment: 'RIGHT' },
    ],
    headerNavigation: [
      { label: 'Home', url: '/', active: true },
      { label: 'Courses', url: '/courses', active: true },
      { label: 'About Us', url: '/about', active: true },
      { label: 'Why QIMD?', url: '/why-qimd', active: true },
      { label: 'Blogs', url: '/blog', active: true },
      { label: 'Career', url: '/careers', active: true },
      { label: 'Contact Us', url: '/contact', active: true },
    ],
  })

  // Footer State
  const [footerState, setFooterState] = useState<any>({
    footerLogo: '/images/logo/qimd-logo.png',
    footerDescription: "India's premier AI-Powered Marketing & Design Institute offering practical agency-level training.",
    address: 'Office 301, Hinjewadi Phase 1, Near IT Park, Pune - 411057',
    phone: '+91 91300 00000',
    email: 'info@qimd.in',
    copyrightText: '© 2026 QIMD Institute. All Rights Reserved.',
    quickLinks: [
      { label: 'About Us', url: '/about', active: true },
      { label: 'Courses', url: '/courses', active: true },
      { label: 'Placements', url: '/placements', active: true },
      { label: 'Contact Us', url: '/contact', active: true },
    ],
    importantLinks: [
      { label: 'Privacy Policy', url: '/privacy-policy', active: true },
      { label: 'Terms & Conditions', url: '/terms-and-conditions', active: true },
      { label: 'Refund Policy', url: '/refund-policy', active: true },
      { label: 'Sitemap', url: '/sitemap', active: true },
    ],
    courseLinks: [
      { label: 'AI Digital Marketing', url: '/courses', active: true },
      { label: 'AI Graphic Design', url: '/courses', active: true },
      { label: 'AI Video Editing', url: '/courses', active: true },
    ],
  })

  // Load page layout data
  useEffect(() => {
    loadPageData(selectedPageKey)
  }, [selectedPageKey])

  const loadPageData = async (pageKey: string) => {
    setLoading(true)
    try {
      if (pageKey === 'HEADER' || pageKey === 'FOOTER') {
        const res = await getHeaderSettingsAction()
        if (res.success && res.settings) {
          const dbPhone = res.settings.contactPhone || '+91 91300 00000'
          const dbEmail = res.settings.contactEmail || 'info@qimd.in'
          const dbWhatsapp = res.settings.whatsappNumber || '+919130000000'
          const hp = res.settings.homepageSections as any

          let topBarItemsList = hp?.topBarItems || [
            { id: 'phone', label: 'Top Phone Number', value: dbPhone, icon: 'ion:call-outline', active: true, alignment: 'LEFT' },
            { id: 'email', label: 'Top Email Address', value: dbEmail, icon: 'ion:mail-outline', active: true, alignment: 'LEFT' },
            { id: 'hireFromUs', label: '"Hire From Us" CTA Button', value: '/hire-from-us', icon: 'ion:briefcase-outline', active: true, alignment: 'RIGHT' },
          ]

          topBarItemsList = topBarItemsList.map((item: any) => ({
            ...item,
            value: item.id === 'phone' ? dbPhone : item.id === 'email' ? dbEmail : item.value,
          }))

          setHeaderState((prev: any) => ({
            ...prev,
            phone: dbPhone,
            email: dbEmail,
            whatsappNumber: dbWhatsapp,
            topBarItems: topBarItemsList,
            headerNavigation: hp?.headerData || prev.headerNavigation,
            topBarConfig: hp?.topBarConfig || prev.topBarConfig,
            mainHeaderConfig: hp?.mainHeaderConfig || prev.mainHeaderConfig,
            socialLinksList: hp?.socialLinksList || prev.socialLinksList,
          }))

          if (res.settings.footerContent) {
            setFooterState((prev: any) => ({ ...prev, ...(res.settings.footerContent as any) }))
          }
        }
      } else {
        const pageRes = await getWebsitePagesAction()
        if (pageRes.success && pageRes.pages) {
          setPages(pageRes.pages)
        }

        const secRes = await getWebsitePageSectionsAction(pageKey)
        if (secRes.success) {
          setCurrentPage(secRes.webPage || null)
          setSections(secRes.sections || [])
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load page content')
    } finally {
      setLoading(false)
    }
  }

  // Refresh live canvas view
  const triggerCanvasRefresh = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('websiteSettingsUpdated'))
    }
    setIframeKey((prev) => prev + 1)
  }

  // Save Header and refresh canvas
  const saveHeaderAndSync = async (updatedHeaderState: any) => {
    setHeaderState(updatedHeaderState)
    const res = await saveHeaderSettingsAction(updatedHeaderState)
    if (res.success) {
      toast.success('Website canvas updated!')
      triggerCanvasRefresh()
    } else {
      toast.error(res.error || 'Failed to update header')
    }
  }

  // Save Footer and refresh canvas
  const saveFooterAndSync = async (updatedFooterState: any) => {
    setFooterState(updatedFooterState)
    const res = await saveFooterSettingsAction(updatedFooterState)
    if (res.success) {
      toast.success('Website canvas updated!')
      triggerCanvasRefresh()
    } else {
      toast.error(res.error || 'Failed to update footer')
    }
  }

  // Handle Section Toggle Active
  const handleToggleActive = async (secId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    setSections((prev) => prev.map((s) => (s.id === secId ? { ...s, isActive: newStatus } : s)))
    const res = await toggleSectionActiveAction(secId, newStatus)
    if (res.success) {
      toast.success(res.message || 'Status updated')
      triggerCanvasRefresh()
    } else {
      toast.error(res.error || 'Failed to update section')
    }
  }

  // Handle Reorder Up / Down for Sections
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    const updated = [...sections]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp

    const reordered = updated.map((item, idx) => ({ ...item, displayOrder: idx + 1 }))
    setSections(reordered)

    const payload = reordered.map((r) => ({ id: r.id, displayOrder: r.displayOrder }))
    const res = await reorderPageSectionsAction(payload)
    if (res.success) {
      toast.success('Section order saved!')
      triggerCanvasRefresh()
    } else {
      toast.error(res.error || 'Failed to reorder sections')
    }
  }

  // Top Bar Item Move
  const handleMoveTopBarItem = async (index: number, direction: 'up' | 'down') => {
    const items = [...(headerState.topBarItems || [])]
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return
    const target = direction === 'up' ? index - 1 : index + 1
    const temp = items[index]
    items[index] = items[target]
    items[target] = temp
    const nextState = { ...headerState, topBarItems: items }
    await saveHeaderAndSync(nextState)
  }

  // Menu Link Move
  const handleMoveMenuLink = async (index: number, direction: 'up' | 'down') => {
    const nav = [...(headerState.headerNavigation || [])]
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === nav.length - 1)) return
    const target = direction === 'up' ? index - 1 : index + 1
    const temp = nav[index]
    nav[index] = nav[target]
    nav[target] = temp
    const nextState = { ...headerState, headerNavigation: nav }
    await saveHeaderAndSync(nextState)
  }

  // Social Link Move
  const handleMoveSocialLink = async (index: number, direction: 'up' | 'down') => {
    const list = [...(headerState.socialLinksList || [])]
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === list.length - 1)) return
    const target = direction === 'up' ? index - 1 : index + 1
    const temp = list[index]
    list[index] = list[target]
    list[target] = temp
    const nextState = { ...headerState, socialLinksList: list }
    await saveHeaderAndSync(nextState)
  }

  // Footer Link Moves
  const handleMoveFooterQuickLink = async (index: number, direction: 'up' | 'down') => {
    const list = [...(footerState.quickLinks || [])]
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === list.length - 1)) return
    const target = direction === 'up' ? index - 1 : index + 1
    const temp = list[index]
    list[index] = list[target]
    list[target] = temp
    const nextState = { ...footerState, quickLinks: list }
    await saveFooterAndSync(nextState)
  }

  const handleMoveFooterImportantLink = async (index: number, direction: 'up' | 'down') => {
    const list = [...(footerState.importantLinks || [])]
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === list.length - 1)) return
    const target = direction === 'up' ? index - 1 : index + 1
    const temp = list[index]
    list[index] = list[target]
    list[target] = temp
    const nextState = { ...footerState, importantLinks: list }
    await saveFooterAndSync(nextState)
  }

  // Duplicate Section
  const handleDuplicate = async (secId: string) => {
    const res = await duplicatePageSectionAction(secId)
    if (res.success) {
      toast.success('Section duplicated!')
      loadPageData(selectedPageKey)
      triggerCanvasRefresh()
    } else {
      toast.error(res.error || 'Failed to duplicate section')
    }
  }

  // Delete Section
  const handleDeleteConfirm = async () => {
    if (!deletingSectionId) return
    const res = await deletePageSectionAction(deletingSectionId)
    if (res.success) {
      toast.success(res.message || 'Section deleted successfully')
      setSections((prev) => prev.filter((s) => s.id !== deletingSectionId))
      triggerCanvasRefresh()
    } else {
      toast.error(res.error || 'Failed to delete section')
    }
    setDeleteConfirmModalOpen(false)
    setDeletingSectionId(null)
  }

  // Add Section from catalog
  const handleAddSectionFromCatalog = async (secType: string, secName: string) => {
    setAddSectionModalOpen(false)
    const newOrder = sections.length + 1
    const payload: PageSectionInput = {
      pageKey: selectedPageKey,
      sectionKey: `${secType}_${Date.now().toString().slice(-4)}`,
      sectionType: secType,
      sectionTitle: secName,
      displayOrder: newOrder,
      isActive: true,
      status: 'PUBLISHED',
      extraData: {},
    }
    const res = await savePageSectionAction(payload)
    if (res.success && res.section) {
      toast.success('Section added to page layout!')
      loadPageData(selectedPageKey)
      triggerCanvasRefresh()
    } else {
      toast.error(res.error || 'Failed to add section')
    }
  }

  // Target website URL for live preview iframe
  const getCanvasTargetUrl = () => {
    switch (selectedPageKey) {
      case 'ABOUT': return '/about'
      case 'COURSES': return '/courses'
      case 'WHY_QIMD': return '/why-qimd'
      case 'BLOGS': return '/blog'
      case 'CAREER': return '/careers'
      case 'CONTACT': return '/contact'
      case 'PRIVACY_POLICY': return '/privacy-policy'
      case 'TERMS': return '/terms-and-conditions'
      case 'REFUND_POLICY': return '/refund-policy'
      case 'ADMISSION': return '/courses'
      case 'SITEMAP': return '/sitemap'
      default: return '/'
    }
  }

  return (
    <div className="space-y-4 font-sans bg-slate-50 min-h-screen pb-16">
      {/* MINIMAL LIGHT CONTROL BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Icon icon="ion:easel-outline" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Website Canvas Builder</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Interactive
              </span>
            </h1>
            <p className="text-xs text-slate-500">Edit layout directly on the live website canvas below.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-64">
            <select
              value={selectedPageKey}
              onChange={(e) => setSelectedPageKey(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
            >
              {PAGE_CATEGORIES.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.pages.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                devicePreview === 'desktop' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon icon="ion:desktop-outline" className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                devicePreview === 'mobile' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon icon="ion:phone-portrait-outline" className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>

          <button
            onClick={triggerCanvasRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-2xs"
          >
            <Icon icon="ion:checkmark-done-circle-outline" className="w-4 h-4" />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* 100% PURE VISUAL WEBSITE CANVAS WORKSPACE (MATCHING THE 2ND SCREENSHOT) */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <Icon icon="line-md:loading-twotone-loop" className="w-8 h-8 mx-auto text-blue-600" />
          <p className="text-sm font-medium">Loading Live Website Canvas...</p>
        </div>
      ) : selectedPageKey === 'HEADER' ? (
        /* ISOLATED DIRECT INTERACTIVE HEADER CANVAS */
        <div className="space-y-3">
          {/* Subtle On-Canvas Direct Header Controls Toolbar */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-700">
              <Icon icon="ion:menu-outline" className="w-4 h-4 text-blue-600" />
              <span>Header Canvas Items (Click arrows to reorder directly on live header):</span>
            </div>

            {/* Quick Reorder Pills for Top Contact Elements */}
            <div className="flex flex-wrap items-center gap-2">
              {(headerState.topBarItems || []).map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-slate-800 text-[11px] font-bold">
                  <button
                    onClick={() => handleMoveTopBarItem(idx, 'up')}
                    disabled={idx === 0}
                    title="Move Left"
                    className="p-0.5 hover:text-blue-600 disabled:opacity-30"
                  >
                    <Icon icon="ion:chevron-back-outline" className="w-3 h-3" />
                  </button>
                  <span>{item.label}</span>
                  <button
                    onClick={() => handleMoveTopBarItem(idx, 'down')}
                    disabled={idx === (headerState.topBarItems?.length || 0) - 1}
                    title="Move Right"
                    className="p-0.5 hover:text-blue-600 disabled:opacity-30"
                  >
                    <Icon icon="ion:chevron-forward-outline" className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      const updated = [...headerState.topBarItems]
                      updated[idx].alignment = updated[idx].alignment === 'RIGHT' ? 'LEFT' : 'RIGHT'
                      saveHeaderAndSync({ ...headerState, topBarItems: updated })
                    }}
                    className={`ml-1 px-1.5 py-0.2 rounded text-[9px] font-black ${
                      item.alignment === 'RIGHT' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.alignment === 'RIGHT' ? 'R' : 'L'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Public Website Header Frame */}
          <div className="bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex justify-center p-2">
            <iframe
              key={iframeKey}
              src="/"
              className={`transition-all duration-300 bg-white rounded-xl border border-slate-200 ${
                devicePreview === 'mobile' ? 'w-[375px] h-[550px]' : 'w-full h-[600px]'
              }`}
              title="Live Website Header Canvas"
            />
          </div>
        </div>
      ) : selectedPageKey === 'FOOTER' ? (
        /* ISOLATED DIRECT INTERACTIVE FOOTER CANVAS */
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-700">
              <Icon icon="ion:subway-outline" className="w-4 h-4 text-blue-600" />
              <span>Footer Canvas Items:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(footerState.quickLinks || []).map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg flex items-center gap-1 text-[11px]">
                  <button onClick={() => handleMoveFooterQuickLink(idx, 'up')} disabled={idx === 0} className="hover:text-blue-600 disabled:opacity-30">
                    <Icon icon="ion:chevron-back-outline" className="w-3 h-3" />
                  </button>
                  <span>{item.label}</span>
                  <button onClick={() => handleMoveFooterQuickLink(idx, 'down')} disabled={idx === (footerState.quickLinks?.length || 0) - 1} className="hover:text-blue-600 disabled:opacity-30">
                    <Icon icon="ion:chevron-forward-outline" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex justify-center p-2">
            <iframe
              key={iframeKey}
              src="/"
              className={`transition-all duration-300 bg-white rounded-xl border border-slate-200 ${
                devicePreview === 'mobile' ? 'w-[375px] h-[550px]' : 'w-full h-[600px]'
              }`}
              title="Live Website Footer Canvas"
            />
          </div>
        </div>
      ) : (
        /* 100% PURE LIVE PUBLIC WEBSITE CANVAS (EXACT 2ND SCREENSHOT LOOK) */
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-700">
              <Icon icon="ion:layers-outline" className="w-4 h-4 text-blue-600" />
              <span>Page Sections Canvas ({sections.length} sections):</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAddSectionModalOpen(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-2xs"
              >
                + Add Section
              </button>
              {sections.map((sec, idx) => (
                <div key={sec.id} className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-slate-800 text-[11px] font-bold">
                  <button onClick={() => handleMoveSection(idx, 'up')} disabled={idx === 0} className="hover:text-blue-600 disabled:opacity-30">
                    <Icon icon="ion:chevron-back-outline" className="w-3 h-3" />
                  </button>
                  <span>{sec.sectionTitle || sec.sectionKey}</span>
                  <button onClick={() => handleMoveSection(idx, 'down')} disabled={idx === sections.length - 1} className="hover:text-blue-600 disabled:opacity-30">
                    <Icon icon="ion:chevron-forward-outline" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exact 2nd Screenshot Clean Live Public Website Canvas Frame */}
          <div className="bg-white border border-slate-300 rounded-3xl shadow-xl overflow-hidden min-h-[750px] flex justify-center p-2">
            <iframe
              key={iframeKey}
              src={getCanvasTargetUrl()}
              className={`transition-all duration-300 bg-white rounded-2xl border border-slate-200 ${
                devicePreview === 'mobile' ? 'w-[375px] h-[750px]' : 'w-full h-[780px]'
              }`}
              title="Live Public Website Canvas"
            />
          </div>
        </div>
      )}

      {/* ADD SECTION CATALOG MODAL */}
      {addSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add New Website Section</h3>
                <p className="text-xs text-slate-500">Choose a section type to insert into {selectedPageKey} page layout</p>
              </div>
              <button onClick={() => setAddSectionModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-800">
                <Icon icon="ion:close-outline" className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SECTION_TYPE_CATALOG.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleAddSectionFromCatalog(item.type, item.name)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all group flex items-start gap-3.5 shadow-2xs hover:shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon icon={item.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Icon icon="ion:warning-outline" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Delete Section?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will remove the section from the active page layout.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteConfirmModalOpen(false)
                  setDeletingSectionId(null)
                }}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700"
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
