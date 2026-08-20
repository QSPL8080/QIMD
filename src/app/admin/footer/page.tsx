'use client'

import React, { useState, useEffect } from 'react'
import {
  getFooterCMSData,
  updateFooterSettingsAction,
  saveFooterContactItemAction,
  deleteFooterContactItemAction,
  saveFooterColumnAction,
  deleteFooterColumnAction,
  reorderFooterColumnsAction,
  saveFooterColumnLinkAction,
  deleteFooterColumnLinkAction,
  reorderFooterColumnLinksAction,
} from '@/app/actions/footerActions'
import { Icon } from '@iconify/react'
import Link from 'next/link'

export default function AdminFooterCMSPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Footer Settings
  const [settings, setSettings] = useState<any>({
    logo: '/images/logo/qimd-logo-white.png',
    logoAltText: 'QIMD Footer Logo',
    logoLink: '/',
    logoActive: true,
    addressLabel: 'Physical Institute Address',
    fullAddress: 'Office 301, Hinjewadi Phase 1, Near IT Park, Pune - 411057',
    googleMapsUrl: 'https://maps.google.com',
    addressActive: true,
  })

  // Contacts
  const [phones, setPhones] = useState<any[]>([])
  const [emails, setEmails] = useState<any[]>([])

  // Dynamic Columns with Links
  const [columns, setColumns] = useState<any[]>([])

  // Modal State for Contact Items
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [contactModalType, setContactModalType] = useState<'PHONE' | 'EMAIL'>('PHONE')
  const [editingContact, setEditingContact] = useState<any | null>(null)
  const [contactForm, setContactForm] = useState({ label: '', value: '', isActive: true })

  // Modal State for Column
  const [columnModalOpen, setColumnModalOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<any | null>(null)
  const [columnForm, setColumnForm] = useState({ title: '', description: '', icon: '', isActive: true })

  // Modal State for Column Link
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [targetColumnId, setTargetColumnId] = useState<string>('')
  const [editingLink, setEditingLink] = useState<any | null>(null)
  const [linkForm, setLinkForm] = useState({
    title: '',
    url: '',
    linkType: 'INTERNAL',
    openInNewTab: false,
    isActive: true,
  })

  // Delete Confirm Dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string
    title: string
    kind: 'CONTACT' | 'COLUMN' | 'LINK'
  } | null>(null)

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getFooterCMSData()
      if (res.success) {
        if (res.settings) setSettings(res.settings)
        if (res.phones) setPhones(res.phones)
        if (res.emails) setEmails(res.emails)
        if (res.columns) setColumns(res.columns)
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to fetch Footer CMS data' })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Save Settings Form
  const handleSaveSettings = async () => {
    setSaving(true)
    setStatusMsg(null)
    const res = await updateFooterSettingsAction(settings)
    setSaving(false)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Footer settings updated successfully' })
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to update footer settings' })
    }
  }

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success && data.url) {
        setSettings((prev: any) => ({ ...prev, logo: data.url }))
        setStatusMsg({ type: 'success', text: 'Footer logo uploaded to Media Library successfully' })
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Logo upload failed' })
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Logo upload failed. Please try again.' })
    } finally {
      setUploadingLogo(false)
    }
  }

  // Contact Modal Actions
  const openContactModal = (type: 'PHONE' | 'EMAIL', item?: any) => {
    setContactModalType(type)
    if (item) {
      setEditingContact(item)
      setContactForm({ label: item.label, value: item.value, isActive: item.isActive })
    } else {
      setEditingContact(null)
      setContactForm({ label: type === 'PHONE' ? 'Admissions' : 'General', value: '', isActive: true })
    }
    setContactModalOpen(true)
  }

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await saveFooterContactItemAction(
      {
        type: contactModalType,
        label: contactForm.label,
        value: contactForm.value,
        isActive: contactForm.isActive,
      },
      editingContact?.id
    )
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Contact item saved' })
      setContactModalOpen(false)
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save contact item' })
    }
  }

  const toggleContactActive = async (item: any) => {
    const res = await saveFooterContactItemAction(
      {
        type: item.type,
        label: item.label,
        value: item.value,
        isActive: !item.isActive,
        displayOrder: item.displayOrder,
      },
      item.id
    )
    if (res.success) fetchData()
  }

  // Column Modal Actions
  const openColumnModal = (col?: any) => {
    if (col) {
      setEditingColumn(col)
      setColumnForm({ title: col.title, description: col.description || '', icon: col.icon || '', isActive: col.isActive })
    } else {
      setEditingColumn(null)
      setColumnForm({ title: '', description: '', icon: '', isActive: true })
    }
    setColumnModalOpen(true)
  }

  const handleSaveColumn = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await saveFooterColumnAction(
      {
        title: columnForm.title,
        description: columnForm.description,
        icon: columnForm.icon,
        isActive: columnForm.isActive,
      },
      editingColumn?.id
    )
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Footer column saved' })
      setColumnModalOpen(false)
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save column' })
    }
  }

  const toggleColumnActive = async (col: any) => {
    const res = await saveFooterColumnAction(
      {
        title: col.title,
        description: col.description,
        icon: col.icon,
        isActive: !col.isActive,
        displayOrder: col.displayOrder,
      },
      col.id
    )
    if (res.success) fetchData()
  }

  const moveColumnOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === columns.length - 1)) return
    const newList = [...columns]
    const targetIndex = direction === 'UP' ? index - 1 : index + 1
    const temp = newList[index]
    newList[index] = newList[targetIndex]
    newList[targetIndex] = temp
    const reordered = newList.map((c, i) => ({ id: c.id, displayOrder: i + 1 }))
    const res = await reorderFooterColumnsAction(reordered)
    if (res.success) fetchData()
  }

  // Link Modal Actions
  const openLinkModal = (columnId: string, link?: any) => {
    setTargetColumnId(columnId)
    if (link) {
      setEditingLink(link)
      setLinkForm({
        title: link.title,
        url: link.url,
        linkType: link.linkType || 'INTERNAL',
        openInNewTab: link.openInNewTab ?? false,
        isActive: link.isActive ?? true,
      })
    } else {
      setEditingLink(null)
      setLinkForm({
        title: '',
        url: '/',
        linkType: 'INTERNAL',
        openInNewTab: false,
        isActive: true,
      })
    }
    setLinkModalOpen(true)
  }

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await saveFooterColumnLinkAction(
      {
        columnId: targetColumnId,
        title: linkForm.title,
        url: linkForm.url,
        linkType: linkForm.linkType as any,
        openInNewTab: linkForm.openInNewTab,
        isActive: linkForm.isActive,
      },
      editingLink?.id
    )
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Footer link saved' })
      setLinkModalOpen(false)
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save link' })
    }
  }

  const toggleLinkActive = async (link: any) => {
    const res = await saveFooterColumnLinkAction(
      {
        columnId: link.columnId,
        title: link.title,
        url: link.url,
        linkType: link.linkType,
        openInNewTab: link.openInNewTab,
        isActive: !link.isActive,
        displayOrder: link.displayOrder,
      },
      link.id
    )
    if (res.success) fetchData()
  }

  const moveLinkOrder = async (columnLinks: any[], index: number, direction: 'UP' | 'DOWN') => {
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === columnLinks.length - 1)) return
    const newList = [...columnLinks]
    const targetIndex = direction === 'UP' ? index - 1 : index + 1
    const temp = newList[index]
    newList[index] = newList[targetIndex]
    newList[targetIndex] = temp
    const reordered = newList.map((l, i) => ({ id: l.id, displayOrder: i + 1 }))
    const res = await reorderFooterColumnLinksAction(reordered)
    if (res.success) fetchData()
  }

  // Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    let res: any = null
    if (deleteConfirm.kind === 'CONTACT') {
      res = await deleteFooterContactItemAction(deleteConfirm.id)
    } else if (deleteConfirm.kind === 'COLUMN') {
      res = await deleteFooterColumnAction(deleteConfirm.id)
    } else if (deleteConfirm.kind === 'LINK') {
      res = await deleteFooterColumnLinkAction(deleteConfirm.id)
    }
    setDeleteConfirm(null)
    if (res?.success) {
      setStatusMsg({ type: 'success', text: 'Item deleted successfully' })
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res?.error || 'Failed to delete item' })
    }
  }

  return (
    <div className="space-y-6 w-full font-sans pb-16">
      {/* FOOTER MANAGEMENT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:footer-outline" className="w-6 h-6 text-slate-800" />
            Footer Management CMS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage Footer Branding, Address, multiple phone & email contacts, dynamic footer column builder & column links.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Icon icon="ion:checkmark-circle-outline" className="w-4 h-4" />
          {saving ? 'Saving Footer Changes...' : 'Save Footer Changes'}
        </button>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
            <Icon icon="ion:close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-500 text-sm">
          <Icon icon="ion:sync" className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
          Loading Footer CMS data...
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: FOOTER BRANDING, ADDRESS & WHATSAPP CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FOOTER LOGO CARD */}
            <div className="bg-slate-900 text-white border border-slate-800 p-5 rounded-2xl space-y-4 text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Icon icon="ion:moon-outline" className="w-4 h-4 text-blue-400" />
                    Footer Logo
                  </h3>
                  <p className="text-[11px] text-slate-400">Footer logo for dark background</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.logoActive}
                    onChange={(e) => setSettings({ ...settings, logoActive: e.target.checked })}
                    className="rounded text-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-300">Active</span>
                </label>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center min-h-[90px]">
                {settings.logo ? (
                  <img src={settings.logo} alt={settings.logoAltText || 'Footer Logo'} className="max-h-14 object-contain" />
                ) : (
                  <span className="text-slate-500">No Footer Logo</span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Upload / Select Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={settings.logo || ''}
                      onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                      placeholder="/images/logo/qimd-logo-white.png"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white"
                    />
                    <label className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer transition-colors shrink-0 flex items-center gap-1">
                      <Icon icon="ion:cloud-upload-outline" className="w-4 h-4" />
                      {uploadingLogo ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={settings.logoAltText || ''}
                      onChange={(e) => setSettings({ ...settings, logoAltText: e.target.value })}
                      placeholder="QIMD Footer Logo"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Logo Link</label>
                    <input
                      type="text"
                      value={settings.logoLink || ''}
                      onChange={(e) => setSettings({ ...settings, logoLink: e.target.value })}
                      placeholder="/"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER ADDRESS CARD */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Icon icon="ion:location-outline" className="w-4 h-4 text-rose-600" />
                    Physical Institute Address
                  </h3>
                  <p className="text-[11px] text-slate-500">Footer location address</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.addressActive}
                    onChange={(e) => setSettings({ ...settings, addressActive: e.target.checked })}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800">Active</span>
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Address Label</label>
                  <input
                    type="text"
                    value={settings.addressLabel || ''}
                    onChange={(e) => setSettings({ ...settings, addressLabel: e.target.value })}
                    placeholder="Physical Institute Address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Address Text</label>
                  <textarea
                    rows={2}
                    value={settings.fullAddress || ''}
                    onChange={(e) => setSettings({ ...settings, fullAddress: e.target.value })}
                    placeholder="Office 301, Hinjewadi Phase 1, Near IT Park, Pune - 411057"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Google Maps URL</label>
                  <input
                    type="text"
                    value={settings.googleMapsUrl || ''}
                    onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* FOOTER WHATSAPP CTA CARD */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Icon icon="ion:logo-whatsapp" className="w-4 h-4 text-emerald-600" />
                    Footer WhatsApp Button
                  </h3>
                  <p className="text-[11px] text-slate-500">Green button under Information column</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.whatsappActive !== false}
                    onChange={(e) => setSettings({ ...settings, whatsappActive: e.target.checked })}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800">Active</span>
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Button Text</label>
                  <input
                    type="text"
                    value={settings.whatsappText || 'Chat with Us on WhatsApp'}
                    onChange={(e) => setSettings({ ...settings, whatsappText: e.target.value })}
                    placeholder="Chat with Us on WhatsApp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.whatsappNumber || '+91 91300 00000'}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    placeholder="+91 91300 00000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Direct + Add Button Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSettings((prev: any) => ({
                      ...prev,
                      extraCtaButtons: [
                        ...(prev.extraCtaButtons || []),
                        { id: Date.now().toString(), text: 'Contact Us', url: '/contact', active: true },
                      ],
                    }))
                  }}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
                  <span>+ Add Button</span>
                </button>

                <span className="text-[11px] text-slate-500 font-medium">Add extra CTA buttons directly</span>
              </div>

              {/* Extra CTA Buttons list */}
              {settings.extraCtaButtons && settings.extraCtaButtons.length > 0 && (
                <div className="space-y-2 pt-2">
                  {settings.extraCtaButtons.map((btn: any, idx: number) => (
                    <div key={btn.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={btn.text}
                          onChange={(e) => {
                            const updated = [...settings.extraCtaButtons]
                            updated[idx].text = e.target.value
                            setSettings({ ...settings, extraCtaButtons: updated })
                          }}
                          placeholder="Button Label"
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 font-semibold"
                        />
                        <input
                          type="text"
                          value={btn.url}
                          onChange={(e) => {
                            const updated = [...settings.extraCtaButtons]
                            updated[idx].url = e.target.value
                            setSettings({ ...settings, extraCtaButtons: updated })
                          }}
                          placeholder="/link-url"
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = settings.extraCtaButtons.filter((_: any, i: number) => i !== idx)
                          setSettings({ ...settings, extraCtaButtons: updated })
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Icon icon="ion:trash-outline" className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER SOCIAL ICONS DISPLAY CARD */}
            <div className="bg-purple-50/60 border border-purple-200 p-5 rounded-2xl space-y-3 shadow-xs text-xs">
              <div className="flex items-center justify-between border-b border-purple-200 pb-3">
                <h3 className="font-bold text-purple-900 flex items-center gap-1.5 text-sm">
                  <Icon icon="ion:share-social-outline" className="w-4 h-4 text-purple-700" />
                  Footer Social Icons Display
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showSocialIcons !== false}
                    onChange={(e) => setSettings({ ...settings, showSocialIcons: e.target.checked })}
                    className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span className="font-semibold text-purple-900">Show Icons</span>
                </label>
              </div>

              <p className="text-slate-600 leading-relaxed">
                Social links are managed exclusively inside{' '}
                <Link href="/admin/social-links" className="text-purple-700 underline font-bold">
                  Social Links CMS
                </Link>
                . This setting controls whether social icons (Instagram, Facebook, YouTube, LinkedIn, X, WhatsApp) appear in the footer brand column.
              </p>

              <div className="pt-1">
                <Link
                  href="/admin/social-links"
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-white border border-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Icon icon="ion:open-outline" className="w-3.5 h-3.5" />
                  Manage Social Links CMS
                </Link>
              </div>
            </div>

            {/* FLOATING WIDGETS CONTROL CARD (WHATSAPP & SCROLL TO TOP) */}
            <div className="bg-indigo-50/60 border border-indigo-200 p-5 rounded-2xl space-y-3 shadow-xs text-xs">
              <div className="flex items-center justify-between border-b border-indigo-200 pb-3">
                <h3 className="font-bold text-indigo-900 flex items-center gap-1.5 text-sm">
                  <Icon icon="ion:chevron-up-circle-outline" className="w-4 h-4 text-indigo-700" />
                  Scroll To Top Floating Button
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showScrollToTop !== false}
                    onChange={(e) => setSettings({ ...settings, showScrollToTop: e.target.checked })}
                    className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="font-semibold text-indigo-900">Active</span>
                </label>
              </div>

              <p className="text-slate-600 leading-relaxed">
                Controls the visibility of the purple floating <span className="font-semibold text-indigo-800">Scroll-to-Top (^)</span> button at the bottom-right of the screen.
              </p>
            </div>
          </div>

          {/* SECTION 2: FOOTER CONTACT NUMBERS & EMAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FOOTER PHONES */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Icon icon="ion:call-outline" className="w-4 h-4 text-emerald-600" />
                    Footer Phone Numbers
                  </h3>
                  <p className="text-[11px] text-slate-500">Multiple labeled phones (Admissions, Office, Placement)</p>
                </div>
                <button
                  type="button"
                  onClick={() => openContactModal('PHONE')}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Icon icon="ion:add-circle-outline" /> Add Phone
                </button>
              </div>

              <div className="space-y-2">
                {phones.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-4">No footer phones configured.</p>
                ) : (
                  phones.map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{p.label}: </span>
                        <span className="font-mono text-slate-700">{p.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleContactActive(p)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Off'}
                        </button>
                        <button onClick={() => openContactModal('PHONE', p)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => setDeleteConfirm({ id: p.id, title: p.label, kind: 'CONTACT' })} className="text-rose-600 hover:underline">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* FOOTER EMAILS */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Icon icon="ion:mail-outline" className="w-4 h-4 text-purple-600" />
                    Footer Email Addresses
                  </h3>
                  <p className="text-[11px] text-slate-500">Multiple labeled emails (General, Admissions, Careers)</p>
                </div>
                <button
                  type="button"
                  onClick={() => openContactModal('EMAIL')}
                  className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Icon icon="ion:add-circle-outline" /> Add Email
                </button>
              </div>

              <div className="space-y-2">
                {emails.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-4">No footer emails configured.</p>
                ) : (
                  emails.map((e) => (
                    <div key={e.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{e.label}: </span>
                        <span className="font-mono text-slate-700">{e.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleContactActive(e)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            e.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {e.isActive ? 'Active' : 'Off'}
                        </button>
                        <button onClick={() => openContactModal('EMAIL', e)} className="text-purple-600 hover:underline">Edit</button>
                        <button onClick={() => setDeleteConfirm({ id: e.id, title: e.label, kind: 'CONTACT' })} className="text-rose-600 hover:underline">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: DYNAMIC FOOTER COLUMN BUILDER */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Icon icon="ion:grid-outline" className="w-5 h-5 text-blue-600" />
                  Dynamic Footer Column Builder
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create, reorder, enable/disable footer columns and manage nested column links.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openColumnModal()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
                Add Footer Column
              </button>
            </div>

            {/* COLUMNS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {columns.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-2xl">
                  No footer columns created yet. Click Add Footer Column to create your first column.
                </div>
              ) : (
                columns.map((col, cIdx) => (
                  <div key={col.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                    {/* Column Header */}
                    <div className="border-b border-slate-200 pb-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                            {cIdx + 1}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm">{col.title}</h3>
                        </div>
                        {col.description && <p className="text-[11px] text-slate-500 mt-0.5">{col.description}</p>}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveColumnOrder(cIdx, 'UP')}
                          disabled={cIdx === 0}
                          title="Move Left/Up"
                          className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                        >
                          <Icon icon="ion:arrow-up" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveColumnOrder(cIdx, 'DOWN')}
                          disabled={cIdx === columns.length - 1}
                          title="Move Right/Down"
                          className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                        >
                          <Icon icon="ion:arrow-down" className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleColumnActive(col)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            col.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-500 border-slate-300'
                          }`}
                        >
                          {col.isActive ? 'Active' : 'Disabled'}
                        </button>
                        <button onClick={() => openColumnModal(col)} className="p-1 text-blue-600 hover:text-blue-800" title="Edit Column">
                          <Icon icon="ion:create-outline" className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm({ id: col.id, title: col.title, kind: 'COLUMN' })} className="p-1 text-rose-600 hover:text-rose-800" title="Delete Column">
                          <Icon icon="ion:trash-outline" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Column Links Section */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Column Links ({col.links?.length || 0})</span>
                        <button
                          type="button"
                          onClick={() => openLinkModal(col.id)}
                          className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1"
                        >
                          <Icon icon="ion:add" /> Add Link
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {!col.links || col.links.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">No links in this column.</p>
                        ) : (
                          col.links.map((link: any, lIdx: number) => (
                            <div key={link.id} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-semibold text-slate-800 truncate">{link.title}</span>
                                {link.linkType === 'BUTTON' && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold shrink-0">
                                    🟢 BTN
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-slate-400 truncate">({link.url})</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => moveLinkOrder(col.links, lIdx, 'UP')}
                                  disabled={lIdx === 0}
                                  className="text-slate-400 hover:text-blue-600 disabled:opacity-20"
                                >
                                  <Icon icon="ion:arrow-up" className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => moveLinkOrder(col.links, lIdx, 'DOWN')}
                                  disabled={lIdx === col.links.length - 1}
                                  className="text-slate-400 hover:text-blue-600 disabled:opacity-20"
                                >
                                  <Icon icon="ion:arrow-down" className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => toggleLinkActive(link)}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    link.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                                  }`}
                                >
                                  {link.isActive ? 'ON' : 'OFF'}
                                </button>
                                <button onClick={() => openLinkModal(col.id, link)} className="text-blue-600 hover:underline text-[11px]">Edit</button>
                                <button onClick={() => setDeleteConfirm({ id: link.id, title: link.title, kind: 'LINK' })} className="text-rose-600 hover:underline text-[11px]">Delete</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONTACT ITEM */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingContact ? `Edit Footer ${contactModalType}` : `Add Footer ${contactModalType}`}
              </h3>
              <button onClick={() => setContactModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Label</label>
                <input
                  type="text"
                  value={contactForm.label}
                  onChange={(e) => setContactForm({ ...contactForm, label: e.target.value })}
                  placeholder={contactModalType === 'PHONE' ? 'Admissions / Office' : 'General / Careers'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {contactModalType === 'PHONE' ? 'Phone Number' : 'Email Address'}
                </label>
                <input
                  type={contactModalType === 'PHONE' ? 'text' : 'email'}
                  value={contactForm.value}
                  onChange={(e) => setContactForm({ ...contactForm, value: e.target.value })}
                  placeholder={contactModalType === 'PHONE' ? '+91 91300 00000' : 'info@qimd.in'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={contactForm.isActive}
                  onChange={(e) => setContactForm({ ...contactForm, isActive: e.target.checked })}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <span className="font-semibold text-slate-800">Active and visible in footer</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setContactModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FOOTER COLUMN */}
      {columnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingColumn ? 'Edit Footer Column' : 'Add Footer Column'}
              </h3>
              <button onClick={() => setColumnModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveColumn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Column Title</label>
                <input
                  type="text"
                  value={columnForm.title}
                  onChange={(e) => setColumnForm({ ...columnForm, title: e.target.value })}
                  placeholder="e.g. Quick Links / Courses / Information"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Optional Description</label>
                <input
                  type="text"
                  value={columnForm.description}
                  onChange={(e) => setColumnForm({ ...columnForm, description: e.target.value })}
                  placeholder="Brief tagline for column"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Optional Iconify Icon Name</label>
                <input
                  type="text"
                  value={columnForm.icon}
                  onChange={(e) => setColumnForm({ ...columnForm, icon: e.target.value })}
                  placeholder="e.g. ion:book-outline"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={columnForm.isActive}
                  onChange={(e) => setColumnForm({ ...columnForm, isActive: e.target.checked })}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <span className="font-semibold text-slate-800">Column Active</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setColumnModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  Save Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COLUMN LINK */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingLink ? 'Edit Footer Link' : 'Add Footer Link'}
              </h3>
              <button onClick={() => setLinkModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Link Title</label>
                <input
                  type="text"
                  value={linkForm.title}
                  onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                  placeholder="e.g. About Us / Digital Marketing"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL / Path</label>
                <input
                  type="text"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  placeholder={
                    linkForm.linkType === 'BUTTON'
                      ? 'https://wa.me/91XXXXXXXXXX or any URL'
                      : linkForm.linkType === 'EXTERNAL'
                      ? 'https://example.com'
                      : '/about-us'
                  }
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                />
                {linkForm.linkType === 'BUTTON' && (
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                    💡 For WhatsApp: use <span className="font-mono">https://wa.me/91XXXXXXXXXX</span> (no spaces, no +). For any other button, paste the full URL.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Link Type</label>
                  <select
                    value={linkForm.linkType}
                    onChange={(e) => {
                      const val = e.target.value
                      setLinkForm({
                        ...linkForm,
                        linkType: val,
                        // Auto open in new tab for external buttons
                        openInNewTab: val === 'BUTTON' || val === 'EXTERNAL' ? true : linkForm.openInNewTab,
                        // Clear default URL placeholder
                        url: val === 'INTERNAL' && linkForm.url.startsWith('http') ? '/' : linkForm.url,
                      })
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="INTERNAL">Internal Page (plain link)</option>
                    <option value="EXTERNAL">External URL (plain link)</option>
                    <option value="BUTTON">🟢 Green CTA Button</option>
                  </select>
                </div>

                <div className="pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={linkForm.openInNewTab}
                      onChange={(e) => setLinkForm({ ...linkForm, openInNewTab: e.target.checked })}
                      className="rounded text-blue-600 w-3.5 h-3.5"
                    />
                    <span className="text-slate-800 font-medium">Open New Tab</span>
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={linkForm.isActive}
                  onChange={(e) => setLinkForm({ ...linkForm, isActive: e.target.checked })}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <span className="font-semibold text-slate-800">Link Active</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setLinkModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl">
              <Icon icon="ion:trash-outline" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Delete {deleteConfirm.kind}?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
