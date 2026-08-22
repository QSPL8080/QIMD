'use client'

import React, { useState } from 'react'
import { savePartnerAction, deletePartnerPermanentlyAction } from '@/app/actions/partnerActions'
import { bulkDeletePartnersAction } from '@/app/actions/cmsActions'
import { Icon } from '@iconify/react'

interface PartnerItem {
  id: string
  name: string
  logo: string
  type?: string
  websiteUrl?: string
  description?: string
  displayOrder: number
  isActive: boolean
}

export default function PartnerManagementClient({
  hiringPartners: initialHiringPartners,
  emiPartners: initialEmiPartners,
}: {
  hiringPartners: PartnerItem[]
  emiPartners: PartnerItem[]
}) {
  const [tab, setTab] = useState<'HIRING' | 'EMI'>('HIRING')
  const [hiringPartners, setHiringPartners] = useState<PartnerItem[]>(initialHiringPartners)
  const [emiPartners, setEmiPartners] = useState<PartnerItem[]>(initialEmiPartners)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PartnerItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [logoUrl, setLogoUrl] = useState<string>('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkConfirmModal, setBulkConfirmModal] = useState<boolean>(false)

  const currentList = tab === 'HIRING' ? hiringPartners : emiPartners

  const handleTabChange = (newTab: 'HIRING' | 'EMI') => {
    setTab(newTab)
    setSelectedIds([])
    setMsg(null)
  }

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === currentList.length && currentList.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(currentList.map((p) => p.id))
    }
  }

  const handleOpenAdd = () => {
    setEditingItem(null)
    setLogoUrl('')
    setModalOpen(true)
    setMsg(null)
  }

  const handleOpenEdit = (item: PartnerItem) => {
    setEditingItem(item)
    setLogoUrl(item.logo || '')
    setModalOpen(true)
    setMsg(null)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.url) {
        setLogoUrl(data.url)
      } else {
        alert(data.error || 'Failed to upload partner logo')
      }
    } catch (err) {
      alert('Error uploading logo file')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const formData = new FormData(e.currentTarget)
    const rawData = {
      name: formData.get('name') as string,
      logo: logoUrl.trim(),
      type: tab,
      websiteUrl: formData.get('websiteUrl') as string,
      displayOrder: Number(formData.get('displayOrder') || 0),
      isActive: formData.get('isActive') === 'true',
    }

    const res = await savePartnerAction(rawData, editingItem?.id)
    setLoading(false)

    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'Saved successfully' })
      setModalOpen(false)
      const updatedItem: PartnerItem = {
        id: editingItem?.id || (res.partner?.id ? String(res.partner.id) : Date.now().toString()),
        name: rawData.name,
        logo: rawData.logo,
        type: rawData.type,
        websiteUrl: rawData.websiteUrl,
        description: rawData.websiteUrl,
        displayOrder: rawData.displayOrder,
        isActive: rawData.isActive,
      }

      if (tab === 'HIRING') {
        setHiringPartners((prev) =>
          editingItem ? prev.map((p) => (p.id === editingItem.id ? updatedItem : p)) : [updatedItem, ...prev]
        )
      } else {
        setEmiPartners((prev) =>
          editingItem ? prev.map((p) => (p.id === editingItem.id ? updatedItem : p)) : [updatedItem, ...prev]
        )
      }
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this partner record permanently?')) return
    const res = await deletePartnerPermanentlyAction(id, tab === 'EMI')
    if (res.success) {
      if (tab === 'HIRING') {
        setHiringPartners((prev) => prev.filter((p) => p.id !== id))
      } else {
        setEmiPartners((prev) => prev.filter((p) => p.id !== id))
      }
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      setMsg({ type: 'success', text: 'Partner deleted permanently' })
    } else {
      alert(res.error)
    }
  }

  const handleBulkDelete = async () => {
    const isEmi = tab === 'EMI'
    const res = await bulkDeletePartnersAction(selectedIds, isEmi)
    if (res.success) {
      if (tab === 'HIRING') {
        setHiringPartners((prev) => prev.filter((p) => !selectedIds.includes(p.id)))
      } else {
        setEmiPartners((prev) => prev.filter((p) => !selectedIds.includes(p.id)))
      }
      setSelectedIds([])
      setBulkConfirmModal(false)
      setMsg({ type: 'success', text: `${selectedIds.length} partner records permanently deleted` })
    } else {
      setBulkConfirmModal(false)
      setMsg({ type: 'error', text: res.error || 'Failed to delete partners' })
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:briefcase-outline" className="w-6 h-6 text-indigo-600" />
            Hiring & EMI Financial Partners Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage placement hiring partner logos and 0% EMI financing partner logos displayed across the public website
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
          Add {tab === 'HIRING' ? 'Hiring Partner' : 'EMI Partner'}
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-xs border ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('HIRING')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            tab === 'HIRING'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Corporate Hiring Partners ({hiringPartners.length})
        </button>
        <button
          onClick={() => setTab('EMI')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            tab === 'EMI'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          0% Interest EMI Partners ({emiPartners.length})
        </button>
      </div>

      {/* Bulk Action Bar */}
      {currentList.length > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.length === currentList.length && currentList.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700">
              {selectedIds.length > 0
                ? `${selectedIds.length} of ${currentList.length} selected`
                : `Select all (${currentList.length})`}
            </span>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={() => setBulkConfirmModal(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Icon icon="ion:trash-bin-outline" className="w-3.5 h-3.5" />
              Permanently Delete ({selectedIds.length})
            </button>
          )}
        </div>
      )}

      {/* Partners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentList.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No partners found in this section. Click &quot;Add Partner&quot; to create one.
          </div>
        ) : (
          currentList.map((item) => (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-4 space-y-3 shadow-xs flex flex-col justify-between transition-colors ${
                selectedIds.includes(item.id) ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelectId(item.id)}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {item.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <div className="h-20 bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-center">
                  <img src={item.logo} alt={item.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                  {item.websiteUrl && (
                    <p className="text-[11px] text-blue-600 truncate mt-0.5">{item.websiteUrl}</p>
                  )}
                  {item.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-center"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? `Edit ${tab === 'HIRING' ? 'Hiring' : 'EMI'} Partner` : `Add ${tab === 'HIRING' ? 'Hiring' : 'EMI'} Partner`}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Partner Company Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingItem?.name || ''}
                  placeholder="e.g. Google, TechCorp, Bajaj Finance"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              {/* Partner Logo Upload & Preview Box */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-slate-700 font-semibold">Partner Logo (Upload from Device or URL) *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="logo"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Upload logo file or enter image URL..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                    required
                  />
                  <label className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    <Icon icon="ion:cloud-upload-outline" className="w-4 h-4" />
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>

                {/* Preview Box with [ X ] Delete button */}
                {logoUrl ? (
                  <div className="relative w-36 h-20 bg-white rounded-xl border border-slate-300 p-2 flex items-center justify-center shadow-xs">
                    <img src={logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white p-1.5 rounded-full hover:bg-rose-700 shadow-md transition-transform hover:scale-110"
                      title="Delete Logo"
                    >
                      <Icon icon="ion:close" className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No logo attached. Click upload to attach logo file.</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {tab === 'HIRING' ? 'Website URL (Optional)' : 'Description (Optional)'}
                </label>
                <input
                  type="text"
                  name="websiteUrl"
                  defaultValue={editingItem?.websiteUrl || editingItem?.description || ''}
                  placeholder={tab === 'HIRING' ? 'https://company.com' : '0% Interest EMI Option'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    defaultValue={editingItem?.displayOrder || 0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    name="isActive"
                    defaultValue={editingItem ? String(editingItem.isActive) : 'true'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  {loading ? 'Saving...' : 'Save Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Delete Permanently Confirmation Modal */}
      {bulkConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Icon icon="ion:alert-circle" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Permanently delete {selectedIds.length} {tab === 'HIRING' ? 'hiring' : 'EMI'} partners?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                These partner records and logos will be permanently removed from the database and cannot be recovered.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setBulkConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
