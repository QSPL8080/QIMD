import { createHmac, timingSafeEqual } from 'crypto'
import { createLead } from '@/lib/leads'
import { audit } from '@/lib/audit'
import { notifySuperAdmin } from '@/lib/notifications'
import { emailStaff } from '@/lib/staffMail'

export const dynamic = 'force-dynamic'

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || 'v21.0'}`

/** Meta webhook verification (subscribe). */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = process.env.META_VERIFY_TOKEN
  if (token && url.searchParams.get('hub.mode') === 'subscribe' && url.searchParams.get('hub.verify_token') === token) {
    return new Response(url.searchParams.get('hub.challenge') || '', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return new Response('Forbidden', { status: 403 })
}

function validSignature(raw: string, header: string | null) {
  const secret = process.env.META_APP_SECRET
  if (!secret || !header?.startsWith('sha256=')) return false
  const expected = Buffer.from(createHmac('sha256', secret).update(raw, 'utf8').digest('hex'))
  const given = Buffer.from(header.slice(7))
  return expected.length === given.length && timingSafeEqual(expected, given)
}

type FieldData = { name: string; values?: string[] }

function fieldsToLead(fields: FieldData[]) {
  const get = (...names: string[]) => {
    for (const n of names) {
      const f = fields.find((x) => x.name?.toLowerCase() === n)
      if (f?.values?.[0]) return String(f.values[0]).trim()
    }
    return ''
  }
  const find = (re: RegExp) => fields.find((x) => re.test(x.name || ''))?.values?.[0]?.trim() || ''
  const fullName = get('full_name', 'name') || [get('first_name'), get('last_name')].filter(Boolean).join(' ')
  const known = new Set(['full_name', 'name', 'first_name', 'last_name', 'email', 'phone_number', 'phone', 'city', 'course'])
  const extra = fields.filter((f) => !known.has((f.name || '').toLowerCase()) && f.values?.length).map((f) => `${f.name.replace(/_/g, ' ')}: ${f.values!.join(', ')}`)
  return {
    fullName: fullName || 'Meta lead',
    email: get('email'),
    phone: get('phone_number', 'phone'),
    city: get('city') || find(/city|location/i),
    course: get('course') || find(/course|program|interest/i),
    qualification: find(/qualification|education/i),
    message: extra.join('\n'),
  }
}

async function fetchLead(leadgenId: string, accessToken: string) {
  const tryFields = async (fields: string) => {
    const res = await fetch(`${GRAPH}/${encodeURIComponent(leadgenId)}?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) })
    const json: any = await res.json().catch(() => ({}))
    return res.ok ? json : Promise.reject(new Error(json?.error?.message || `Graph API ${res.status}`))
  }
  try {
    return await tryFields('created_time,field_data,ad_id,ad_name,adset_name,campaign_name,form_id')
  } catch {
    // Without ads permissions, campaign/ad names are not readable
    return tryFields('created_time,field_data,ad_id,form_id')
  }
}

/** Meta Lead Ads → CRM lead (source META). Duplicate deliveries are ignored by leadgen ID. */
export async function POST(request: Request) {
  const raw = await request.text()
  if (!validSignature(raw, request.headers.get('x-hub-signature-256'))) return new Response('Invalid signature', { status: 401 })
  const accessToken = process.env.META_PAGE_ACCESS_TOKEN
  let body: any
  try {
    body = JSON.parse(raw)
  } catch {
    return new Response('Bad request', { status: 400 })
  }
  if (!accessToken) {
    console.error('[meta] META_PAGE_ACCESS_TOKEN is not set; lead not imported')
    return Response.json({ ok: false, error: 'not configured' })
  }

  const changes: any[] = (body?.entry || []).flatMap((e: any) => e?.changes || []).filter((c: any) => c?.field === 'leadgen' && c?.value?.leadgen_id)
  let created = 0
  let failed = 0
  for (const c of changes) {
    const v = c.value
    const ref = `meta:${v.leadgen_id}`
    try {
      const data = await fetchLead(String(v.leadgen_id), accessToken)
      const f = fieldsToLead(Array.isArray(data?.field_data) ? data.field_data : [])
      const lead = await createLead({
        source: 'META',
        enquiryType: 'ADMISSION',
        fullName: f.fullName,
        phone: f.phone,
        email: f.email,
        course: f.course,
        city: f.city,
        qualification: f.qualification,
        message: f.message,
        campaign: [data?.campaign_name, data?.adset_name, data?.ad_name].filter(Boolean).join(' / ') || undefined,
        adId: String(data?.ad_id || v.ad_id || '') || undefined,
        formId: String(data?.form_id || v.form_id || '') || undefined,
        sourceRef: ref,
        rawPayload: { webhook: v, lead: data },
      })
      if (lead) created++
    } catch (err: any) {
      if (err?.code === 'P2002' || /unique/i.test(String(err?.message))) continue // already imported
      failed++
      console.error('[meta] lead import failed', v.leadgen_id, err)
      await audit(null, 'META_LEAD_FAILED', 'lead', null, `Meta lead ${v.leadgen_id} could not be imported: ${String(err?.message || err).slice(0, 300)}`)
    }
  }
  // A failed import returns 500 so Meta retries the delivery; leads already saved are skipped by their leadgen ID
  if (failed) {
    await notifySuperAdmin({ type: 'INTEGRATION_ERROR', title: `Meta Lead Ads: ${failed} lead(s) could not be imported — check the Meta access token`, link: '/admin/audit?entity=lead' })
    await emailStaff(
      { roles: ['SUPER_ADMIN'] },
      { subject: 'Meta Lead Ads: leads could not be imported', title: 'Meta lead import failed', intro: `${failed} lead(s) from Meta could not be imported. Meta will retry; if it keeps failing, the page access token has probably expired.`, link: '/admin/audit?entity=lead', linkLabel: 'Open audit log' },
    )
    return Response.json({ ok: false, created, failed }, { status: 500 })
  }
  return Response.json({ ok: true, created })
}
