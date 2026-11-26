/** CSV with UTF-8 BOM (opens correctly in Excel). Cells that look like formulas are neutralised. */
export function toCsv(head: string[], rows: unknown[][]): string {
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
    return `"${safe.replace(/"/g, '""')}"`
  }
  return `﻿${[head.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))].join('\r\n')}`
}

export function csvResponse(name: string, csv: string) {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name.replace(/[^a-zA-Z0-9_.-]/g, '_')}"`,
      'Cache-Control': 'no-store',
    },
  })
}
