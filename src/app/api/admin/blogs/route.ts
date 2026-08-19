import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const blogs = await db.blog.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ blogs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
