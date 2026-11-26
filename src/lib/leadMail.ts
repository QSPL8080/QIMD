import { sendMail, emailLayout, emailTable, emailButton, SITE_URL } from './mailer'
import { getSetting } from './settings'

/**
 * Emails every website form submission to the institute inbox
 * (Settings → Lead email; default info@quickuppinstitute.com).
 * A failed email never stops the form: the record is always saved first.
 */

export type LeadMailType = 'admission' | 'contact' | 'career' | 'hire' | 'franchise' | 'meta'

const LABELS: Record<LeadMailType, { title: string; admin: string }> = {
  admission: { title: 'New Admission Enquiry', admin: '/admin/leads' },
  contact: { title: 'New Contact Enquiry', admin: '/admin/leads' },
  meta: { title: 'New Meta Lead', admin: '/admin/leads' },
  career: { title: 'New Career Application', admin: '/admin/enquiries/careers' },
  hire: { title: 'New Hire Request', admin: '/admin/enquiries/hire' },
  franchise: { title: 'New Franchise Enquiry', admin: '/admin/enquiries/franchise' },
}

function absoluteUrl(v: string) {
  if (/^https?:\/\//i.test(v)) return v
  return v.startsWith('/') ? `${SITE_URL}${v}` : v
}

export async function sendLeadEmail(
  type: LeadMailType,
  fields: { label: string; value?: string | number | null; link?: boolean }[],
  replyTo?: string | null,
  adminPath?: string,
) {
  try {
    const { title, admin } = LABELS[type]
    const to = process.env.LEADS_NOTIFY_EMAIL || process.env.NOTIFICATION_EMAIL || (await getSetting('leadNotifyEmail'))
    const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
    const rows = fields.filter((f) => f.value !== undefined && f.value !== null && String(f.value).trim() !== '')
    const name = String(rows[0]?.value || '').trim()
    const link = `${SITE_URL}${adminPath || admin}`

    const html = emailLayout(
      title,
      emailTable(
        rows.map((f) =>
          f.link ? { label: f.label, html: `<a href="${absoluteUrl(String(f.value))}" style="color:#5B3FD9">${absoluteUrl(String(f.value))}</a>` } : { label: f.label, value: f.value },
        ),
      ) + emailButton(link, 'Open in Admin Panel'),
      `${when} IST`,
    )
    const text = [`${title} — ${when} IST`, '', ...rows.map((f) => `${f.label}: ${f.link ? absoluteUrl(String(f.value)) : f.value}`), '', `Admin: ${link}`].join('\n')

    const res = await sendMail({ to, subject: `${title}${name ? ` — ${name}` : ''}`, html, text, replyTo })
    if (!res.ok) console.warn('[lead email]', res.error)
  } catch (err) {
    console.error('[lead email] could not send:', err)
  }
}
