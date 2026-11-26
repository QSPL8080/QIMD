import React from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminSession, isSuperAdminRole } from '@/lib/auth'
import { can, moduleForPath } from '@/lib/permissions'
import { countBinItems } from '@/lib/binData'
import { getNotifications } from '@/lib/notifications'
import { runRemindersIfDue } from '@/lib/reminders'
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

  // Page-level access: every admin page belongs to a module (SRS §3)
  const pathname = (await headers()).get('x-pathname') || ''
  if (pathname === '/admin' || pathname === '/admin/login') {
    redirect('/admin/dashboard')
  }
  const mod = moduleForPath(pathname)
  if (mod && !can(session.roleName, mod, 'view', session.moduleAccess)) {
    redirect('/admin/dashboard')
  }

  // Bin count for the Super Admin's top bar
  let binCount: number | null = null
  if (isSuperAdminRole(session.roleName)) {
    try {
      binCount = await countBinItems()
    } catch {
      binCount = 0
    }
  }
  // Fee reminders and follow-up alerts: at most once an hour, never blocks the page
  void runRemindersIfDue().catch(() => {})
  const notifications = await getNotifications(session, 30)

  return (
    <AdminShell session={session} binCount={binCount} notifications={notifications}>
      {children}
    </AdminShell>
  )
}
