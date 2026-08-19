'use client'

import React, { useState, useEffect } from 'react'
import {
  savePlacementAction,
  trashPlacementAction,
  restorePlacementAction,
  deletePlacementAction,
} from '@/app/actions/cmsActions'
import { Icon } from '@iconify/react'

export default function AdminPlacementsPage() {
  const [placements, setPlacements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlacement, setEditingPlacement] = useState<any | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [search, setSearch] = useState('')

  const [studentPhotoUrl, setStudentPhotoUrl] = useState<string>('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [youtubeLinkInput, setYoutubeLinkInput] = useState<string>('')

  const fetchPlacements = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/placements')
      const data = await res.json()
      setPlacements(data.placements || [])
    } catch (err) {
      console.error('Failed to fetch placements:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlacements()
  }, [])

  const openForm = (placement?: any) => {
    if (placement) {
      setEditingPlacement(placement)
      setStudentPhotoUrl(placement.studentPhoto || '')
      setYoutubeLinkInput(placement.videoUrl || '')
    } else {
      setEditingPlacement(null)
      setStudentPhotoUrl('')
      setYoutubeLinkInput('')
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
        setStudentPhotoUrl(data.url)
      } else {
        alert(data.error || 'Failed to upload student photo')
      }
    } catch (err) {
      alert('Error uploading file')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const filteredPlacements = placements.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (p.designation && p.designation.toLowerCase().includes(search.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(search.toLowerCase()))
    const matchesTrash = showTrash ? p.isDeleted : !p.isDeleted
    return matchesSearch && matchesTrash
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const payload = {
      studentName: formData.get('studentName') as string,
      studentPhoto: studentPhotoUrl.trim() || null,
      youtubeLink: youtubeLinkInput.trim() || null,
      companyName: formData.get('companyName') as string,
      location: formData.get('location') as string,
      designation: formData.get('designation') as string,
      joiningYear: formData.get('joiningYear') as string,
      package: formData.get('package') as string,
      successStory: formData.get('successStory') as string,
      featured: formData.get('featured') === 'true',
      isActive: formData.get('isActive') === 'true',
    }

    const res = await savePlacementAction(payload, editingPlacement?.id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Placement record saved successfully' })
      setIsFormOpen(false)
      setEditingPlacement(null)
      fetchPlacements()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save placement record' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move placement record to Trash?')) return
    const res = await trashPlacementAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Placement moved to Trash' })
      fetchPlacements()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to trash placement' })
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restorePlacementAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Placement restored from Trash' })
      fetchPlacements()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to restore placement' })
    }
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('WARNING: Permanently delete placement record?')) return
    const res = await deletePlacementAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Placement record permanently deleted' })
      fetchPlacements()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete placement' })
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:trophy-outline" className="w-6 h-6 text-amber-500" />
            Placements & Career Success Showcase
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage student placement records, photos, YouTube videos, companies, locations & salary packages
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
            {showTrash ? 'View Active Records' : 'View Trash'}
          </button>

          <button
            onClick={() => openForm()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Icon icon="ion:add-circle-outline" className="w-4.5 h-4.5" />
            Add Placement Record
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
            placeholder="Search student, company, designation, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
          <Icon icon="ion:search-outline" className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Placements Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading placement records...</div>
        ) : filteredPlacements.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">No placement records found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">Student & Photo</th>
                <th className="p-4">Designation & Company</th>
                <th className="p-4">Location & Year</th>
                <th className="p-4">Package</th>
                <th className="p-4">Video / Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPlacements.map((p) => {
                const hasVideo = p.isVideo || (p.videoUrl && p.videoUrl.trim() !== '')

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-3.5">
                      {p.studentPhoto ? (
                        <img src={p.studentPhoto} alt={p.studentName} className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {p.studentName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 text-base leading-snug">{p.studentName}</p>
                        {hasVideo && (
                          <span className="block text-purple-600 text-xs font-semibold flex items-center gap-1 mt-0.5">
                            <Icon icon="ion:videocam" /> Video Available
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 text-sm block">{p.designation || 'Specialist'}</span>
                      <span className="text-slate-500 text-xs font-medium">{p.companyName}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-800 block font-semibold text-sm">{p.location || 'N/A'}</span>
                      <span className="text-slate-400 text-xs font-medium">{p.joiningYear || 'N/A'}</span>
                    </td>
                    <td className="p-4 font-bold text-emerald-700 text-sm">
                      {p.package || 'Confidential'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Non-Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {!p.isDeleted ? (
                        <>
                          <button
                            onClick={() => openForm(p)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Record"
                          >
                            <Icon icon="ion:create-outline" className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleTrash(p.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Move to Trash"
                          >
                            <Icon icon="ion:trash-outline" className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(p.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore"
                          >
                            <Icon icon="ion:refresh-outline" className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeletePermanently(p.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Permanently"
                          >
                            <Icon icon="ion:trash-bin-outline" className="w-5 h-5" />
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
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-2xl p-6 sm:p-7 max-h-[88vh] overflow-y-auto no-scrollbar space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingPlacement ? 'Edit Placement Story' : 'Add Placement Story'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Student Name *</label>
                  <input
                    type="text"
                    name="studentName"
                    required
                    defaultValue={editingPlacement?.studentName || ''}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hiring Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    defaultValue={editingPlacement?.companyName || ''}
                    placeholder="e.g. TCS, Infosys, Growth Agency"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              {/* Student Photo Upload & Preview Box */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-slate-700 font-semibold">Student Photo (Upload from Computer or URL)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="studentPhoto"
                    value={studentPhotoUrl}
                    onChange={(e) => setStudentPhotoUrl(e.target.value)}
                    placeholder="Upload student photo or enter URL..."
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

                {/* Preview Box with [ X ] Delete button */}
                {studentPhotoUrl ? (
                  <div className="relative w-28 h-28 rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
                    <img src={studentPhotoUrl} alt="Student Photo Preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setStudentPhotoUrl('')}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white p-1.5 rounded-full hover:bg-rose-700 shadow-md transition-transform hover:scale-110"
                      title="Delete Photo"
                    >
                      <Icon icon="ion:close" className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No student photo attached. Click upload to attach a photo.</p>
                )}
              </div>

              {/* YouTube Video Link Field */}
              <div className="bg-purple-50/60 p-4 border border-purple-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-purple-900 font-bold flex items-center gap-1.5">
                    <Icon icon="ion:logo-youtube" className="text-red-600 text-base" />
                    YouTube Video Link (Optional)
                  </label>
                  {youtubeLinkInput && (
                    <button
                      type="button"
                      onClick={() => setYoutubeLinkInput('')}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Remove Video
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  name="youtubeLink"
                  value={youtubeLinkInput}
                  onChange={(e) => setYoutubeLinkInput(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=XXXXXXXX or https://youtu.be/XXXXXXXX"
                  className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Location of Placed Company</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingPlacement?.location || ''}
                    placeholder="e.g. Pune, Mumbai, Remote"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Job Designation</label>
                  <input
                    type="text"
                    name="designation"
                    defaultValue={editingPlacement?.designation || ''}
                    placeholder="e.g. Software Developer, Data Analyst, HR Executive"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Year of Placement</label>
                  <input
                    type="text"
                    name="joiningYear"
                    defaultValue={editingPlacement?.joiningYear || '2025'}
                    placeholder="e.g. 2024, 2025, 2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Salary Package</label>
                  <input
                    type="text"
                    name="package"
                    defaultValue={editingPlacement?.package || ''}
                    placeholder="e.g. ₹4.5 LPA, ₹6 LPA, ₹8.5 LPA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Success Story Quote</label>
                <textarea
                  name="successStory"
                  rows={3}
                  defaultValue={editingPlacement?.successStory || ''}
                  placeholder="Enter student experience / quote..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Featured Status</label>
                  <select
                    name="featured"
                    defaultValue={editingPlacement ? String(editingPlacement.featured) : 'false'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="true">Featured</option>
                    <option value="false">Standard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Active Status (Public Visibility)</label>
                  <select
                    name="isActive"
                    defaultValue={editingPlacement ? String(editingPlacement.isActive) : 'true'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="true">Active (Visible on Website)</option>
                    <option value="false">Non-Active (Hidden from Listing)</option>
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
