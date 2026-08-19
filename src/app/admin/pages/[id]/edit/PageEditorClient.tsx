'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  saveWebPageAction,
  togglePageStatusAction,
} from '@/app/actions/pageActions'
import {
  savePageSectionAction,
  trashPageSectionAction,
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
  status: 'DRAFT' | 'PUBLISHED'
  isActive: boolean
  isDeleted: boolean
}

interface PageData {
  id: string
  pageName: string
  pageKey: string
  slug: string
  description?: string
  status: 'DRAFT' | 'PUBLISHED'
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  ogImage?: string
  sections: PageSectionItem[]
}

export default function PageEditorClient({ page }: { page: PageData }) {
  const [activeTab, setActiveTab] = useState<'SECTIONS' | 'SEO'>('SECTIONS')
  const [sections, setSections] = useState<PageSectionItem[]>(page.sections)
  const [pageStatus, setPageStatus] = useState<'DRAFT' | 'PUBLISHED'>(page.status)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<PageSectionItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleOpenAddSection = () => {
    setEditingSection(null)
    setModalOpen(true)
    setMsg(null)
  }

  const handleOpenEditSection = (s: PageSectionItem) => {
    setEditingSection(s)
    setModalOpen(true)
    setMsg(null)
  }

  const handleSaveSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const formData = new FormData(e.currentTarget)
    const rawData = {
      pageKey: page.pageKey,
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
      setMsg({ type: 'success', text: res.message || 'Section saved' })
      setModalOpen(false)
      window.location.reload()
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save section' })
    }
  }

  const handleSaveSEO = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const formData = new FormData(e.currentTarget)
    const rawData = {
      pageName: page.pageName,
      pageKey: page.pageKey,
      slug: page.slug,
      description: page.description,
      status: pageStatus,
      metaTitle: formData.get('metaTitle') as string,
      metaDescription: formData.get('metaDescription') as string,
      canonicalUrl: formData.get('canonicalUrl') as string,
      ogImage: formData.get('ogImage') as string,
    }

    const res = await saveWebPageAction(rawData, page.id)
    setLoading(false)

    if (res.success) {
      setMsg({ type: 'success', text: 'Page SEO metadata saved successfully!' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save SEO metadata' })
    }
  }

  const handleTogglePublish = async () => {
    const nextStatus = pageStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    const res = await togglePageStatusAction(page.id, nextStatus)
    if (res.success) {
      setPageStatus(nextStatus)
      setMsg({ type: 'success', text: res.message || 'Page status updated' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to update page status' })
    }

  }

  const handleTrashSection = async (id: string) => {
    if (!confirm('Trash this section?')) return
    const res = await trashPageSectionAction(id)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/pages" className="hover:text-indigo-600 font-medium">
              Web Pages
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">{page.pageName}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Page Editor: {page.pageName}
            <span className="text-xs font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              {page.slug}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={page.slug}
            target="_blank"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Icon icon="ion:open-outline" className="w-4 h-4" />
            Preview Live Page
          </Link>

          <button
            onClick={handleTogglePublish}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 shadow-xs ${
              pageStatus === 'PUBLISHED'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
            }`}
          >
            <Icon icon={pageStatus === 'PUBLISHED' ? 'ion:checkmark-circle' : 'ion:time-outline'} className="w-4 h-4" />
            {pageStatus === 'PUBLISHED' ? 'Published' : 'Draft Mode (Click to Publish)'}
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

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('SECTIONS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'SECTIONS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Page Layout & Content Sections ({sections.length})
        </button>
        <button
          onClick={() => setActiveTab('SEO')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'SEO'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Technical SEO Metadata & OpenGraph
        </button>
      </div>

      {/* TAB 1: SECTIONS LIST */}
      {activeTab === 'SECTIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Manage section headings, body copy, CTA links, section order, and images for this page.
            </p>
            <button
              onClick={handleOpenAddSection}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
              Add Section to Page
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sections.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No sections defined for this page yet. Click "Add Section to Page" above to add one.
              </div>
            ) : (
              sections.map((s, idx) => (
                <div
                  key={s.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center border border-slate-200">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-indigo-700 uppercase bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                        {s.sectionKey}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
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
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {s.sectionTitle || 'Untitled Section'}
                    </h3>
                    {s.subtitle && <p className="text-xs text-slate-500 mt-1">{s.subtitle}</p>}
                    {s.content && (
                      <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans">
                        {s.content}
                      </p>
                    )}
                  </div>

                  {s.image && (
                    <div className="h-28 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                      <img src={s.image} alt={s.sectionTitle || ''} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="text-[11px] text-slate-500">
                      Button CTA: <strong className="text-slate-800">{s.buttonText || 'None'}</strong>{' '}
                      {s.buttonUrl && <span className="text-blue-600">({s.buttonUrl})</span>}
                    </div>

                    <div className="space-x-2">
                      <button
                        onClick={() => handleOpenEditSection(s)}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors text-xs"
                      >
                        Edit Section Content
                      </button>
                      <button
                        onClick={() => handleTrashSection(s.id)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg transition-colors text-xs"
                      >
                        Trash
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICAL SEO */}
      {activeTab === 'SEO' && (
        <form onSubmit={handleSaveSEO} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-xs shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3">
            Search Engine Optimization (SEO) & Social Sharing Meta Tags
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              defaultValue={page.metaTitle || ''}
              placeholder="e.g. AI-Powered Courses – QIMD Hinjewadi Pune"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Meta Description</label>
            <textarea
              name="metaDescription"
              rows={3}
              defaultValue={page.metaDescription || ''}
              placeholder="Compelling meta description for search result snippets..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Canonical URL</label>
              <input
                type="text"
                name="canonicalUrl"
                defaultValue={page.canonicalUrl || ''}
                placeholder="https://www.qimd.in/courses"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">OpenGraph Share Image URL</label>
              <input
                type="text"
                name="ogImage"
                defaultValue={page.ogImage || ''}
                placeholder="/images/logo/qimd-logo.png"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs text-xs"
            >
              {loading ? 'Saving...' : 'Save SEO Metadata'}
            </button>
          </div>
        </form>
      )}

      {/* Section Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingSection ? `Edit Section: ${editingSection.sectionKey}` : 'Add Section to Page'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section Key (Identifier)</label>
                <input
                  type="text"
                  name="sectionKey"
                  required
                  defaultValue={editingSection?.sectionKey || ''}
                  placeholder="e.g. HERO, WHY_CHOOSE_US, STATS, CTA_BANNER"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section Title / Heading</label>
                <input
                  type="text"
                  name="sectionTitle"
                  defaultValue={editingSection?.sectionTitle || ''}
                  placeholder="Section main heading text..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subtitle / Tagline</label>
                <textarea
                  name="subtitle"
                  rows={2}
                  defaultValue={editingSection?.subtitle || ''}
                  placeholder="Section subtitle..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Main Paragraph / Content Text</label>
                <textarea
                  name="content"
                  rows={4}
                  defaultValue={editingSection?.content || ''}
                  placeholder="Body content text for section..."
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
                    placeholder="e.g. Explore Courses"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Button Target Link URL</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Display Order Index</label>
                  <input
                    type="number"
                    name="displayOrder"
                    defaultValue={editingSection?.displayOrder || 0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visibility Status</label>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  {loading ? 'Saving...' : 'Save Section Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
