import { timingSafeEqual } from 'crypto'
import { runRemindersIfDue } from '@/lib/reminders'

export const dynamic = 'force-dynamic'

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const url = new URL(request.url)
  const given = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || url.searchParams.get('key') || ''
  const a = Buffer.from(given)
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Scheduled run of fee reminders and follow-up alerts (SRS §11).
 * Call hourly: GET /api/cron/reminders with header "Authorization: Bearer <CRON_SECRET>" (or ?key=<CRON_SECRET>).
 * Safe to call often: each reminder is sent once only.
 */
export async function GET(request: Request) {
  if (!authorised(request)) return Response.json({ error: 'Unauthorised' }, { status: 401 })
  const result = await runRemindersIfDue(true)
  return Response.json({ ok: !('error' in result), ...result })
}

export const POST = GET
