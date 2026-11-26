import React from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { getReceiptData } from '@/lib/receipts'
import ReceiptView from '@/components/Admin/ReceiptView'
import PrintButton from '@/components/Admin/PrintButton'
import { BTN_SECONDARY } from '@/components/Admin/ui'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Fee receipt', robots: { index: false, follow: false } }

export default async function AdminReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!can(session.roleName, 'fees', 'view', session.moduleAccess)) redirect('/admin/dashboard')
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const r = await getReceiptData({ id })
  if (!r) notFound()
  return (
    <div>
      <div className="qrcpt-noprint flex flex-wrap items-center justify-between gap-2 mb-4">
        <Link href={`/admin/admissions/${r.admissionId}?tab=fees`} className={BTN_SECONDARY}>
          ← {r.admissionCode}
        </Link>
        <PrintButton />
      </div>
      <ReceiptView r={r} />
    </div>
  )
}
