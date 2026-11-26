import React from 'react'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getAdminSession, isSuperAdminRole } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { mailConfigured } from '@/lib/mailer'
import { PageHeader } from '@/components/Admin/ui'
import UserManagementClient from './UserManagementClient'

export const dynamic = 'force-dynamic'

export default async function UserManagementPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.roleName, 'users', 'view', session.moduleAccess)) redirect('/admin/dashboard')
  const superAdmin = isSuperAdminRole(session.roleName)

  // Never send password hashes to the browser
  const users = await (db as any).user.findMany({
    where: superAdmin ? {} : { isDeleted: false },
    orderBy: { createdAt: 'desc' },
    select: { id: true, fullName: true, email: true, username: true, phone: true, role: true, status: true, isDeleted: true, lastLogin: true, createdAt: true, moduleAccess: true, lockedUntil: true },
  })

  return (
    <div>
      <PageHeader
        title="Admin Users"
        subtitle={superAdmin ? 'Create staff accounts, set roles and permissions, and reset passwords.' : 'Manage staff accounts. Super Admin accounts can only be changed by the Super Admin.'}
      />
      <UserManagementClient
        initialUsers={JSON.parse(JSON.stringify(users))}
        currentUserId={session.id}
        superAdmin={superAdmin}
        canAdd={can(session.roleName, 'users', 'add')}
        canEdit={can(session.roleName, 'users', 'edit')}
        canDelete={can(session.roleName, 'users', 'delete')}
        mailReady={mailConfigured()}
      />
    </div>
  )
}
