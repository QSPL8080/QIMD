'use client'

import React, { useState, useEffect } from 'react'
import {
  saveTrainerAction,
  trashTrainerAction,
  restoreTrainerAction,
  deleteTrainerAction,
  updateWebsiteSettingsAction,
} from '@/app/actions/cmsActions'
import { useWebsiteSettings } from '@/app/context/WebsiteSettingsContext'
import { Icon } from '@iconify/react'

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTrainer, setEditingTrainer] = useState<any | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [search, setSearch] = useState('')

  const fetchTrainers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/trainers')
      const data = await res.json()
      setTrainers(data.trainers || [])
    } catch (err) {
      console.error('Failed to fetch trainers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrainers()
  }, [])

  const filteredTrainers = trainers.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (t.designation && t.designation.toLowerCase().includes(search.toLowerCase()))
    const matchesTrash = showTrash ? t.isDeleted : !t.isDeleted
    return matchesSearch && matchesTrash
  })

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
      category: formData.get('category') as string,
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
      setStatusMsg({ type: 'success', text: res.message || 'Trainer saved successfully' })
      setIsFormOpen(false)
      setEditingTrainer(null)
      fetchTrainers()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save trainer' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move trainer to Trash?')) return
    const res = await trashTrainerAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Trainer moved to Trash' })
      fetchTrainers()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to trash trainer' })
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreTrainerAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Trainer restored from Trash' })
      fetchTrainers()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to restore trainer' })
    }
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('WARNING: Permanently delete this trainer profile?')) return
    const res = await deleteTrainerAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Trainer permanently deleted' })
      fetchTrainers()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete trainer' })
    }
  }

  const { teamGroupPhoto } = useWebsiteSettings()
  const [trainerBannerUrl, setTrainerBannerUrl] = useState<string>('')
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [savingBanner, setSavingBanner] = useState(false)

  useEffect(() => {
    if (teamGroupPhoto) setTrainerBannerUrl(teamGroupPhoto)
  }, [teamGroupPhoto])

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setTrainerBannerUrl(data.url)
      } else {
        alert(data.error || 'Failed to upload banner photo')
      }
    } catch (err) {
      alert('Error uploading file')
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleSaveBanner = async () => {
    setSavingBanner(true)
    try {
      const settingsRes = await fetch('/api/admin/settings')
      const settingsData = await settingsRes.json()
      const currentSettings = settingsData.settings || {}

      const updatedPayload = {
        ...currentSettings,
        homepageSections: {
          ...(currentSettings.homepageSections || {}),
          teamGroupPhoto: trainerBannerUrl.trim(),
        },
      }

      const saveRes = await updateWebsiteSettingsAction(updatedPayload)
      if (saveRes.success) {
        setStatusMsg({ type: 'success', text: 'Trainer Banner updated successfully! Website updated.' })
        window.dispatchEvent(new CustomEvent('websiteSettingsUpdated'))
      } else {
        setStatusMsg({ type: 'error', text: saveRes.error || 'Failed to update trainer banner' })
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Error saving trainer banner' })
    } finally {
      setSavingBanner(false)
    }
  }

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Icon icon="ion:school-outline" className="w-6 h-6 text-[#764DFF]" />
            Trainer CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage AI-Powered Digital Marketing, Graphic Design &amp; Video Editing faculty trainers (/trainers page)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showTrash
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Icon icon="ion:trash-outline" className="w-4 h-4" />
            {showTrash ? 'View Active Trainers' : 'View Trainer Trash'}
          </button>

          <button
            onClick={() => openForm()}
            className="px-4 py-2 bg-[#764DFF] hover:bg-[#5c38d6] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Icon icon="ion:add-circle" className="w-4.5 h-4.5" />
            + Add Trainer Profile
          </button>
        </div>
      </div>

      {/* TRAINER BANNER CMS SECTION */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:image-outline" className="w-4 h-4 text-[#764DFF]" />
              Website Trainer Section Banner (/trainers page)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Change the main group photo banner displayed in the Trainers section of the website
            </p>
          </div>
          <button
            onClick={handleSaveBanner}
            disabled={savingBanner}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Icon icon="ion:checkmark-circle" className="w-4 h-4" />
            {savingBanner ? 'Saving Banner...' : 'Save Trainer Banner'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <div className="relative w-full sm:w-48 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
            <img
              src={trainerBannerUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80'}
              alt="Trainer Banner Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={trainerBannerUrl}
                onChange={(e) => setTrainerBannerUrl(e.target.value)}
                placeholder="Paste group banner image URL or upload file..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono text-slate-900"
              />
              <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-bold transition-all border border-slate-200 shrink-0 flex items-center gap-1.5">
                <Icon icon="ion:cloud-upload-outline" className="w-4 h-4 text-[#764DFF]" />
                {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-400">Recommended size: 1200 x 500px high-resolution banner image.</p>
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

      {/* SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search trainer by name or domain designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-[#764DFF] focus:ring-1 focus:ring-[#764DFF] transition-all shadow-2xs"
          />
          <Icon icon="ion:search-outline" className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* TRAINERS & TEAM TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">Loading team members...</div>
        ) : filteredTrainers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold">No team profiles found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Profile &amp; Name</th>
                  <th className="py-3 px-4">Domain Category</th>
                  <th className="py-3 px-4">Qualification</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredTrainers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
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
                        <span className="block text-slate-400 text-[11px] font-normal">{t.designation || 'Instructor / Team Member'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#764DFF]/10 text-[#5c38d6]">
                        {t.category || 'MARKETING'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{t.qualification || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-[#764DFF] font-bold">{t.experience || 'N/A'}</td>
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
                            title="Edit Trainer"
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
                            title="Restore Trainer"
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

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-2xl p-6 sm:p-7 max-h-[88vh] overflow-y-auto no-scrollbar space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingTrainer ? 'Edit Trainer Profile' : 'Add New Trainer Profile'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    defaultValue={editingTrainer?.fullName || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    defaultValue={editingTrainer?.designation || 'Senior AI Mentor'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Domain Category</label>
                  <select
                    name="category"
                    defaultValue={editingTrainer?.category || 'MARKETING'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="MARKETING">Digital Marketing</option>
                    <option value="DESIGN">Graphic Design</option>
                    <option value="VIDEO">Video Editing</option>
                    <option value="GENERAL">General Mentorship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    defaultValue={editingTrainer?.qualification || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    defaultValue={editingTrainer?.experience || '8+ Years'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              {/* Trainer Photo Upload & Preview Box */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-slate-700 font-semibold">Trainer Photo (Upload from Device or URL)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="photo"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Upload photo from device or enter URL..."
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
                  <div className="relative w-24 h-24 rounded-xl border border-slate-300 bg-white p-1">
                    <img src={photoUrl} alt="Trainer Photo Preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700 shadow-md transition-transform hover:scale-110"
                      title="Delete Photo"
                    >
                      <Icon icon="ion:close" className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No photo attached. Upload or leave blank.</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Biography</label>
                <textarea
                  name="biography"
                  rows={3}
                  defaultValue={editingTrainer?.biography || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    name="linkedin"
                    defaultValue={editingTrainer?.linkedin || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Instagram URL</label>
                  <input
                    type="text"
                    name="instagram"
                    defaultValue={editingTrainer?.instagram || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Featured Status</label>
                  <select
                    name="featured"
                    defaultValue={editingTrainer ? String(editingTrainer.featured) : 'false'}
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
                    defaultValue={editingTrainer ? String(editingTrainer.isActive) : 'true'}
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
                  Save Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
