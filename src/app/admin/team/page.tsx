'use client'

import React, { useState, useEffect } from 'react'
import {
  saveTrainerAction,
  trashTrainerAction,
  restoreTrainerAction,
  deleteTrainerAction,
  updateWebsiteSettingsAction,
  bulkTrashTrainersAction,
  bulkRestoreTrainersAction,
  bulkDeleteTrainersPermanentlyAction,
} from '@/app/actions/cmsActions'
import { useWebsiteSettings } from '@/app/context/WebsiteSettingsContext'
import { Icon } from '@iconify/react'

export default function AdminTeamPage() {
  const [trainers, setTrainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTrainer, setEditingTrainer] = useState<any | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [search, setSearch] = useState('')

  // Multi-select & Bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkConfirmModal, setBulkConfirmModal] = useState<boolean>(false)

  const fetchTeam = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/trainers')
      const data = await res.json()
      setTrainers(data.trainers || [])
    } catch (err) {
      console.error('Failed to fetch team members:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  const activeTeam = trainers.filter((t) => !t.isDeleted)
  const trashTeam = trainers.filter((t) => t.isDeleted)

  const currentList = showTrash ? trashTeam : activeTeam

  const filteredTeam = currentList.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (t.designation && t.designation.toLowerCase().includes(search.toLowerCase()))
    return matchesSearch
  })

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTeam.length && filteredTeam.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredTeam.map((t) => t.id))
    }
  }

  const handleTabChange = (trash: boolean) => {
    setShowTrash(trash)
    setSelectedIds([])
    setStatusMsg(null)
  }

  const handleBulkTrash = async () => {
    if (!confirm(`Move ${selectedIds.length} team members to Trash?`)) return
    const res = await bulkTrashTrainersAction(selectedIds)
    if (res.success) {
      setTrainers((prev) => prev.map((t) => (selectedIds.includes(t.id) ? { ...t, isDeleted: true } : t)))
      setSelectedIds([])
      setStatusMsg({ type: 'success', text: `${selectedIds.length} team members moved to Trash` })
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to bulk trash team members' })
    }
  }

  const handleBulkRestore = async () => {
    const res = await bulkRestoreTrainersAction(selectedIds)
    if (res.success) {
      setTrainers((prev) => prev.map((t) => (selectedIds.includes(t.id) ? { ...t, isDeleted: false } : t)))
      setSelectedIds([])
      setStatusMsg({ type: 'success', text: `${selectedIds.length} team members restored` })
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to bulk restore team members' })
    }
  }

  const handleBulkDeletePermanently = async () => {
    const res = await bulkDeleteTrainersPermanentlyAction(selectedIds)
    if (res.success) {
      setTrainers((prev) => prev.filter((t) => !selectedIds.includes(t.id)))
      setSelectedIds([])
      setBulkConfirmModal(false)
      setStatusMsg({ type: 'success', text: `${selectedIds.length} team members permanently deleted` })
    } else {
      setBulkConfirmModal(false)
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete team members' })
    }
  }

  const [photoUrl, setPhotoUrl] = useState<string>('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const openForm = (trainer?: any) => {
    if (trainer) {
      setEditingTrainer(trainer)
      setPhotoUrl(trainer.photo || '')
    } else {
      setEditingTrainer(null)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const payload = {
      fullName: formData.get('fullName') as string,
      designation: formData.get('designation') as string,
      category: 'GENERAL', // Always set to GENERAL for Team CMS
      qualification: formData.get('qualification') as string,
      experience: formData.get('experience') as string,
      biography: formData.get('biography') as string,
      photo: photoUrl.trim() || null,
      certifications: formData.get('certifications') as string,
      linkedin: formData.get('linkedin') as string,
      instagram: formData.get('instagram') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      featured: formData.get('featured') === 'true',
      isActive: formData.get('isActive') === 'true',
    }

    const res = await saveTrainerAction(payload, editingTrainer?.id)

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Team profile saved successfully' })
      setIsFormOpen(false)
      fetchTeam()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save team profile' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Are you sure you want to move this team profile to trash?')) return
    const res = await trashTrainerAction(id)
    if (res.success) {
      setTrainers((prev) => prev.map((t) => (t.id === id ? { ...t, isDeleted: true } : t)))
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      setStatusMsg({ type: 'success', text: res.message || 'Updated' })
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed' })
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreTrainerAction(id)
    if (res.success) {
      setTrainers((prev) => prev.map((t) => (t.id === id ? { ...t, isDeleted: false } : t)))
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      setStatusMsg({ type: 'success', text: res.message || 'Restored' })
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed' })
    }
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('PERMANENT DELETE: This action cannot be undone. Delete this team profile permanently?')) return
    const res = await deleteTrainerAction(id)
    if (res.success) {
      setTrainers((prev) => prev.filter((t) => t.id !== id))
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      setStatusMsg({ type: 'success', text: res.message || 'Deleted' })
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed' })
    }
  }

  const { teamGroupPhoto } = useWebsiteSettings()
  const [groupPhotoUrl, setGroupPhotoUrl] = useState<string>('')
  const [uploadingGroupPhoto, setUploadingGroupPhoto] = useState(false)
  const [savingGroupPhoto, setSavingGroupPhoto] = useState(false)

  useEffect(() => {
    if (teamGroupPhoto) setGroupPhotoUrl(teamGroupPhoto)
  }, [teamGroupPhoto])

  const handleGroupPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingGroupPhoto(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.url) {
        setGroupPhotoUrl(data.url)
      } else {
        alert(data.error || 'Failed to upload photo')
      }
    } catch (err) {
      alert('Error uploading file')
    } finally {
      setUploadingGroupPhoto(false)
    }
  }

  const handleSaveGroupPhoto = async () => {
    setSavingGroupPhoto(true)
    try {
      const settingsRes = await fetch('/api/admin/settings')
      const settingsData = await settingsRes.json()
      const currentSettings = settingsData.settings || {}

      const updatedPayload = {
        ...currentSettings,
        homepageSections: {
          ...(currentSettings.homepageSections || {}),
          teamGroupPhoto: groupPhotoUrl.trim(),
        },
      }

      const saveRes = await updateWebsiteSettingsAction(updatedPayload)
      if (saveRes.success) {
        setStatusMsg({ type: 'success', text: 'Team Group Photo updated successfully! Website updated.' })
        window.dispatchEvent(new CustomEvent('websiteSettingsUpdated'))
      } else {
        setStatusMsg({ type: 'error', text: saveRes.error || 'Failed to update group photo' })
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Error saving group photo' })
    } finally {
      setSavingGroupPhoto(false)
    }
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Icon icon="ion:people-outline" className="w-6 h-6 text-[#764DFF]" />
            Our Team CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage QIMD Leadership, Industry Mentors &amp; Core Team Member profiles for the Our Team page (/about/our-team)
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
              <Icon icon="ion:people-outline" className="w-4 h-4 text-[#764DFF]" />
              Active ({activeTeam.length})
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
              Trash ({trashTeam.length})
            </button>
          </div>

          {!showTrash && (
            <button
              onClick={() => openForm()}
              className="px-4 py-2 bg-[#764DFF] hover:bg-[#5c38d6] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Icon icon="ion:add-circle" className="w-4.5 h-4.5" />
              + Add Team Member
            </button>
          )}
        </div>
      </div>

      {/* TEAM GROUP PHOTO CMS SECTION */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:image-outline" className="w-4 h-4 text-[#764DFF]" />
              Website Hero Group Photo Banner (/about/our-team)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload and change the main background team group photo banner image displayed on the Our Team page
            </p>
          </div>
          <button
            onClick={handleSaveGroupPhoto}
            disabled={savingGroupPhoto}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Icon icon="ion:checkmark-circle" className="w-4 h-4" />
            {savingGroupPhoto ? 'Saving Banner...' : 'Save Group Photo'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <div className="relative w-full sm:w-48 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
            <img
              src={groupPhotoUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80'}
              alt="Group Photo Banner Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={groupPhotoUrl}
                onChange={(e) => setGroupPhotoUrl(e.target.value)}
                placeholder="Paste group banner image URL or upload file..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono text-slate-900"
              />
              <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-bold transition-all border border-slate-200 shrink-0 flex items-center gap-1.5">
                <Icon icon="ion:cloud-upload-outline" className="w-4 h-4 text-[#764DFF]" />
                {uploadingGroupPhoto ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGroupPhotoUpload}
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-400">Recommended size: 1600 x 600px high-resolution banner image.</p>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search team member by name or role designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-[#764DFF] focus:ring-1 focus:ring-[#764DFF] transition-all shadow-2xs"
          />
          <Icon icon="ion:search-outline" className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {filteredTeam.length > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredTeam.length && filteredTeam.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700">
              {selectedIds.length > 0
                ? `${selectedIds.length} of ${filteredTeam.length} selected`
                : `Select all (${filteredTeam.length})`}
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              {showTrash ? (
                <>
                  <button
                    onClick={handleBulkRestore}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Icon icon="ion:refresh-outline" className="w-3.5 h-3.5" />
                    Restore Selected ({selectedIds.length})
                  </button>
                  <button
                    onClick={() => setBulkConfirmModal(true)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Icon icon="ion:trash-bin-outline" className="w-3.5 h-3.5" />
                    Permanently Delete ({selectedIds.length})
                  </button>
                </>
              ) : (
                <button
                  onClick={handleBulkTrash}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Icon icon="ion:trash-outline" className="w-3.5 h-3.5" />
                  Move Selected to Trash ({selectedIds.length})
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* OUR TEAM TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">Loading team profiles...</div>
        ) : filteredTeam.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
            {showTrash ? 'No team profiles in Trash' : 'No team members found matching criteria. Click "+ Add Team Member" to create one.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredTeam.length && filteredTeam.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Profile &amp; Name</th>
                  <th className="py-3 px-4">Role / Designation</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredTeam.map((t) => (
                  <tr key={t.id} className={`hover:bg-slate-50/80 transition-colors ${selectedIds.includes(t.id) ? 'bg-indigo-50/20' : ''}`}>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(t.id)}
                        onChange={() => toggleSelectId(t.id)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                      {t.photo ? (
                        <img src={t.photo} alt={t.fullName} className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100 flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#764DFF]/10 text-[#5c38d6] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {t.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-snug">{t.fullName}</p>
                        <span className="block text-slate-400 text-[11px] font-normal">{t.qualification || 'Core Team Lead'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {t.designation || 'Team Member'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#764DFF] font-bold">{t.experience || '8+ Years'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block ${
                          t.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {!t.isDeleted ? (
                        <>
                          <button
                            onClick={() => openForm(t)}
                            className="p-1.5 text-slate-500 hover:text-[#764DFF] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Team Member"
                          >
                            <Icon icon="ion:create-outline" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTrash(t.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Move to Trash"
                          >
                            <Icon icon="ion:trash-outline" className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(t.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore"
                          >
                            <Icon icon="ion:refresh-outline" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePermanently(t.id)}
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

      {/* CREATE / EDIT TEAM MEMBER MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTrainer ? 'Edit Team Member Profile' : 'Add New Team Member'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
              >
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    defaultValue={editingTrainer?.fullName || ''}
                    placeholder="e.g. Industry Lead Mentor"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    name="designation"
                    required
                    defaultValue={editingTrainer?.designation || 'Digital Marketing & Performance Growth Lead'}
                    placeholder="e.g. Creative Art Director"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Qualification / Sub-title</label>
                  <input
                    type="text"
                    name="qualification"
                    defaultValue={editingTrainer?.qualification || ''}
                    placeholder="e.g. B.Des / MBA Growth Lead"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    defaultValue={editingTrainer?.experience || '10+ Years'}
                    placeholder="e.g. 10+ Years"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-slate-700 font-bold">Profile Photo (Upload from Device or Enter URL)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="photo"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Upload image or paste Unsplash/Image URL..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-xs"
                  />
                  <label className="px-4 py-2.5 bg-[#764DFF] hover:bg-[#5c38d6] text-white rounded-xl cursor-pointer font-bold transition-all text-xs shrink-0 flex items-center gap-1.5">
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
                {photoUrl && (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-300 bg-white">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Biography / Short Summary</label>
                <textarea
                  name="biography"
                  rows={3}
                  defaultValue={editingTrainer?.biography || ''}
                  placeholder="10+ years driving multi-channel ROI campaigns, SEO growth architectures..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">LinkedIn Profile URL</label>
                <input
                  type="text"
                  name="linkedin"
                  defaultValue={editingTrainer?.linkedin || '#'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="true"
                    defaultChecked={editingTrainer ? editingTrainer.isActive : true}
                    className="w-4 h-4 text-[#764DFF] rounded"
                  />
                  <span>Active Profile</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#764DFF] hover:bg-[#5c38d6] text-white shadow-sm"
                >
                  Save Team Member
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
                Permanently delete {selectedIds.length} team members?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                These team member profiles will be permanently removed from the database and cannot be recovered.
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
