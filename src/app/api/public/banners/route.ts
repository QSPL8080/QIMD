import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })

    return NextResponse.json({ banners })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
