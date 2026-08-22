'use client'

import React, { useState, useEffect } from 'react'
import { updateSocialLinksAction } from '@/app/actions/cmsActions'
import { Icon } from '@iconify/react'
import { siteConfig } from '@/data'

interface SocialLinksState {
  instagram: string
  facebook: string
  linkedin: string
  youtube: string
  twitter: string
  whatsapp: string
}

interface ActiveStatusState {
  instagram: boolean
  facebook: boolean
  linkedin: boolean
  youtube: boolean
  twitter: boolean
  whatsapp: boolean
}

export interface CustomSocialLink {
  id: string
  name: string
  icon: string
  url: string
  active: boolean
  showHeader?: boolean
  showFooter?: boolean
}

interface PlacementState {
  instagram: boolean
  facebook: boolean
  linkedin: boolean
  youtube: boolean
  twitter: boolean
  whatsapp: boolean
}

const PRESET_CUSTOM_ICONS = [
  { label: 'Telegram', icon: 'logos:telegram' },
  { label: 'Threads', icon: 'simple-icons:threads' },
  { label: 'TikTok', icon: 'logos:tiktok-icon' },
  { label: 'Pinterest', icon: 'logos:pinterest' },
  { label: 'Discord', icon: 'logos:discord-icon' },
  { label: 'GitHub', icon: 'mdi:github' },
  { label: 'Behance', icon: 'simple-icons:behance' },
  { label: 'Dribbble', icon: 'simple-icons:dribbble' },
  { label: 'Snapchat', icon: 'simple-icons:snapchat' },
  { label: 'Website', icon: 'ion:link-outline' },
]

