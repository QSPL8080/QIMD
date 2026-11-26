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
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const banners = await db.banner.findMany({
      where: { isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })

    return NextResponse.json({ banners })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
