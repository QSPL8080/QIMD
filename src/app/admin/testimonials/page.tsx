'use client'

import React, { useState, useEffect } from 'react'
import {
  saveTestimonialAction,
  trashTestimonialAction,
  restoreTestimonialAction,
  deleteTestimonialAction,
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
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors flex items-center gap-2 ${
              showTrash
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon icon="ion:trash-outline" className="w-4.5 h-4.5" />
            {showTrash ? 'View Active Reviews' : 'View Trash'}
          </button>

          <button
            onClick={() => openForm()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
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

      {/* List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading testimonials...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">No testimonials found in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
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
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
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
    </div>
  )
}
