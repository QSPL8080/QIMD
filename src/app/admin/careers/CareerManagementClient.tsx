'use client'

import React, { useState } from 'react'
import {
  saveJobOpeningAction,
  trashJobOpeningAction,
  restoreJobOpeningAction,
  deleteJobOpeningPermanentlyAction,
  bulkTrashJobOpeningsAction,
  bulkRestoreJobOpeningsAction,
  bulkDeleteJobOpeningsPermanentlyAction,
} from '@/app/actions/careerActions'
import { Icon } from '@iconify/react'

interface JobOpeningItem {
  id: string
  title: string
  department?: string
  location?: string
  jobType?: string
  description: string
  requirements?: string
  displayOrder: number
  status: 'DRAFT' | 'PUBLISHED'
  isActive: boolean
  isDeleted: boolean
  applications?: any[]
  createdAt: string
}

export default function CareerManagementClient({ initialJobs }: { initialJobs: JobOpeningItem[] }) {
  const [jobs, setJobs] = useState<JobOpeningItem[]>(initialJobs)
  const [search, setSearch] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobOpeningItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Multi-select & Bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkConfirmModal, setBulkConfirmModal] = useState<boolean>(false)

  const activeJobs = jobs.filter((j) => !j.isDeleted)
  const trashJobs = jobs.filter((j) => j.isDeleted)

  const currentList = showTrash ? trashJobs : activeJobs

  const filteredJobs = currentList.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.department && j.department.toLowerCase().includes(search.toLowerCase()))
    return matchesSearch
  })

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredJobs.length && filteredJobs.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredJobs.map((j) => j.id))
    }
  }

  const handleTabChange = (trash: boolean) => {
    setShowTrash(trash)
    setSelectedIds([])
    setMsg(null)
  }

  const handleOpenAdd = () => {
    setEditingJob(null)
    setModalOpen(true)
    setMsg(null)
  }

  const handleOpenEdit = (j: JobOpeningItem) => {
    setEditingJob(j)
    setModalOpen(true)
    setMsg(null)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const formData = new FormData(e.currentTarget)
    const rawData = {
      title: formData.get('title'),
      department: formData.get('department'),
      location: formData.get('location'),
      jobType: formData.get('jobType'),
      description: formData.get('description'),
      requirements: formData.get('requirements'),
      displayOrder: Number(formData.get('displayOrder') || 0),
      status: formData.get('status'),
      isActive: formData.get('isActive') === 'true',
    }

    const res = await saveJobOpeningAction(rawData, editingJob?.id)
    setLoading(false)

    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'Saved successfully' })
      setModalOpen(false)
      if ((res as any).job) {
        const savedJob = (res as any).job as JobOpeningItem
        setJobs((prev) => {
          const exists = prev.some((j) => j.id === savedJob.id)
          if (exists) {
            return prev.map((j) => (j.id === savedJob.id ? { ...j, ...savedJob } : j))
          }
          return [savedJob, ...prev]
        })
      }
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move job opening to Trash?')) return
    const res = await trashJobOpeningAction(id)
    if (res.success) {
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, isDeleted: true } : j)))
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      setMsg({ type: 'success', text: 'Job opening moved to Trash' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to trash job opening' })
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreJobOpeningAction(id)
    if (res.success) {
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, isDeleted: false } : j)))
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      setMsg({ type: 'success', text: 'Job opening restored' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to restore job opening' })
    }
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('Permanently delete this job opening?')) return
    const res = await deleteJobOpeningPermanentlyAction(id)
    if (res.success) {
      setJobs((prev) => prev.filter((j) => j.id !== id))
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      setMsg({ type: 'success', text: 'Job opening permanently deleted' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to delete job opening' })
    }
  }

  const handleBulkTrash = async () => {
    if (!confirm(`Move ${selectedIds.length} job openings to Trash?`)) return
    const res = await bulkTrashJobOpeningsAction(selectedIds)
    if (res.success) {
      setJobs((prev) => prev.map((j) => (selectedIds.includes(j.id) ? { ...j, isDeleted: true } : j)))
      setSelectedIds([])
      setMsg({ type: 'success', text: `${selectedIds.length} job openings moved to Trash` })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to bulk trash job openings' })
    }
  }

  const handleBulkRestore = async () => {
    const res = await bulkRestoreJobOpeningsAction(selectedIds)
    if (res.success) {
      setJobs((prev) => prev.map((j) => (selectedIds.includes(j.id) ? { ...j, isDeleted: false } : j)))
      setSelectedIds([])
      setMsg({ type: 'success', text: `${selectedIds.length} job openings restored` })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to restore job openings' })
    }
  }

  const handleBulkDeletePermanently = async () => {
    const res = await bulkDeleteJobOpeningsPermanentlyAction(selectedIds)
    if (res.success) {
      setJobs((prev) => prev.filter((j) => !selectedIds.includes(j.id)))
      setSelectedIds([])
      setBulkConfirmModal(false)
      setMsg({ type: 'success', text: `${selectedIds.length} job openings permanently deleted` })
    } else {
      setBulkConfirmModal(false)
      setMsg({ type: 'error', text: res.error || 'Failed to delete job openings' })
    }
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Icon icon="ion:briefcase-outline" className="w-6 h-6 text-[#764DFF]" />
            Job Openings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage active career opportunities, department listings &amp; candidate applications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleTabChange(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                !showTrash
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon icon="ion:briefcase-outline" className="w-4 h-4 text-[#764DFF]" />
              Active ({activeJobs.length})
            </button>
            <button
              onClick={() => handleTabChange(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                showTrash
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon icon="ion:trash-outline" className="w-4 h-4" />
              Trash ({trashJobs.length})
            </button>
          </div>

          {!showTrash && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#764DFF] hover:bg-[#5c38d6] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Icon icon="ion:add-circle" className="w-4.5 h-4.5" />
              + Add Job Opening
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* SEARCH & FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search job title or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-[#764DFF] focus:ring-1 focus:ring-[#764DFF] transition-all shadow-2xs"
          />
          <Icon icon="ion:search-outline" className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {filteredJobs.length > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredJobs.length && filteredJobs.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700">
              {selectedIds.length > 0
                ? `${selectedIds.length} of ${filteredJobs.length} selected`
                : `Select all (${filteredJobs.length})`}
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

      {/* JOB OPENINGS TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredJobs.length && filteredJobs.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Job Title</th>
                <th className="py-3 px-4">Department &amp; Location</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Applications</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold text-xs">
                    {showTrash ? 'No job openings in Trash' : 'No job openings found. Click "+ Add Job Opening" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => (
                  <tr key={j.id} className={`hover:bg-slate-50/80 transition-colors ${selectedIds.includes(j.id) ? 'bg-indigo-50/20' : ''}`}>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(j.id)}
                        onChange={() => toggleSelectId(j.id)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-sm leading-snug">{j.title}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{j.description}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{j.department || 'Academics'}</p>
                      <p className="text-[11px] text-slate-400">{j.location || 'Hinjewadi, Pune'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{j.jobType || 'Full-Time'}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#764DFF]/10 text-[#5c38d6]">
                        {j.applications?.length || 0} Received
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block ${
                          j.status === 'PUBLISHED' && j.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {j.status} {j.isActive ? '' : '(Inactive)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {!j.isDeleted ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(j)}
                            className="p-1.5 text-slate-500 hover:text-[#764DFF] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Job"
                          >
                            <Icon icon="ion:create-outline" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTrash(j.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Move to Trash"
                          >
                            <Icon icon="ion:trash-outline" className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(j.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore Job"
                          >
                            <Icon icon="ion:refresh-outline" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePermanently(j.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Permanently"
                          >
                            <Icon icon="ion:trash-bin-outline" className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create / Edit Job */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-7 space-y-4 max-h-[88vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingJob ? 'Edit Job Opening' : 'Create New Job Opening'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingJob?.title || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  placeholder="e.g. Digital Marketing Trainer & Mentor"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    defaultValue={editingJob?.department || 'Academics - Marketing'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingJob?.location || 'Hinjewadi, Pune (Classroom)'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Type</label>
                  <select
                    name="jobType"
                    defaultValue={editingJob?.jobType || 'Full-Time'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract / Faculty">Contract / Visiting Faculty</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    defaultValue={editingJob?.displayOrder || 0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={editingJob?.description || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirements / Qualifications</label>
                <textarea
                  name="requirements"
                  rows={3}
                  defaultValue={editingJob?.requirements || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Publish Status</label>
                  <select
                    name="status"
                    defaultValue={editingJob?.status || 'PUBLISHED'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Active Status</label>
                  <select
                    name="isActive"
                    defaultValue={editingJob ? String(editingJob.isActive) : 'true'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="true">Active (Receiving Applications)</option>
                    <option value="false">Inactive (Closed)</option>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  {loading ? 'Saving...' : 'Save Job Opening'}
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
                Permanently delete {selectedIds.length} job openings?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                These job opening records will be permanently removed from the database and cannot be recovered.
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
