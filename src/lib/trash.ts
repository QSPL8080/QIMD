import { db } from './db'
import type { SessionUser } from './auth'

/** Everything that can sit in the central Bin. */
export const TRASH_TYPES = [
  'admission',
  'contact',
  'career',
  'hire',
  'franchise',
  'blog',
  'job',
  'placement',
  'testimonial',
  'review',
  'faq',
  'gallery',
  'banner',
  'user',
] as const
export type TrashType = (typeof TRASH_TYPES)[number]

/** Remember who moved records to the Bin and when. Never blocks the delete itself. */
export async function recordTrash(type: TrashType, ids: string | string[], session: SessionUser) {
  const list = (Array.isArray(ids) ? ids : [ids]).filter(Boolean)
  for (const entityId of list) {
    try {
      await db.trashEntry.upsert({
        where: { entityType_entityId: { entityType: type, entityId } },
        update: {
          deletedById: session.id,
          deletedByName: session.fullName,
          deletedByRole: session.roleName,
          deletedAt: new Date(),
        },
        create: {
          entityType: type,
          entityId,
          deletedById: session.id,
          deletedByName: session.fullName,
          deletedByRole: session.roleName,
        },
      })
    } catch (err) {
      console.error('Bin record failed:', err)
    }
  }
}

/** Forget Bin records once items are restored or deleted for good. */
export async function clearTrash(type: TrashType, ids: string | string[]) {
  const list = (Array.isArray(ids) ? ids : [ids]).filter(Boolean)
  if (list.length === 0) return
  try {
    await db.trashEntry.deleteMany({ where: { entityType: type, entityId: { in: list } } })
  } catch (err) {
    console.error('Bin cleanup failed:', err)
  }
}
