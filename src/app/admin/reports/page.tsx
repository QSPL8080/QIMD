import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Icon } from '@iconify/react'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const [auditLogs, notificationLogs] = await Promise.all([
    db.auditLog.findMany({ take: 50, orderBy: { createdAt: 'desc' }, include: { user: true } }),
    db.notificationLog.findMany({ take: 50, orderBy: { sentAt: 'desc' } }),
  ])

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:stats-chart-outline" className="w-6 h-6 text-purple-600" />
            System Reports & Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Export CRM leads, audit trails, and email delivery history (SRS Section 4.20)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/api/export?type=contact"
            className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Icon icon="ion:download-outline" className="w-4 h-4" />
            Contacts CSV
          </a>
          <a
            href="/api/export?type=admission"
            className="px-3.5 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Icon icon="ion:download-outline" className="w-4 h-4" />
            Admissions CSV
          </a>
          <a
            href="/api/export?type=career"
            className="px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Icon icon="ion:download-outline" className="w-4 h-4" />
            Careers CSV
          </a>
          <a
            href="/api/export?type=franchise"
            className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Icon icon="ion:download-outline" className="w-4 h-4" />
            Franchise CSV
          </a>
          <a
            href="/api/export?type=hire"
            className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Icon icon="ion:download-outline" className="w-4 h-4" />
            Hire CSV
          </a>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Icon icon="ion:shield-checkmark-outline" className="w-5 h-5 text-blue-600" />
          Administrative Audit Log (Recent Activity)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Module</th>
                <th className="p-4">Action</th>
                <th className="p-4">Record ID</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 text-sm">{log.user?.fullName || 'System'}</td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-4 text-slate-800 font-medium text-sm">{log.action}</td>
                  <td className="p-4 text-slate-500 font-mono text-xs truncate max-w-[120px]">
                    {log.recordId || 'N/A'}
                  </td>
                  <td className="p-4 text-slate-600 font-medium text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Icon icon="ion:mail-outline" className="w-5 h-5 text-emerald-600" />
          System Email & Notification Log
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">Recipient</th>
                <th className="p-4">Type</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Status</th>
                <th className="p-4">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {notificationLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 text-sm">{log.recipient}</td>
                  <td className="p-4 font-bold text-emerald-700 text-sm">{log.notificationType}</td>
                  <td className="p-4 text-slate-700 font-medium text-sm">{log.subject}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {log.deliveryStatus}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium text-sm">{new Date(log.sentAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
