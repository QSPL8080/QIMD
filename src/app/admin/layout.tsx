import React from 'react'
import { getAdminSession } from '@/lib/auth'
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

  return <AdminShell session={session}>{children}</AdminShell>
}
