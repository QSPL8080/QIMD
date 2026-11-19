'use client'

import React from 'react'
import { createRoot } from 'react-dom/client'

type Options = { confirmText?: string; danger?: boolean }

function Dialog({ message, options, onClose }: { message: string; options: Options; onClose: (ok: boolean) => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const danger = options.danger !== false
  return (
    <div className="qbin-modal" role="dialog" aria-modal="true" onClick={() => onClose(false)}>
      <div className="qbin-modal-box" onClick={(e) => e.stopPropagation()}>
        <span className={`qbin-modal-ic${danger ? ' is-danger' : ''}`} aria-hidden="true">!</span>
        <h3>Please confirm</h3>
        <p>{message}</p>
        <div className="qbin-modal-actions">
          <button type="button" className="qbin-btn" onClick={() => onClose(false)}>
            Cancel
          </button>
          <button type="button" autoFocus className={`qbin-btn ${danger ? 'is-danger-solid' : 'is-main'}`} onClick={() => onClose(true)}>
            {options.confirmText || 'Yes, continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Site-styled replacement for window.confirm(). Resolves true when the user confirms. */
export function confirmDialog(message: string, options: Options = {}): Promise<boolean> {
  return new Promise((resolve) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    const close = (ok: boolean) => {
      root.unmount()
      host.remove()
      resolve(ok)
    }
    root.render(<Dialog message={message} options={options} onClose={close} />)
  })
}
