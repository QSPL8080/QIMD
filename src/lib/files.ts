import { db } from './db'
import type { SessionUser } from './auth'
import { can, normalizeRole, type Module } from './permissions'

/** Private document storage (SRS §14.4). Files live in the database and are only served after an access check. */

export const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB

const TYPES = [
  { mime: 'application/pdf', ext: ['pdf'], sig: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: 'image/jpeg', ext: ['jpg', 'jpeg'], sig: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', ext: ['png'], sig: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/webp', ext: ['webp'], sig: [0x52, 0x49, 0x46, 0x46], extra: (b: Buffer) => b.subarray(8, 12).toString('ascii') === 'WEBP' },
]

/** Check extension AND actual file content. Returns the real MIME type or an error. */
export function validateUpload(name: string, buf: Buffer): { ok: true; mime: string } | { ok: false; error: string } {
  if (buf.length === 0) return { ok: false, error: 'The file is empty.' }
  if (buf.length > MAX_FILE_BYTES) return { ok: false, error: 'File is larger than 5 MB.' }
  const ext = (name.split('.').pop() || '').toLowerCase()
  const byContent = TYPES.find((t) => t.sig.every((b, i) => buf[i] === b) && (!t.extra || t.extra(buf)))
  if (!byContent) return { ok: false, error: 'Only PDF, JPG, PNG or WebP files are allowed.' }
  if (!byContent.ext.includes(ext)) return { ok: false, error: `The file extension .${ext} does not match its content (${byContent.ext[0].toUpperCase()}).` }
  return { ok: true, mime: byContent.mime }
}

export function safeFileName(name: string) {
  const base = name.replace(/[/\\?%*:|"<>\x00-\x1f]/g, '_').replace(/\s+/g, ' ').trim()
  return (base || 'file').slice(-120)
}

/** Which module owns a file type, for access checks. */
export const FILE_OWNER_MODULE: Record<string, Module> = {
  admission: 'admissions',
  expense: 'expenses',
}

/** Can this user open (view/download) a file of this owner type? Viewers cannot download files. */
export function canOpenFile(session: SessionUser, ownerType: string) {
  const mod = FILE_OWNER_MODULE[ownerType]
  if (!mod) return false
  if (normalizeRole(session.roleName) === 'VIEWER') return false
  return can(session.roleName, mod, 'view', session.moduleAccess)
}

export async function listFiles(ownerType: string, ownerId: string) {
  const rows = await (db as any).storedFile.findMany({
    where: { ownerType, ownerId, isDeleted: false },
    select: { id: true, label: true, originalName: true, mimeType: true, size: true, uploadedByName: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map((r: any) => ({ ...r, createdAt: new Date(r.createdAt).toISOString() }))
}
