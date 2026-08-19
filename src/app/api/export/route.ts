import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'contact'

    let rows: any[] = []
    let headers: string[] = []

    if (type === 'contact') {
      const records = await db.contactEnquiry.findMany({ orderBy: { createdAt: 'desc' } })
      headers = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Date']
      rows = records.map((r) => [r.id, r.fullName, r.email, r.phone, r.subject || '', r.message, r.status, r.createdAt.toISOString()])
    } else if (type === 'admission') {
      const records = await db.admissionEnquiry.findMany({ include: { course: true }, orderBy: { createdAt: 'desc' } })
      headers = ['ID', 'Student Name', 'Email', 'Phone', 'Course', 'City', 'Qualification', 'Status', 'Date']
      rows = records.map((r) => [r.id, r.studentName, r.email, r.phone, r.course?.courseName || '', r.city || '', r.qualification || '', r.status, r.createdAt.toISOString()])
    } else if (type === 'career') {
      const records = await db.careerEnquiry.findMany({ orderBy: { createdAt: 'desc' } })
      headers = ['ID', 'Name', 'Email', 'Phone', 'Job Title', 'Resume URL', 'Status', 'Date']
      rows = records.map((r) => [r.id, r.fullName, r.email, r.phone, r.jobTitle, r.resume, r.status, r.createdAt.toISOString()])
    } else if (type === 'franchise') {
      const records = await db.franchisePartnerEnquiry.findMany({ orderBy: { createdAt: 'desc' } })
      headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'City', 'State', 'Investment', 'Status', 'Date']
      rows = records.map((r) => [r.id, r.fullName, r.companyName || '', r.email, r.phone, r.city || '', r.state || '', r.investmentCapacity || '', r.status, r.createdAt.toISOString()])
    } else if (type === 'hire') {
      const records = await db.companyPlacementEnquiry.findMany({ orderBy: { createdAt: 'desc' } })
      headers = ['ID', 'Company', 'Contact Person', 'Email', 'Phone', 'Job Role', 'Vacancies', 'Status', 'Date']
      rows = records.map((r) => [r.id, r.companyName, r.contactPerson, r.email, r.phone, r.jobRole, r.vacancies || 1, r.status, r.createdAt.toISOString()])
    }

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="qimd_${type}_enquiries_${Date.now()}.csv"`,
      },
    })
  } catch (err: any) {
    console.error('Export error:', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
