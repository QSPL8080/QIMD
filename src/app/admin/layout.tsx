import React from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  getAdminSession,
  isSuperAdminRole,
  isAdminRole,
  isSalesManagerRole,
  isCounsellorRole,
  isAdmissionHeadRole,
  isSeoRole,
} from '@/lib/auth'
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

  const pathname = (await headers()).get('x-pathname') || ''

  // Protected Super Admin routes
  if ((pathname.startsWith('/admin/users') || pathname.startsWith('/admin/bin')) && !isSuperAdminRole(session.roleName)) {
    redirect('/admin/dashboard')
  }

  // SEO Manager role may only access content modules and dashboard
  if (isSeoRole(session.roleName)) {
    const isContentPath =
      pathname === '/admin/dashboard' ||
      pathname.startsWith('/admin/blogs') ||
      pathname.startsWith('/admin/banners') ||
      pathname.startsWith('/admin/careers') ||
      pathname.startsWith('/admin/placements') ||
      pathname.startsWith('/admin/testimonials') ||
      pathname.startsWith('/admin/reviews') ||
      pathname.startsWith('/admin/faqs') ||
      pathname.startsWith('/admin/gallery')

    if (!isContentPath) {
      redirect('/admin/dashboard')
    }
  }

  // Counsellor role may only access their assigned leads and dashboard
  if (isCounsellorRole(session.roleName)) {
    if (pathname !== '/admin/dashboard' && pathname !== '/admin/enquiries/admission' && !pathname.startsWith('/admin/enquiries/admission/')) {
      redirect('/admin/enquiries/admission')
    }
  }

  // Sales Manager / Lead Manager role may only access leads and dashboard
  if (isSalesManagerRole(session.roleName)) {
    if (pathname !== '/admin/dashboard' && !pathname.startsWith('/admin/enquiries/')) {
      redirect('/admin/enquiries/admission')
    }
  }

  // Admission Head role may access dashboard, admissions, expenses, and admission enquiries
  if (isAdmissionHeadRole(session.roleName)) {
    const isAllowed =
      pathname === '/admin/dashboard' ||
      pathname.startsWith('/admin/admissions') ||
      pathname.startsWith('/admin/expenses') ||
      pathname.startsWith('/admin/enquiries/admission')

    if (!isAllowed) {
      redirect('/admin/admissions')
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
