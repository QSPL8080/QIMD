'use client'

import React, { useState } from 'react'
import {
  saveUserAction,
  trashUserAction,
  restoreUserAction,
  deleteUserPermanentlyAction,
} from '@/app/actions/userActions'
import { Icon } from '@iconify/react'

interface Role {
  id: string
  roleName: string
  description?: string
}

interface UserItem {
  id: string
  fullName: string
  email: string
  phone?: string
  roleId: string
  role: Role
  status: boolean
  isDeleted: boolean
  lastLogin?: string
  createdAt: string
}

export default function UserManagementClient({
  initialUsers,
  roles,
  currentUserId,
}: {
  initialUsers: UserItem[]
  roles: Role[]
  currentUserId: string
}) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showTrash, setShowTrash] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesTrash = showTrash ? u.isDeleted : !u.isDeleted

    let matchesRole = true
    if (roleFilter !== 'ALL') {
      const rName = u.role?.roleName || ''
      matchesRole = rName.toLowerCase().includes(roleFilter.toLowerCase())
    }

    let matchesStatus = true
    if (statusFilter === 'ACTIVE') matchesStatus = u.status === true
    else if (statusFilter === 'INACTIVE') matchesStatus = u.status === false

    return matchesSearch && matchesTrash && matchesRole && matchesStatus
  })

  const handleOpenAdd = () => {
    setEditingUser(null)
    setModalOpen(true)
    setMsg(null)
  }

  const handleOpenEdit = (u: UserItem) => {
    setEditingUser(u)
    setModalOpen(true)
    setMsg(null)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const formData = new FormData(e.currentTarget)
    const rawData = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      roleId: formData.get('roleId'),
      password: formData.get('password'),
      status: formData.get('status') === 'true',
    }

    const res = await saveUserAction(rawData, editingUser?.id)
    setLoading(false)

    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'Saved successfully' })
      setModalOpen(false)
      window.location.reload()
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save' })
    }
  }

  const handleTrash = async (id: string) => {
    if (!confirm('Are you sure you want to move this user to Trash?')) return
    const res = await trashUserAction(id)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  const handleRestore = async (id: string) => {
    const res = await restoreUserAction(id)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  const handleDeletePermanently = async (id: string) => {
    if (!confirm('WARNING: Permanently delete this user? This cannot be undone.')) return
    const res = await deleteUserPermanentlyAction(id)
    if (res.success) window.location.reload()
    else alert(res.error)
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:people-circle-outline" className="w-6 h-6 text-blue-600" />
            User Management & Role-Based Access Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage administrative personnel, assign roles (`SUPER_ADMIN` / `ADMIN` / `CONTENT_MANAGER`), and audit status
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
            {showTrash ? 'View Active Users' : 'View Trash'}
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-2"
          >
            <Icon icon="ion:person-add-outline" className="w-4.5 h-4.5" />
            Create Administrator
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            msg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
          <Icon icon="ion:search-outline" className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
            <option value="Content Manager">Content Manager</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium text-sm">
                    No users found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-base leading-snug">{u.fullName}</p>
                          <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {u.role?.roleName || 'Admin'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium text-sm">{u.phone || 'N/A'}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                          u.status
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {u.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium text-sm">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {!u.isDeleted ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Icon icon="ion:create-outline" className="w-5 h-5" />
                          </button>
                          {u.id !== currentUserId && (
                            <button
                              onClick={() => handleTrash(u.id)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Move to Trash"
                            >
                              <Icon icon="ion:trash-outline" className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(u.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore User"
                          >
                            <Icon icon="ion:refresh-outline" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePermanently(u.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Permanently"
                          >
                            <Icon icon="ion:trash-bin-outline" className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create / Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'Edit User Profile & Role' : 'Create Administrator Account'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icon icon="ion:close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  defaultValue={editingUser?.fullName || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={editingUser?.email || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password {editingUser ? '(Leave blank to keep unchanged)' : '(Required)'}
                </label>
                <input
                  type="password"
                  name="password"
                  required={!editingUser}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={editingUser?.phone || ''}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Role</label>
                <select
                  name="roleId"
                  required
                  defaultValue={editingUser?.roleId || roles[0]?.id}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.roleName} - {r.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                <select
                  name="status"
                  defaultValue={editingUser ? String(editingUser.status) : 'true'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="true">Active (Allowed to log in)</option>
                  <option value="false">Inactive (Login blocked)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm"
                >
                  {loading ? 'Saving...' : 'Save User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
