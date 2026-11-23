import React from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminSession, isLeadManagerRole, isSeoRole, isSuperAdminRole } from '@/lib/auth'
import { countBinItems } from '@/lib/binData'
import { getNotifications } from '@/lib/notifications'
import AdminShell from './AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()

  if (!session) {
    return <div className="min-h-screen bg-slate-50">{children}</div>
  }

  // The SEO role may only use the Blogs section
  if (isSeoRole(session.roleName)) {
    const pathname = (await headers()).get('x-pathname') || ''
    if (pathname !== '/admin/blogs' && !pathname.startsWith('/admin/blogs/')) {
      redirect('/admin/blogs')
    }
  }

  // The Lead Manager role may only use the Leads section
  if (isLeadManagerRole(session.roleName)) {
    const pathname = (await headers()).get('x-pathname') || ''
    if (!pathname.startsWith('/admin/enquiries/')) {
      redirect('/admin/enquiries/admission')
    }
  }

  // Bin count for the Super Admin's top bar
  let binCount: number | null = null
  let notifications: Awaited<ReturnType<typeof getNotifications>> | null = null
  if (isSuperAdminRole(session.roleName)) {
    try {
      binCount = await countBinItems()
    } catch {
      binCount = 0
    }
    notifications = await getNotifications(30)
  }

  return (
    <AdminShell session={session} binCount={binCount} notifications={notifications}>
      {children}
    </AdminShell>
  )
}
