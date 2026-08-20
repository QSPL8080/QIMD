'use client'

import React, { useState, useEffect } from 'react'
import { updateWebsiteSettingsAction } from '@/app/actions/cmsActions'
import { deleteUnusedImageAction } from '@/app/actions/mediaActions'
import { Icon } from '@iconify/react'
import Link from 'next/link'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [faviconUrl, setFaviconUrl] = useState('')
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
        setFaviconUrl(data.settings.favicon || '')
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFavicon(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.url) {
        const prev = faviconUrl
        setFaviconUrl(data.url)
        
        // Auto-save setting to DB immediately
        const payload = {
          ...settings,
          favicon: data.url,
        }
        await updateWebsiteSettingsAction(payload)
        window.dispatchEvent(new Event('websiteSettingsUpdated'))

        if (prev && prev !== data.url && prev.startsWith('/uploads/')) {
          deleteUnusedImageAction(prev)
        }
      } else {
        alert(data.error || 'Failed to upload favicon')
      }
    } catch (err) {
      alert('Error uploading favicon file')
    } finally {
      setUploadingFavicon(false)
    }
  }

  const handleRemoveFavicon = async () => {
    if (!faviconUrl) return
    const toRemove = faviconUrl
    setFaviconUrl('')

    // Auto-save setting to DB immediately
    const payload = {
      ...settings,
      favicon: '',
    }
    await updateWebsiteSettingsAction(payload)
    window.dispatchEvent(new Event('websiteSettingsUpdated'))

    if (toRemove.startsWith('/uploads/')) {
      await deleteUnusedImageAction(toRemove)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const payload = {
      ...settings,
      websiteName: formData.get('websiteName') as string,
      googleMap: formData.get('googleMap') as string,
      googleAnalytics: formData.get('googleAnalytics') as string,
      searchConsole: formData.get('searchConsole') as string,
      robotsTxt: formData.get('robotsTxt') as string,
      sitemap: formData.get('sitemap') as string,
      favicon: faviconUrl,
      theme: 'LIGHT',
    }

    const res = await updateWebsiteSettingsAction(payload)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Global technical settings updated successfully' })
      fetchSettings()
      // Dispatch event to sync state across the app
      window.dispatchEvent(new Event('websiteSettingsUpdated'))
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to update settings' })
    }
  }

  return (
    <div className="space-y-6 w-full font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:settings-outline" className="w-6 h-6 text-slate-700" />
            Website Settings — Global & Technical
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage global website name, Google Maps embed, Google Analytics, Search Console, & Robots.txt.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* INFORMATIONAL CALLOUT */}
      <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
          <Icon icon="ion:information-circle-outline" className="w-5 h-5 text-blue-600" />
          Dedicated Header, Footer, and Social Links Management
        </div>
        <p className="text-blue-800 leading-relaxed">
          Header branding, top bar contacts, and CTAs are managed under <Link href="/admin/header" className="font-bold underline">Header CMS</Link>. Footer logo, institute address, contacts, & columns are managed under <Link href="/admin/footer" className="font-bold underline">Footer CMS</Link>. Social media URLs are managed under <Link href="/admin/social-links" className="font-bold underline">Social Links CMS</Link>.
        </p>
      </div>

      {/* TECHNICAL SETTINGS FORM */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading website settings...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Website Name</label>
                <input
                  type="text"
                  name="websiteName"
                  defaultValue={settings?.websiteName || 'QIMD - Quickup Institute of Marketing & Design'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Website Favicon (.ico or .png)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden px-3 py-2 h-[40px]">
                    {faviconUrl ? (
                      <div className="flex items-center gap-2 w-full justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img src={faviconUrl} alt="Favicon" className="w-5 h-5 object-contain flex-shrink-0" />
                          <span className="text-[11px] text-slate-600 truncate font-mono">{faviconUrl.substring(faviconUrl.lastIndexOf('/') + 1)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFavicon}
                          className="text-rose-500 hover:text-rose-600 p-1 flex-shrink-0"
                          title="Remove Favicon"
                        >
                          <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-full text-slate-400">
                        <Icon icon="mdi:image-outline" className="w-5 h-5 flex-shrink-0" />
                        <span className="text-[11px]">No Favicon Uploaded</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept=".ico,.png,.jpg,.jpeg"
                    onChange={handleFaviconUpload}
                    disabled={uploadingFavicon}
                    className="hidden"
                    id="favicon-upload-input"
                  />
                  <label
                    htmlFor="favicon-upload-input"
                    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer transition-colors text-xs flex-shrink-0 h-[40px] ${
                      uploadingFavicon ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {uploadingFavicon ? (
                      <>
                        <Icon icon="mdi:loading" className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:upload" className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Google Maps Location Embed URL</label>
              <input
                type="text"
                name="googleMap"
                defaultValue={settings?.googleMap || ''}
                placeholder="https://maps.google.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Google Analytics ID</label>
                <input
                  type="text"
                  name="googleAnalytics"
                  defaultValue={settings?.googleAnalytics || ''}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Google Search Console Verification Code</label>
                <input
                  type="text"
                  name="searchConsole"
                  defaultValue={settings?.searchConsole || ''}
                  placeholder="verification_token_string"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Robots.txt Custom Rules</label>
                <textarea
                  name="robotsTxt"
                  rows={4}
                  defaultValue={settings?.robotsTxt || 'User-agent: *\nAllow: /\nSitemap: https://qimd.in/sitemap.xml'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5 text-xs">Sitemap Configuration URL</label>
                <input
                  type="text"
                  name="sitemap"
                  defaultValue={settings?.sitemap || 'https://qimd.in/sitemap.xml'}
                  placeholder="https://qimd.in/sitemap.xml"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Save Technical Settings
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
