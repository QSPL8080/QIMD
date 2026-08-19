import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserManagementClient from './UserManagementClient'

export const dynamic = 'force-dynamic'

export default async function UserManagementPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  if (session.roleName !== 'Super Admin' && session.roleName !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-2">
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-sm">User Management is restricted to Super Administrator role only.</p>
      </div>
    )
  }

  const [users, roles] = await Promise.all([
    db.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.role.findMany({
      orderBy: { roleName: 'asc' },
    }),
  ])

  return (
    <UserManagementClient
      initialUsers={JSON.parse(JSON.stringify(users))}
      roles={JSON.parse(JSON.stringify(roles))}
      currentUserId={session.id}
    />
  )
}
