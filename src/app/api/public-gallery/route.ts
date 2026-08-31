import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { galleryData } from '@/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const dbItems = await db.gallery.findMany({
      where: { isDeleted: false },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    })

    if (dbItems && dbItems.length > 0) {
      return NextResponse.json({ success: true, items: dbItems })
    }
  } catch (err: any) {
    console.error('Error fetching gallery items from database:', err)
  }

  // Fallback to static galleryData if DB has no items or on error
  const fallbackItems = galleryData.map((item, index) => ({
    id: item.id || `fallback-${index}`,
    album: item.category || 'Classroom',
    category: item.category || 'Classroom',
    mediaType: 'IMAGE',
    fileUrl: item.src,
    thumbnail: item.src,
    altText: item.alt,
    caption: item.caption,
    createdAt: new Date().toISOString(),
  }))

  return NextResponse.json({ success: true, items: fallbackItems })
}

