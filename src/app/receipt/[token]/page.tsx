import React from 'react'
import { notFound } from 'next/navigation'
import { getReceiptData } from '@/lib/receipts'
import ReceiptView from '@/components/Admin/ReceiptView'
import PrintButton from '@/components/Admin/PrintButton'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Fee receipt', robots: { index: false, follow: false, nocache: true } }

/** Student's secure receipt link (unguessable token; no sign-in). */
export default async function PublicReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[A-Za-z0-9_-]{24,128}$/.test(token)) notFound()
  const r = await getReceiptData({ token })
  if (!r) notFound()
  return (
    <div className="min-h-screen bg-[#F4F6FA] px-3 sm:px-6 py-8">
      <div className="qrcpt-noprint max-w-[760px] mx-auto flex justify-end mb-4">
        <PrintButton label="Download / Print" />
      </div>
      <ReceiptView r={r} />
    </div>
  )
}
