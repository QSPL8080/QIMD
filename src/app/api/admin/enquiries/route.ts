import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'

/** Career applications, hire requests and franchise enquiries. Admission & contact enquiries are now Leads (/admin/leads). */
export async function GET(request: Request) {
  const authSession = await getAdminSession()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'career'
  if (!authSession || !can(authSession.roleName, 'enquiries', 'view', authSession.moduleAccess)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const assignee = { assignedTo: { select: { id: true, fullName: true, email: true, role: true } } }
    let enquiries: any[] = []
    if (type === 'career') {
      enquiries = await db.careerEnquiry.findMany({ where: { isDeleted: false }, include: { jobOpening: true }, orderBy: { createdAt: 'desc' } })
    } else if (type === 'franchise') {
      enquiries = await db.franchisePartnerEnquiry.findMany({ where: { isDeleted: false }, include: assignee, orderBy: { createdAt: 'desc' } })
    } else if (type === 'hire') {
      enquiries = await db.companyPlacementEnquiry.findMany({ where: { isDeleted: false }, include: assignee, orderBy: { createdAt: 'desc' } })
    } else {
      return NextResponse.json({ error: 'Admission and contact enquiries are in Leads.' }, { status: 400 })
    }
    return NextResponse.json({ enquiries, currentUser: { id: authSession.id, role: authSession.roleName, name: authSession.fullName } })
  } catch (err: any) {
    console.error('Error fetching enquiries:', err)
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 })
  }
}
