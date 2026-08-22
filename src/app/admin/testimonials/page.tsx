'use client'

import React, { useState, useEffect } from 'react'
import {
  saveTestimonialAction,
  trashTestimonialAction,
  restoreTestimonialAction,
  deleteTestimonialAction,
  bulkTrashTestimonialsAction,
  bulkRestoreTestimonialsAction,
  bulkDeleteTestimonialsPermanentlyAction,
} from '@/app/actions/cmsActions'
import { Icon } from '@iconify/react'

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [starRating, setStarRating] = useState<number>(5)
  const [youtubeLinkInput, setYoutubeLinkInput] = useState<string>('')
  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkConfirmModal, setBulkConfirmModal] = useState<boolean>(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/testimonials')
      const data = await res.json()
      setTestimonials(data.testimonials || [])

      const coursesRes = await fetch('/api/admin/courses')
      const coursesData = await coursesRes.json()
      setCourses(coursesData.courses || [])
    } catch (err) {
      console.error('Failed to fetch testimonials:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const openForm = (item?: any) => {
    if (item) {
      setEditingItem(item)
      setStarRating(item.rating || 5)
      setYoutubeLinkInput(item.videoUrl || '')
      setPhotoUrl(item.photo || '')
    } else {
      setEditingItem(null)
      setStarRating(5)
      setYoutubeLinkInput('')
      setPhotoUrl('')
    }
    setIsFormOpen(true)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.url) {
        setPhotoUrl(data.url)
      } else {
        alert(data.error || 'Failed to upload photo')
      }
    } catch (err) {
      alert('Error uploading file')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const filteredItems = testimonials.filter((t) => {
    const matchesTrash = showTrash ? t.isDeleted : !t.isDeleted
    return matchesTrash
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const payload = {
      studentName: formData.get('studentName') as string,
      heading: formData.get('heading') as string,
      course: formData.get('course') as string,
      company: formData.get('company') as string,
      rating: starRating,
      review: formData.get('review') as string,
      photo: photoUrl.trim() || (formData.get('photo') as string) || null,
      youtubeLink: youtubeLinkInput,
      featured: formData.get('featured') === 'true',
      isActive: formData.get('isActive') === 'true',
    }

    const res = await saveTestimonialAction(payload, editingItem?.id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Testimonial saved successfully' })
      setIsFormOpen(false)
      setEditingItem(null)
      fetchItems()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save testimonial' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move testimonial to Trash?')) return
    const res = await trashTestimonialAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Testimonial moved to Trash' })
      fetchItems()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to trash testimonial' })
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreTestimonialAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Testimonial restored from Trash' })
      fetchItems()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to restore' })
    }
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('WARNING: Permanently delete this testimonial?')) return
    const res = await deleteTestimonialAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Testimonial permanently deleted' })
      fetchItems()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete' })
    }
  }

  const activeTestimonials = testimonials.filter((t) => !t.isDeleted)
  const trashTestimonials = testimonials.filter((t) => t.isDeleted)

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredItems.map((t) => t.id))
    }
  }

  const handleTabChange = (trash: boolean) => {
    setShowTrash(trash)
    setSelectedIds([])
    setStatusMsg(null)
  }

  const handleBulkTrash = async () => {
    if (!confirm(`Move ${selectedIds.length} testimonials to Trash?`)) return
    const res = await bulkTrashTestimonialsAction(selectedIds)
    if (res.success) {
      setSelectedIds([])
      setStatusMsg({ type: 'success', text: `${selectedIds.length} testimonials moved to Trash` })
      fetchItems()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to bulk trash testimonials' })
    }
  }

  const handleBulkRestore = async () => {
    const res = await bulkRestoreTestimonialsAction(selectedIds)
    if (res.success) {
      setSelectedIds([])
      setStatusMsg({ type: 'success', text: `${selectedIds.length} testimonials restored` })
      fetchItems()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to bulk restore testimonials' })
    }
  }

  const handleBulkDeletePermanently = async () => {
    const res = await bulkDeleteTestimonialsPermanentlyAction(selectedIds)
    if (res.success) {
      setSelectedIds([])
      setBulkConfirmModal(false)
      setStatusMsg({ type: 'success', text: `${selectedIds.length} testimonials permanently deleted` })
      fetchItems()
    } else {
      setBulkConfirmModal(false)
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete testimonials' })
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:videocam-outline" className="w-6 h-6 text-purple-600" />
            Student Testimonials CMS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage student video testimonials and YouTube links displayed on the website
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleTabChange(false)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                !showTrash
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon icon="ion:list-outline" className="w-4 h-4 text-purple-600" />
              Active ({activeTestimonials.length})
            </button>
            <button
              onClick={() => handleTabChange(true)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                showTrash
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon icon="ion:trash-outline" className="w-4 h-4" />
              Trash ({trashTestimonials.length})
            </button>
          </div>

          <button
            onClick={() => openForm()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Icon icon="ion:add-circle-outline" className="w-4.5 h-4.5" />
            Add Testimonial
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Bulk Action Bar */}
      {filteredItems.length > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700">
              {selectedIds.length > 0
                ? `${selectedIds.length} of ${filteredItems.length} selected`
                : `Select all (${filteredItems.length})`}
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              {showTrash ? (
                <>
                  <button
                    onClick={handleBulkRestore}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Icon icon="ion:refresh-outline" className="w-3.5 h-3.5" />
                    Restore Selected ({selectedIds.length})
                  </button>
                  <button
                    onClick={() => setBulkConfirmModal(true)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Icon icon="ion:trash-bin-outline" className="w-3.5 h-3.5" />
                    Permanently Delete ({selectedIds.length})
                  </button>
                </>
              ) : (
                <button
                  onClick={handleBulkTrash}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Icon icon="ion:trash-outline" className="w-3.5 h-3.5" />
                  Move Selected to Trash ({selectedIds.length})
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading testimonials...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">
            {showTrash ? 'No testimonials currently in Trash.' : 'No active testimonials found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="p-4 w-10"></th>
                <th className="p-4">Student & Photo</th>
                <th className="p-4">Heading / Course</th>
                <th className="p-4">Rating & Type</th>
                <th className="p-4">Review Text</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.map((item) => {
                const isVideoTestimonial = item.isVideo || (item.videoUrl && item.videoUrl.trim() !== '')

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      selectedIds.includes(item.id) ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelectId(item.id)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-4 flex items-center gap-3.5">
                      <img
                        src={item.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'}
                        alt={item.studentName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 text-base leading-snug">{item.studentName}</p>
                        {item.company && (
                          <p className="text-blue-600 font-semibold text-xs mt-0.5">
                            @ {item.company}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {item.heading && (
                        <p className="font-semibold text-slate-800 text-sm truncate max-w-[180px]">
                          &quot;{item.heading}&quot;
                        </p>
                      )}
                      <p className="text-slate-500 text-xs font-medium">{item.course || 'AI Course'}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < (item.rating || 5) ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <div className="mt-1">
                        {isVideoTestimonial ? (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1 rounded-full">
                            <Icon icon="ion:videocam" /> Video Testimonial
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1 rounded-full">
                            <Icon icon="ion:document-text" /> Text Testimonial
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs text-slate-600 font-medium text-sm truncate">{item.review}</td>
                    <td className="p-4 text-right space-x-2">
                      {!item.isDeleted ? (
                        <>
                          <button
                            onClick={() => openForm(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Icon icon="ion:create-outline" className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleTrash(item.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Move to Trash"
                          >
                            <Icon icon="ion:trash-outline" className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(item.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore"
                          >
                            <Icon icon="ion:refresh-outline" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePermanently(item.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Permanently"
                          >
                            <Icon icon="ion:trash-bin-outline" className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-xl p-6 sm:p-7 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Student Name *</label>
                  <input
                    type="text"
                    name="studentName"
                    required
                    defaultValue={editingItem?.studentName || ''}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Testimonial Heading</label>
                  <input
                    type="text"
                    name="heading"
                    defaultValue={editingItem?.heading || ''}
                    placeholder='e.g. "Excellent practical learning experience"'
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              {/* Student Photo Upload & Preview */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-slate-700 font-semibold">Student Photo (Upload from Computer or URL)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="photo"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Upload photo or enter URL..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                  <label className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    <Icon icon="ion:cloud-upload-outline" className="w-4 h-4" />
                    {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                {photoUrl ? (
                  <div className="relative w-20 h-20 rounded-full border border-slate-300 bg-white p-0.5">
                    <img src={photoUrl} alt="Photo Preview" className="w-full h-full object-cover rounded-full" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute -top-1 -right-1 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700 shadow-md transition-transform hover:scale-110"
                      title="Delete Photo"
                    >
                      <Icon icon="ion:close" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No photo attached. Upload or leave blank.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Course Completed</label>
                  {courses.length > 0 ? (
                    <select
                      name="course"
                      defaultValue={editingItem?.course || courses[0]?.courseName || ''}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.courseName}>
                          {c.courseName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="course"
                      defaultValue={editingItem?.course || 'AI Powered Digital Marketing Course'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Company</label>
                  <input
                    type="text"
                    name="company"
                    defaultValue={editingItem?.company || ''}
                    placeholder="e.g. Google, TCS, Growth Agency"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              {/* Star Rating Input */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Star Rating (1 to 5 Stars) *</label>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1 text-2xl text-amber-400 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStarRating(star)}
                        className="hover:scale-110 transition-transform"
                      >
                        {star <= starRating ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {starRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Review Text *</label>
                <textarea
                  name="review"
                  required
                  rows={4}
                  defaultValue={editingItem?.review || ''}
                  placeholder="Enter student review details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              {/* Optional YouTube Video Link */}
              <div className="bg-purple-50/60 p-4 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-purple-900 font-bold flex items-center gap-1.5">
                    <Icon icon="ion:logo-youtube" className="text-red-600 text-base" />
                    YouTube Video Link (Optional)
                  </label>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    {youtubeLinkInput.trim() !== '' ? 'VIDEO TESTIMONIAL' : 'TEXT TESTIMONIAL'}
                  </span>
                </div>
                <input
                  type="url"
                  name="youtubeLink"
                  value={youtubeLinkInput}
                  onChange={(e) => setYoutubeLinkInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Featured Status</label>
                  <select
                    name="featured"
                    defaultValue={editingItem ? String(editingItem.featured) : 'false'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="true">Featured</option>
                    <option value="false">Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Active Status</label>
                  <select
                    name="isActive"
                    defaultValue={editingItem ? String(editingItem.isActive) : 'true'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Testimonial
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
                Permanently delete {selectedIds.length} testimonials?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                These testimonials and student photos will be permanently removed from the database and cannot be recovered.
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
                onClick={handleBulkDeletePermanently}
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
