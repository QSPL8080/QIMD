import { sendMail, emailLayout, emailTable, emailButton, emailNote, esc, SITE_URL } from './mailer'
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
          f.link ? { label: f.label, html: `<a href="${esc(absoluteUrl(String(f.value)))}" style="color:#4F46E5">${esc(absoluteUrl(String(f.value)))}</a>` } : { label: f.label, value: f.value },
        ),
      ) +
        emailButton(link, 'Open in Admin Panel') +
        emailNote('Submitted from the QIMD website. Reply to this email to answer the enquirer directly.'),
      `Website enquiry · ${when} IST`,
    )
    const text = [`${title} — ${when} IST`, '', ...rows.map((f) => `${f.label}: ${f.link ? absoluteUrl(String(f.value)) : f.value}`), '', `Admin: ${link}`].join('\n')

    const res = await sendMail({ to, subject: `${title}${name ? ` — ${name}` : ''}`, html, text, replyTo })
    if (!res.ok) console.warn('[lead email]', res.error)
  } catch (err) {
    console.error('[lead email] could not send:', err)
  }
}

const ACK: Record<Exclude<LeadMailType, 'meta'>, { subject: string; line: string }> = {
  admission: { subject: 'We received your admission enquiry', line: 'Thank you for your admission enquiry. Our team will contact you shortly.' },
  contact: { subject: 'We received your enquiry', line: 'Thank you for contacting us. Our team will contact you shortly.' },
  career: { subject: 'We received your application', line: 'Thank you for applying. Our team will review your application and contact you if it is a match.' },
  hire: { subject: 'We received your hiring request', line: 'Thank you for your hiring request. Our placement team will contact you shortly.' },
  franchise: { subject: 'We received your franchise enquiry', line: 'Thank you for your interest in a QIMD franchise. Our team will contact you shortly.' },
}

/** Short "we received it" email to the person who filled in a website form. Never throws. */
export async function sendSubmitterAck(type: Exclude<LeadMailType, 'meta'>, to?: string | null, name?: string | null) {
  try {
    const email = String(to || '').trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    const inst = await getSetting('institute')
    const { subject, line } = ACK[type]
    const contact = [inst.phone, inst.email].filter(Boolean).join(' · ')
    const html = emailLayout(
      subject,
      `<p>Hi ${esc(name || '')},</p><p>${esc(line)}</p><p>If you have any questions in the meantime, simply reply to this email${inst.phone ? ` or call us on ${esc(inst.phone)}` : ''}.</p><p style="margin:22px 0 0">Warm regards,<br><strong style="color:#0F0D1A">Team ${esc(inst.shortName || 'QIMD')}</strong><br><span style="color:#6E6D85;font-size:13px">${esc(inst.name)}</span></p>`,
      'Thank you for reaching out',
    )
    const text = [`Hi ${name || ''},`, '', line, '', 'Warm regards,', `Team ${inst.shortName || 'QIMD'}`, inst.name, inst.address, contact].filter((x) => x !== undefined).join('\n')
    const res = await sendMail({ to: email, subject: `${subject} — ${inst.shortName || inst.name}`, html, text, replyTo: inst.email })
    if (!res.ok) console.warn('[ack email]', res.error)
  } catch (err) {
    console.error('[ack email] could not send:', err)
  }
}
