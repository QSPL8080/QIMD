import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession, canManageLeads } from '@/lib/auth'

export async function GET(request: Request) {
  const authSession = await getAdminSession()
  if (!authSession || !canManageLeads(authSession.roleName)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'contact'
  const counsellorFilter = searchParams.get('counsellorId')

  const isCounsellor = authSession.roleName === 'COUNSELLOR' || authSession.roleName === 'Counsellor'

  try {
    let enquiries: any[] = []

    if (type === 'contact') {
      const where: any = { isDeleted: false }
      if (isCounsellor) {
        where.assignedToId = authSession.id
      } else if (counsellorFilter) {
        where.assignedToId = counsellorFilter
      }

      enquiries = await db.contactEnquiry.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (type === 'admission') {
      const where: any = { isDeleted: false }
      if (isCounsellor) {
        where.assignedToId = authSession.id
      } else if (counsellorFilter) {
        where.assignedToId = counsellorFilter
      }

      const rawEnquiries = await db.admissionEnquiry.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, fullName: true, email: true, role: true },
          },
          followUps: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Duplicate detection across all admission enquiries (by phone & email)
      const allActive = await db.admissionEnquiry.findMany({
        where: { isDeleted: false },
        select: { id: true, phone: true, email: true },
      })

      const phoneCounts = new Map<string, number>()
      const emailCounts = new Map<string, number>()

      for (const item of allActive) {
        const cleanPhone = (item.phone || '').replace(/\D/g, '').slice(-10)
        const cleanEmail = (item.email || '').trim().toLowerCase()
        if (cleanPhone.length >= 7) {
          phoneCounts.set(cleanPhone, (phoneCounts.get(cleanPhone) || 0) + 1)
        }
        if (cleanEmail) {
          emailCounts.set(cleanEmail, (emailCounts.get(cleanEmail) || 0) + 1)
        }
      }

      enquiries = rawEnquiries.map((lead) => {
        const cleanPhone = (lead.phone || '').replace(/\D/g, '').slice(-10)
        const cleanEmail = (lead.email || '').trim().toLowerCase()
        const pCount = cleanPhone.length >= 7 ? phoneCounts.get(cleanPhone) || 0 : 0
        const eCount = cleanEmail ? emailCounts.get(cleanEmail) || 0 : 0
        const isDuplicate = pCount > 1 || eCount > 1
        const duplicateCount = Math.max(pCount, eCount)

        return {
          ...lead,
          isDuplicate,
          duplicateCount,
        }
      })
    } else if (type === 'career') {
      enquiries = await db.careerEnquiry.findMany({
        where: { isDeleted: false },
        include: { jobOpening: true },
        orderBy: { createdAt: 'desc' },
      })
    } else if (type === 'franchise') {
      const where: any = { isDeleted: false }
      if (isCounsellor) {
        where.assignedToId = authSession.id
      }
      enquiries = await db.franchisePartnerEnquiry.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (type === 'hire') {
      const where: any = { isDeleted: false }
      if (isCounsellor) {
        where.assignedToId = authSession.id
      }
      enquiries = await db.companyPlacementEnquiry.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({
      enquiries,
      currentUser: {
        id: authSession.id,
        role: authSession.roleName,
        name: authSession.fullName,
      },
    })
  } catch (err: any) {
    console.error('Error fetching enquiries:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch enquiries' }, { status: 500 })
  }
}
