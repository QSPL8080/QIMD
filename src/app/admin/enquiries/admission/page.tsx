'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  updateEnquiryStatusAction,
  trashEnquiryAction,
  bulkTrashEnquiryAction,
  bulkUpdateEnquiryStatusAction,
} from '@/app/actions/crmActions'
import { Icon } from '@iconify/react'
import { exportToCsv } from '@/lib/exportCsv'
import { formatLeadDateTime } from '@/lib/dateUtils'

/** Program for a lead (saved in the lead message as "Program: …") */
function programOf(lead: any): string {
  return lead?.message?.match(/^Program: (.+)$/m)?.[1] || 'Not specified'
}

export default function AdminAdmissionLeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
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

  // Dynamic monthly calculation: Automatically updates for whatever the current calendar month & year is
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  const totalCount = leads.length
  const monthlyCount = leads.filter((item) => {
    const d = new Date(item.createdAt)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth
  }).length
  const pendingCount = leads.filter((item) => item.status === 'PENDING' || item.status === 'NEW').length
  const contactedCount = leads.filter((item) => item.status === 'CONTACTED').length

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.studentName.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      programOf(lead).toLowerCase().includes(search.toLowerCase()) ||
      (lead.city || '').toLowerCase().includes(search.toLowerCase())

    let matchesStatus = true
    if (statusFilter === 'PENDING') {
      matchesStatus = lead.status === 'PENDING' || lead.status === 'NEW'
    } else if (statusFilter === 'CONTACTED') {
      matchesStatus = lead.status === 'CONTACTED'
    } else if (statusFilter === 'CLOSED') {
      matchesStatus = lead.status === 'CLOSED'
    }

    let matchesDate = true
    if (fromDate) {
      const from = new Date(fromDate)
      from.setHours(0, 0, 0, 0)
      matchesDate = matchesDate && new Date(lead.createdAt) >= from
    }
    if (toDate) {
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999)
      matchesDate = matchesDate && new Date(lead.createdAt) <= to
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const handleExport = () => {
    const targetLeads =
      selectedIds.length > 0
        ? filteredLeads.filter((l) => selectedIds.includes(l.id))
        : filteredLeads

    if (targetLeads.length === 0) {
      setStatusMsg({ type: 'error', text: 'No admission enquiries to export' })
      return
    }

    const headers = [
      'ID',
      'Date Submitted',
      'Student Name',
      'Email',
      'Phone',
      'Program',
      'City',
      'Qualification',
      'Message / Remarks',
      'Status',
    ]

    const rows = targetLeads.map((lead) => [
      lead.id,
      new Date(lead.createdAt).toLocaleString(),
      lead.studentName,
      lead.email,
      lead.phone || '',
      programOf(lead),
      lead.city || '',
      lead.qualification || '',
      lead.message || '',
      lead.status,
    ])

    exportToCsv(`admission_enquiries_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
    setStatusMsg({ type: 'success', text: `Exported ${targetLeads.length} admission enquiry records to CSV` })
  }

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

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.length === 0) return
    startTransition(async () => {
      const res = await bulkUpdateEnquiryStatusAction('admission', selectedIds, newStatus)
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message || `Selected leads marked as ${newStatus}` })
        setLeads((prev) =>
          prev.map((item) =>
            selectedIds.includes(item.id) ? { ...item, status: newStatus } : item
          )
        )
        if (selectedLead && selectedIds.includes(selectedLead.id)) {
          setSelectedLead((prev: any) => ({ ...prev, status: newStatus }))
        }
        setSelectedIds([])
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to update status' })
      }
    })
  }

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await trashEnquiryAction('admission', id)
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
      const res = await bulkTrashEnquiryAction('admission', selectedIds)
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
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id))
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
            Track prospective student program applications, qualifications, and update lead conversion status
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            disabled={filteredLeads.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            title="Download CSV export"
          >
            <Icon icon="ion:download-outline" className="w-4 h-4" />
            <span>
              {selectedIds.length > 0
                ? `Export Selected (${selectedIds.length})`
                : `Export All (${filteredLeads.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Metrics / Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Enquiries</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">All time received</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Icon icon="ion:school-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Total Monthly Count - Refreshes automatically every month */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-linear-to-br from-white to-amber-50/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider block">This Month</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{monthlyCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">{currentMonthName} count</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Icon icon="ion:calendar-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Pending Leads</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">Awaiting action</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Icon icon="ion:time-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Contacted Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Contacted</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">{contactedCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">Followed up</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon icon="ion:checkmark-circle-outline" className="w-6 h-6" />
          </div>
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

      {/* Filter Bar with Status Dropdown, Date Filters, and Select All */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search lead by student name, email, program, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
            />
            <Icon icon="ion:search-outline" className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setSelectedIds([])
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* Secondary Toolbar: From-To Date Filters & Select All Button */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Date Range Picker */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Icon icon="ion:calendar-clear-outline" className="w-4 h-4 text-slate-500" />
              Date Filter:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setSelectedIds([])
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setSelectedIds([])
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('')
                  setToDate('')
                  setSelectedIds([])
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear date filter"
              >
                <Icon icon="ion:close-circle-outline" className="w-3.5 h-3.5" />
                Clear Dates
              </button>
            )}
          </div>

          {/* Action buttons: Select All and Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              disabled={filteredLeads.length === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                selectedIds.length > 0 && selectedIds.length === filteredLeads.length
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon
                icon={
                  selectedIds.length > 0 && selectedIds.length === filteredLeads.length
                    ? 'ion:checkbox'
                    : selectedIds.length > 0
                    ? 'ion:remove-circle-outline'
                    : 'ion:square-outline'
                }
                className="w-4 h-4"
              />
              <span>
                {selectedIds.length === filteredLeads.length && filteredLeads.length > 0
                  ? 'Deselect All'
                  : `Select All (${filteredLeads.length})`}
              </span>
            </button>

            <button
              onClick={handleExport}
              disabled={filteredLeads.length === 0}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Icon icon="ion:download-outline" className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar — Shows whenever 1 or more leads are selected */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {selectedIds.length} of {filteredLeads.length} Selected
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium hover:underline cursor-pointer"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden md:inline">Change Status:</span>

            <button
              onClick={() => handleBulkStatusChange('CONTACTED')}
              disabled={isPending}
              className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <Icon icon="ion:call-outline" className="w-3.5 h-3.5 text-blue-600" />
              Mark Contacted
            </button>

            <button
              onClick={() => handleBulkStatusChange('CLOSED')}
              disabled={isPending}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <Icon icon="ion:checkmark-done-outline" className="w-3.5 h-3.5 text-slate-600" />
              Mark Closed
            </button>

            <button
              onClick={() => handleBulkStatusChange('PENDING')}
              disabled={isPending}
              className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-slate-200 hover:border-amber-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <Icon icon="ion:time-outline" className="w-3.5 h-3.5 text-amber-600" />
              Mark Pending
            </button>

            <button
              onClick={handleExport}
              disabled={isPending}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Icon icon="ion:download-outline" className="w-3.5 h-3.5 text-emerald-700" />
              Export Selected ({selectedIds.length})
            </button>

            <button
              onClick={() => setBulkDeleteConfirm(true)}
              disabled={isPending}
              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <Icon icon="ion:trash-outline" className="w-3.5 h-3.5 text-rose-600" />
              Delete ({selectedIds.length})
            </button>
          </div>
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
            <table className="w-full text-left text-sm min-w-[780px]">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                      title={selectedIds.length === filteredLeads.length ? 'Deselect all' : 'Select all'}
                    />
                  </th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Program</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`hover:bg-amber-50/50 cursor-pointer transition-colors group ${
                      selectedIds.includes(lead.id) ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="p-4 w-10" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => toggleSelectId(lead.id)}
                        className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                      />
                    </td>
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
                      {programOf(lead)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 text-xs block">
                        {formatLeadDateTime(lead.createdAt).date}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {formatLeadDateTime(lead.createdAt).time}
                      </span>
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
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Interested Program</span>
                  <span className="text-slate-900 font-bold block truncate" title={programOf(selectedLead)}>{programOf(selectedLead)}</span>
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
              <button
                onClick={() => setConfirmDeleteId(selectedLead.id)}
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Icon icon="ion:trash-outline" className="w-4 h-4" />
                Delete Lead
              </button>

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
              <p className="text-xs text-slate-500 mt-1">This admission lead will be moved to the Bin. Only the Super Admin can restore or delete them for good.</p>
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
              <h3 className="font-bold text-slate-900 text-sm">Delete {selectedIds.length} selected admission leads?</h3>
              <p className="text-xs text-slate-500 mt-1">These records will be moved to the Bin. Only the Super Admin can restore or delete them for good.</p>
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
                Move to Bin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
