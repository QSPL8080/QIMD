import React from 'react'
import { requireContentManagerSession } from '@/lib/auth'
import WebsiteManagementClient from './WebsiteManagementClient'

export const dynamic = 'force-dynamic'

export default async function WebsiteManagementPage() {
  const session = await requireContentManagerSession()

  return <WebsiteManagementClient session={session} />
}
