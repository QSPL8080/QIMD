'use client'

import React, { useState, useEffect } from 'react'
import {
  saveGalleryItemAction,
  trashGalleryItemAction,
  restoreGalleryItemAction,
  deleteGalleryItemAction,
} from '@/app/actions/cmsActions'
import { Icon } from '@iconify/react'

interface GalleryItem {
  id: string
  album?: string
  category?: string
  mediaType: 'IMAGE' | 'VIDEO'
  fileUrl: string
  thumbnail?: string
  altText?: string
  caption?: string
  isDeleted: boolean
  createdAt: string
}

const categories = ['Classroom', 'Training', 'Workshop', 'Activities', 'Facilities', 'Placements']

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<GalleryItem | null>(null)
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set())

  // Form State
  const [selectedCategory, setSelectedCategory] = useState('Classroom')
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')

  const fetchGallery = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/gallery')
      const data = await res.json()
      setGallery(data.gallery || [])
    } catch (err) {
      console.error('Failed to fetch gallery:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGallery()
  }, [])

  const filteredGallery = gallery.filter(
    (g) => (showTrash ? g.isDeleted : !g.isDeleted) && !brokenIds.has(g.id)
  )

  const handleOpenUpload = (item?: GalleryItem) => {
    if (item) {
      setEditItem(item)
      setSelectedCategory(item.category || 'Classroom')
      setAltText(item.altText || '')
      setCaption(item.caption || '')
    } else {
      setEditItem(null)
      setSelectedCategory('Classroom')
      setAltText('')
      setCaption('')
    }
    setShowModal(true)
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setStatusMsg(null)

    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File | null

    try {
      let fileUrl = editItem ? editItem.fileUrl : ''
      let mediaType: 'IMAGE' | 'VIDEO' = editItem ? editItem.mediaType : 'IMAGE'

      if (file && file.size > 0) {
        const uploadForm = new FormData()
        uploadForm.append('file', file)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm,
        })
        const uploadData = await uploadRes.json()
        if (uploadData.success && uploadData.url) {
          fileUrl = uploadData.url
          mediaType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
        } else {
          setStatusMsg({ type: 'error', text: uploadData.error || 'File upload failed' })
          setUploading(false)
          return
        }
      }

      if (!fileUrl) {
        setStatusMsg({ type: 'error', text: 'Please select an image or video file to upload.' })
        setUploading(false)
        return
      }

      const res = await saveGalleryItemAction(
        {
          album: selectedCategory,
          category: selectedCategory,
          mediaType,
          fileUrl,
          altText: altText || file?.name || 'QIMD Campus Media',
          caption,
        },
        editItem?.id
      )

      setUploading(false)
      setShowModal(false)

      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: editItem ? 'Gallery item updated!' : 'New media added to website gallery!',
        })
        fetchGallery()
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Operation failed' })
      }
    } catch (err: any) {
      setUploading(false)
      setStatusMsg({ type: 'error', text: err.message || 'Operation error' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move gallery item to Trash?')) return
    const res = await trashGalleryItemAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Moved to Trash' })
      fetchGallery()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to trash item' })
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreGalleryItemAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Restored from Trash' })
      fetchGallery()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to restore item' })
    }
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('WARNING: Permanently delete this gallery item from database?')) return
    const res = await deleteGalleryItemAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Item permanently deleted' })
      fetchGallery()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete item' })
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:images-outline" className="w-6 h-6 text-blue-600" />
            Training Gallery & Campus Media CMS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage photos &amp; videos of classrooms, labs, events, and student activities — synced live to website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showTrash
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon icon="ion:trash-outline" className="w-4 h-4" />
            {showTrash ? 'View Active Media' : 'View Trash'}
          </button>

          {!showTrash && (
            <button
              onClick={() => handleOpenUpload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Icon icon="ion:cloud-upload-outline" className="w-4 h-4" />
              Upload New Media
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between shadow-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <Icon icon="ion:close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            <Icon icon="ion:sync" className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading gallery media from database...
          </div>
        ) : filteredGallery.length === 0 ? (
          <div className="col-span-full py-12 text-center space-y-3">
            <Icon icon="ion:images-outline" className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Gallery Panel is Blank</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              No gallery images or videos exist in database. Upload photos/videos above to publish them live on the website.
            </p>
            <button
              onClick={() => handleOpenUpload()}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
              Upload First Media Item
            </button>
          </div>
        ) : (
          filteredGallery.map((item) => {
            const isVideo = item.mediaType === 'VIDEO' || item.fileUrl.endsWith('.mp4')

            return (
              <div
                key={item.id}
                className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="h-36 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  {isVideo ? (
                    <div className="text-center p-2 text-white">
                      <Icon icon="ion:play-circle" className="w-10 h-10 text-rose-500 mx-auto mb-1" />
                      <span className="text-[10px] font-bold block truncate max-w-[120px]">
                        {item.altText || 'Video File'}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.fileUrl}
                      alt={item.altText || 'QIMD Gallery'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => {
                        setBrokenIds((prev) => new Set(prev).add(item.id))
                      }}
                    />
                  )}

                  <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                    {item.category || 'General'}
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  <p className="text-xs font-bold text-slate-800 truncate" title={item.altText}>
                    {item.altText || 'Campus Media'}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenUpload(item)}
                      className="text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Edit / Replace File"
                    >
                      <Icon icon="ion:create-outline" className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    {!item.isDeleted ? (
                      <button
                        onClick={() => handleTrash(item.id)}
                        className="text-amber-600 hover:text-amber-800 p-1 cursor-pointer"
                        title="Move to Trash"
                      >
                        <Icon icon="ion:trash-outline" className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
                          title="Restore"
                        >
                          <Icon icon="ion:refresh-outline" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePermanently(item.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                          title="Delete Permanently"
                        >
                          <Icon icon="ion:trash-bin-outline" className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Upload / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Icon icon="ion:images-outline" className="w-5 h-5 text-blue-600" />
                {editItem ? 'Edit / Replace Gallery Media' : 'Upload New Gallery Media'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gallery Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Media File (Image or Video) {editItem ? '(Optional if keeping current file)' : ''}
                </label>
                <input
                  type="file"
                  name="file"
                  accept="image/*,video/*"
                  required={!editItem}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alt Text / Title</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="e.g. Students working on AI Lab project"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Caption (Description)</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Brief description for public gallery..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {uploading ? 'Processing...' : editItem ? 'Save Changes' : 'Upload & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
