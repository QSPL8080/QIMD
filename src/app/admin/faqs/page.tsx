'use client'

import React, { useState, useEffect } from 'react'
import {
  saveFaqAction,
  trashFaqAction,
  restoreFaqAction,
  deleteFaqAction,
} from '@/app/actions/cmsActions'
import { Icon } from '@iconify/react'

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)

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
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors flex items-center gap-2 ${
              showTrash
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon icon="ion:trash-outline" className="w-4.5 h-4.5" />
            {showTrash ? 'View Active FAQs' : 'View Trash'}
          </button>

          <button
            onClick={() => {
              setEditingItem(null)
              setIsFormOpen(true)
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
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

      {/* FAQs List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading FAQs...</div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">No FAQs found in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Question</th>
                <th className="p-4">Answer</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredFaqs.map((f, idx) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
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
    </div>
  )
}
