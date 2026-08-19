import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({ orderBy: { displayOrder: 'asc' } })
    return NextResponse.json({ testimonials })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