export default function AdminSocialLinksPage() {
  const customSectionRef = React.useRef<HTMLDivElement>(null)

  const [links, setLinks] = useState<SocialLinksState>({
    instagram: siteConfig.socialLinks.instagram,
    facebook: siteConfig.socialLinks.facebook,
    linkedin: siteConfig.socialLinks.linkedin,
    youtube: siteConfig.socialLinks.youtube,
    twitter: siteConfig.socialLinks.twitter,
    whatsapp: siteConfig.socialLinks.whatsapp,
  })

  const [activeStatus, setActiveStatus] = useState<ActiveStatusState>({
    instagram: true,
    facebook: true,
    linkedin: true,
    youtube: true,
    twitter: true,
    whatsapp: true,
  })

  const [headerStatus, setHeaderStatus] = useState<PlacementState>({
    instagram: true,
    facebook: true,
    linkedin: true,
    youtube: true,
    twitter: true,
    whatsapp: true,
  })

  const [footerStatus, setFooterStatus] = useState<PlacementState>({
    instagram: true,
    facebook: true,
    linkedin: true,
    youtube: true,
    twitter: true,
    whatsapp: true,
  })

  const [customLinks, setCustomLinks] = useState<CustomSocialLink[]>([])
  const [selectedCustomIds, setSelectedCustomIds] = useState<string[]>([])
  const [bulkCustomModal, setBulkCustomModal] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings?.socialLinks) {
        const savedLinks = data.settings.socialLinks
        setLinks((prev) => ({
          ...prev,
          instagram: savedLinks.instagram ?? prev.instagram,
          facebook: savedLinks.facebook ?? prev.facebook,
          linkedin: savedLinks.linkedin ?? prev.linkedin,
          youtube: savedLinks.youtube ?? prev.youtube,
          twitter: savedLinks.twitter ?? prev.twitter,
          whatsapp: savedLinks.whatsapp ?? prev.whatsapp,
        }))
        if (savedLinks.activeStatus) {
          setActiveStatus((prev) => ({
            ...prev,
            ...savedLinks.activeStatus,
          }))
        }
        if (savedLinks.headerStatus) {
          setHeaderStatus((prev) => ({
            ...prev,
            ...savedLinks.headerStatus,
          }))
        }
        if (savedLinks.footerStatus) {
          setFooterStatus((prev) => ({
            ...prev,
            ...savedLinks.footerStatus,
          }))
        }
        if (Array.isArray(savedLinks.customLinks)) {
          setCustomLinks(savedLinks.customLinks)
        }
      }
    } catch (err) {
      console.error('Failed to fetch social links settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const toggleSelectCustomId = (id: string) => {
    setSelectedCustomIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAllCustom = () => {
    if (selectedCustomIds.length === customLinks.length && customLinks.length > 0) {
      setSelectedCustomIds([])
    } else {
      setSelectedCustomIds(customLinks.map((item) => item.id))
    }
  }

  const handleBulkDeleteCustomLinks = () => {
    setCustomLinks((prev) => prev.filter((item) => !selectedCustomIds.includes(item.id)))
    setSelectedCustomIds([])
    setBulkCustomModal(false)
    setStatusMsg({ type: 'success', text: `${selectedCustomIds.length} custom social links removed. Click 'Save All Social Links' to persist.` })
  }

  const handleChange = (field: keyof SocialLinksState, value: string) => {
    setLinks((prev) => ({ ...prev, [field]: value }))
  }

  const toggleStatus = (field: keyof ActiveStatusState) => {
    setActiveStatus((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const toggleHeaderPlacement = (field: keyof PlacementState) => {
    setHeaderStatus((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const toggleFooterPlacement = (field: keyof PlacementState) => {
    setFooterStatus((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleAddCustomLink = (preset?: { label: string; icon: string }) => {
    const newLink: CustomSocialLink = {
      id: Date.now().toString(),
      name: preset ? preset.label : 'New Social Platform',
      icon: preset ? preset.icon : 'ion:share-social-outline',
      url: '',
      active: false,
      showHeader: true,
      showFooter: true,
    }
    setCustomLinks((prev) => [...prev, newLink])
    setTimeout(() => {
      if (customSectionRef.current) {
        customSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  const handleUpdateCustomLink = (index: number, key: keyof CustomSocialLink, val: any) => {
    setCustomLinks((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: val }
      return updated
    })
  }

  const handleDeleteCustomLink = (id: string) => {
    setCustomLinks((prev) => prev.filter((item) => item.id !== id))
    setSelectedCustomIds((prev) => prev.filter((x) => x !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMsg(null)

    const payload = {
      ...links,
      activeStatus,
      headerStatus,
      footerStatus,
      customLinks,
    }

    const res = await updateSocialLinksAction(payload)
    setSaving(false)

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Social links updated successfully!' })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('websiteSettingsUpdated'))
      }
      fetchSettings()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to update social links' })
    }
  }

  const socialPlatforms = [
    {
      id: 'instagram' as const,
      name: 'Instagram Profile',
      icon: 'mdi:instagram',
      brandClass: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
      placeholder: 'https://instagram.com/qimdinstitute',
      description: 'Official Instagram profile page URL.',
      locations: ['Header Topbar', 'Mobile Sidebar', 'Footer'],
    },
    {
      id: 'facebook' as const,
      name: 'Facebook Page',
      icon: 'ri:facebook-fill',
      brandClass: 'bg-[#1877F2] text-white',
      placeholder: 'https://facebook.com/qimdinstitute',
      description: 'Official Facebook page link for social media marketing.',
      locations: ['Header Topbar', 'Mobile Sidebar', 'Footer'],
    },
    {
      id: 'linkedin' as const,
      name: 'LinkedIn Company Page',
      icon: 'ri:linkedin-fill',
      brandClass: 'bg-[#0A66C2] text-white',
      placeholder: 'https://linkedin.com/company/qimdinstitute',
      description: 'Professional company page URL for student placements.',
      locations: ['Header Topbar', 'Mobile Sidebar', 'Footer'],
    },
    {
      id: 'youtube' as const,
      name: 'YouTube Channel',
      icon: 'mdi:youtube',
      brandClass: 'bg-[#FF0000] text-white',
      placeholder: 'https://youtube.com/@qimdinstitute',
      description: 'YouTube channel URL for student reviews and course demos.',
      locations: ['Header Topbar', 'Mobile Sidebar', 'Footer'],
    },
    {
      id: 'twitter' as const,
      name: 'Twitter (X) Profile',
      icon: 'ri:twitter-x-fill',
      brandClass: 'bg-black text-white',
      placeholder: 'https://twitter.com/qimdinstitute',
      description: 'Twitter / X profile URL for official institute announcements.',
      locations: ['Header Topbar', 'Mobile Sidebar', 'Footer'],
    },
    {
      id: 'whatsapp' as const,
      name: 'WhatsApp Business Chat',
      icon: 'mdi:whatsapp',
      brandClass: 'bg-[#25D366] text-white',
      placeholder: 'https://wa.me/910000000000',
      description: 'Direct WhatsApp contact chat link and floating button.',
      locations: ['Floating Button', 'Mobile Sidebar', 'Header CTA'],
    },
  ]

  const activeCustomLinks = customLinks.filter((item) => item.active)
  const inactiveCustomLinks = customLinks.filter((item) => !item.active)

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Header Banner */}
      <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
            <Icon icon="ion:share-social" className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Social Media Links Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Edit URLs below and click the <strong className="text-slate-700 font-semibold">Active / Inactive</strong> button to toggle link visibility live.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleAddCustomLink()}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Icon icon="ion:add-circle-outline" className="w-5 h-5" />
            <span>+ Add New Social Link</span>
          </button>
          <button
            type="button"
            onClick={fetchSettings}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-2 border border-slate-200"
          >
            <Icon icon="ion:refresh-outline" className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {statusMsg && (
        <div
          className={`w-full p-4 rounded-2xl text-sm font-medium border flex items-center justify-between shadow-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon
              icon={statusMsg.type === 'success' ? 'ion:checkmark-circle' : 'ion:alert-circle'}
              className="w-5 h-5 flex-shrink-0 text-lg"
            />
            <span className="text-sm font-semibold">{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600 p-1">
            <Icon icon="ion:close" className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Settings Form - Full Width 2 Column Grid */}
      {loading ? (
        <div className="w-full bg-white border border-slate-200 p-16 rounded-2xl text-center text-slate-500 text-sm shadow-xs">
          <Icon icon="ion:sync" className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
          <p className="font-semibold text-slate-700 text-base">Loading social media profiles...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* SOCIAL MEDIA CARDS FRAME */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Icon icon="ion:checkmark-done-circle" className="w-4.5 h-4.5 text-blue-600" />
                Social Media Links Management ({socialPlatforms.length + customLinks.length} Total Platforms)
              </h2>
              <span className="text-xs text-slate-500 font-semibold">
                {socialPlatforms.filter(p => activeStatus[p.id] !== false).length + customLinks.filter(c => c.active !== false).length} Active Platforms
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
              {/* Standard Social Platforms */}
              {socialPlatforms.map((platform) => {
                const currentUrl = links[platform.id] || ''
                const isActive = activeStatus[platform.id] ?? true
                const isHeader = headerStatus[platform.id] ?? true
                const isFooter = footerStatus[platform.id] ?? true
                const hasUrl = Boolean(currentUrl && currentUrl.trim().length > 0)

                return (
                  <div
                    key={platform.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between space-y-4 ${
                      isActive ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-70 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl ${platform.brandClass} flex items-center justify-center flex-shrink-0 shadow-2xs`}
                        >
                          <Icon icon={platform.icon} className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-tight">
                            {platform.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-normal">
                            {platform.description}
                          </p>
                        </div>
                      </div>

                      {/* Clickable Active / Inactive Button - Stays in Place */}
                      <button
                        type="button"
                        onClick={() => toggleStatus(platform.id)}
                        className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-full border shrink-0 flex items-center gap-1.5 font-bold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{isActive ? 'Active' : 'Inactive'}</span>
                        <Icon
                          icon={isActive ? 'ion:checkmark-circle' : 'ion:pause-circle'}
                          className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                        />
                      </button>
                    </div>

                    {/* Editable Link Input */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                          <Icon icon="ion:create-outline" className="w-3.5 h-3.5 text-blue-600" />
                          Link Profile URL:
                        </label>

                        <div className="flex items-center gap-2.5 w-full">
                          <div className="relative flex-1 min-w-0">
                            <input
                              type="url"
                              value={currentUrl}
                              onChange={(e) => handleChange(platform.id, e.target.value)}
                              placeholder={platform.placeholder}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 font-mono transition-all duration-200"
                            />
                          </div>

                          {hasUrl ? (
                            <a
                              href={currentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white border border-slate-200 transition-all duration-200 flex items-center justify-center flex-shrink-0 shadow-2xs"
                            >
                              <Icon icon="ion:open-outline" className="w-4.5 h-4.5" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="p-2 rounded-xl bg-slate-50 text-slate-300 border border-slate-200 cursor-not-allowed flex items-center justify-center flex-shrink-0"
                            >
                              <Icon icon="ion:open-outline" className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Display Location Selector Checkboxes */}
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-3">
                        <span className="font-semibold text-slate-700">Display Locations:</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isHeader}
                              onChange={() => toggleHeaderPlacement(platform.id)}
                              className="rounded text-blue-600 w-3.5 h-3.5"
                            />
                            <span className="font-medium text-slate-800">Header Topbar</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isFooter}
                              onChange={() => toggleFooterPlacement(platform.id)}
                              className="rounded text-blue-600 w-3.5 h-3.5"
                            />
                            <span className="font-medium text-slate-800">Footer</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Custom Social Link Cards */}
              {customLinks.length > 0 && (
                <div className="col-span-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCustomIds.length === customLinks.length && customLinks.length > 0}
                      onChange={toggleSelectAllCustom}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {selectedCustomIds.length > 0
                        ? `${selectedCustomIds.length} of ${customLinks.length} custom links selected`
                        : `Select all custom links (${customLinks.length})`}
                    </span>
                  </div>

                  {selectedCustomIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setBulkCustomModal(true)}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Icon icon="ion:trash-bin-outline" className="w-3.5 h-3.5" />
                      Delete Selected ({selectedCustomIds.length})
                    </button>
                  )}
                </div>
              )}

              {customLinks.map((item, idx) => {
                const isActive = item.active !== false
                const isHeader = item.showHeader !== false
                const isFooter = item.showFooter !== false

                return (
                  <div
                    key={item.id || idx}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between space-y-4 ${
                      selectedCustomIds.includes(item.id)
                        ? 'border-indigo-500 bg-indigo-50/20'
                        : isActive
                        ? 'border-blue-200 hover:border-blue-300'
                        : 'border-slate-200 opacity-70 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedCustomIds.includes(item.id)}
                          onChange={() => toggleSelectCustomId(item.id)}
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <Icon icon={item.icon || 'ion:share-social'} className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateCustomLink(idx, 'name', e.target.value)}
                            placeholder="Platform Name (e.g. Telegram)"
                            className="font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 w-full"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateCustomLink(idx, 'active', !isActive)}
                          className={`text-xs px-3 py-1 rounded-full border shrink-0 flex items-center gap-1 font-bold transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCustomLink(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Custom Social Link"
                        >
                          <Icon icon="ion:trash-outline" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Iconify Icon Name</label>
                          <input
                            type="text"
                            value={item.icon}
                            onChange={(e) => handleUpdateCustomLink(idx, 'icon', e.target.value)}
                            placeholder="logos:telegram"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Profile Link URL</label>
                          <input
                            type="url"
                            value={item.url}
                            onChange={(e) => handleUpdateCustomLink(idx, 'url', e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 text-xs"
                          />
                        </div>
                      </div>

                      {/* Display Location Checkboxes for Custom Link */}
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-3">
                        <span className="font-semibold text-slate-700">Display Locations:</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isHeader}
                              onChange={(e) => handleUpdateCustomLink(idx, 'showHeader', e.target.checked)}
                              className="rounded text-blue-600 w-3.5 h-3.5"
                            />
                            <span className="font-medium text-slate-800">Header Topbar</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isFooter}
                              onChange={(e) => handleUpdateCustomLink(idx, 'showFooter', e.target.checked)}
                              className="rounded text-blue-600 w-3.5 h-3.5"
                            />
                            <span className="font-medium text-slate-800">Footer</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* QUICK ADD PRESETS BAR */}
          <div ref={customSectionRef} id="custom-social-links-section" className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Icon icon="ion:add-circle-outline" className="w-4 h-4 text-blue-600" />
                Quick Add Custom Social Network Presets:
              </h3>
              <button
                type="button"
                onClick={() => handleAddCustomLink()}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Icon icon="ion:add" className="w-4 h-4" />
                <span>+ Custom Platform</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_CUSTOM_ICONS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleAddCustomLink(preset)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon icon={preset.icon} className="w-4 h-4" />
                  <span>+ {preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save Action Bar */}
          <div className="w-full bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span>
                Saved social links and active statuses automatically sync across the entire site.
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0"
            >
              {saving ? (
                <>
                  <Icon icon="ion:sync" className="w-4.5 h-4.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icon icon="ion:save" className="w-4.5 h-4.5" />
                  <span>Save All Social Links</span>
                </>
              )}
            </button>
      </div>
    </form>
  )}

  {/* Bulk Delete Custom Social Links Modal */}
      {bulkCustomModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Icon icon="ion:alert-circle" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Delete {selectedCustomIds.length} custom social links?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                These selected custom links will be removed from your social links list.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBulkCustomModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteCustomLinks}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
