'use client'

import React, { useState, useEffect } from 'react'
import {
  getHeaderCMSData,
  updateHeaderSettingsAction,
  saveHeaderContactItemAction,
  deleteHeaderContactItemAction,
  reorderHeaderContactItemsAction,
} from '@/app/actions/headerActions'
import { Icon } from '@iconify/react'
import Link from 'next/link'

export default function AdminHeaderCMSPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Header Settings
  const [settings, setSettings] = useState<any>({
    logo: '/images/logo/qimd-logo.png',
    logoAltText: 'QIMD Institute Logo',
    logoLink: '/',
    logoActive: true,
    showSocialLinks: true,
    hireFromUsText: 'Hire From Us',
    hireFromUsUrl: '/hire-from-us',
    hireFromUsNewTab: false,
    hireFromUsActive: true,
    enquireNowText: 'Enquire Now',
    enquireNowUrl: '/contact',
    enquireNowNewTab: false,
    enquireNowActive: true,
    contactPhone: '+91 90000 00000',
    whatsappText: 'WhatsApp',
    whatsappNumber: '+919876543210',
    whatsappActive: true,
  })

  // Contact Items
  const [phones, setPhones] = useState<any[]>([])
  const [emails, setEmails] = useState<any[]>([])

  // Modal / Form state for Contact Items (Phone & Email)
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [itemModalType, setItemModalType] = useState<'PHONE' | 'EMAIL'>('PHONE')
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [itemForm, setItemForm] = useState({ label: '', value: '', isActive: true })

  // Modal / Confirm state for deletion
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string; type: string } | null>(null)

  // Uploading logo state
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getHeaderCMSData()
      if (res.success) {
        if (res.settings) setSettings(res.settings)
        if (res.phones) setPhones(res.phones)
        if (res.emails) setEmails(res.emails)
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to fetch Header CMS data' })
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
    const res = await updateHeaderSettingsAction(settings)
    setSaving(false)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Header settings updated successfully' })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('websiteSettingsUpdated'))
      }
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to update header settings' })
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
        const newSettings = { ...settings, logo: data.url }
        setSettings(newSettings)
        await updateHeaderSettingsAction(newSettings)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('websiteSettingsUpdated'))
        }
        setStatusMsg({ type: 'success', text: 'Header logo uploaded and saved successfully' })
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Logo upload failed' })
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Logo upload failed. Please try again.' })
    } finally {
      setUploadingLogo(false)
    }
  }

  // Open Add/Edit Item Modal
  const openItemModal = (type: 'PHONE' | 'EMAIL', item?: any) => {
    setItemModalType(type)
    if (item) {
      setEditingItem(item)
      setItemForm({ label: item.label, value: item.value, isActive: item.isActive })
    } else {
      setEditingItem(null)
      setItemForm({ label: type === 'PHONE' ? 'Admissions' : 'General', value: '', isActive: true })
    }
    setItemModalOpen(true)
  }

  // Submit Contact Item Form
  const handleSaveContactItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await saveHeaderContactItemAction(
      {
        type: itemModalType,
        label: itemForm.label,
        value: itemForm.value,
        isActive: itemForm.isActive,
      },
      editingItem?.id
    )
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Contact item saved' })
      setItemModalOpen(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('websiteSettingsUpdated'))
      }
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save contact item' })
    }
  }

  // Toggle Contact Item Active/Inactive
  const toggleItemActive = async (item: any) => {
    const res = await saveHeaderContactItemAction(
      {
        type: item.type,
        label: item.label,
        value: item.value,
        isActive: !item.isActive,
        displayOrder: item.displayOrder,
      },
      item.id
    )
    if (res.success) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('websiteSettingsUpdated'))
      }
      fetchData()
    }
  }

  // Delete Contact Item
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    const res = await deleteHeaderContactItemAction(deleteConfirm.id)
    setDeleteConfirm(null)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Item deleted successfully' })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('websiteSettingsUpdated'))
      }
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete item' })
    }
  }

  // Move Contact Item Up/Down
  const moveItemOrder = async (list: any[], index: number, direction: 'UP' | 'DOWN') => {
    if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === list.length - 1)) return
    const newList = [...list]
    const targetIndex = direction === 'UP' ? index - 1 : index + 1
    const temp = newList[index]
    newList[index] = newList[targetIndex]
    newList[targetIndex] = temp

    const reordered = newList.map((item, idx) => ({ id: item.id, displayOrder: idx + 1 }))
    const res = await reorderHeaderContactItemsAction(reordered)
    if (res.success) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('websiteSettingsUpdated'))
      }
      fetchData()
    }
  }

  const generatedWaUrl = (settings?.whatsappNumber || '').replace(/[^\d+]/g, '')

  return (
    <div className="space-y-6 w-full font-sans pb-12">
      {/* HEADER MANAGEMENT BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:header-outline" className="w-6 h-6 text-blue-600" />
            Header Management CMS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage complete public header including Top Bar (phones, emails, Hire From Us, Social toggle) and Main Header (logo, Enquire Now, WhatsApp).
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Icon icon="ion:checkmark-circle-outline" className="w-4 h-4" />
          {saving ? 'Saving Changes...' : 'Save Header Changes'}
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
          Loading Header CMS data...
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: TOP BAR MANAGEMENT */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Icon icon="ion:ribbon-outline" className="w-5 h-5 text-blue-600" />
                ROW 1 — Top Bar Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Controls contact phone numbers, official email addresses, Hire From Us CTA button, and Social Media links toggle in the top bar.
              </p>
            </div>

            {/* PHONES MANAGEMENT */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Icon icon="ion:call-outline" className="w-4 h-4 text-emerald-600" />
                  Top Bar Phone Numbers
                </h3>
                <button
                  type="button"
                  onClick={() => openItemModal('PHONE')}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
                  Add Phone Number
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Order</th>
                      <th className="py-2.5 px-4">Label</th>
                      <th className="py-2.5 px-4">Phone Number</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {phones.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">No phone numbers configured. Click Add Phone Number above.</td>
                      </tr>
                    ) : (
                      phones.map((phone, idx) => (
                        <tr key={phone.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{phone.label}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-900">{phone.value}</td>
                          <td className="py-2.5 px-4">
                            <button
                              type="button"
                              onClick={() => toggleItemActive(phone)}
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                                phone.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {phone.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => moveItemOrder(phones, idx, 'UP')}
                                disabled={idx === 0}
                                title="Move Up"
                                className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                              >
                                <Icon icon="ion:arrow-up" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => moveItemOrder(phones, idx, 'DOWN')}
                                disabled={idx === phones.length - 1}
                                title="Move Down"
                                className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                              >
                                <Icon icon="ion:arrow-down" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openItemModal('PHONE', phone)}
                                title="Edit Phone"
                                className="p-1 text-blue-600 hover:text-blue-800"
                              >
                                <Icon icon="ion:create-outline" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: phone.id, title: phone.label, type: 'Phone Number' })}
                                title="Delete Phone"
                                className="p-1 text-rose-600 hover:text-rose-800"
                              >
                                <Icon icon="ion:trash-outline" className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EMAILS MANAGEMENT */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Icon icon="ion:mail-outline" className="w-4 h-4 text-purple-600" />
                  Top Bar Email Addresses
                </h3>
                <button
                  type="button"
                  onClick={() => openItemModal('EMAIL')}
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
                  Add Email Address
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Order</th>
                      <th className="py-2.5 px-4">Label</th>
                      <th className="py-2.5 px-4">Email Address</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {emails.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">No email addresses configured. Click Add Email Address above.</td>
                      </tr>
                    ) : (
                      emails.map((email, idx) => (
                        <tr key={email.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{email.label}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-900">{email.value}</td>
                          <td className="py-2.5 px-4">
                            <button
                              type="button"
                              onClick={() => toggleItemActive(email)}
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                                email.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {email.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => moveItemOrder(emails, idx, 'UP')}
                                disabled={idx === 0}
                                title="Move Up"
                                className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                              >
                                <Icon icon="ion:arrow-up" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => moveItemOrder(emails, idx, 'DOWN')}
                                disabled={idx === emails.length - 1}
                                title="Move Down"
                                className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                              >
                                <Icon icon="ion:arrow-down" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openItemModal('EMAIL', email)}
                                title="Edit Email"
                                className="p-1 text-purple-600 hover:text-purple-800"
                              >
                                <Icon icon="ion:create-outline" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: email.id, title: email.label, type: 'Email Address' })}
                                title="Delete Email"
                                className="p-1 text-rose-600 hover:text-rose-800"
                              >
                                <Icon icon="ion:trash-outline" className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* HIRE FROM US CTA & SOCIAL TOGGLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100 text-xs">
              <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
                    <Icon icon="ion:briefcase-outline" className="w-4 h-4 text-amber-700" />
                    "Hire From Us" CTA Button
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.hireFromUsActive}
                      onChange={(e) => setSettings({ ...settings, hireFromUsActive: e.target.checked })}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="font-semibold text-amber-900">Active</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Button Text</label>
                    <input
                      type="text"
                      value={settings.hireFromUsText}
                      onChange={(e) => setSettings({ ...settings, hireFromUsText: e.target.value })}
                      placeholder="Hire From Us"
                      className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Target URL</label>
                    <input
                      type="text"
                      value={settings.hireFromUsUrl}
                      onChange={(e) => setSettings({ ...settings, hireFromUsUrl: e.target.value })}
                      placeholder="/hire-from-us"
                      className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-mono text-slate-900"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={settings.hireFromUsNewTab}
                      onChange={(e) => setSettings({ ...settings, hireFromUsNewTab: e.target.checked })}
                      className="rounded text-amber-600 w-3.5 h-3.5"
                    />
                    <span className="text-slate-700 font-medium">Open link in new tab</span>
                  </label>
                </div>

                {/* Direct + Add Top Bar Button Action */}
                <div className="pt-2 flex items-center justify-between border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSettings((prev: any) => ({
                        ...prev,
                        extraTopBarButtons: [
                          ...(prev.extraTopBarButtons || []),
                          { id: Date.now().toString(), text: 'Admissions Open', url: '/contact', alignment: 'RIGHT', active: true },
                        ],
                      }))
                    }}
                    className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
                    <span>+ Add Top Bar Button</span>
                  </button>
                  <span className="text-[11px] text-amber-800 font-medium">Add extra top bar buttons</span>
                </div>

                {/* Extra Top Bar Buttons List */}
                {settings.extraTopBarButtons && settings.extraTopBarButtons.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {settings.extraTopBarButtons.map((btn: any, idx: number) => (
                      <div key={btn.id || idx} className="p-2.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={btn.text}
                            onChange={(e) => {
                              const updated = [...settings.extraTopBarButtons]
                              updated[idx].text = e.target.value
                              setSettings({ ...settings, extraTopBarButtons: updated })
                            }}
                            placeholder="Button Label"
                            className="bg-slate-50 border border-amber-200 rounded-lg p-1.5 text-xs font-semibold text-slate-900"
                          />
                          <input
                            type="text"
                            value={btn.url}
                            onChange={(e) => {
                              const updated = [...settings.extraTopBarButtons]
                              updated[idx].url = e.target.value
                              setSettings({ ...settings, extraTopBarButtons: updated })
                            }}
                            placeholder="/target-url"
                            className="bg-slate-50 border border-amber-200 rounded-lg p-1.5 text-xs font-mono text-slate-900"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = settings.extraTopBarButtons.filter((_: any, i: number) => i !== idx)
                            setSettings({ ...settings, extraTopBarButtons: updated })
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

              {/* SOCIAL LINKS DISPLAY SETTING */}
              <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-purple-900 flex items-center gap-1.5 text-sm">
                    <Icon icon="ion:share-social-outline" className="w-4 h-4 text-purple-700" />
                    Top Bar Social Icons Display
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showSocialLinks}
                      onChange={(e) => setSettings({ ...settings, showSocialLinks: e.target.checked })}
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                    <span className="font-semibold text-purple-900">Show Icons</span>
                  </label>
                </div>

                <p className="text-slate-600 leading-relaxed text-xs">
                  Social links are managed exclusively inside <Link href="/admin/social-links" className="text-purple-700 underline font-bold">Social Links CMS</Link>.
                  This setting only controls whether active social icons appear in the top bar header.
                </p>

                <div className="pt-2">
                  <Link
                    href="/admin/social-links"
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-white border border-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Icon icon="ion:open-outline" className="w-3.5 h-3.5" />
                    Manage Social Links CMS
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: MAIN HEADER MANAGEMENT */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Icon icon="ion:image-outline" className="w-5 h-5 text-blue-600" />
                ROW 2 — Main Header Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage Header Logo, Navigation integration, Enquire Now button, and WhatsApp CTA button.
              </p>
            </div>

            {/* HEADER LOGO CARD */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Icon icon="ion:sparkles-outline" className="w-4 h-4 text-blue-600" />
                    Header Logo Branding
                  </h3>
                  <p className="text-[11px] text-slate-500">Official logo displayed in public header navigation</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.logoActive}
                    onChange={(e) => setSettings({ ...settings, logoActive: e.target.checked })}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-900">Active</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Logo Preview */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-center min-h-[100px]">
                  {settings.logo ? (
                    <img src={settings.logo} alt={settings.logoAltText || 'Logo Preview'} className="max-h-14 object-contain" />
                  ) : (
                    <span className="text-slate-400">No Logo Uploaded</span>
                  )}
                </div>

                {/* Upload & Controls */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Upload / Select Image</label>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <input
                        type="text"
                        value={settings.logo || ''}
                        onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                        placeholder="/images/logo/qimd-logo.png"
                        className="flex-1 min-w-[140px] bg-white border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                      />
                      <label className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer transition-colors shrink-0 flex items-center gap-1">
                        <Icon icon="ion:cloud-upload-outline" className="w-4 h-4" />
                        {uploadingLogo ? 'Uploading...' : 'Upload'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          const newSettings = { ...settings, logo: '/images/logo/qimd-logo.png' }
                          setSettings(newSettings)
                          await updateHeaderSettingsAction(newSettings)
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new Event('websiteSettingsUpdated'))
                          }
                          setStatusMsg({ type: 'success', text: 'Reset to default header logo' })
                        }}
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold shrink-0"
                        title="Reset to default logo"
                      >
                        Default
                      </button>
                      {settings.logo && (
                        <button
                          type="button"
                          onClick={async () => {
                            const newSettings = { ...settings, logo: '' }
                            setSettings(newSettings)
                            await updateHeaderSettingsAction(newSettings)
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new Event('websiteSettingsUpdated'))
                            }
                            setStatusMsg({ type: 'success', text: 'Logo removed' })
                          }}
                          className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold shrink-0 border border-rose-200"
                          title="Remove logo"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Alt Text</label>
                      <input
                        type="text"
                        value={settings.logoAltText || ''}
                        onChange={(e) => setSettings({ ...settings, logoAltText: e.target.value })}
                        placeholder="QIMD Logo"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Logo Link</label>
                      <input
                        type="text"
                        value={settings.logoLink || ''}
                        onChange={(e) => setSettings({ ...settings, logoLink: e.target.value })}
                        placeholder="/"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION CTAs: ENQUIRE NOW & WHATSAPP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* ENQUIRE NOW CARD */}
              <div className="bg-sky-50/60 border border-sky-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sky-900 flex items-center gap-1.5 text-sm">
                    <Icon icon="ion:paper-plane-outline" className="w-4 h-4 text-sky-700" />
                    Enquire Now Button
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enquireNowActive}
                      onChange={(e) => setSettings({ ...settings, enquireNowActive: e.target.checked })}
                      className="rounded text-sky-600 w-4 h-4"
                    />
                    <span className="font-semibold text-sky-900">Active</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Button Text</label>
                    <input
                      type="text"
                      value={settings.enquireNowText}
                      onChange={(e) => setSettings({ ...settings, enquireNowText: e.target.value })}
                      placeholder="Enquire Now"
                      className="w-full bg-white border border-sky-300 rounded-lg p-2 font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Calling Number</label>
                    <input
                      type="text"
                      value={settings.contactPhone || ''}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      placeholder="+91 90000 00000"
                      className="w-full bg-white border border-sky-300 rounded-lg p-2 font-mono text-slate-900"
                    />
                  </div>
                  {settings.contactPhone && (
                    <p className="text-[11px] text-sky-700 font-medium bg-sky-50 border border-sky-200 rounded-lg px-3 py-2">
                      📞 Generated:{' '}
                      <span className="font-mono font-bold">
                        tel:{settings.contactPhone.replace(/\s/g, '')}
                      </span>
                    </p>
                  )}
                </div>

                {/* Direct + Add Header CTA Button Action */}
                <div className="pt-2 flex items-center justify-between border-t border-sky-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSettings((prev: any) => ({
                        ...prev,
                        extraHeaderCtaButtons: [
                          ...(prev.extraHeaderCtaButtons || []),
                          { id: Date.now().toString(), text: 'Book Free Demo', url: '/contact', active: true },
                        ],
                      }))
                    }}
                    className="px-3.5 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
                    <span>+ Add Header CTA Button</span>
                  </button>
                  <span className="text-[11px] text-sky-800 font-medium">Add extra navigation header buttons</span>
                </div>

                {/* Extra Header CTA Buttons List */}
                {settings.extraHeaderCtaButtons && settings.extraHeaderCtaButtons.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {settings.extraHeaderCtaButtons.map((btn: any, idx: number) => (
                      <div key={btn.id || idx} className="p-2.5 bg-white border border-sky-200 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={btn.text}
                            onChange={(e) => {
                              const updated = [...settings.extraHeaderCtaButtons]
                              updated[idx].text = e.target.value
                              setSettings({ ...settings, extraHeaderCtaButtons: updated })
                            }}
                            placeholder="Button Label"
                            className="bg-slate-50 border border-sky-200 rounded-lg p-1.5 text-xs font-semibold text-slate-900"
                          />
                          <input
                            type="text"
                            value={btn.url}
                            onChange={(e) => {
                              const updated = [...settings.extraHeaderCtaButtons]
                              updated[idx].url = e.target.value
                              setSettings({ ...settings, extraHeaderCtaButtons: updated })
                            }}
                            placeholder="/target-url"
                            className="bg-slate-50 border border-sky-200 rounded-lg p-1.5 text-xs font-mono text-slate-900"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = settings.extraHeaderCtaButtons.filter((_: any, i: number) => i !== idx)
                            setSettings({ ...settings, extraHeaderCtaButtons: updated })
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

              {/* WHATSAPP CARD */}
              <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
                    <Icon icon="mdi:whatsapp" className="w-4.5 h-4.5 text-emerald-600" />
                    WhatsApp Button & Link
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.whatsappActive}
                      onChange={(e) => setSettings({ ...settings, whatsappActive: e.target.checked })}
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span className="font-semibold text-emerald-900">Active</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Button Text</label>
                    <input
                      type="text"
                      value={settings.whatsappText}
                      onChange={(e) => setSettings({ ...settings, whatsappText: e.target.value })}
                      placeholder="WhatsApp"
                      className="w-full bg-white border border-emerald-300 rounded-lg p-2 font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Independent WhatsApp Number</label>
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      placeholder="+919876543210"
                      className="w-full bg-white border border-emerald-300 rounded-lg p-2 font-mono text-slate-900"
                    />
                  </div>
                  <div className="p-2 bg-emerald-100/60 rounded-lg text-[11px] text-emerald-900 flex items-center justify-between">
                    <span>Generated URL: <strong className="font-mono">{`https://wa.me/${generatedWaUrl}`}</strong></span>
                    <a href={`https://wa.me/${generatedWaUrl}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline flex items-center gap-1">
                      <Icon icon="ion:open-outline" /> Test
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PHONE & EMAIL */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingItem ? `Edit ${itemModalType === 'PHONE' ? 'Phone' : 'Email'}` : `Add New ${itemModalType === 'PHONE' ? 'Phone Number' : 'Email Address'}`}
              </h3>
              <button onClick={() => setItemModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContactItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Label Name</label>
                <input
                  type="text"
                  value={itemForm.label}
                  onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                  placeholder={itemModalType === 'PHONE' ? 'e.g. Admissions / Helpline' : 'e.g. Official / Info'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {itemModalType === 'PHONE' ? 'Phone Number' : 'Email Address'}
                </label>
                <input
                  type={itemModalType === 'PHONE' ? 'text' : 'email'}
                  value={itemForm.value}
                  onChange={(e) => setItemForm({ ...itemForm, value: e.target.value })}
                  placeholder={itemModalType === 'PHONE' ? '+91 91300 00000' : 'info@quickuppinstitute.com'}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={itemForm.isActive}
                  onChange={(e) => setItemForm({ ...itemForm, isActive: e.target.checked })}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <span className="font-semibold text-slate-800">Active and visible in Top Bar</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG FOR DELETE */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl">
              <Icon icon="ion:trash-outline" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Delete {deleteConfirm.type}?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
