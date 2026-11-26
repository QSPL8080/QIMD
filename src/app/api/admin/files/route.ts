import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { FILE_OWNER_MODULE, safeFileName, validateUpload, MAX_FILE_BYTES } from '@/lib/files'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/** Upload a private document (admission documents/photo, expense bills). */
export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Upload failed. Try again.' }, { status: 400 })
  }
  const ownerType = String(form.get('ownerType') || '')
  const ownerId = String(form.get('ownerId') || '') || null
  const label = String(form.get('label') || '').trim().slice(0, 120) || null
  const file = form.get('file')
  const mod = FILE_OWNER_MODULE[ownerType]
  if (!mod) return NextResponse.json({ error: 'Unknown upload type.' }, { status: 400 })
  if (!can(session.roleName, mod, 'add', session.moduleAccess) && !can(session.roleName, mod, 'edit', session.moduleAccess)) {
    return NextResponse.json({ error: 'Your role cannot upload files here.' }, { status: 403 })
  }
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a file.' }, { status: 400 })
  if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: 'File is larger than 5 MB.' }, { status: 400 })

  if (ownerId) {
    if (!/^[0-9a-f-]{36}$/i.test(ownerId)) return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
    const exists = ownerType === 'admission' ? await (db as any).admission.count({ where: { id: ownerId, isDeleted: false } }) : await (db as any).expense.count({ where: { id: ownerId, isDeleted: false } })
    if (!exists) return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const check = validateUpload(file.name, buf)
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 })

  const row = await (db as any).storedFile.create({
    data: {
      ownerType,
      ownerId,
      label,
      originalName: safeFileName(file.name),
      mimeType: check.mime,
      size: buf.length,
      data: buf,
      uploadedById: session.id,
      uploadedByName: session.fullName,
    },
    select: { id: true, originalName: true, mimeType: true, size: true, label: true, createdAt: true },
  })
  await audit(session, 'FILE_UPLOAD', ownerType, ownerId, `Uploaded ${row.originalName}${label ? ` (${label})` : ''}`)
  return NextResponse.json({ file: { ...row, createdAt: new Date(row.createdAt).toISOString(), uploadedByName: session.fullName } })
}
