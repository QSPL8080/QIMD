'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  saveWebPageAction,
  togglePageStatusAction,
  trashWebPageAction,
  restoreWebPageAction,
  deleteWebPagePermanentlyAction,
} from '@/app/actions/pageActions'
import { Icon } from '@iconify/react'

interface PageItem {
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
  isDeleted: boolean
  sections: any[]
  updatedAt: string
}

export default function PageManagementClient({ initialPages }: { initialPages: PageItem[] }) {
  const [pages, setPages] = useState<PageItem[]>(initialPages)
  const [search, setSearch] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<PageItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.pageName.toLowerCase().includes(search.toLowerCase()) ||
      p.pageKey.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
    const matchesTrash = showTrash ? p.isDeleted : !p.isDeleted
    return matchesSearch && matchesTrash
  })

  const handleOpenAdd = () => {
    setEditingPage(null)
    setModalOpen(true)
    setMsg(null)
  }

  const handleOpenEditSettings = (p: PageItem) => {
    setEditingPage(p)
    setModalOpen(true)
    setMsg(null)
  }

  const handleSavePageSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const formData = new FormData(e.currentTarget)
    const rawData = {
      pageName: formData.get('pageName') as string,
      pageKey: formData.get('pageKey') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      status: (formData.get('status') as 'DRAFT' | 'PUBLISHED') || 'PUBLISHED',
      metaTitle: formData.get('metaTitle') as string,
      metaDescription: formData.get('metaDescription') as string,
      canonicalUrl: formData.get('canonicalUrl') as string,
      ogImage: formData.get('ogImage') as string,
    }

    const res = await saveWebPageAction(rawData, editingPage?.id)
    setLoading(false)

    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'Page saved successfully' })
      setModalOpen(false)
      window.location.reload()
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save page' })
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: 'DRAFT' | 'PUBLISHED') => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    const res = await togglePageStatusAction(id, newStatus)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move page to Trash?')) return
    const res = await trashWebPageAction(id)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  const handleRestore = async (id: string) => {
    const res = await restoreWebPageAction(id)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('Permanently delete this page record?')) return
    const res = await deleteWebPagePermanentlyAction(id)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:document-outline" className="w-6 h-6 text-indigo-600" />
            Website Public Pages & CMS Manager (19 SRS Pages)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage text content, headings, section order, images, banners, CTAs, and SEO metadata across all public website pages
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
            {showTrash ? 'View Active Pages' : 'View Page Trash'}
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
            Add Custom Web Page
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

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search page name, slug, or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
          />
          <Icon icon="ion:search-outline" className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No public pages found. Click "Add Custom Web Page" to create one.
          </div>
        ) : (
          filteredPages.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                    KEY: {p.pageKey}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{p.pageName}</h3>
                  <p className="text-[11px] font-mono text-blue-600 mt-0.5">Slug: {p.slug}</p>
                  {p.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                  )}
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Editable Sections:</span>
                    <strong className="text-slate-900">{p.sections.length} sections</strong>
                  </div>
                  <div className="text-slate-500 truncate">
                    SEO Title: <span className="text-slate-800">{p.metaTitle || 'Default'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {!p.isDeleted ? (
                  <>
                    <Link
                      href={`/admin/pages/${p.id}/edit`}
                      className="flex-1 text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      Edit Page & Sections
                    </Link>

                    <button
                      onClick={() => handleToggleStatus(p.id, p.status)}
                      title={p.status === 'PUBLISHED' ? 'Unpublish to Draft' : 'Publish to Live'}
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                        p.status === 'PUBLISHED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      <Icon icon={p.status === 'PUBLISHED' ? 'ion:checkmark-circle' : 'ion:eye-off'} className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenEditSettings(p)}
                      title="SEO & Page Settings"
                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-colors"
                    >
                      <Icon icon="ion:settings-outline" className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleTrash(p.id)}
                      title="Move to Trash"
                      className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl transition-colors"
                    >
                      <Icon icon="ion:trash-outline" className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleRestore(p.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeletePermanently(p.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Page Settings & SEO Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingPage ? `Page Settings & SEO: ${editingPage.pageName}` : 'Add Custom Web Page'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePageSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Page Name</label>
                  <input
                    type="text"
                    name="pageName"
                    required
                    defaultValue={editingPage?.pageName || ''}
                    placeholder="e.g. Courses & Programs"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Page Key (Unique Identifier)</label>
                  <input
                    type="text"
                    name="pageKey"
                    required
                    defaultValue={editingPage?.pageKey || ''}
                    placeholder="e.g. COURSES, ABOUT"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    name="slug"
                    required
                    defaultValue={editingPage?.slug || '/'}
                    placeholder="e.g. /courses"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingPage?.status || 'PUBLISHED'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="PUBLISHED">PUBLISHED (Visible to Public)</option>
                    <option value="DRAFT">DRAFT (Hidden from Public)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Page Description</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingPage?.description || ''}
                  placeholder="Internal summary of page purpose..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                ></textarea>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">Technical SEO Metadata</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      name="metaTitle"
                      defaultValue={editingPage?.metaTitle || ''}
                      placeholder="e.g. AI-Powered Courses – QIMD Pune"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Meta Description</label>
                    <textarea
                      name="metaDescription"
                      rows={2}
                      defaultValue={editingPage?.metaDescription || ''}
                      placeholder="Meta description for search engine listings..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Canonical URL</label>
                      <input
                        type="text"
                        name="canonicalUrl"
                        defaultValue={editingPage?.canonicalUrl || ''}
                        placeholder="https://www.qimd.in/courses"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">OG Share Image URL</label>
                      <input
                        type="text"
                        name="ogImage"
                        defaultValue={editingPage?.ogImage || ''}
                        placeholder="/images/og-share.jpg"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>
                  </div>
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
                  {loading ? 'Saving...' : 'Save Page & SEO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
