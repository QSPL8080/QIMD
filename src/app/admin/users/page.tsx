import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserManagementClient from './UserManagementClient'

export const dynamic = 'force-dynamic'

export default async function UserManagementPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  if (session.roleName !== 'Super Admin' && session.roleName !== 'SUPER_ADMIN' && session.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-2">
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-sm">User Management is restricted to Super Administrator role only.</p>
      </div>
    )
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <UserManagementClient
      initialUsers={JSON.parse(JSON.stringify(users))}
      currentUserId={session.id}
    />
  )
}
