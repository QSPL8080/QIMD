/**
 * Utility to export data arrays to a CSV file and trigger browser download.
 * Adds UTF-8 BOM so non-ASCII characters open properly in MS Excel and Google Sheets.
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const BOM = '\uFEFF'
  const csvContent =
    BOM +
    [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => row.map(escapeCsvValue).join(',')),
    ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""'
  const str = String(val)
  return `"${str.replace(/"/g, '""')}"`
}
