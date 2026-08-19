import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const trainers = await db.trainer.findMany({ orderBy: { displayOrder: 'asc' } })
    return NextResponse.json({ trainers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
