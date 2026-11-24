'use client'

import React, { useState, useEffect, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  getAdmissionsAction,
  createAdmissionAction,
  verifyAdmissionAction,
  updateAdmissionAction,
  deleteAdmissionAction,
} from '@/app/actions/admissionActions'
import { getCounsellorListAction } from '@/app/actions/crmActions'
import { coursesData } from '@/data'
import { Icon } from '@iconify/react'
import { exportToCsv } from '@/lib/exportCsv'
import { canDeleteRecords, getRoleDisplayName } from '@/lib/roles'

function AdmissionsContent() {
  const searchParams = useSearchParams()

  const [admissions, setAdmissions] = useState<any[]>([])
  const [counsellors, setCounsellors] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Modals & Drawers
  const [selectedAdmission, setSelectedAdmission] = useState<any | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form state for creating admission
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    courseName: '',
    batchTiming: 'Morning Batch (10 AM - 1 PM)',
    city: '',
    qualification: '',
    counsellorId: '',
    leadId: '',
    remarks: '',
  })

  const fetchAdmissions = async () => {
    setLoading(true)
    try {
      const res = await getAdmissionsAction()
      if (res.success) {
        setAdmissions(res.admissions || [])
        setCurrentUser(res.currentUser)
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to load admissions' })
      }
    } catch (err) {
      console.error('Failed to load admissions:', err)
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
      console.error('Failed to fetch counsellors:', err)
    }
  }

  useEffect(() => {
    fetchAdmissions()
    fetchCounsellors()
  }, [])

  // Check if redirected from a lead to prefill
  useEffect(() => {
    const fromLead = searchParams.get('fromLead')
    if (fromLead) {
      setFormData({
        studentName: searchParams.get('studentName') || '',
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        courseName: searchParams.get('courseName') || '',
        batchTiming: 'Morning Batch (10 AM - 1 PM)',
        city: searchParams.get('city') || '',
        qualification: searchParams.get('qualification') || '',
        counsellorId: '',
        leadId: fromLead,
        remarks: 'Converted from admission inquiry lead',
      })
      setShowCreateModal(true)
    }
  }, [searchParams])

  // Calculation for metric cards
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  const totalCount = admissions.length
  const monthlyCount = admissions.filter((item) => {
    const d = new Date(item.admissionDate)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth
  }).length
  const pendingCount = admissions.filter((item) => item.status === 'VERIFICATION_PENDING').length
  const activeCount = admissions.filter((item) => item.status === 'VERIFIED_ACTIVE').length

  const userRole = currentUser?.role || 'ADMIN'
  const canDelete = canDeleteRecords(userRole)

  const filteredAdmissions = admissions.filter((item) => {
    const matchesSearch =
      (item.admissionNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.phone || '').includes(search) ||
      (item.courseName || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.city || '').toLowerCase().includes(search.toLowerCase())

    let matchesStatus = true
    if (statusFilter !== 'ALL') {
      matchesStatus = item.status === statusFilter
    }

    let matchesDate = true
    if (fromDate) {
      const from = new Date(fromDate)
      from.setHours(0, 0, 0, 0)
      matchesDate = matchesDate && new Date(item.admissionDate) >= from
    }
    if (toDate) {
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999)
      matchesDate = matchesDate && new Date(item.admissionDate) <= to
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const handleCreateAdmission = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await createAdmissionAction(formData)
      if (res.success && res.admission) {
        setStatusMsg({ type: 'success', text: res.message || 'Admission created successfully' })
        setAdmissions((prev) => [res.admission, ...prev])
        setShowCreateModal(false)
        setFormData({
          studentName: '',
          email: '',
          phone: '',
          courseName: '',
          batchTiming: 'Morning Batch (10 AM - 1 PM)',
          city: '',
          qualification: '',
          counsellorId: '',
          leadId: '',
          remarks: '',
        })
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to create admission' })
      }
    })
  }

  const handleVerifyAdmission = async (id: string) => {
    startTransition(async () => {
      const res = await verifyAdmissionAction(id)
      if (res.success && res.admission) {
        setStatusMsg({ type: 'success', text: res.message || 'Admission verified and activated' })
        setAdmissions((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...res.admission } : item))
        )
        if (selectedAdmission?.id === id) {
          setSelectedAdmission((prev: any) => ({ ...prev, ...res.admission }))
        }
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to verify admission' })
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!canDelete) return
    startTransition(async () => {
      const res = await deleteAdmissionAction(id)
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message || 'Admission moved to Bin' })
        setAdmissions((prev) => prev.filter((item) => item.id !== id))
        if (selectedAdmission?.id === id) setSelectedAdmission(null)
        setConfirmDeleteId(null)
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to delete admission' })
        setConfirmDeleteId(null)
      }
    })
  }

  const handleExport = () => {
    if (filteredAdmissions.length === 0) {
      setStatusMsg({ type: 'error', text: 'No admission records to export' })
      return
    }

    const headers = [
      'Admission Number',
      'Student Name',
      'Email',
      'Phone',
      'Course',
      'Batch Timing',
      'City',
      'Qualification',
      'Admission Date',
      'Status',
      'Assigned Counsellor',
      'Verified By',
      'Remarks',
    ]

    const rows = filteredAdmissions.map((adm) => [
      adm.admissionNumber,
      adm.studentName,
      adm.email,
      adm.phone,
      adm.courseName,
      adm.batchTiming || '',
      adm.city || '',
      adm.qualification || '',
      new Date(adm.admissionDate).toLocaleDateString(),
      adm.status,
      adm.counsellor?.fullName || 'N/A',
      adm.verifiedBy?.fullName || 'Not Verified',
      adm.remarks || '',
    ])

    exportToCsv(`student_admissions_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
    setStatusMsg({ type: 'success', text: `Exported ${filteredAdmissions.length} admission records to CSV` })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED_ACTIVE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Icon icon="ion:checkmark-circle" className="w-3.5 h-3.5 text-emerald-600" />
            Verified Active
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        )
      case 'VERIFICATION_PENDING':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Icon icon="ion:hourglass-outline" className="w-3.5 h-3.5 text-amber-600" />
            Verification Pending
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
              <Icon icon="ion:id-card-outline" className="w-6 h-6 text-teal-600" />
              Student Admission Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
              {getRoleDisplayName(userRole)}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Official institute student records, unique Admission IDs, document verification, and enrolment status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
            <span>New Student Admission</span>
          </button>

          <button
            onClick={handleExport}
            disabled={filteredAdmissions.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            title="Download CSV export"
          >
            <Icon icon="ion:download-outline" className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Admissions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Admissions
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">All student records</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Icon icon="ion:school-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white p-5 rounded-2xl border border-teal-200/80 bg-linear-to-br from-white to-teal-50/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-teal-900 uppercase tracking-wider block">This Month</span>
            <span className="text-2xl font-black text-teal-700 mt-1 block">{monthlyCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">{currentMonthName}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Icon icon="ion:calendar-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Verification Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Pending Verification
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">Awaiting Head Review</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Icon icon="ion:hourglass-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Verified Active */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Verified & Active
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{activeCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">Confirmed enrolments</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Icon icon="ion:checkmark-circle-outline" className="w-6 h-6" />
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

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by Admission ID, student name, email, phone, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
            />
            <Icon icon="ion:search-outline" className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFICATION_PENDING">Pending Verification</option>
              <option value="VERIFIED_ACTIVE">Verified Active</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Date Filter */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Icon icon="ion:calendar-clear-outline" className="w-4 h-4 text-slate-500" />
              Admission Date:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('')
                  setToDate('')
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Icon icon="ion:close-circle-outline" className="w-3.5 h-3.5" />
                Clear Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading student admission records...</div>
        ) : filteredAdmissions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">No student admissions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[950px]">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-4">Admission ID</th>
                  <th className="p-4">Student & Contact</th>
                  <th className="p-4">Course & Batch</th>
                  <th className="p-4">Counsellor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Admission Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAdmissions.map((adm) => (
                  <tr
                    key={adm.id}
                    onClick={() => setSelectedAdmission(adm)}
                    className="hover:bg-teal-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="p-4">
                      <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 text-xs inline-block">
                        {adm.admissionNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 text-base group-hover:text-teal-700 block">
                        {adm.studentName}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <a
                          href={`tel:${adm.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-blue-600 font-semibold"
                        >
                          {adm.phone}
                        </a>
                        <span className="text-slate-300">•</span>
                        <a
                          href={`mailto:${adm.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline text-slate-600 truncate max-w-[180px]"
                        >
                          {adm.email}
                        </a>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 text-sm block">{adm.courseName}</span>
                      <span className="text-slate-400 text-xs block mt-0.5">{adm.batchTiming || 'Regular'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {adm.counsellor?.fullName || 'Direct Enrolment'}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(adm.status)}</td>
                    <td className="p-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                      {new Date(adm.admissionDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAdmission(adm)
                        }}
                        className="px-3.5 py-1.5 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Icon icon="ion:eye-outline" className="w-3.5 h-3.5 text-teal-700" />
                        Review / Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-6 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Icon icon="ion:id-card" className="w-6 h-6 text-teal-600" />
                  New Student Admission
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enrol a new student into QIMD programs with an official Admission ID
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <Icon icon="ion:close" className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmission} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Enrolled Course *
                  </label>
                  <select
                    required
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                  >
                    <option value="">Select Course Program...</option>
                    {coursesData.map((c) => (
                      <option key={c.slug} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Batch Timing
                  </label>
                  <select
                    value={formData.batchTiming}
                    onChange={(e) => setFormData({ ...formData, batchTiming: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                  >
                    <option value="Morning Batch (10 AM - 1 PM)">Morning (10 AM - 1 PM)</option>
                    <option value="Afternoon Batch (2 PM - 5 PM)">Afternoon (2 PM - 5 PM)</option>
                    <option value="Evening Batch (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                    <option value="Weekend Batch (Sat & Sun)">Weekend (Sat & Sun)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Pune"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. Graduate / 12th"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Assigned Counsellor (Who closed the admission)
                </label>
                <select
                  value={formData.counsellorId}
                  onChange={(e) => setFormData({ ...formData, counsellorId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                >
                  <option value="">Direct / No Counsellor</option>
                  {counsellors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({getRoleDisplayName(c.role)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Enrolment Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Additional notes about enrolment, special batch requests, or concessions..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs"
                >
                  Create Admission Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Verification Modal */}
      {selectedAdmission && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-6 sm:p-7 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200 text-sm">
                    {selectedAdmission.admissionNumber}
                  </span>
                  {getStatusBadge(selectedAdmission.status)}
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-2">{selectedAdmission.studentName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admitted on {new Date(selectedAdmission.admissionDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedAdmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <Icon icon="ion:close" className="w-6 h-6" />
              </button>
            </div>

            {/* Verification Banner */}
            {selectedAdmission.status === 'VERIFICATION_PENDING' ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                    <Icon icon="ion:alert-circle" className="w-4 h-4 text-amber-600" />
                    Admission Head Verification Required
                  </span>
                  <p className="text-[11px] text-amber-800">
                    Verify student details and eligibility documents to confirm official admission.
                  </p>
                </div>
                <button
                  onClick={() => handleVerifyAdmission(selectedAdmission.id)}
                  disabled={isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Icon icon="ion:checkmark-done" className="w-4 h-4" />
                  Verify & Activate
                </button>
              </div>
            ) : selectedAdmission.status === 'VERIFIED_ACTIVE' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Icon icon="ion:ribbon-outline" className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-emerald-900 block">Verified & Active Student</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Verified by {selectedAdmission.verifiedBy?.fullName || 'Admission Head'} on{' '}
                    {selectedAdmission.verifiedAt ? new Date(selectedAdmission.verifiedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Student Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Course Program</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedAdmission.courseName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Batch Timing</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedAdmission.batchTiming || 'Regular'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Phone</span>
                <a href={`tel:${selectedAdmission.phone}`} className="font-bold text-slate-900 mt-0.5 block hover:text-teal-700">
                  {selectedAdmission.phone}
                </a>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Email</span>
                <a href={`mailto:${selectedAdmission.email}`} className="font-bold text-slate-900 mt-0.5 block hover:text-teal-700 truncate">
                  {selectedAdmission.email}
                </a>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">City</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedAdmission.city || 'N/A'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Qualification</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{selectedAdmission.qualification || 'N/A'}</span>
              </div>
            </div>

            {selectedAdmission.remarks && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">Remarks</span>
                <p className="text-slate-800 leading-relaxed">{selectedAdmission.remarks}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {canDelete ? (
                <button
                  onClick={() => setConfirmDeleteId(selectedAdmission.id)}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon icon="ion:trash-outline" className="w-4 h-4" />
                  Move to Bin
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={() => setSelectedAdmission(null)}
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
              <h3 className="font-bold text-slate-900 text-sm">Delete this admission record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This admission record will be moved to the Bin. Only the Super Admin can restore or delete it permanently.
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
    </div>
  )
}

export default function AdminAdmissionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Loading admissions...</div>}>
      <AdmissionsContent />
    </Suspense>
  )
}
