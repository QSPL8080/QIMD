import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [courses, categories, trainers] = await Promise.all([
      db.course.findMany({
        include: { category: true, trainer: true },
        orderBy: { displayOrder: 'asc' },
      }),
      db.courseCategory.findMany({ orderBy: { displayOrder: 'asc' } }),
      db.trainer.findMany({ orderBy: { displayOrder: 'asc' } }),
    ])

    return NextResponse.json({ courses, categories, trainers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
