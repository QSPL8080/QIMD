'use client'

import React, { useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { uploadMedia } from '@/lib/uploadMedia'

/** Upload a file to website storage and hand back its public URL. Shows progress for large videos. */
export default function MediaUploadButton({
  accept,
  folder,
  label,
  onUploaded,
}: {
  accept: string
  folder: string
  label: string
  onUploaded: (url: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        disabled={progress !== null}
        onClick={() => input.current?.click()}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-black disabled:opacity-60"
      >
        <Icon icon="ion:cloud-upload-outline" className="w-4 h-4" />
        {progress !== null ? `Uploading… ${progress}%` : label}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          setError('')
          setProgress(0)
          try {
            onUploaded(await uploadMedia(file, folder, setProgress))
          } catch (err) {
            setError((err as Error).message)
          }
          setProgress(null)
        }}
      />
      {error && <span className="text-[11px] text-rose-600">{error}</span>}
    </span>
  )
}
