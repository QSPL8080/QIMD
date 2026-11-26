'use client'

/**
 * Upload a website image/video/PDF from the admin panel and get its public URL.
 * Goes straight from the browser to the storage bucket (so large videos work),
 * falling back to the server upload when the bucket is not configured.
 * Throws an Error with a readable message on failure.
 */
export async function uploadMedia(file: File, folder: string, onProgress?: (percent: number) => void): Promise<string> {
  const sign = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, type: file.type, size: file.size, folder }),
  })
  const s = await sign.json().catch(() => ({}))
  if (!sign.ok) throw new Error(s.error || 'Upload failed')

  if (s.direct) {
    const body = new FormData()
    body.append('cacheControl', '31536000')
    body.append('', file)
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', s.signedUrl)
      xhr.setRequestHeader('x-upsert', 'false')
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100))
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) return resolve()
        const msg = parseErr(xhr.responseText)
        if (xhr.status === 413 || /maximum allowed size|too large|payload/i.test(msg)) {
          return reject(new Error(`This file (${Math.round(file.size / 1048576)} MB) is bigger than your Supabase storage allows. In Supabase go to Storage → Settings and raise "Upload file size limit" (the Free plan stops at 50 MB), or compress the video, or use a YouTube link.`))
        }
        reject(new Error(`Upload failed (${xhr.status}). ${msg}`))
      }
      xhr.onerror = () => reject(new Error('Upload failed. Check your internet connection.'))
      xhr.send(body)
    })
    return s.url as string
  }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed')
  onProgress?.(100)
  return data.url as string
}

function parseErr(text: string) {
  try {
    const j = JSON.parse(text)
    return j.message || j.error || ''
  } catch {
    return ''
  }
}

export const isVideoFileUrl = (url?: string | null) => Boolean(url && /\.(mp4|webm|mov)(\?|$)/i.test(url))
