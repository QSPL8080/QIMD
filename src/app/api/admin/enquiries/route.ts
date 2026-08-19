import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'contact'

  try {
    let enquiries: any[] = []

    if (type === 'contact') {
      enquiries = await db.contactEnquiry.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
      })
    } else if (type === 'admission') {
      enquiries = await db.admissionEnquiry.findMany({
        where: { isDeleted: false },
        include: { course: true },
        orderBy: { createdAt: 'desc' },
      })
    } else if (type === 'career') {
      enquiries = await db.careerEnquiry.findMany({
        where: { isDeleted: false },
        include: { jobOpening: true },
        orderBy: { createdAt: 'desc' },
      })
    } else if (type === 'franchise') {
      enquiries = await db.franchisePartnerEnquiry.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
      })
    } else if (type === 'hire') {
      enquiries = await db.companyPlacementEnquiry.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({ enquiries })
  } catch (err: any) {
    console.error('Error fetching enquiries:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch enquiries' }, { status: 500 })
  }
}
