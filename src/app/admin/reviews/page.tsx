'use client'

import React, { useState, useEffect } from 'react'
import {
  saveStudentReviewAction,
  trashStudentReviewAction,
  restoreStudentReviewAction,
  deleteStudentReviewAction,
} from '@/app/actions/cmsActions'
import { Icon } from '@iconify/react'

export default function AdminStudentReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [starRating, setStarRating] = useState<number>(5)

  const seedDefaultReviewsIfEmpty = async () => {
    const initialReviews = [
      {
        studentName: "Rohan V.",
        course: "Digital Marketing Master Program",
        review: "The practical training and live client projects helped me build confidence and prepare for interviews. The trainers were supportive throughout my learning journey.",
        rating: 5,
        company: "Growth Media Agency",
      },
      {
        studentName: "Sneha M.",
        course: "UI/UX & Graphic Design Course",
        review: "The AI-powered curriculum, internships, and placement guidance gave me the skills I needed to start my career with confidence.",
        rating: 5,
        company: "Creative Studio",
      },
      {
        studentName: "Aniket K.",
        course: "Video Editing & Content Creation",
        review: "Unlike traditional institutes, QIMD focuses on practical implementation. Every assignment and project helped me understand how the industry actually works.",
        rating: 5,
        company: "Media House",
      },
      {
        studentName: "Pooja S.",
        course: "Full-Stack Digital Marketing & AI",
        review: "From zero experience to working on real client projects, the journey at QIMD has been truly rewarding. I highly recommend it to anyone looking to build a career in the digital industry.",
        rating: 5,
        company: "Tech Agency",
      },
    ]

    for (const r of initialReviews) {
      await saveStudentReviewAction(r)
    }
  }

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reviews')
      const data = await res.json()
      let items = data.reviews || []

      if (items.length === 0) {
        await seedDefaultReviewsIfEmpty()
        const res2 = await fetch('/api/admin/reviews')
        const data2 = await res2.json()
        items = data2.reviews || []
      }

      setReviews(items)
    } catch (err) {
      console.error('Failed to fetch student reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const openForm = (item?: any) => {
    if (item) {
      setEditingItem(item)
      setStarRating(item.rating || 5)
      setPhotoUrl(item.photo || '')
    } else {
      setEditingItem(null)
      setStarRating(5)
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

  const filteredItems = reviews.filter((r) => (showTrash ? r.isDeleted : !r.isDeleted))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const payload = {
      studentName: formData.get('studentName') as string,
      photo: photoUrl.trim() || null,
      course: formData.get('course') as string,
      company: formData.get('company') as string,
      rating: starRating,
      review: formData.get('review') as string,
      isActive: formData.get('isActive') === 'true',
    }

    const res = await saveStudentReviewAction(payload, editingItem?.id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Student review saved' })
      setIsFormOpen(false)
      setEditingItem(null)
      fetchItems()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save review' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move review to Trash?')) return
    const res = await trashStudentReviewAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Review moved to Trash' })
      fetchItems()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to trash review' })
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreStudentReviewAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Review restored' })
      fetchItems()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to restore' })
    }
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('WARNING: Permanently delete this review?')) return
    const res = await deleteStudentReviewAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Review permanently deleted' })
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
            <Icon icon="ion:chatbubble-ellipses-outline" className="w-6 h-6 text-indigo-600" />
            Student Reviews CMS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage student written reviews and star ratings displayed in the Student Reviews section
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
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Icon icon="ion:add-circle-outline" className="w-4.5 h-4.5" />
            Add Student Review
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
          <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading reviews...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">No student reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-4">Student &amp; Photo</th>
                  <th className="p-4">Course &amp; Company</th>
                  <th className="p-4">Star Rating</th>
                  <th className="p-4">Review Text</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {r.photo ? (
                        <img
                          src={r.photo}
                          alt={r.studentName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-100">
                          {r.studentName ? r.studentName.charAt(0) : 'S'}
                        </div>
                      )}
                      <span className="font-bold text-slate-900">{r.studentName}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-indigo-600">{r.course || 'AI Course'}</p>
                      {r.company && <p className="text-xs text-slate-500">@ {r.company}</p>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < (r.rating || 5) ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs text-slate-600 italic truncate">&quot;{r.review}&quot;</td>
                    <td className="p-4 text-right space-x-2">
                      {!r.isDeleted ? (
                        <>
                          <button
                            onClick={() => openForm(r)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Icon icon="ion:create-outline" className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleTrash(r.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Move to Trash"
                          >
                            <Icon icon="ion:trash-outline" className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(r.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore"
                          >
                            <Icon icon="ion:refresh-outline" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePermanently(r.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Permanently"
                          >
                            <Icon icon="ion:trash-bin-outline" className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Drawer / Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingItem ? 'Edit Student Review' : 'Add New Student Review'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <Icon icon="ion:close-outline" className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  required
                  defaultValue={editingItem?.studentName || ''}
                  placeholder="e.g. Rohan V."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Profile Photo (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Profile Photo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Student Preview"
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      <Icon icon="ion:person-outline" className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="Or paste photo URL..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Completed</label>
                <input
                  type="text"
                  name="course"
                  defaultValue={editingItem?.course || ''}
                  placeholder="e.g. Digital Marketing Master Program"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company (Optional)</label>
                <input
                  type="text"
                  name="company"
                  defaultValue={editingItem?.company || ''}
                  placeholder="e.g. Growth Media Agency"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Star Rating</label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setStarRating(star)}
                      className="text-2xl focus:outline-none"
                    >
                      <span className={star <= starRating ? 'text-amber-400' : 'text-slate-300'}>★</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Review Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="review"
                  required
                  rows={4}
                  defaultValue={editingItem?.review || ''}
                  placeholder="Write the student review text..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  name="isActive"
                  defaultValue={editingItem?.isActive !== false ? 'true' : 'false'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600"
                >
                  <option value="true">Active (Published)</option>
                  <option value="false">Draft (Inactive)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
