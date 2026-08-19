import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await db.websiteSettings.findFirst()
    return NextResponse.json({
      success: true,
      settings: {
        logo: settings?.logo || '/images/logo/qimd-logo.png',
        favicon: settings?.favicon || '/images/logo/qimd-logo-white.png',
        footerLogo: settings?.favicon || '/images/logo/qimd-logo-white.png',
        websiteName: settings?.websiteName || 'QIMD Institute',
        contactEmail: settings?.contactEmail || 'info@qimd.in',
        contactPhone: settings?.contactPhone || '+91 90000 00000',
        whatsappNumber: settings?.whatsappNumber || '+91 90000 00000',
        address: settings?.address || 'Hinjewadi Phase 1, Pune',
      },
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      settings: {
        logo: '/images/logo/qimd-logo.png',
        favicon: '/images/logo/qimd-logo-white.png',
        footerLogo: '/images/logo/qimd-logo-white.png',
      },
    })
  }
}
