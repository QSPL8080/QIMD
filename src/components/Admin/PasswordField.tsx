'use client'

import React, { useState } from 'react'
import { Icon } from '@iconify/react'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%'

export function generatePassword(length = 10) {
  const bytes = new Uint32Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (n) => CHARS[n % CHARS.length]).join('')
}

/** Password input with show/hide, generate and copy. */
export default function PasswordField({
  name = 'password',
  value,
  onChange,
  required,
  placeholder = '••••••••',
}: {
  name?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={value ? 6 : undefined}
          autoComplete="new-password"
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-20 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
        />
        <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5">
          <button type="button" onClick={() => setShow((s) => !s)} title={show ? 'Hide password' : 'Show password'} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-900">
            <Icon icon={show ? 'ion:eye-off-outline' : 'ion:eye-outline'} className="w-4 h-4" />
          </button>
          <button type="button" onClick={copy} title="Copy password" disabled={!value} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-40">
            <Icon icon={copied ? 'ion:checkmark-outline' : 'ion:copy-outline'} className="w-4 h-4" />
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          onChange(generatePassword())
          setShow(true)
        }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900"
      >
        <Icon icon="ion:key-outline" className="w-3.5 h-3.5" />
        Generate strong password
      </button>
    </div>
  )
}
