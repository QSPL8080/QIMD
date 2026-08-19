import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const placements = await db.placement.findMany({ orderBy: { displayOrder: 'asc' } })
    return NextResponse.json({ placements })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
