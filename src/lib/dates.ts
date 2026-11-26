/**
 * Dates for the CRM. Timestamps are stored in UTC and always shown in the
 * institute timezone (IST). Date-only fields (due dates, admission date, DOB)
 * are stored as calendar dates ("YYYY-MM-DD") with no time part.
 * Plain module: safe on the server and in the browser.
 */

export const TIMEZONE = 'Asia/Kolkata'
const IST_OFFSET = '+05:30'

/** Today's calendar date in IST, as YYYY-MM-DD. */
export function todayIST(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** Add days to a YYYY-MM-DD date. */
export function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Whole days from `a` to `b` (both YYYY-MM-DD). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000)
}

export const isYmd = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`))

/** A date-only DB value (Prisma gives midnight UTC) → YYYY-MM-DD. */
export function ymdOf(d: Date | string | null | undefined): string {
  if (!d) return ''
  const x = typeof d === 'string' ? new Date(d) : d
  return Number.isNaN(x.getTime()) ? '' : x.toISOString().slice(0, 10)
}

/** YYYY-MM-DD → Date for a Prisma @db.Date column. */
export function dateOnly(ymd: string): Date {
  return new Date(`${ymd}T00:00:00.000Z`)
}

/** Start of an IST day as a UTC instant. */
export function istStart(ymd: string): Date {
  return new Date(`${ymd}T00:00:00.000${IST_OFFSET}`)
}

/** End of an IST day as a UTC instant. */
export function istEnd(ymd: string): Date {
  return new Date(`${ymd}T23:59:59.999${IST_OFFSET}`)
}

/** "YYYY-MM-DDTHH:mm" typed in IST → UTC instant. */
export function istLocalToDate(local: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null
  const d = new Date(`${local}:00${IST_OFFSET}`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** UTC instant → "YYYY-MM-DDTHH:mm" in IST (for datetime-local inputs). */
export function toIstLocal(d: Date | string | null | undefined): string {
  if (!d) return ''
  const x = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(x.getTime())) return ''
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(x)
  const g = (t: string) => p.find((q) => q.type === t)?.value || ''
  return `${g('year')}-${g('month')}-${g('day')}T${g('hour')}:${g('minute')}`
}

/** Show a timestamp in IST, e.g. 26 Nov 2026, 11:27 am */
export function fmtDateTime(d: Date | string | null | undefined): string {
  if (!d) return '—'
  const x = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(x.getTime())) return '—'
  return x.toLocaleString('en-IN', { timeZone: TIMEZONE, day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/** Show a calendar date, e.g. 26 Nov 2026. Accepts YYYY-MM-DD or a date-only DB value. */
export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—'
  const ymd = typeof d === 'string' && isYmd(d) ? d : ymdOf(d)
  if (!ymd) return '—'
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-IN', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' })
}

/** The IST calendar date of a timestamp, e.g. 26 Nov 2026. */
export function fmtDayOf(d: Date | string | null | undefined): string {
  if (!d) return '—'
  const x = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(x.getTime())) return '—'
  return x.toLocaleDateString('en-IN', { timeZone: TIMEZONE, day: '2-digit', month: 'short', year: 'numeric' })
}

/** IST calendar date (YYYY-MM-DD) of a timestamp. */
export function istYmdOf(d: Date | string): string {
  return todayIST(typeof d === 'string' ? new Date(d) : d)
}

/** First day of the IST month of `ymd`. */
export const monthStart = (ymd: string) => `${ymd.slice(0, 7)}-01`

/** Monday of the IST week of `ymd`. */
export function weekStart(ymd: string): string {
  const dow = new Date(`${ymd}T00:00:00Z`).getUTCDay() // 0 Sun
  return addDays(ymd, dow === 0 ? -6 : 1 - dow)
}

export function fmtMoney(n: number | string | null | undefined): string {
  const v = Number(n || 0)
  return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
}
