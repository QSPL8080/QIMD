/**
 * Format a date and timestamp for leads and admin tables.
 * Returns { date: '24 Nov 2026', time: '02:45 PM' }
 */
export function formatLeadDateTime(dateInput?: string | Date | null) {
  if (!dateInput) return { date: '—', time: '' }
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return { date: '—', time: '' }
    return {
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    }
  } catch {
    return { date: '—', time: '' }
  }
}
