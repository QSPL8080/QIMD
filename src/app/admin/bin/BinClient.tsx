'use client'

import React, { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import type { BinItem } from '@/lib/binData'
import { restoreBinItemsAction, deleteBinItemsForeverAction } from '@/app/actions/binActions'

type Props = { items: BinItem[]; labels: Record<string, string>; loadError?: string }
type Confirm = { mode: 'restore' | 'delete'; keys: string[] } | null

const keyOf = (i: BinItem) => `${i.type}:${i.id}`

function formatDate(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function BinClient({ items, labels, loadError }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    items.forEach((i) => (c[i.type] = (c[i.type] || 0) + 1))
    return c
  }, [items])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(
      (i) =>
        (filter === 'ALL' || i.type === filter) &&
        (!q || `${i.title} ${i.subtitle} ${i.deletedByName || ''}`.toLowerCase().includes(q))
    )
  }, [items, filter, search])

  const allChecked = visible.length > 0 && visible.every((i) => selected.includes(keyOf(i)))
  const toggleAll = () =>
    setSelected(allChecked ? selected.filter((k) => !visible.some((i) => keyOf(i) === k)) : Array.from(new Set([...selected, ...visible.map(keyOf)])))
  const toggle = (k: string) => setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]))

  const run = () => {
    if (!confirm) return
    const chosen = items.filter((i) => confirm.keys.includes(keyOf(i))).map((i) => ({ type: i.type, id: i.id }))
    startTransition(async () => {
      const res = confirm.mode === 'restore' ? await restoreBinItemsAction(chosen) : await deleteBinItemsForeverAction(chosen)
      setNotice({ ok: res.success && !res.error, text: res.error || res.message || 'Done' })
      setSelected((s) => s.filter((k) => !confirm.keys.includes(k)))
      setConfirm(null)
      router.refresh()
    })
  }

  const types = Object.keys(labels).filter((t) => counts[t])

  return (
    <div className="qbin">
      <section className="qbin-head">
        <div>
          <span className="qad-kicker">Super Admin</span>
          <h1 className="qad-h1">Bin</h1>
          <p>Everything deleted from the admin panel waits here. Restore it, or delete it for good.</p>
        </div>
        <div className="qbin-total">
          <strong>{items.length}</strong>
          <span>items in the Bin</span>
        </div>
      </section>

      {loadError && <div className="qbin-notice is-error">{loadError}</div>}
      {notice && (
        <div className={`qbin-notice ${notice.ok ? 'is-ok' : 'is-error'}`}>
          <Icon icon={notice.ok ? 'ion:checkmark-circle-outline' : 'ion:alert-circle-outline'} />
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss"><Icon icon="ion:close-outline" /></button>
        </div>
      )}

      <section className="qbin-tools">
        <div className="qbin-filters">
          <button type="button" className={`qbin-chip${filter === 'ALL' ? ' is-active' : ''}`} onClick={() => setFilter('ALL')}>
            All <span>{items.length}</span>
          </button>
          {types.map((t) => (
            <button key={t} type="button" className={`qbin-chip${filter === t ? ' is-active' : ''}`} onClick={() => setFilter(t)}>
              {labels[t]} <span>{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="qbin-search">
          <Icon icon="ion:search-outline" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, title or who deleted it…" />
        </div>
      </section>

      {selected.length > 0 && (
        <div className="qbin-bulk">
          <span>{selected.length} selected</span>
          <button type="button" className="qbin-btn" disabled={isPending} onClick={() => setConfirm({ mode: 'restore', keys: selected })}>
            <Icon icon="ion:arrow-undo-outline" /> Restore
          </button>
          <button type="button" className="qbin-btn is-danger" disabled={isPending} onClick={() => setConfirm({ mode: 'delete', keys: selected })}>
            <Icon icon="ion:trash-outline" /> Delete permanently
          </button>
        </div>
      )}

      <section className="qad-card qbin-card">
        {visible.length === 0 ? (
          <div className="qbin-empty">
            <Icon icon="ion:trash-bin-outline" />
            <strong>The Bin is empty</strong>
            <span>Deleted items will show up here.</span>
          </div>
        ) : (
          <div className="qad-table-wrap">
            <table className="qad-table qbin-table">
              <thead>
                <tr>
                  <th className="qbin-check"><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all" /></th>
                  <th>Item</th>
                  <th>Section</th>
                  <th>Deleted by</th>
                  <th>Deleted on</th>
                  <th className="qbin-actions-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((i) => {
                  const k = keyOf(i)
                  const when = formatDate(i.deletedAt)
                  return (
                    <tr key={k} className={selected.includes(k) ? 'is-selected' : ''}>
                      <td className="qbin-check"><input type="checkbox" checked={selected.includes(k)} onChange={() => toggle(k)} aria-label={`Select ${i.title}`} /></td>
                      <td>
                        <span className="qad-strong">{i.title}</span>
                        {i.subtitle && <small>{i.subtitle}</small>}
                      </td>
                      <td><span className="qbin-type">{labels[i.type]}</span></td>
                      <td>
                        {i.deletedByName ? (
                          <>
                            <span className="qad-strong">{i.deletedByName}</span>
                            <small>{i.deletedByRole}</small>
                          </>
                        ) : (
                          <span className="qad-muted">Not recorded</span>
                        )}
                      </td>
                      <td>
                        {when.date}
                        <small>{when.time}</small>
                      </td>
                      <td className="qbin-actions">
                        <button type="button" className="qbin-icon" title="Restore" disabled={isPending} onClick={() => setConfirm({ mode: 'restore', keys: [k] })}>
                          <Icon icon="ion:arrow-undo-outline" />
                        </button>
                        <button type="button" className="qbin-icon is-danger" title="Delete permanently" disabled={isPending} onClick={() => setConfirm({ mode: 'delete', keys: [k] })}>
                          <Icon icon="ion:trash-outline" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {confirm && (
        <div className="qbin-modal" role="dialog" aria-modal="true">
          <div className="qbin-modal-box">
            <span className={`qbin-modal-ic${confirm.mode === 'delete' ? ' is-danger' : ''}`}>
              <Icon icon={confirm.mode === 'delete' ? 'ion:warning-outline' : 'ion:arrow-undo-outline'} />
            </span>
            <h3>{confirm.mode === 'delete' ? `Delete ${confirm.keys.length} item(s) permanently?` : `Restore ${confirm.keys.length} item(s)?`}</h3>
            <p>
              {confirm.mode === 'delete'
                ? 'They will be removed from the database for good. This cannot be undone.'
                : 'They will go back to their section and show again where they were before.'}
            </p>
            <div className="qbin-modal-actions">
              <button type="button" className="qbin-btn" onClick={() => setConfirm(null)} disabled={isPending}>Cancel</button>
              <button type="button" className={`qbin-btn ${confirm.mode === 'delete' ? 'is-danger-solid' : 'is-main'}`} onClick={run} disabled={isPending}>
                {isPending ? 'Working…' : confirm.mode === 'delete' ? 'Delete permanently' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
