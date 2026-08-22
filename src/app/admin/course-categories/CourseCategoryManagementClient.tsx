'use client'

import React, { useState } from 'react'
import {
  saveCategoryAction,
  trashCategoryAction,
  restoreCategoryAction,
  deleteCategoryPermanentlyAction,
  bulkTrashCategoriesAction,
  bulkRestoreCategoriesAction,
  bulkDeleteCategoriesPermanentlyAction,
  getCategoriesAction,
} from '@/app/actions/cmsActions'
import { Icon } from '@iconify/react'

interface CategoryItem {
  id: string
  name: string
  slug: string
  description?: string
  displayOrder: number
  status: boolean
  isDeleted: boolean
  courses?: any[]
  createdAt: string
}

export default function CourseCategoryManagementClient({
  initialCategories,
}: {
  initialCategories: CategoryItem[]
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories)
  const [search, setSearch] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Selection & Bulk delete state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkConfirmModal, setBulkConfirmModal] = useState<boolean>(false)

  const activeCategories = categories.filter((c) => !c.isDeleted)
  const trashCategories = categories.filter((c) => c.isDeleted)

  const currentList = showTrash ? trashCategories : activeCategories

  const filtered = currentList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map((c) => c.id))
    }
  }

  const handleTabChange = (trash: boolean) => {
    setShowTrash(trash)
    setSelectedIds([])
    setMsg(null)
  }

  const handleOpenAdd = () => {
    setEditingCat(null)
    setModalOpen(true)
    setMsg(null)
  }

  const handleOpenEdit = (c: CategoryItem) => {
    setEditingCat(c)
    setModalOpen(true)
    setMsg(null)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const formData = new FormData(e.currentTarget)
    const rawData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: (formData.get('description') as string) || '',
      displayOrder: Number(formData.get('displayOrder') || 0),
      status: formData.get('status') === 'true',
    }

    const res = await saveCategoryAction(rawData, editingCat?.id)
    setLoading(false)

    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'Category saved successfully' })
      setModalOpen(false)
      if ((res as any).category) {
        const returnedCat = (res as any).category as CategoryItem
        setCategories((prev) => {
          const exists = prev.some((c) => c.id === returnedCat.id)
          if (exists) {
            return prev.map((c) => (c.id === returnedCat.id ? { ...c, ...returnedCat } : c))
          }
          return [returnedCat, ...prev]
        })
      } else {
        const fresh = await getCategoriesAction()
        if (fresh.success && fresh.categories) {
          setCategories(fresh.categories)
        }
      }
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move category to Trash?')) return
    const res = await trashCategoryAction(id)
    if (res.success) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isDeleted: true } : c))
      )
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      setMsg({ type: 'success', text: 'Category moved to Trash' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to trash category' })
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreCategoryAction(id)
    if (res.success) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isDeleted: false } : c))
      )
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      setMsg({ type: 'success', text: 'Category restored' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to restore category' })
    }
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('Permanently delete this category? Associated courses will be updated.')) return
    const res = await deleteCategoryPermanentlyAction(id)
    if (res.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      setMsg({ type: 'success', text: 'Category permanently deleted' })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to delete category' })
    }
  }

  // Bulk operations
  const handleBulkTrash = async () => {
    if (!confirm(`Move ${selectedIds.length} categories to Trash?`)) return
    const res = await bulkTrashCategoriesAction(selectedIds)
    if (res.success) {
      setCategories((prev) =>
        prev.map((c) => (selectedIds.includes(c.id) ? { ...c, isDeleted: true } : c))
      )
      setSelectedIds([])
      setMsg({ type: 'success', text: `${selectedIds.length} categories moved to Trash` })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to bulk trash categories' })
    }
  }

  const handleBulkRestore = async () => {
    const res = await bulkRestoreCategoriesAction(selectedIds)
    if (res.success) {
      setCategories((prev) =>
        prev.map((c) => (selectedIds.includes(c.id) ? { ...c, isDeleted: false } : c))
      )
      setSelectedIds([])
      setMsg({ type: 'success', text: `${selectedIds.length} categories restored` })
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to bulk restore categories' })
    }
  }

  const handleBulkDeletePermanently = async () => {
    const res = await bulkDeleteCategoriesPermanentlyAction(selectedIds)
    if (res.success) {
      setCategories((prev) => prev.filter((c) => !selectedIds.includes(c.id)))
      setSelectedIds([])
      setBulkConfirmModal(false)
      setMsg({ type: 'success', text: `${selectedIds.length} categories permanently deleted` })
    } else {
      setBulkConfirmModal(false)
      setMsg({ type: 'error', text: res.error || 'Failed to permanently delete categories' })
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:folder-open-outline" className="w-6 h-6 text-cyan-600" />
            Course Categories Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize training programs into digital marketing, graphic design, video editing & custom categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleTabChange(false)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                !showTrash
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon icon="ion:list-outline" className="w-4 h-4 text-blue-600" />
              Active ({activeCategories.length})
            </button>
            <button
              onClick={() => handleTabChange(true)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                showTrash
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon icon="ion:trash-outline" className="w-4 h-4" />
              Trash ({trashCategories.length})
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Icon icon="ion:add-circle-outline" className="w-4.5 h-4.5" />
            Create Category
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Filter Bar & Bulk Actions */}
      <div className="space-y-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search category name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
            <Icon icon="ion:search-outline" className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          </div>
        </div>

        {/* Bulk Action Bar */}
        {filtered.length > 0 && (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.length === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">
                {selectedIds.length > 0
                  ? `${selectedIds.length} of ${filtered.length} selected`
                  : `Select all (${filtered.length})`}
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
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="p-4 w-10"></th>
                <th className="p-4">Category Name</th>
                <th className="p-4">SEO Slug</th>
                <th className="p-4">Courses Count</th>
                <th className="p-4">Display Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium text-sm">
                    {showTrash ? 'No categories currently in Trash.' : 'No active course categories found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      selectedIds.includes(c.id) ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleSelectId(c.id)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 text-base leading-snug">{c.name}</p>
                      <p className="text-xs text-slate-400 font-medium truncate max-w-xs">{c.description}</p>
                    </td>
                    <td className="p-4 text-slate-600 font-medium text-xs font-mono">{c.slug}</td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {c.courses?.length || 0} Courses
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 text-sm">{c.displayOrder}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                          c.status
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {c.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {!c.isDeleted ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <Icon icon="ion:create-outline" className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleTrash(c.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Move to Trash"
                          >
                            <Icon icon="ion:trash-outline" className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(c.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore"
                          >
                            <Icon icon="ion:refresh-outline" className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeletePermanently(c.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Permanently"
                          >
                            <Icon icon="ion:trash-bin-outline" className="w-5 h-5" />
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

      {/* Bulk Delete Permanently Confirmation Modal */}
      {bulkConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Icon icon="ion:alert-circle" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Permanently delete {selectedIds.length} categories?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                These categories will be permanently removed from the database and cannot be recovered.
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

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-7 max-h-[88vh] overflow-y-auto no-scrollbar space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCat ? 'Edit Category' : 'Create Course Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingCat?.name || ''}
                  onChange={(e) => {
                    const slugInput = (e.target.form as any)?.slug
                    if (slugInput && !editingCat) {
                      slugInput.value = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, '')
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SEO Slug</label>
                <input
                  type="text"
                  name="slug"
                  required
                  defaultValue={editingCat?.slug || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingCat?.description || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  defaultValue={editingCat?.displayOrder || 0}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={editingCat ? String(editingCat.status) : 'true'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
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
                  {loading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
