import React from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminSession, isSeoRole } from '@/lib/auth'
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

  return <AdminShell session={session}>{children}</AdminShell>
}
