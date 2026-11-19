import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession, isAdminRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authSession = await getAdminSession()
  if (!authSession || !isAdminRole(authSession.roleName)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const gallery = await db.gallery.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ gallery })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

