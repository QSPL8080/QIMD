'use client'

import React, { useEffect } from 'react'
import { Icon } from '@iconify/react'

export default function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start sm:items-center justify-center p-3 overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`bg-white border border-slate-200 rounded-2xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} my-6`}>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            <Icon icon="ion:close" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

/** Small inline success / error line. */
export function Msg({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null
  return <p className={`text-xs font-semibold ${msg.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{msg.text}</p>
}
