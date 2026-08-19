'use client'

import React, { useState } from 'react'
import {
  savePageSectionAction,
  trashPageSectionAction,
  restorePageSectionAction,
  deletePageSectionPermanentlyAction,
} from '@/app/actions/sectionActions'
import { Icon } from '@iconify/react'

interface PageSectionItem {
  id: string
  pageKey: string
  sectionKey: string
  sectionTitle?: string
  subtitle?: string
  content?: string
  image?: string
  buttonText?: string
  buttonUrl?: string
  displayOrder: number
  isActive: boolean
  isDeleted: boolean
  createdAt: string
}

export default function PageSectionManagementClient({
  initialSections,
}: {
  initialSections: PageSectionItem[]
}) {
  const [sections, setSections] = useState<PageSectionItem[]>(initialSections)
  const [selectedPage, setSelectedPage] = useState<string>('HOME')
  const [search, setSearch] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<PageSectionItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const pagesList = [
    { key: 'HOME', name: 'Home Page' },
    { key: 'ABOUT', name: 'About Us Page' },
    { key: 'WHY_QIMD', name: 'Why QIMD Page' },
    { key: 'COURSES', name: 'Courses Page' },
    { key: 'PLACEMENTS', name: 'Placements Page' },
    { key: 'CONTACT', name: 'Contact Page' },
  ]

  const filteredSections = sections.filter((s) => {
    const matchesPage = selectedPage === 'ALL' || s.pageKey === selectedPage
    const matchesSearch =
      (s.sectionTitle && s.sectionTitle.toLowerCase().includes(search.toLowerCase())) ||
      s.sectionKey.toLowerCase().includes(search.toLowerCase()) ||
      s.pageKey.toLowerCase().includes(search.toLowerCase())
    const matchesTrash = showTrash ? s.isDeleted : !s.isDeleted
    return matchesPage && matchesSearch && matchesTrash
  })

  const handleOpenAdd = () => {
    setEditingSection(null)
    setModalOpen(true)
    setMsg(null)
  }

  const handleOpenEdit = (s: PageSectionItem) => {
    setEditingSection(s)
    setModalOpen(true)
    setMsg(null)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const formData = new FormData(e.currentTarget)
    const rawData = {
      pageKey: (formData.get('pageKey') as string) || selectedPage,
      sectionKey: formData.get('sectionKey') as string,
      sectionTitle: formData.get('sectionTitle') as string,
      subtitle: formData.get('subtitle') as string,
      content: formData.get('content') as string,
      image: formData.get('image') as string,
      buttonText: formData.get('buttonText') as string,
      buttonUrl: formData.get('buttonUrl') as string,
      displayOrder: Number(formData.get('displayOrder') || 0),
      isActive: formData.get('isActive') === 'true',
    }

    const res = await savePageSectionAction(rawData, editingSection?.id)
    setLoading(false)

    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'Page section saved successfully' })
      setModalOpen(false)
      window.location.reload()
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save section' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move page section to Trash?')) return
    const res = await trashPageSectionAction(id)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  const handleRestore = async (id: string) => {
    const res = await restorePageSectionAction(id)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('Permanently delete this section?')) return
    const res = await deletePageSectionPermanentlyAction(id)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:layers-outline" className="w-6 h-6 text-blue-600" />
            Website Page & Section Builder CMS (WordPress-Style)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Edit page section headings, hero banners, text content, section images, CTAs, and section order across website pages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showTrash
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon icon="ion:trash-outline" className="w-4 h-4" />
            {showTrash ? 'View Active Sections' : 'View Section Trash'}
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
            Create Page Section
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-xs border ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Page Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedPage('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            selectedPage === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Website Pages
        </button>
        {pagesList.map((p) => (
          <button
            key={p.key}
            onClick={() => setSelectedPage(p.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedPage === p.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search section title or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
          />
          <Icon icon="ion:search-outline" className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Sections Cards / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSections.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No page sections found. Click "Create Page Section" above to add one.
          </div>
        ) : (
          filteredSections.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                    Page: {s.pageKey}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 ml-2">
                    Section: {s.sectionKey}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {s.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {s.sectionTitle || 'Untitled Section'}
                </h3>
                {s.subtitle && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.subtitle}</p>
                )}
                {s.content && (
                  <p className="text-xs text-slate-700 mt-2 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-sans">
                    {s.content}
                  </p>
                )}
              </div>

              {s.image && (
                <div className="h-20 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                  <img src={s.image} alt={s.sectionTitle || ''} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="text-[11px] text-slate-500">
                  Button: <strong className="text-slate-800">{s.buttonText || 'None'}</strong>
                </div>

                <div className="space-x-2">
                  {!s.isDeleted ? (
                    <>
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors"
                      >
                        Edit Section
                      </button>
                      <button
                        onClick={() => handleTrash(s.id)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg transition-colors"
                      >
                        Trash
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRestore(s.id)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handleDeletePermanently(s.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingSection ? 'Edit Page Section' : 'Create New Page Section'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Page</label>
                  <select
                    name="pageKey"
                    defaultValue={editingSection?.pageKey || selectedPage}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    {pagesList.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.name} ({p.key})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section Key (Unique ID)</label>
                  <input
                    type="text"
                    name="sectionKey"
                    required
                    defaultValue={editingSection?.sectionKey || ''}
                    placeholder="e.g. HERO, WHY_CHOOSE_US, STATS, CTA_BANNER"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section Title / Heading</label>
                <input
                  type="text"
                  name="sectionTitle"
                  defaultValue={editingSection?.sectionTitle || ''}
                  placeholder="e.g. AI-Powered Practical Training in Digital Marketing & Design"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subtitle / Tagline</label>
                <textarea
                  name="subtitle"
                  rows={2}
                  defaultValue={editingSection?.subtitle || ''}
                  placeholder="Subheading text for the section..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Main Paragraph / Content Text</label>
                <textarea
                  name="content"
                  rows={4}
                  defaultValue={editingSection?.content || ''}
                  placeholder="Main body content of section..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-sans"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section Image / Banner URL</label>
                <input
                  type="text"
                  name="image"
                  defaultValue={editingSection?.image || ''}
                  placeholder="/images/hero-banner.jpg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Button / CTA Text</label>
                  <input
                    type="text"
                    name="buttonText"
                    defaultValue={editingSection?.buttonText || ''}
                    placeholder="e.g. Explore Courses, Apply Now"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Button Link URL</label>
                  <input
                    type="text"
                    name="buttonUrl"
                    defaultValue={editingSection?.buttonUrl || ''}
                    placeholder="e.g. /courses, /contact"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    defaultValue={editingSection?.displayOrder || 0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    name="isActive"
                    defaultValue={editingSection ? String(editingSection.isActive) : 'true'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="true">Active (Visible on Website)</option>
                    <option value="false">Inactive (Hidden)</option>
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
                  {loading ? 'Saving...' : 'Save Page Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
