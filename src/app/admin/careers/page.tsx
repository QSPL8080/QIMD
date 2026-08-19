import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CareerManagementClient from './CareerManagementClient'

export const dynamic = 'force-dynamic'

export default async function AdminCareerOpeningsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const jobOpenings = await db.jobOpening.findMany({
    include: { careerEnquiries: true },
    orderBy: { displayOrder: 'asc' },
  })

  return <CareerManagementClient initialJobs={JSON.parse(JSON.stringify(jobOpenings))} />
}
