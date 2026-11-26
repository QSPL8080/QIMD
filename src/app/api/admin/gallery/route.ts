import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { getSetting } from '@/lib/settings'
import { galleryPhotoSet, GALLERY_SET_FLAG } from '@/lib/gallerySet'
import { isSuperAdminRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authSession = await getAdminSession()
  if (!authSession || !can(authSession.roleName, 'content', 'view', authSession.moduleAccess)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const [gallery, categories, flag] = await Promise.all([
      db.gallery.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] }),
      getSetting('galleryCategories'),
      (db as any).appSetting.findUnique({ where: { key: GALLERY_SET_FLAG } }).catch(() => null),
    ])
    // New photo set shipped with the code, offered once to the Super Admin
    const set = isSuperAdminRole(authSession.roleName) ? galleryPhotoSet() : []
    const photoSet = set.length ? { count: set.length, categories: [...new Set(set.map((p) => p.category))], installed: flag?.value || null } : null
    return NextResponse.json({ gallery, categories, photoSet })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

