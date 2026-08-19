'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  updateEnquiryStatusAction,
  deleteEnquiryAction,
} from '@/app/actions/crmActions'
import { Icon } from '@iconify/react'

export default function AdminJobApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enquiries?type=career')
      const data = await res.json()
      setApplications(data.enquiries || [])
    } catch (err) {
      console.error('Failed to fetch job applications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(search.toLowerCase())

    let matchesStatus = true
    if (statusFilter === 'PENDING') {
      matchesStatus = app.status === 'PENDING' || app.status === 'NEW'
    } else if (statusFilter === 'CONTACTED') {
      matchesStatus = app.status === 'CONTACTED' || app.status === 'SHORTLISTED' || app.status === 'HIRED'
    } else if (statusFilter === 'CLOSED') {
      matchesStatus = app.status === 'CLOSED' || app.status === 'REJECTED'
    }

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (id: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateEnquiryStatusAction('career', id, newStatus)
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Status updated successfully' })
        setApplications((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        )
        if (selectedApp?.id === id) {
          setSelectedApp((prev: any) => ({ ...prev, status: newStatus }))
        }
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to update status' })
      }
    })
  }

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteEnquiryAction('career', id)
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Job application deleted successfully' })
        setApplications((prev) => prev.filter((item) => item.id !== id))
        if (selectedApp?.id === id) setSelectedApp(null)
        setConfirmDeleteId(null)
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to delete application' })
      }
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONTACTED':
      case 'SHORTLISTED':
      case 'HIRED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            {status === 'SHORTLISTED' ? 'Shortlisted' : status === 'HIRED' ? 'Hired' : 'Contacted'}
          </span>
        )
      case 'CLOSED':
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            {status === 'REJECTED' ? 'Rejected' : 'Closed'}
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
            <Icon icon="ion:briefcase-outline" className="w-6 h-6 text-purple-600" />
            Career Enquiry CMS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage incoming career applicant resumes, position applications, and candidate evaluation status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/export?type=careers"
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
            placeholder="Search applicant name, email, or position..."
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

      {/* Job Applications List View */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading job applications...</div>
        ) : filteredApps.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No job applications found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Applicant Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Applied Position</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredApps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="hover:bg-purple-50/50 cursor-pointer transition-colors group"
                >
                  <td className="p-3.5 font-bold text-slate-900 group-hover:text-purple-700">
                    {app.fullName}
                  </td>
                  <td className="p-3.5 text-slate-600">{app.email}</td>
                  <td className="p-3.5 text-slate-800 font-semibold">{app.jobTitle}</td>
                  <td className="p-3.5">{getStatusBadge(app.status)}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedApp(app)
                      }}
                      className="px-3 py-1.5 bg-purple-50 text-purple-800 hover:bg-purple-100 rounded-lg text-xs font-semibold transition-colors"
                    >
                      View Application
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
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-xl p-6 sm:p-7 space-y-6 shadow-2xl max-h-[88vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedApp.fullName}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applied on {new Date(selectedApp.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-0">
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Email</span>
                  <span className="text-slate-900 font-bold block truncate break-all" title={selectedApp.email}>{selectedApp.email}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Phone</span>
                  <span className="text-slate-900 font-bold block truncate">{selectedApp.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-0">
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Position Applied For</span>
                  <span className="text-slate-900 font-bold block truncate" title={selectedApp.jobTitle}>{selectedApp.jobTitle}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Resume / CV</span>
                  {selectedApp.resume ? (
                    <a
                      href={selectedApp.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-purple-700 hover:underline font-bold mt-0.5 max-w-full truncate"
                    >
                      <Icon icon="ion:document-attach-outline" className="w-4 h-4 shrink-0" />
                      <span className="truncate">View / Download Resume</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 font-bold block">No Resume Provided</span>
                  )}
                </div>
              </div>

              {selectedApp.coverLetter && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">Cover Message / Letter</span>
                  <p className="text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                    {selectedApp.coverLetter}
                  </p>
                </div>
              )}

              {/* Status Update Control */}
              <div className="bg-purple-50/60 p-4 border border-purple-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-0.5">Update Application Status</label>
                  <span className="text-[11px] text-slate-500">Update evaluation status in database</span>
                </div>
                <select
                  value={selectedApp.status}
                  onChange={(e) => handleStatusChange(selectedApp.id, e.target.value)}
                  className="bg-white border border-purple-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 shadow-xs"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setConfirmDeleteId(selectedApp.id)}
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Icon icon="ion:trash-outline" className="w-4 h-4" />
                Delete Application
              </button>

              <button
                onClick={() => setSelectedApp(null)}
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
              <h3 className="font-bold text-slate-900 text-sm">Delete this job application?</h3>
              <p className="text-xs text-slate-500 mt-1">This application will be permanently deleted.</p>
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
    </div>
  )
}
