'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  updateEnquiryStatusAction,
  deleteEnquiryAction,
  bulkDeleteEnquiryAction,
} from '@/app/actions/crmActions'
import { Icon } from '@iconify/react'

export default function AdminAdmissionLeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enquiries?type=admission')
      const data = await res.json()
      setLeads(data.enquiries || [])
    } catch (err) {
      console.error('Failed to fetch admission leads:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.studentName.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      (lead.course?.courseName || '').toLowerCase().includes(search.toLowerCase())

    let matchesStatus = true
    if (statusFilter === 'PENDING') {
      matchesStatus = lead.status === 'PENDING' || lead.status === 'NEW'
    } else if (statusFilter === 'CONTACTED') {
      matchesStatus = lead.status === 'CONTACTED'
    } else if (statusFilter === 'CLOSED') {
      matchesStatus = lead.status === 'CLOSED'
    }

    return matchesSearch && matchesStatus
  })

  const closedLeads = filteredLeads.filter(l => l.status === 'CLOSED')

  const handleStatusChange = async (id: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateEnquiryStatusAction('admission', id, newStatus)
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Status updated successfully' })
        setLeads((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        )
        if (selectedLead?.id === id) {
          setSelectedLead((prev: any) => ({ ...prev, status: newStatus }))
        }
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to update status' })
      }
    })
  }

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteEnquiryAction('admission', id)
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Admission lead deleted successfully' })
        setLeads((prev) => prev.filter((item) => item.id !== id))
        if (selectedLead?.id === id) setSelectedLead(null)
        setConfirmDeleteId(null)
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to delete lead' })
        setConfirmDeleteId(null)
      }
    })
  }

  const handleBulkDelete = async () => {
    startTransition(async () => {
      const res = await bulkDeleteEnquiryAction('admission', selectedIds)
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message || 'Selected records deleted' })
        setLeads((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
        setSelectedIds([])
        setBulkDeleteConfirm(false)
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to bulk delete' })
        setBulkDeleteConfirm(false)
      }
    })
  }

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === closedLeads.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(closedLeads.map(l => l.id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONTACTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Contacted
          </span>
        )
      case 'CLOSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Closed
          </span>
        )
      case 'PENDING':
      case 'NEW':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:school-outline" className="w-6 h-6 text-amber-600" />
            Admission Enquiry CMS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track prospective student course applications, qualifications, and update lead conversion status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/export?type=admission"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Icon icon="ion:download-outline" className="w-4.5 h-4.5" />
            Export CSV
          </a>
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

      {/* Filter Bar with Status Dropdown & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search lead by student name, email, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
          <Icon icon="ion:search-outline" className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <label className="text-sm font-semibold text-slate-600 whitespace-nowrap">Status Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600 w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Bulk delete bar — shows only when viewing CLOSED tab and closed records exist */}
      {statusFilter === 'CLOSED' && closedLeads.length > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.length === closedLeads.length && closedLeads.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700">
              {selectedIds.length > 0
                ? `${selectedIds.length} of ${closedLeads.length} selected`
                : `Select all closed (${closedLeads.length})`}
            </span>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Icon icon="ion:trash-outline" className="w-3.5 h-3.5" />
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      )}

      {/* Admission Leads List View */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading admission leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">No admission leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
                {statusFilter === 'CLOSED' && <th className="p-4 w-10"></th>}
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Course</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-amber-50/50 cursor-pointer transition-colors group"
                >
                  {statusFilter === 'CLOSED' && (
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => toggleSelectId(lead.id)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="p-4 font-bold text-slate-900 text-base group-hover:text-amber-700">
                    {lead.studentName}
                  </td>
                  <td className="p-4 text-slate-600 font-medium text-sm">
                    <a
                      href={`mailto:${lead.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:underline"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="p-4 text-slate-800 font-semibold text-sm">
                    {lead.course?.courseName || 'AI Practical Program'}
                  </td>
                  <td className="p-4">{getStatusBadge(lead.status)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedLead(lead)
                      }}
                      className="px-3.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Detail Popup Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-xl p-6 sm:p-7 space-y-6 shadow-2xl max-h-[88vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedLead.studentName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applied on {new Date(selectedLead.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-0">
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Email</span>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="text-blue-600 hover:underline font-bold block truncate break-all"
                    title={selectedLead.email}
                  >
                    {selectedLead.email}
                  </a>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Phone</span>
                  <a href={`tel:${selectedLead.phone}`} className="text-slate-900 font-bold block truncate hover:text-blue-600">
                    {selectedLead.phone || 'N/A'}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-0">
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Interested Course</span>
                  <span className="text-slate-900 font-bold block truncate" title={selectedLead.course?.courseName}>{selectedLead.course?.courseName || 'AI Practical Program'}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">City</span>
                  <span className="text-slate-900 font-bold block truncate">{selectedLead.city || 'N/A'}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Qualification</span>
                  <span className="text-slate-900 font-bold block truncate">{selectedLead.qualification || 'N/A'}</span>
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">Student Message / Enquiry Note</span>
                  <p className="text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              {/* Status Update Control */}
              <div className="bg-amber-50/60 p-4 border border-amber-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-0.5">Update Status</label>
                  <span className="text-[11px] text-slate-500">Change admission lead status in database</span>
                </div>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                  className="bg-white border border-amber-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600 shadow-xs"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {selectedLead.status === 'CLOSED' ? (
                <button
                  onClick={() => setConfirmDeleteId(selectedLead.id)}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Icon icon="ion:trash-outline" className="w-4 h-4" />
                  Delete Lead
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  Only CLOSED enquiries can be deleted
                </span>
              )}

              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Icon icon="ion:alert-circle" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Delete this admission lead?</h3>
              <p className="text-xs text-slate-500 mt-1">This admission lead will be permanently deleted and cannot be recovered.</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Icon icon="ion:alert-circle" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Delete {selectedIds.length} closed admission leads?</h3>
              <p className="text-xs text-slate-500 mt-1">These records will be permanently deleted and cannot be recovered.</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
