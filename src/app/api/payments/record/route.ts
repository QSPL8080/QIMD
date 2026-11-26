import { timingSafeEqual } from 'crypto'
import { db } from '@/lib/db'
import { recordPaymentInternal } from '@/lib/payments'

export const dynamic = 'force-dynamic'

/**
 * Payment gateway hook: record an online fee payment against an admission.
 * Any gateway (PayU, Razorpay, Cashfree, PhonePe…) or your own payment page can call it
 * after a payment succeeds. The receipt is created and emailed exactly like a manual payment.
 *
 *   POST /api/payments/record
 *   Authorization: Bearer <PAYMENTS_API_KEY>
 *   {
 *     "admissionCode": "ADM-000123",      // or "admissionId": "<uuid>"
 *     "amount": 15000,                     // rupees
 *     "transactionId": "pay_29QQoUBi66xm2f", // gateway's unique ID — the same ID is never recorded twice
 *     "gateway": "Razorpay",               // optional, shown on the payment
 *     "paidAt": "2026-11-26T10:15:00+05:30", // optional, default now
 *     "notes": "Second instalment"         // optional
 *   }
 *
 * Replies 200 { ok: true, paymentId, receiptNo, duplicate } or 4xx { ok: false, error }.
 */
export async function POST(request: Request) {
  const key = process.env.PAYMENTS_API_KEY || ''
  const given = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  const a = Buffer.from(given)
  const b = Buffer.from(key)
  if (key.length < 16 || a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ ok: false, error: 'Unauthorised' }, { status: 401 })

  const body: any = await request.json().catch(() => null)
  if (!body) return Response.json({ ok: false, error: 'Send a JSON body.' }, { status: 400 })
  const txn = String(body.transactionId || body.gatewayTxnId || '').trim().slice(0, 150)
  if (!txn) return Response.json({ ok: false, error: 'transactionId is required.' }, { status: 400 })
  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount <= 0) return Response.json({ ok: false, error: 'amount must be a positive number (rupees).' }, { status: 400 })

  const code = String(body.admissionCode || '').trim().toUpperCase()
  const id = String(body.admissionId || '').trim()
  const admission = await (db as any).admission.findFirst({
    where: { isDeleted: false, ...(id && /^[0-9a-f-]{36}$/i.test(id) ? { id } : code ? { admissionCode: code } : { id: '00000000-0000-0000-0000-000000000000' }) },
    select: { id: true },
  })
  if (!admission) return Response.json({ ok: false, error: 'Admission not found (check admissionCode / admissionId).' }, { status: 404 })

  const paidAt = body.paidAt ? new Date(body.paidAt) : new Date()
  const gateway = String(body.gateway || 'Online').slice(0, 40)
  let r: Awaited<ReturnType<typeof recordPaymentInternal>>
  try {
    r = await recordPaymentInternal(
    null,
    admission.id,
    { amount, paidAt, mode: 'GATEWAY', reference: txn, notes: [gateway !== 'Online' ? `Paid online via ${gateway}` : 'Paid online', body.notes ? String(body.notes).slice(0, 300) : ''].filter(Boolean).join(' · ') },
    { gatewayTxnId: txn, gateway },
    )
  } catch (err: any) {
    if (err?.code === 'P2002') {
      const p = await (db as any).payment.findUnique({ where: { gatewayTxnId: txn }, select: { id: true, receiptNo: true } })
      return Response.json({ ok: true, paymentId: p?.id, receiptNo: p?.receiptNo, duplicate: true })
    }
    console.error('[payments api]', err)
    return Response.json({ ok: false, error: 'Could not record the payment.' }, { status: 500 })
  }
  if (!r.success) return Response.json({ ok: false, error: r.error }, { status: 422 })
  return Response.json({ ok: true, paymentId: r.paymentId, receiptNo: r.receiptNo, duplicate: Boolean(r.duplicate), emailed: r.emailed ?? null })
}
