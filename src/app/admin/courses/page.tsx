'use client'

import React, { useState, useEffect } from 'react'
import {
  saveCourseAction,
  trashCourseAction,
  restoreCourseAction,
  deleteCourseAction,
} from '@/app/actions/cmsActions'
import { deleteUnusedImageAction } from '@/app/actions/mediaActions'
import { Icon } from '@iconify/react'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [trainers, setTrainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCourse, setEditingCourse] = useState<any | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [search, setSearch] = useState('')

  // File upload state & banner preview
  const [bannerImageUrl, setBannerImageUrl] = useState('')
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/courses')
      const data = await res.json()
      setCourses(data.courses || [])
      setCategories(data.categories || [])
      setTrainers(data.trainers || [])
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openForm = (course?: any) => {
    if (course) {
      setEditingCourse(course)
      setBannerImageUrl(course.bannerImage || '')
    } else {
      setEditingCourse(null)
      setBannerImageUrl('')
    }
    setIsFormOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBanner(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.url) {
        const previousImage = bannerImageUrl
        setBannerImageUrl(data.url)
        // Delete old physical image file if replacing
        if (previousImage && previousImage !== data.url && previousImage.startsWith('/uploads/')) {
          deleteUnusedImageAction(previousImage)
        }
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (err) {
      alert('Error uploading file from computer')
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleRemoveBanner = async () => {
    if (!bannerImageUrl) return
    const urlToRemove = bannerImageUrl
    setBannerImageUrl('')
    await deleteUnusedImageAction(urlToRemove)
  }

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.courseName.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
    const matchesTrash = showTrash ? c.isDeleted : !c.isDeleted
    return matchesSearch && matchesTrash
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const finalBanner = bannerImageUrl.trim() || (formData.get('bannerImage') as string) || ''

    const rawCatId = formData.get('categoryId') as string
    const categoryId = rawCatId && rawCatId.trim() ? rawCatId.trim() : (categories[0]?.id || null)
    const rawTrainerId = formData.get('trainerId') as string
    const trainerId = rawTrainerId && rawTrainerId.trim() ? rawTrainerId.trim() : null

    const payload = {
      courseName: (formData.get('courseName') as string) || 'Untitled Course',
      slug: (formData.get('slug') as string) || (formData.get('courseName') as string || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId,
      trainerId,
      shortDescription: (formData.get('shortDescription') as string) || '',
      description: (formData.get('description') as string) || '',
      bannerImage: finalBanner || null,
      duration: (formData.get('duration') as string) || '6 Months',
      fees: Number(formData.get('fees')) || 0,
      discountPrice: Number(formData.get('discountPrice')) || 0,
      eligibility: (formData.get('eligibility') as string) || '',
      syllabus: (formData.get('syllabus') as string) || '',
      learningOutcomes: (formData.get('learningOutcomes') as string) || '',
      certification: (formData.get('certification') as string) || '',
      brochure: (formData.get('brochure') as string) || '',
      demoVideo: (formData.get('demoVideo') as string) || '',
      featured: formData.get('featured') === 'true',
      displayOrder: Number(formData.get('displayOrder') || 0),
      metaTitle: (formData.get('metaTitle') as string) || '',
      metaDescription: (formData.get('metaDescription') as string) || '',
      status: (formData.get('status') as string) || 'PUBLISHED',
      isActive: formData.get('isActive') !== 'false',
    }

    const res = await saveCourseAction(payload, editingCourse?.id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Course saved successfully' })
      setIsFormOpen(false)
      setEditingCourse(null)
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save course' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move course to Trash?')) return
    const res = await trashCourseAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Course moved to Trash' })
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to trash course' })
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreCourseAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Course restored from Trash' })
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to restore course' })
    }
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('WARNING: Permanently delete this course? This cannot be undone.')) return
    const res = await deleteCourseAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Course permanently deleted' })
      fetchData()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete course' })
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:book-outline" className="w-6 h-6 text-sky-600" />
            Courses CMS Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, edit, publish, assign trainers, upload banner images, syllabus, and manage courses
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
            {showTrash ? 'View Active Courses' : 'View Trash'}
          </button>

          <button
            onClick={() => openForm()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Icon icon="ion:add-circle-outline" className="w-4.5 h-4.5" />
            Create New Course
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

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search course name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
          <Icon icon="ion:search-outline" className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Courses List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">No courses found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">Course Banner & Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Duration & Fees</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 flex items-center gap-3.5">
                    <img
                      src={course.bannerImage || '/images/courses/digital-marketing.jpg'}
                      alt={course.courseName}
                      className="w-14 h-10 object-cover rounded-lg border border-slate-200 bg-slate-100 flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 text-base leading-snug">{course.courseName}</p>
                      <p className="text-slate-400 text-xs font-medium">/{course.slug}</p>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-800 text-sm">{course.category?.name || 'General'}</td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-900 text-sm">{course.duration || '6 Months'}</p>
                    <p className="text-emerald-700 font-bold text-xs">
                      ₹{course.discountPrice || course.fees}
                    </p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                        course.status === 'PUBLISHED' && course.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {course.status} {course.isActive ? '' : '(Inactive)'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {!course.isDeleted ? (
                      <>
                        <button
                          onClick={() => openForm(course)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <Icon icon="ion:create-outline" className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleTrash(course.id)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Move to Trash"
                        >
                          <Icon icon="ion:trash-outline" className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRestore(course.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Restore"
                        >
                          <Icon icon="ion:refresh-outline" className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePermanently(course.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Permanently"
                        >
                          <Icon icon="ion:trash-bin-outline" className="w-5 h-5" />
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

      {/* Course Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-2xl p-6 sm:p-7 max-h-[88vh] overflow-y-auto no-scrollbar space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingCourse ? 'Edit Course Record' : 'Create New Course Record'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Course Name *</label>
                  <input
                    type="text"
                    name="courseName"
                    required
                    defaultValue={editingCourse?.courseName || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SEO Slug</label>
                  <input
                    type="text"
                    name="slug"
                    defaultValue={editingCourse?.slug || ''}
                    placeholder="e.g. ai-powered-digital-marketing"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Course Category *</label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={editingCourse?.categoryId || (categories[0]?.id || '')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Trainer</label>
                  <select
                    name="trainerId"
                    defaultValue={editingCourse?.trainerId || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="">No Trainer Assigned</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.designation || 'Instructor'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    defaultValue={editingCourse?.duration || '6 Months'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Standard Fees (₹)</label>
                  <input
                    type="number"
                    name="fees"
                    defaultValue={editingCourse?.fees || 45000}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    name="discountPrice"
                    defaultValue={editingCourse?.discountPrice || 35000}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              {/* Banner Image Upload & Preview */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-slate-700 font-semibold">Banner Image (Upload from Computer or URL)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="bannerImage"
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    placeholder="/images/courses/digital-marketing.jpg or /uploads/..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                  <label className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    <Icon icon="ion:cloud-upload-outline" className="w-4 h-4" />
                    {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                {bannerImageUrl && (
                  <div className="relative w-56 h-32 rounded-xl overflow-hidden border border-slate-300 bg-white p-1 group">
                    <img src={bannerImageUrl} alt="Banner Preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-md transition-colors"
                      title="Remove / Delete Banner Image"
                    >
                      <Icon icon="ion:close" className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Short Description</label>
                <textarea
                  name="shortDescription"
                  rows={2}
                  defaultValue={editingCourse?.shortDescription || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Description & Overview</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={editingCourse?.description || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Syllabus & Modules (Line by Line)</label>
                <textarea
                  name="syllabus"
                  rows={4}
                  defaultValue={editingCourse?.syllabus || ''}
                  placeholder="Module 1: SEO Basics&#10;Module 2: Google Ads"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Learning Outcomes</label>
                  <textarea
                    name="learningOutcomes"
                    rows={3}
                    defaultValue={editingCourse?.learningOutcomes || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Certification Details</label>
                  <textarea
                    name="certification"
                    rows={3}
                    defaultValue={editingCourse?.certification || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SEO Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    defaultValue={editingCourse?.metaTitle || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SEO Meta Description</label>
                  <input
                    type="text"
                    name="metaDescription"
                    defaultValue={editingCourse?.metaDescription || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Publish Status</label>
                  <select
                    name="status"
                    defaultValue={editingCourse?.status || 'PUBLISHED'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Featured Program</label>
                  <select
                    name="featured"
                    defaultValue={editingCourse ? String(editingCourse.featured) : 'false'}
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
                    defaultValue={editingCourse ? String(editingCourse.isActive) : 'true'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
                  Save Course Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
