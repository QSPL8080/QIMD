'use client'

import React from 'react'
import { Icon } from '@iconify/react'

export default function PrintButton({ label = 'Print / Save PDF' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-black"
    >
      <Icon icon="ion:print-outline" className="w-4 h-4" />
      {label}
    </button>
  )
}
