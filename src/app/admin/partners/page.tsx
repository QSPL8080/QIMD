import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PartnerManagementClient from './PartnerManagementClient'

export const dynamic = 'force-dynamic'

export default async function AdminPartnersPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const hiringPartners = await db.partner.findMany({
    where: { isDeleted: false },
    orderBy: { displayOrder: 'asc' },
  })

  const emiPartners = await db.emiPartner.findMany({
    where: { isDeleted: false },
    orderBy: { displayOrder: 'asc' },
  })

  return (
    <PartnerManagementClient
      hiringPartners={JSON.parse(JSON.stringify(hiringPartners))}
      emiPartners={JSON.parse(JSON.stringify(emiPartners))}
    />
  )
}
