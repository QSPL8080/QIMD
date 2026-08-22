'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  updateEnquiryStatusAction,
  deleteEnquiryAction,
  bulkDeleteEnquiryAction,
} from '@/app/actions/crmActions'
import { Icon } from '@iconify/react'

export default function AdminFranchiseProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  const fetchProposals = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enquiries?type=franchise')
      const data = await res.json()
      setProposals(data.enquiries || [])
    } catch (err) {
      console.error('Failed to fetch franchise proposals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  const filteredProposals = proposals.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.companyName || '').toLowerCase().includes(search.toLowerCase())

    let matchesStatus = true
    if (statusFilter === 'PENDING') {
      matchesStatus = p.status === 'PENDING' || p.status === 'NEW'
    } else if (statusFilter === 'CONTACTED') {
      matchesStatus = p.status === 'CONTACTED'
    } else if (statusFilter === 'CLOSED') {
      matchesStatus = p.status === 'CLOSED'
    }

    return matchesSearch && matchesStatus
  })

  const closedProposals = filteredProposals.filter(p => p.status === 'CLOSED')

  const handleStatusChange = async (id: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateEnquiryStatusAction('franchise', id, newStatus)
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Status updated successfully' })
        setProposals((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        )
        if (selectedProposal?.id === id) {
          setSelectedProposal((prev: any) => ({ ...prev, status: newStatus }))
        }
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to update status' })
      }
    })
  }

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteEnquiryAction('franchise', id)
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Franchise proposal deleted successfully' })
        setProposals((prev) => prev.filter((item) => item.id !== id))
        if (selectedProposal?.id === id) setSelectedProposal(null)
        setConfirmDeleteId(null)
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to delete proposal' })
        setConfirmDeleteId(null)
      }
    })
  }

  const handleBulkDelete = async () => {
    startTransition(async () => {
      const res = await bulkDeleteEnquiryAction('franchise', selectedIds)
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message || 'Selected records deleted' })
        setProposals((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
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
    if (selectedIds.length === closedProposals.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(closedProposals.map(r => r.id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONTACTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
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
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:business-outline" className="w-6 h-6 text-indigo-600" />
            Franchise/Partner Enquiry CMS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review franchise expansion partnership proposals, investment capacities, and update partnership status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/export?type=franchise"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Icon icon="ion:download-outline" className="w-4 h-4" />
            Export CSV
          </a>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs border ${
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
            placeholder="Search proposal by name, email, city, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
          />
          <Icon icon="ion:search-outline" className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Status Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Bulk delete bar — shows only when viewing CLOSED tab and closed records exist */}
      {statusFilter === 'CLOSED' && closedProposals.length > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.length === closedProposals.length && closedProposals.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700">
              {selectedIds.length > 0
                ? `${selectedIds.length} of ${closedProposals.length} selected`
                : `Select all closed (${closedProposals.length})`}
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

      {/* Franchise Proposals List View */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading franchise proposals...</div>
        ) : filteredProposals.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No franchise proposals found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                {statusFilter === 'CLOSED' && <th className="p-3.5 w-10"></th>}
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProposals.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProposal(p)}
                  className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                >
                  {statusFilter === 'CLOSED' && (
                    <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelectId(p.id)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="p-3.5 font-bold text-slate-900 group-hover:text-indigo-700">
                    {p.fullName}
                    {p.companyName && (
                      <span className="block text-[11px] font-normal text-slate-500">{p.companyName}</span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <a
                      href={`mailto:${p.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:underline"
                    >
                      {p.email}
                    </a>
                  </td>
                  <td className="p-3.5 text-slate-800 font-medium">
                    {p.city ? `${p.city}${p.state ? `, ${p.state}` : ''}` : 'Location Not Specified'}
                  </td>
                  <td className="p-3.5">{getStatusBadge(p.status)}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProposal(p)
                      }}
                      className="px-3.5 py-1.5 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors"
                    >
                      View Proposal
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
      {selectedProposal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-xl p-6 sm:p-7 space-y-6 shadow-2xl max-h-[88vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedProposal.fullName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submitted on {new Date(selectedProposal.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
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
                    href={`mailto:${selectedProposal.email}`}
                    className="text-blue-600 hover:underline font-bold block truncate break-all"
                    title={selectedProposal.email}
                  >
                    {selectedProposal.email}
                  </a>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Phone</span>
                  <a href={`tel:${selectedProposal.phone}`} className="text-slate-900 font-bold block truncate hover:text-blue-600">
                    {selectedProposal.phone || 'N/A'}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-0">
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">City / Location</span>
                  <span className="text-slate-900 font-bold block truncate">{selectedProposal.city || 'N/A'}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">State</span>
                  <span className="text-slate-900 font-bold block truncate">{selectedProposal.state || 'N/A'}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Investment Capacity</span>
                  <span className="text-slate-900 font-bold block truncate" title={selectedProposal.investmentCapacity}>{selectedProposal.investmentCapacity || 'N/A'}</span>
                </div>
              </div>

              {selectedProposal.message && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">Proposal Message / Details</span>
                  <p className="text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                    {selectedProposal.message}
                  </p>
                </div>
              )}

              {/* Status Update Control */}
              <div className="bg-indigo-50/60 p-4 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-0.5">Update Proposal Status</label>
                  <span className="text-[11px] text-slate-500">Change proposal status in database</span>
                </div>
                <select
                  value={selectedProposal.status}
                  onChange={(e) => handleStatusChange(selectedProposal.id, e.target.value)}
                  className="bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {selectedProposal.status === 'CLOSED' ? (
                <button
                  onClick={() => setConfirmDeleteId(selectedProposal.id)}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Icon icon="ion:trash-outline" className="w-4 h-4" />
                  Delete Proposal
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  Only CLOSED enquiries can be deleted
                </span>
              )}

              <button
                onClick={() => setSelectedProposal(null)}
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
              <h3 className="font-bold text-slate-900 text-sm">Delete this franchise proposal?</h3>
              <p className="text-xs text-slate-500 mt-1">This proposal will be permanently deleted and cannot be recovered.</p>
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
              <h3 className="font-bold text-slate-900 text-sm">Delete {selectedIds.length} closed proposals?</h3>
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
