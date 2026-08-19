import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await db.gallery.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, items })
  } catch (err: any) {
    return NextResponse.json({ success: false, items: [] }, { status: 500 })
  }
}
