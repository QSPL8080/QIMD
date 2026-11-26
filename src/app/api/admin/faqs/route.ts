import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'

export async function GET() {
  const authSession = await getAdminSession()
  if (!authSession || !can(authSession.roleName, 'content', 'view', authSession.moduleAccess)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const faqs = await db.faq.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] })
    return NextResponse.json({ faqs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
