import React from 'react'
import { redirect } from 'next/navigation'
import { getAdminSession, isAdminRole, isSuperAdminRole } from '@/lib/auth'
import { getAllSettings } from '@/lib/settings'
import { mailConfigured } from '@/lib/mailer'
import { storageConfigured } from '@/lib/storage'
import { PageHeader } from '@/components/Admin/ui'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!isAdminRole(session.roleName)) redirect('/admin/dashboard')
  const settings = await getAllSettings()
  const env = {
    mail: mailConfigured(),
    cron: Boolean(process.env.CRON_SECRET),
    meta: Boolean(process.env.META_VERIFY_TOKEN && process.env.META_APP_SECRET && process.env.META_PAGE_ACCESS_TOKEN),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
    payments: (process.env.PAYMENTS_API_KEY || '').length >= 16,
    storage: storageConfigured(),
  }
  return (
    <div>
      <PageHeader title="Settings" subtitle="Institute details for receipts and emails, courses, expense categories and where website enquiries are emailed." />
      <SettingsClient settings={settings} superAdmin={isSuperAdminRole(session.roleName)} env={env} />
    </div>
  )
}
