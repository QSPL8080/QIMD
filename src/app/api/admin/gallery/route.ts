import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const gallery = await db.gallery.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ gallery })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
