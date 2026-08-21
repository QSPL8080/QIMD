'use client'

import React, { useState } from 'react'
import { saveBannerAction, deleteBannerPermanentlyAction } from '@/app/actions/bannerActions'
import { Icon } from '@iconify/react'

export interface BannerItem {
  id: string
  title?: string | null
  imageUrl: string
  displayOrder: number
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export default function BannerManagementClient({ initialBanners }: { initialBanners: BannerItem[] }) {
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BannerItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [imageUrl, setImageUrl] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null)

  const handleOpenAdd = () => {
    setEditingItem(null)
    setImageUrl('')
    setModalOpen(true)
    setMsg(null)
  }

  const handleOpenEdit = (item: BannerItem) => {
    setEditingItem(item)
    setImageUrl(item.imageUrl || '')
    setModalOpen(true)
    setMsg(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.url) {
        setImageUrl(data.url)
      } else {
        alert(data.error || 'Failed to upload banner image')
      }
    } catch (err) {
      alert('Error uploading image file')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const formData = new FormData(e.currentTarget)
    const rawData = {
      title: (formData.get('title') as string) || undefined,
      imageUrl: imageUrl.trim(),
      displayOrder: Number(formData.get('displayOrder') || 0),
      isActive: formData.get('isActive') === 'true',
    }

    const res = await saveBannerAction(rawData, editingItem?.id)
    setLoading(false)

    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'Saved successfully' })
      setModalOpen(false)
      window.location.reload()
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner record?')) return
    const res = await deleteBannerPermanentlyAction(id)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  const handleToggleActive = async (item: BannerItem) => {
    const res = await saveBannerAction(
      {
        title: item.title || undefined,
        imageUrl: item.imageUrl,
        displayOrder: item.displayOrder,
        isActive: !item.isActive,
      },
      item.id
    )
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:images-outline" className="w-6 h-6 text-purple-600" />
            Homepage Banner Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage, upload, reorder, activate or deactivate hero banner images displayed on the homepage carousel.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
          Upload New Banner
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

      {/* Banners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {banners.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No banners found. Click "Upload New Banner" to add one.
          </div>
        ) : (
          banners.map((item) => (
            <div
              key={item.id}
              className={`bg-white border ${
                item.isActive ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
              } rounded-2xl p-4 space-y-3 shadow-xs flex flex-col justify-between transition-all`}
            >
              <div className="space-y-3">
                {/* Banner Image Card Container */}
                <div className="relative group h-44 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.title || 'Homepage Banner'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewModalUrl(item.imageUrl)}
                      className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-lg text-xs font-bold shadow-md flex items-center gap-1"
                    >
                      <Icon icon="ion:eye-outline" className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                        item.isActive
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-slate-500 text-white border-slate-600'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/70 text-white backdrop-blur-xs">
                      Order: {item.displayOrder}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    {item.title || 'Untitled Banner'}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">{item.imageUrl}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`py-1.5 font-bold rounded-lg transition-colors text-center text-[11px] ${
                    item.isActive
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-center text-[11px]"
                >
                  Edit / Replace
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors text-center text-[11px]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Save / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit / Replace Banner' : 'Upload New Banner'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Title / Label (Optional)</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingItem?.title || ''}
                  placeholder="e.g. AI-Powered Marketing Special Batch"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              {/* Banner Image Upload & Preview Box */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-slate-700 font-semibold">
                  Banner Image (Upload Image File or Enter Path) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Upload file or enter /images/Banner/... path"
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                    required
                  />
                  <label className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl cursor-pointer font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    <Icon icon="ion:cloud-upload-outline" className="w-4 h-4" />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {/* Preview Box with [ X ] Remove button */}
                {imageUrl ? (
                  <div className="relative w-full h-36 bg-white rounded-xl border border-slate-300 p-2 flex items-center justify-center shadow-xs overflow-hidden">
                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-3 right-3 bg-rose-600 text-white p-1.5 rounded-full hover:bg-rose-700 shadow-md transition-transform hover:scale-110"
                      title="Remove Image Reference"
                    >
                      <Icon icon="ion:close" className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No image attached. Upload image file to proceed.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    defaultValue={editingItem?.displayOrder || 0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    name="isActive"
                    defaultValue={editingItem ? String(editingItem.isActive) : 'true'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                  >
                    <option value="true">Active (Visible in Homepage Carousel)</option>
                    <option value="false">Inactive (Hidden)</option>
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  {loading ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 z-10 bg-slate-900/70 text-white p-2 rounded-full hover:bg-slate-900 transition-colors"
            >
              <Icon icon="ion:close" className="w-6 h-6" />
            </button>
            <img src={previewModalUrl} alt="Banner Preview" className="w-full h-auto max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  )
}
