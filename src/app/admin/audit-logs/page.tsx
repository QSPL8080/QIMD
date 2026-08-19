import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Icon } from '@iconify/react'

export const dynamic = 'force-dynamic'

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const params = await searchParams
  const selectedUserId = params.userId || ''

  // Fetch all users for the dropdown filter
  const users = await db.user.findMany({
    orderBy: { fullName: 'asc' },
    select: { id: true, fullName: true, email: true, role: true },
  })

  // Filter audit logs by selected userId if provided
  const where: any = {}
  if (selectedUserId) {
    where.userId = selectedUserId
  }

  const logs = await db.auditLog.findMany({
    where,
    take: 150,
    include: { user: { include: { role: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:shield-checkmark-outline" className="w-6 h-6 text-blue-600" />
            Audit Logs & User Security Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track user-based actions, CMS updates, lead status modifications, and administrative operations
          </p>
        </div>
      </div>

      {/* User-Based Dropdown Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Icon icon="ion:filter-outline" className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">Filter Audit Logs By User:</span>
        </div>

        <form method="GET" className="w-full sm:w-auto flex items-center gap-3">
          <select
            name="userId"
            defaultValue={selectedUserId}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 w-full sm:w-80 shadow-xs"
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({u.email}) — [{u.role?.roleName || 'User'}]
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors"
          >
            Apply Filter
          </button>

          {selectedUserId && (
            <a
              href="/admin/audit-logs"
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Reset
            </a>
          )}
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Administrator / User</th>
                <th className="p-4">Module</th>
                <th className="p-4">Action Performed</th>
                <th className="p-4">Record ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-medium text-sm">
                    No audit logs found for the selected user.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600 font-medium text-sm font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {log.user?.fullName ? log.user.fullName.charAt(0) : 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {log.user ? log.user.fullName : 'System / Auth'}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">{log.user?.email || 'System Action'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 text-sm">{log.action}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs truncate max-w-[150px]">
                      {log.recordId || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
