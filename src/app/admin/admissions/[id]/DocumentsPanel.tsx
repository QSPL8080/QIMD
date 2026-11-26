'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Card, INPUT, BTN_PRIMARY, BTN_SECONDARY, BTN_GHOST_DANGER, Field } from '@/components/Admin/ui'
import { Msg } from '@/components/Admin/Modal'
import { confirmDialog } from '@/components/Admin/confirmDialog'
import { removeAdmissionFileAction } from '@/app/actions/admissionActions'

type FileRow = { id: string; label: string | null; originalName: string; mimeType: string; size: number; uploadedByName: string | null; createdAt: string }
const LABELS = ['Photo', 'Signed admission form', 'Aadhaar Card', 'Address proof', 'Passport', 'Driving Licence', 'Voter ID', 'Electricity Bill', 'Rental Agreement', 'Payment evidence', 'Other']

export default function DocumentsPanel({ admissionId, files, perms }: { admissionId: string; files: FileRow[]; perms: { upload: boolean; open: boolean; remove: boolean } }) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [label, setLabel] = useState('Photo')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const upload = async () => {
    const file = input.current?.files?.[0]
    if (!file) return setMsg({ ok: false, text: 'Choose a file.' })
    if (file.size > 5 * 1024 * 1024) return setMsg({ ok: false, text: 'File is larger than 5 MB.' })
    setBusy(true)
    const body = new FormData()
    body.set('file', file)
    body.set('ownerType', 'admission')
    body.set('ownerId', admissionId)
    body.set('label', label)
    try {
      const res = await fetch('/api/admin/files', { method: 'POST', body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) setMsg({ ok: false, text: data.error || 'Upload failed.' })
      else {
        setMsg({ ok: true, text: `${data.file.originalName} uploaded.` })
        if (input.current) input.current.value = ''
        router.refresh()
      }
    } catch {
      setMsg({ ok: false, text: 'Upload failed. Check your connection.' })
    }
    setBusy(false)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card title={`Documents (${files.length})`} className="xl:col-span-2">
        {files.length === 0 ? (
          <p className="text-sm text-slate-500">No documents uploaded.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {files.map((f) => (
              <li key={f.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-3 min-w-0">
                  <Icon icon={f.mimeType === 'application/pdf' ? 'ion:document-text-outline' : 'ion:image-outline'} className="w-6 h-6 text-slate-500 flex-shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 truncate">{f.label || f.originalName}</span>
                    <span className="block text-[11px] text-slate-500 truncate">
                      {f.originalName} · {(f.size / 1024).toFixed(0)} KB · {f.uploadedByName || '—'} · {new Date(f.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </span>
                </span>
                <span className="flex gap-1.5">
                  {perms.open ? (
                    <>
                      <a className={BTN_SECONDARY} href={`/api/admin/files/${f.id}`} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                      <a className={BTN_SECONDARY} href={`/api/admin/files/${f.id}?download=1`}>
                        Download
                      </a>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400">Viewing restricted</span>
                  )}
                  {perms.remove && (
                    <button
                      type="button"
                      className={BTN_GHOST_DANGER}
                      onClick={async () => {
                        if (!(await confirmDialog(`Remove ${f.originalName}?`, { confirmText: 'Remove' }))) return
                        const r = await removeAdmissionFileAction(f.id)
                        setMsg({ ok: r.success, text: r.success ? 'Removed.' : r.error || 'Failed.' })
                        if (r.success) router.refresh()
                      }}
                    >
                      Remove
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {perms.upload && (
        <Card title="Upload document">
          <div className="space-y-3">
            <Field label="Document">
              <select className={INPUT} value={label} onChange={(e) => setLabel(e.target.value)}>
                {LABELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="File (PDF, JPG, PNG or WebP · max 5 MB)">
              <input ref={input} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" className="block w-full text-sm" />
            </Field>
            <Msg msg={msg} />
            <button type="button" className={`${BTN_PRIMARY} w-full`} disabled={busy} onClick={upload}>
              {busy ? 'Uploading…' : 'Upload'}
            </button>
            <p className="text-[11px] text-slate-500">Files are private: only staff with access to admissions can open them.</p>
          </div>
        </Card>
      )}
      {!perms.upload && <Msg msg={msg} />}
    </div>
  )
}
