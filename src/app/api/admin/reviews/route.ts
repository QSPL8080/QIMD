import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession, isAdminRole } from '@/lib/auth'

export async function GET() {
  const authSession = await getAdminSession()
  if (!authSession || !isAdminRole(authSession.roleName)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const reviews = await db.studentReview.findMany({ orderBy: { displayOrder: 'asc' } })
    return NextResponse.json({ reviews })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
