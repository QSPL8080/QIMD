'use client'

import React, { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  updateEnquiryStatusAction,
  trashEnquiryAction,
  bulkTrashEnquiryAction,
  bulkUpdateEnquiryStatusAction,
  getCounsellorListAction,
  assignLeadAction,
  bulkAssignLeadsAction,
  addLeadFollowUpAction,
  getLeadFollowUpsAction,
} from '@/app/actions/crmActions'
import {
  canAssignLeads,
  canExportLeads,
  canDeleteRecords,
  isCounsellorRole,
  isSalesManagerRole,
  isAdminRole,
  isSuperAdminRole,
  getRoleDisplayName,
} from '@/lib/roles'
import { Icon } from '@iconify/react'
import { exportToCsv } from '@/lib/exportCsv'
import { formatLeadDateTime } from '@/lib/dateUtils'

/** Program for a lead (saved in the lead message as "Program: …") */
function programOf(lead: any): string {
  return lead?.message?.match(/^Program: (.+)$/m)?.[1] || 'Not specified'
}

export default function AdminAdmissionLeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [counsellors, setCounsellors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [counsellorFilter, setCounsellorFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Interactive Drawer / Modal state
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [leadFollowUps, setLeadFollowUps] = useState<any[]>([])
  const [loadingFollowUps, setLoadingFollowUps] = useState(false)
  const [newRemark, setNewRemark] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [newNextDate, setNewNextDate] = useState('')

  // Single / Bulk action state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAssignUserId, setBulkAssignUserId] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enquiries?type=admission')
      const data = await res.json()
      setLeads(data.enquiries || [])
      if (data.currentUser) {
        setCurrentUser(data.currentUser)
      }
    } catch (err) {
      console.error('Failed to fetch admission leads:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCounsellors = async () => {
    try {
      const res = await getCounsellorListAction()
      if (res.success && res.counsellors) {
        setCounsellors(res.counsellors)
      }
    } catch (err) {
      console.error('Failed to fetch counsellor list:', err)
    }
  }

  useEffect(() => {
    fetchLeads()
    fetchCounsellors()
  }, [])

  // When a lead is selected for the detail drawer, load its follow-up history
  useEffect(() => {
    if (!selectedLead) {
      setLeadFollowUps([])
      setNewRemark('')
      setNewStatus('')
      setNewNextDate('')
      return
    }

    setNewStatus(selectedLead.status || 'CONTACTED')
    setLoadingFollowUps(true)
    getLeadFollowUpsAction(selectedLead.id)
      .then((res) => {
        if (res.success) {
          setLeadFollowUps(res.followUps || [])
        }
      })
      .catch((err) => console.error('Failed to fetch follow-ups:', err))
      .finally(() => setLoadingFollowUps(false))
  }, [selectedLead?.id])

  // Dynamic monthly calculation: Automatically updates for current calendar month & year
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
  const followUpDueCount = leads.filter(
    (item) => item.status === 'FOLLOW_UP_REQUIRED' || item.status === 'COUNSELLING_SCHEDULED'
  ).length
  const convertedCount = leads.filter((item) => item.status === 'ADMISSION_CLOSED').length

  const userRole = currentUser?.role || 'ADMIN'
  const isCounsellor = isCounsellorRole(userRole)
  const canAssign = canAssignLeads(userRole)
  const canExport = canExportLeads(userRole)
  const canDelete = canDeleteRecords(userRole)

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (lead.phone || '').includes(search) ||
      programOf(lead).toLowerCase().includes(search.toLowerCase()) ||
      (lead.city || '').toLowerCase().includes(search.toLowerCase())

    let matchesStatus = true
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING') {
        matchesStatus = lead.status === 'PENDING' || lead.status === 'NEW'
      } else {
        matchesStatus = lead.status === statusFilter
      }
    }

    let matchesCounsellor = true
    if (counsellorFilter !== 'ALL') {
      if (counsellorFilter === 'UNASSIGNED') {
        matchesCounsellor = !lead.assignedToId
      } else {
        matchesCounsellor = lead.assignedToId === counsellorFilter
      }
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

    return matchesSearch && matchesStatus && matchesCounsellor && matchesDate
  })

  const handleExport = () => {
    if (!canExport) return
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
      'Assigned Counsellor',
      'Status',
      'Latest Remarks',
      'Is Duplicate',
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
      lead.assignedTo?.fullName || 'Unassigned',
      lead.status,
      lead.remarks || '',
      lead.isDuplicate ? `Yes (${lead.duplicateCount})` : 'No',
    ])

    exportToCsv(`admission_leads_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
    setStatusMsg({ type: 'success', text: `Exported ${targetLeads.length} admission enquiry records to CSV` })
  }

  const handleStatusChange = async (id: string, updatedStatus: string) => {
    startTransition(async () => {
      const res = await updateEnquiryStatusAction('admission', id, updatedStatus)
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Status updated successfully' })
        setLeads((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: updatedStatus } : item))
        )
        if (selectedLead?.id === id) {
          setSelectedLead((prev: any) => ({ ...prev, status: updatedStatus }))
        }
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to update status' })
      }
    })
  }

  const handleAssignSingleLead = async (leadId: string, toUserId: string) => {
    if (!canAssign) return
    startTransition(async () => {
      const res = await assignLeadAction('admission', leadId, toUserId)
      if (res.success) {
        const assignedUser = counsellors.find((c) => c.id === toUserId)
        setStatusMsg({ type: 'success', text: res.message || 'Lead assigned successfully' })
        setLeads((prev) =>
          prev.map((item) =>
            item.id === leadId
              ? { ...item, assignedToId: toUserId, assignedTo: assignedUser || item.assignedTo }
              : item
          )
        )
        if (selectedLead?.id === leadId) {
          setSelectedLead((prev: any) => ({
            ...prev,
            assignedToId: toUserId,
            assignedTo: assignedUser || prev.assignedTo,
          }))
        }
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to assign lead' })
      }
    })
  }

  const handleBulkAssign = async () => {
    if (!canAssign || !bulkAssignUserId || selectedIds.length === 0) return
    startTransition(async () => {
      const res = await bulkAssignLeadsAction('admission', selectedIds, bulkAssignUserId)
      if (res.success) {
        const assignedUser = counsellors.find((c) => c.id === bulkAssignUserId)
        setStatusMsg({ type: 'success', text: res.message || 'Leads assigned successfully' })
        setLeads((prev) =>
          prev.map((item) =>
            selectedIds.includes(item.id)
              ? { ...item, assignedToId: bulkAssignUserId, assignedTo: assignedUser || item.assignedTo }
              : item
          )
        )
        setSelectedIds([])
        setBulkAssignUserId('')
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to bulk assign leads' })
      }
    })
  }

  const handleBulkStatusChange = async (updatedStatus: string) => {
    if (selectedIds.length === 0) return
    startTransition(async () => {
      const res = await bulkUpdateEnquiryStatusAction('admission', selectedIds, updatedStatus)
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message || `Selected leads marked as ${updatedStatus}` })
        setLeads((prev) =>
          prev.map((item) =>
            selectedIds.includes(item.id) ? { ...item, status: updatedStatus } : item
          )
        )
        setSelectedIds([])
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to update status' })
      }
    })
  }

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead || !newRemark.trim()) return

    startTransition(async () => {
      const res = await addLeadFollowUpAction({
        enquiryType: 'admission',
        enquiryId: selectedLead.id,
        remarks: newRemark,
        status: newStatus || undefined,
        nextFollowUpDate: newNextDate ? new Date(newNextDate).toISOString() : undefined,
      })

      if (res.success && res.record) {
        setStatusMsg({ type: 'success', text: 'Follow-up interaction recorded successfully' })
        setLeadFollowUps((prev) => [res.record, ...prev])
        setLeads((prev) =>
          prev.map((item) =>
            item.id === selectedLead.id
              ? {
                  ...item,
                  status: newStatus || item.status,
                  remarks: newRemark.trim(),
                }
              : item
          )
        )
        setSelectedLead((prev: any) => ({
          ...prev,
          status: newStatus || prev.status,
          remarks: newRemark.trim(),
        }))
        setNewRemark('')
        setNewNextDate('')
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to record follow-up' })
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!canDelete) return
    startTransition(async () => {
      const res = await trashEnquiryAction('admission', id)
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Admission lead moved to the Bin' })
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
    if (!canDelete) return
    startTransition(async () => {
      const res = await bulkTrashEnquiryAction('admission', selectedIds)
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message || 'Selected records moved to Bin' })
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
      case 'NEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            New
          </span>
        )
      case 'CONTACTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Contacted
          </span>
        )
      case 'INTERESTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Interested
          </span>
        )
      case 'FOLLOW_UP_REQUIRED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            Follow-Up Due
          </span>
        )
      case 'COUNSELLING_SCHEDULED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Counselling Set
          </span>
        )
      case 'NOT_INTERESTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Not Interested
          </span>
        )
      case 'ADMISSION_CLOSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-300 flex items-center gap-1">
            <Icon icon="ion:checkmark-circle" className="w-3 h-3 text-teal-600" />
            Admitted
          </span>
        )
      case 'INVALID_DUPLICATE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Duplicate/Spam
          </span>
        )
      case 'CLOSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Closed
          </span>
        )
      case 'PENDING':
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:school-outline" className="w-6 h-6 text-amber-600" />
              {isCounsellor ? 'My Assigned Leads' : 'Admission Lead CRM'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              {getRoleDisplayName(userRole)}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isCounsellor
              ? 'View prospective student applications assigned to you, record follow-up remarks, and schedule callbacks'
              : 'Track lead intake, assign counsellors, review follow-up timelines, and convert inquiries to student admissions'}
          </p>
        </div>

        {canExport && (
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
        )}
      </div>

      {/* Metrics / Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {isCounsellor ? 'My Leads' : 'Total Leads'}
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">All time received</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Icon icon="ion:school-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Count */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-linear-to-br from-white to-amber-50/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider block">This Month</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{monthlyCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">{currentMonthName}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Icon icon="ion:calendar-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Follow-Ups Due */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Follow-Ups Due</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{followUpDueCount + pendingCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">Requires touchpoint</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Icon icon="ion:time-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Converted / Admitted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Admitted (Closed)</span>
            <span className="text-2xl font-black text-teal-700 mt-1 block">{convertedCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">Converted students</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Icon icon="ion:checkmark-done-circle-outline" className="w-6 h-6" />
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
            <Icon icon="ion:close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar with Status Dropdown, Counsellor Filter, and Date Range */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search lead by student name, phone, email, program, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
            />
            <Icon icon="ion:search-outline" className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          </div>

          {/* Counsellor Filter (Visible to Sales Manager & Admins) */}
          {canAssign && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                Counsellor:
              </label>
              <select
                value={counsellorFilter}
                onChange={(e) => {
                  setCounsellorFilter(e.target.value)
                  setSelectedIds([])
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-600"
              >
                <option value="ALL">All Counsellors</option>
                <option value="UNASSIGNED">Unassigned Leads</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({getRoleDisplayName(c.role)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
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
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
              <option value="FOLLOW_UP_REQUIRED">Follow-Up Required</option>
              <option value="COUNSELLING_SCHEDULED">Counselling Scheduled</option>
              <option value="NOT_INTERESTED">Not Interested</option>
              <option value="ADMISSION_CLOSED">Admitted / Closed</option>
              <option value="INVALID_DUPLICATE">Duplicate / Spam</option>
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
              Date:
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

            {canExport && (
              <button
                onClick={handleExport}
                disabled={filteredLeads.length === 0}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Icon icon="ion:download-outline" className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="bg-white px-3 py-1 rounded-lg border border-amber-200 text-xs font-bold text-amber-900 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              {selectedIds.length} of {filteredLeads.length} Selected
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold hover:underline cursor-pointer"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Assignment Dropdown (Sales Manager & Admins only) */}
            {canAssign && (
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <select
                  value={bulkAssignUserId}
                  onChange={(e) => setBulkAssignUserId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 px-2 py-1 focus:outline-none"
                >
                  <option value="">Assign to Counsellor...</option>
                  {counsellors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAssign}
                  disabled={!bulkAssignUserId || isPending}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Assign
                </button>
              </div>
            )}

            {/* Quick Status Buttons */}
            <button
              onClick={() => handleBulkStatusChange('CONTACTED')}
              disabled={isPending}
              className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <Icon icon="ion:call-outline" className="w-3.5 h-3.5 text-blue-600" />
              Mark Contacted
            </button>

            <button
              onClick={() => handleBulkStatusChange('FOLLOW_UP_REQUIRED')}
              disabled={isPending}
              className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <Icon icon="ion:time-outline" className="w-3.5 h-3.5 text-amber-600" />
              Mark Follow-Up Due
            </button>

            <button
              onClick={() => handleBulkStatusChange('ADMISSION_CLOSED')}
              disabled={isPending}
              className="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <Icon icon="ion:checkmark-circle-outline" className="w-3.5 h-3.5 text-teal-600" />
              Mark Admitted
            </button>

            {canDelete && (
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={isPending}
                className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <Icon icon="ion:trash-outline" className="w-3.5 h-3.5 text-rose-600" />
                Delete ({selectedIds.length})
              </button>
            )}
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
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded cursor-pointer accent-amber-600"
                      title={selectedIds.length === filteredLeads.length ? 'Deselect all' : 'Select all'}
                    />
                  </th>
                  <th className="p-4">Student & Contact</th>
                  <th className="p-4">Program</th>
                  <th className="p-4">Assigned Counsellor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`hover:bg-amber-50/40 cursor-pointer transition-colors group ${
                      selectedIds.includes(lead.id) ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="p-4 w-10" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => toggleSelectId(lead.id)}
                        className="w-4 h-4 rounded cursor-pointer accent-amber-600"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base group-hover:text-amber-700">
                          {lead.studentName}
                        </span>
                        {lead.isDuplicate && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1"
                            title={`Identical contact details found across ${lead.duplicateCount} records`}
                          >
                            <Icon icon="ion:copy-outline" className="w-3 h-3 text-amber-700" />
                            Duplicate ({lead.duplicateCount})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Icon icon="ion:call-outline" className="w-3.5 h-3.5 text-slate-400" />
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-blue-600 font-semibold"
                          >
                            {lead.phone || 'No phone'}
                          </a>
                        </span>
                        <span className="text-slate-300">•</span>
                        <a
                          href={`mailto:${lead.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline text-slate-600 truncate max-w-[180px]"
                        >
                          {lead.email}
                        </a>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-900 font-bold text-sm block">{programOf(lead)}</span>
                      {lead.city && (
                        <span className="text-slate-400 text-xs block mt-0.5">
                          <Icon icon="ion:location-outline" className="w-3 h-3 inline mr-1" />
                          {lead.city}
                        </span>
                      )}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      {canAssign ? (
                        <select
                          value={lead.assignedToId || ''}
                          onChange={(e) => handleAssignSingleLead(lead.id, e.target.value)}
                          className="bg-slate-50 hover:bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
                        >
                          <option value="">Unassigned</option>
                          {counsellors.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.fullName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {lead.assignedTo?.fullName || 'Unassigned'}
                        </span>
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(lead.status)}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 text-xs block">
                        {formatLeadDateTime(lead.createdAt).date}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {formatLeadDateTime(lead.createdAt).time}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedLead(lead)
                        }}
                        className="px-3.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Icon icon="ion:chatbubbles-outline" className="w-3.5 h-3.5 text-amber-700" />
                        Follow-Up
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Counsellor Follow-Up & Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl p-6 sm:p-7 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-black text-slate-900">{selectedLead.studentName}</h2>
                  {getStatusBadge(selectedLead.status)}
                  {selectedLead.isDuplicate && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <Icon icon="ion:warning-outline" className="w-3.5 h-3.5 text-amber-700" />
                      Duplicate ({selectedLead.duplicateCount} records)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Lead received on {new Date(selectedLead.createdAt).toLocaleString()} • Program:{' '}
                  <span className="font-bold text-slate-800">{programOf(selectedLead)}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Icon icon="ion:close" className="w-6 h-6" />
              </button>
            </div>

            {/* Content Grid: Left Student Details, Right Follow-Up Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Student Details & Direct Outreach Actions */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Icon icon="ion:person-outline" className="w-4 h-4 text-amber-600" />
                    Student Information
                  </h3>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Phone Number</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <a href={`tel:${selectedLead.phone}`} className="text-base font-bold text-slate-900 hover:text-amber-700">
                        {selectedLead.phone || 'N/A'}
                      </a>
                      {selectedLead.phone && (
                        <a
                          href={`tel:${selectedLead.phone}`}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-[11px] hover:bg-emerald-100 flex items-center gap-1"
                        >
                          <Icon icon="ion:call" className="w-3 h-3" /> Call
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Email Address</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <a href={`mailto:${selectedLead.email}`} className="text-slate-900 font-semibold truncate hover:text-blue-600 block max-w-[200px]">
                        {selectedLead.email}
                      </a>
                      <a
                        href={`mailto:${selectedLead.email}`}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold text-[11px] hover:bg-blue-100 flex items-center gap-1"
                      >
                        <Icon icon="ion:mail" className="w-3 h-3" /> Email
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">City</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{selectedLead.city || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Qualification</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">{selectedLead.qualification || 'Not specified'}</span>
                    </div>
                  </div>

                  {selectedLead.message && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">Enquiry Note</span>
                      <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800 text-xs whitespace-pre-wrap leading-relaxed">
                        {selectedLead.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Counsellor Assignment Control */}
                <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/70 space-y-2">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                    Assigned Counsellor
                  </span>
                  {canAssign ? (
                    <select
                      value={selectedLead.assignedToId || ''}
                      onChange={(e) => handleAssignSingleLead(selectedLead.id, e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600"
                    >
                      <option value="">Unassigned</option>
                      {counsellors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} ({getRoleDisplayName(c.role)})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-xs font-bold text-slate-800">
                      {selectedLead.assignedTo?.fullName || 'Not yet assigned'}
                    </div>
                  )}
                </div>

                {/* Convert to Student Admission Action */}
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="ion:id-card-outline" className="w-5 h-5 text-teal-700" />
                    <span className="text-xs font-black text-teal-900">Student Enrolment</span>
                  </div>
                  <p className="text-[11px] text-teal-800 leading-snug">
                    When the student confirms enrolment, generate an official admission record and ID card.
                  </p>
                  <Link
                    href={`/admin/admissions?fromLead=${selectedLead.id}&studentName=${encodeURIComponent(
                      selectedLead.studentName
                    )}&email=${encodeURIComponent(selectedLead.email)}&phone=${encodeURIComponent(
                      selectedLead.phone || ''
                    )}&courseName=${encodeURIComponent(programOf(selectedLead))}&city=${encodeURIComponent(
                      selectedLead.city || ''
                    )}&qualification=${encodeURIComponent(selectedLead.qualification || '')}`}
                    className="block text-center w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    Convert to Official Admission →
                  </Link>
                </div>
              </div>

              {/* Right Column: Interactive Follow-Up Form & Chronological Timeline */}
              <div className="lg:col-span-7 space-y-5">
                {/* Add Follow-Up Form */}
                <form
                  onSubmit={handleAddFollowUp}
                  className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <Icon icon="ion:create-outline" className="w-4 h-4 text-amber-600" />
                      Add Follow-Up Note
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">Recorded by {currentUser?.name || 'You'}</span>
                  </div>

                  <div>
                    <textarea
                      required
                      rows={3}
                      value={newRemark}
                      onChange={(e) => setNewRemark(e.target.value)}
                      placeholder="Enter discussion notes, student's concerns, preferred batch timings, or fee quotation discussed..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-amber-600 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Update Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
                      >
                        <option value="CONTACTED">Contacted</option>
                        <option value="INTERESTED">Interested</option>
                        <option value="FOLLOW_UP_REQUIRED">Follow-Up Required</option>
                        <option value="COUNSELLING_SCHEDULED">Counselling Scheduled</option>
                        <option value="NOT_INTERESTED">Not Interested</option>
                        <option value="ADMISSION_CLOSED">Admission Closed (Enrolled)</option>
                        <option value="INVALID_DUPLICATE">Invalid / Duplicate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Next Scheduled Follow-Up
                      </label>
                      <input
                        type="datetime-local"
                        value={newNextDate}
                        onChange={(e) => setNewNextDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isPending || !newRemark.trim()}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Icon icon="ion:save-outline" className="w-4 h-4" />
                      Save Interaction Note
                    </button>
                  </div>
                </form>

                {/* Follow-Up Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Icon icon="ion:time-outline" className="w-4 h-4 text-slate-600" />
                      Interaction Timeline ({leadFollowUps.length})
                    </h3>
                  </div>

                  {loadingFollowUps ? (
                    <div className="p-4 text-center text-xs text-slate-400">Loading timeline history...</div>
                  ) : leadFollowUps.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                      No follow-up notes recorded yet. Add the first interaction note above.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {leadFollowUps.map((item) => (
                        <div key={item.id} className="relative group">
                          {/* Dot */}
                          <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-2xs"></div>

                          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900 flex items-center gap-1">
                                {item.createdByName || 'Staff Member'}
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({getRoleDisplayName(item.createdByRole)})
                                </span>
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                              {item.remarks}
                            </p>

                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
                              {item.status && (
                                <span className="font-bold text-slate-600">
                                  Outcome: <span className="text-amber-800">{item.status}</span>
                                </span>
                              )}
                              {item.nextFollowUpDate && (
                                <span className="text-indigo-600 font-semibold flex items-center gap-1">
                                  <Icon icon="ion:calendar-outline" className="w-3.5 h-3.5" />
                                  Next Call: {new Date(item.nextFollowUpDate).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {canDelete ? (
                <button
                  onClick={() => setConfirmDeleteId(selectedLead.id)}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon icon="ion:trash-outline" className="w-4 h-4" />
                  Move to Bin
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
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
              <p className="text-xs text-slate-500 mt-1">
                This admission lead will be moved to the Bin. Only the Super Admin can restore or delete them permanently.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
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
              <h3 className="font-bold text-slate-900 text-sm">
                Move {selectedIds.length} selected admission leads to Bin?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                These records will be moved to the Bin. Only the Super Admin can restore or delete them permanently.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
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
