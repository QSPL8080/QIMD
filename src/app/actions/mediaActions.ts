'use server'

import { requireAdminSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import fs from 'fs'
import path from 'path'

export async function uploadMediaAction(formData: FormData) {
  const session = await requireAdminSession()

  try {
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'General'

    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided.' }
    }

    const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'File size exceeds 2 MB upload limit specified in SRS requirements.' }
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
    ]

    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Unsupported file format. Allowed: JPG, JPEG, PNG, WebP, SVG, PDF.' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder.toLowerCase().replace(/[^a-z0-9]/g, '-'))
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const ext = path.extname(file.name) || (file.type === 'application/pdf' ? '.pdf' : '.jpg')
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`
    const filePath = path.join(uploadsDir, uniqueName)

    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/uploads/${folder.toLowerCase().replace(/[^a-z0-9]/g, '-')}/${uniqueName}`

    await createAuditLog({
      userId: session.id,
      module: 'MEDIA_LIBRARY',
      action: 'UPLOAD_FILE',
    })

    return {
      success: true,
      message: 'File uploaded successfully',
      fileUrl: publicUrl,
    }
  } catch (err: any) {
    console.error('File upload error:', err)
    return { success: false, error: err.message || 'File upload failed.' }
  }
}

export async function deleteUnusedImageAction(fileUrl: string) {
  await requireAdminSession()
  try {
    const { safeDeleteUnusedFile } = await import('@/lib/mediaService')
    const deleted = await safeDeleteUnusedFile(fileUrl)
    return { success: true, deleted }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete image' }
  }
}
