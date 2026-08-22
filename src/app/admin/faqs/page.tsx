'use client'

import React, { useState, useEffect } from 'react'
import {
  saveFaqAction,
  trashFaqAction,
  restoreFaqAction,
  deleteFaqAction,
  bulkTrashFaqsAction,
  bulkRestoreFaqsAction,
  bulkDeleteFaqsPermanentlyAction,
} from '@/app/actions/cmsActions'
import { Icon } from '@iconify/react'

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkConfirmModal, setBulkConfirmModal] = useState<boolean>(false)

  const fetchFaqs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/faqs')
      const data = await res.json()
      setFaqs(data.faqs || [])
    } catch (err) {
      console.error('Failed to fetch FAQs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  const filteredFaqs = faqs.filter((f) => (showTrash ? f.isDeleted : !f.isDeleted))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const payload = {
      question: formData.get('question') as string,
      answer: formData.get('answer') as string,
      displayOrder: Number(formData.get('displayOrder')) || 0,
      isActive: formData.get('isActive') === 'true',
    }

    const res = await saveFaqAction(payload, editingItem?.id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'FAQ saved' })
      setIsFormOpen(false)
      setEditingItem(null)
      fetchFaqs()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Move FAQ to Trash?')) return
    const res = await trashFaqAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Moved to Trash' })
      fetchFaqs()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to trash FAQ' })
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreFaqAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Restored from Trash' })
      fetchFaqs()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to restore FAQ' })
    }
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('WARNING: Permanently delete this FAQ?')) return
    const res = await deleteFaqAction(id)
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'FAQ permanently deleted' })
      fetchFaqs()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete' })
    }
  }

  const activeFaqs = faqs.filter((f) => !f.isDeleted)
  const trashFaqs = faqs.filter((f) => f.isDeleted)

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFaqs.length && filteredFaqs.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredFaqs.map((f) => f.id))
    }
  }

  const handleTabChange = (trash: boolean) => {
    setShowTrash(trash)
    setSelectedIds([])
    setStatusMsg(null)
  }

  const handleBulkTrash = async () => {
    if (!confirm(`Move ${selectedIds.length} FAQs to Trash?`)) return
    const res = await bulkTrashFaqsAction(selectedIds)
    if (res.success) {
      setSelectedIds([])
      setStatusMsg({ type: 'success', text: `${selectedIds.length} FAQs moved to Trash` })
      fetchFaqs()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to bulk trash FAQs' })
    }
  }

  const handleBulkRestore = async () => {
    const res = await bulkRestoreFaqsAction(selectedIds)
    if (res.success) {
      setSelectedIds([])
      setStatusMsg({ type: 'success', text: `${selectedIds.length} FAQs restored` })
      fetchFaqs()
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to bulk restore FAQs' })
    }
  }

  const handleBulkDeletePermanently = async () => {
    const res = await bulkDeleteFaqsPermanentlyAction(selectedIds)
    if (res.success) {
      setSelectedIds([])
      setBulkConfirmModal(false)
      setStatusMsg({ type: 'success', text: `${selectedIds.length} FAQs permanently deleted` })
      fetchFaqs()
    } else {
      setBulkConfirmModal(false)
      setStatusMsg({ type: 'error', text: res.error || 'Failed to delete FAQs' })
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:help-circle-outline" className="w-6 h-6 text-emerald-600" />
            Frequently Asked Questions (FAQs) CMS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage Q&A items displayed on homepage accordion and FAQ page (SRS Section 4.14)
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
              <Icon icon="ion:list-outline" className="w-4 h-4 text-emerald-600" />
              Active ({activeFaqs.length})
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
              Trash ({trashFaqs.length})
            </button>
          </div>

          <button
            onClick={() => {
              setEditingItem(null)
              setIsFormOpen(true)
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Icon icon="ion:add-circle-outline" className="w-4.5 h-4.5" />
            Add FAQ
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

      {/* Bulk Action Bar */}
      {filteredFaqs.length > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredFaqs.length && filteredFaqs.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700">
              {selectedIds.length > 0
                ? `${selectedIds.length} of ${filteredFaqs.length} selected`
                : `Select all (${filteredFaqs.length})`}
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

      {/* FAQs List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading FAQs...</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">
            {showTrash ? 'No FAQs currently in Trash.' : 'No active FAQs found in database.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="p-4 w-10"></th>
                <th className="p-4">#</th>
                <th className="p-4">Question</th>
                <th className="p-4">Answer</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredFaqs.map((f, idx) => (
                <tr
                  key={f.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    selectedIds.includes(f.id) ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(f.id)}
                      onChange={() => toggleSelectId(f.id)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-bold text-slate-400 text-sm">{idx + 1}</td>
                  <td className="p-4 font-semibold text-slate-900 text-base max-w-xs">{f.question}</td>
                  <td className="p-4 text-slate-600 font-medium text-sm line-clamp-2 max-w-md">{f.answer}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                        f.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {f.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {!f.isDeleted ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingItem(f)
                            setIsFormOpen(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Icon icon="ion:create-outline" className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleTrash(f.id)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Move to Trash"
                        >
                          <Icon icon="ion:trash-outline" className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRestore(f.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Restore"
                        >
                          <Icon icon="ion:refresh-outline" className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePermanently(f.id)}
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

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-xl p-6 sm:p-7 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">{editingItem ? 'Edit FAQ' : 'Add New FAQ'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Question *</label>
                <input
                  type="text"
                  name="question"
                  required
                  defaultValue={editingItem?.question || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Answer *</label>
                <textarea
                  name="answer"
                  required
                  rows={4}
                  defaultValue={editingItem?.answer || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    defaultValue={editingItem?.displayOrder || 0}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Active Status</label>
                  <select
                    name="isActive"
                    defaultValue={editingItem ? String(editingItem.isActive) : 'true'}
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
                  Save FAQ
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
                Permanently delete {selectedIds.length} FAQs?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                These FAQs will be permanently removed from the database and cannot be recovered.
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
