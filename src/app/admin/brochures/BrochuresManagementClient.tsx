'use client'

import React, { useState, useTransition } from 'react'
import {
  saveBrochureAction,
  toggleBrochureStatusAction,
  trashBrochureAction,
  deleteBrochureAction,
} from '@/app/actions/cmsActions'
import { Icon } from '@iconify/react'

export interface BrochureItem {
  id: string
  title: string
  courseId: string
  courseName: string
  courseSlug: string
  fileUrl: string
  fileSize: string
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CourseOption {
  id: string
  courseName: string
  slug: string
}

interface Props {
  initialBrochures: BrochureItem[]
  courses: CourseOption[]
}

export default function BrochuresManagementClient({ initialBrochures, courses }: Props) {
  const [brochures, setBrochures] = useState<BrochureItem[]>(initialBrochures)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BrochureItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form State
  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleOpenAdd = () => {
    setEditingItem(null)
    setTitle('')
    setCourseId(courses[0]?.id || '')
    setFileUrl('')
    setFileSize('')
    setIsActive(true)
    setMsg(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (item: BrochureItem) => {
    setEditingItem(item)
    setTitle(item.title)
    setCourseId(item.courseId)
    setFileUrl(item.fileUrl)
    setFileSize(item.fileSize)
    setIsActive(item.isActive)
    setMsg(null)
    setModalOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a valid PDF document.')
      return
    }

    setUploadingFile(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.url) {
        setFileUrl(data.url)
        const sizeInKb = (file.size / 1024).toFixed(1)
        setFileSize(`${sizeInKb} KB`)
        if (!title) {
          const selectedCourseName = courses.find((c) => c.id === courseId)?.courseName
          setTitle(selectedCourseName ? `${selectedCourseName} Brochure` : file.name.replace(/\.[^/.]+$/, ''))
        }
      } else {
        alert(data.error || 'Failed to upload PDF file')
      }
    } catch (err) {
      alert('Error uploading PDF file')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setMsg({ type: 'error', text: 'Please enter a brochure title' })
      return
    }
    if (!courseId) {
      setMsg({ type: 'error', text: 'Please select a program' })
      return
    }
    if (!fileUrl.trim()) {
      setMsg({ type: 'error', text: 'Please upload or provide a PDF file URL' })
      return
    }

    setLoading(true)
    setMsg(null)

    const payload = {
      title: title.trim(),
      courseId,
      fileUrl: fileUrl.trim(),
      fileSize: fileSize.trim() || undefined,
      isActive,
    }

    startTransition(async () => {
      const res = await saveBrochureAction(payload, editingItem?.id)
      setLoading(false)
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Brochure saved successfully' })
        // If activated, update other brochures for same course locally
        const selectedCourseObj = courses.find((c) => c.id === courseId)
        setBrochures((prev) => {
          let updated = prev.map((b) => {
            if (isActive && b.courseId === courseId && b.id !== editingItem?.id) {
              return { ...b, isActive: false }
            }
            return b
          })
          if (editingItem) {
            updated = updated.map((b) =>
              b.id === editingItem.id
                ? {
                    ...b,
                    title: payload.title,
                    courseId: payload.courseId,
                    courseName: selectedCourseObj?.courseName || b.courseName,
                    courseSlug: selectedCourseObj?.slug || b.courseSlug,
                    fileUrl: payload.fileUrl,
                    fileSize: payload.fileSize || b.fileSize,
                    isActive: payload.isActive,
                  }
                : b
            )
          } else if (res.brochure) {
            const newBrochure: BrochureItem = {
              id: res.brochure.id,
              title: res.brochure.title,
              courseId: res.brochure.courseId,
              courseName: selectedCourseObj?.courseName || 'Assigned Program',
              courseSlug: selectedCourseObj?.slug || '',
              fileUrl: res.brochure.fileUrl,
              fileSize: res.brochure.fileSize || 'N/A',
              isActive: res.brochure.isActive,
              isDeleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            updated = [newBrochure, ...updated]
          }
          return updated
        })
        setTimeout(() => setModalOpen(false), 800)
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to save brochure' })
      }
    })
  }

  const handleToggleStatus = (item: BrochureItem) => {
    const newStatus = !item.isActive
    startTransition(async () => {
      const res = await toggleBrochureStatusAction(item.id, newStatus)
      if (res.success) {
        setBrochures((prev) =>
          prev.map((b) => {
            if (newStatus && b.courseId === item.courseId && b.id !== item.id) {
              return { ...b, isActive: false }
            }
            if (b.id === item.id) {
              return { ...b, isActive: newStatus }
            }
            return b
          })
        )
      } else {
        alert(res.error || 'Failed to update status')
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteBrochureAction(id)
      if (res.success) {
        setBrochures((prev) => prev.filter((b) => b.id !== id))
        setConfirmDeleteId(null)
      } else {
        alert(res.error || 'Failed to delete brochure')
      }
    })
  }

  const filteredBrochures = brochures.filter((b) => {
    if (b.isDeleted) return false
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.courseName.toLowerCase().includes(search.toLowerCase())
    const matchesCourse = courseFilter === 'ALL' || b.courseId === courseFilter
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && b.isActive) ||
      (statusFilter === 'INACTIVE' && !b.isActive)
    return matchesSearch && matchesCourse && matchesStatus
  })

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:document-attach-outline" className="w-6 h-6 text-purple-600" />
            Program Brochure Management CMS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage program brochures, replace PDFs, activate/deactivate brochures, and configure automatic student lead downloads.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
          <Icon icon="ion:add-circle-outline" className="w-5 h-5" />
          Add New Brochure
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search brochure by title or program name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
          />
          <Icon icon="ion:search-outline" className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Program Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Program:</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
            >
              <option value="ALL">All Programs</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Brochures List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredBrochures.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Icon icon="ion:document-text-outline" className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">No program brochures found.</p>
            <p className="text-xs text-slate-400 mt-1">Click &quot;Add New Brochure&quot; to upload a PDF brochure for a program.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-4">Brochure Name</th>
                  <th className="p-4">Assigned Program</th>
                  <th className="p-4">PDF File &amp; Size</th>
                  <th className="p-4 text-center">Active Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBrochures.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Icon icon="ion:document-text" className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Updated {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg text-xs font-bold">
                        <Icon icon="ion:school-outline" className="text-sm" />
                        {item.courseName}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <Icon icon="ion:eye-outline" className="text-sm" />
                          View PDF
                        </a>
                        <span className="text-xs font-medium text-slate-500">
                          ({item.fileSize})
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                        title={item.isActive ? 'Click to deactivate' : 'Click to activate (will deactivate other brochures for this program)'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {item.isActive ? 'Active (Auto-Download)' : 'Inactive'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={item.fileUrl}
                          download
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Icon icon="ion:download-outline" className="w-4.5 h-4.5" />
                        </a>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Brochure"
                        >
                          <Icon icon="ion:create-outline" className="w-4.5 h-4.5" />
                        </button>

                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Brochure"
                        >
                          <Icon icon="ion:trash-outline" className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Icon icon="ion:document-attach-outline" className="w-5 h-5 text-purple-600" />
                {editingItem ? 'Edit Program Brochure' : 'Add New Program Brochure'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            {msg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold border ${
                  msg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Program Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Target Program <span className="text-rose-500">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value)
                    const selected = courses.find((c) => c.id === e.target.value)
                    if (selected && !title) {
                      setTitle(`${selected.courseName} Brochure`)
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                  required
                >
                  <option value="" disabled>Select a program</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  When a student submits the admission form for this program, this brochure will automatically download.
                </p>
              </div>

              {/* Brochure Title */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Brochure Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI Digital Marketing Complete Syllabus Brochure"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-purple-600"
                  required
                />
              </div>

              {/* PDF File Upload / Replacement */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  PDF Brochure Document <span className="text-rose-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-purple-300 transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    id="brochure-pdf-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="brochure-pdf-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <Icon icon="ion:cloud-upload-outline" className="w-8 h-8 text-purple-600" />
                    <span className="text-xs font-bold text-purple-700 hover:underline">
                      {uploadingFile ? 'Uploading PDF...' : 'Click to Upload / Replace PDF Document'}
                    </span>
                    <span className="text-[10px] text-slate-400">PDF files up to 10MB</span>
                  </label>
                </div>

                {fileUrl && (
                  <div className="mt-2.5 p-3 bg-purple-50/80 border border-purple-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <Icon icon="ion:document-text" className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-purple-900 truncate">{fileUrl}</span>
                    </div>
                    {fileSize && <span className="text-[11px] font-bold text-purple-700 flex-shrink-0">({fileSize})</span>}
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="block font-bold text-slate-800 text-xs">Set as Active Program Brochure</span>
                  <span className="text-[10px] text-slate-500">
                    Only 1 active brochure per program. Activating this will automatically deactivate other brochures for this program.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-purple-600"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingFile}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Icon icon="ion:load-c" className="animate-spin" />}
                  {editingItem ? 'Update Brochure' : 'Save Brochure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Icon icon="ion:alert-circle" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Delete this brochure?</h3>
              <p className="text-xs text-slate-500 mt-1">This brochure will be permanently deleted and will no longer be available for download.</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
