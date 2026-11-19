import React from 'react'
import { redirect } from 'next/navigation'
import { getAdminSession, isSuperAdminRole } from '@/lib/auth'
import { getBinItems, BIN_TYPE_LABELS } from '@/lib/binData'
import BinClient from './BinClient'

export const dynamic = 'force-dynamic'

export default async function BinPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!isSuperAdminRole(session.roleName)) redirect('/admin/dashboard')

  let items: Awaited<ReturnType<typeof getBinItems>> = []
  let loadError = ''
  try {
    items = await getBinItems()
  } catch (err: any) {
    console.error('Bin load error:', err)
    loadError = 'The Bin could not be loaded. If this is the first time, run prisma/sql/create_bin.sql in Supabase.'
  }

  return <BinClient items={items} labels={BIN_TYPE_LABELS} loadError={loadError} />
}
