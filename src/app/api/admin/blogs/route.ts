import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession, canManageBlogs } from '@/lib/auth'

export async function GET() {
  const authSession = await getAdminSession()
  if (!authSession || !canManageBlogs(authSession.roleName)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const blogs = await db.blog.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ blogs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
