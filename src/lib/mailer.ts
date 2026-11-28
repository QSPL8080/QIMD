import { createTransport, type Transporter } from 'nodemailer'

/**
 * Outgoing email (lead alerts, receipts, fee reminders, password reset).
 *
 * Environment variables (Hostinger → your site → Environment variables):
 *   SMTP_HOST   e.g. smtp.hostinger.com
 *   SMTP_PORT   465 (SSL) or 587 (TLS)
 *   SMTP_USER   the sending mailbox, e.g. info@quickuppinstitute.com
 *   SMTP_PASS   that mailbox's password
 *   SMTP_FROM   optional sender, e.g. "Quickupp Institute <info@quickuppinstitute.com>" (MAIL_FROM also works)
 *   SMTP_SECURE optional "true"/"false" (default: true on port 465)
 *   NOTIFICATION_EMAIL optional: where website enquiries go (else Settings → Website enquiry emails)
 */

let transporter: Transporter | null = null

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function getTransporter() {
  if (!mailConfigured()) return null
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465)
    transporter = createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    })
  }
  return transporter
}

export const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.quickuppinstitute.com').replace(/\/$/, '')

const FONT = "font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const FOOTER_MARK = '<!--QIMD_FOOTER-->'

/**
 * Branded email shell: logo, white card with a brand-gradient top bar, title, body, footer.
 * Table-based so it lines up in Gmail, Outlook and phone mail apps.
 * The footer (institute name, address, phone, email, website) is filled in by sendMail from Settings → Institute.
 */
export function emailLayout(title: string, bodyHtml: string, subtitle?: string) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#F2F3F8;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(subtitle || title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2F3F8">
<tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
    <tr><td style="background:#FFFFFF;border:1px solid #E4E5EE;border-radius:14px;overflow:hidden">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td height="5" style="height:5px;line-height:5px;font-size:0;background-color:#6366F1;background-image:linear-gradient(90deg,#00C2FF 0%,#6366F1 50%,#E0249A 100%)">&nbsp;</td></tr>
        <tr><td style="padding:22px 36px 18px;border-bottom:1px solid #ECEDF3">
          <a href="${SITE_URL}" style="text-decoration:none"><img src="${SITE_URL}/images/logo/email-logo.png" width="170" alt="Quickupp Institute of Marketing &amp; Design" style="display:block;width:170px;max-width:60%;height:auto;border:0;outline:none"></a>
        </td></tr>
        <tr><td style="padding:28px 36px 6px;${FONT}">
          ${subtitle ? `<div style="font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#6366F1;margin:0 0 8px">${esc(subtitle)}</div>` : ''}
          <h1 style="margin:0;font-size:22px;line-height:1.35;font-weight:700;color:#0F0D1A">${esc(title)}</h1>
        </td></tr>
        <tr><td style="padding:16px 36px 32px;${FONT};font-size:15px;line-height:1.65;color:#33324A">${bodyHtml.replace(/<p>/g, '<p style="margin:0 0 14px">')}</td></tr>
      </table>
    </td></tr>
    <tr><td align="center" style="padding:24px 20px 8px;${FONT};font-size:12px;line-height:1.7;color:#8A8AA3">${FOOTER_MARK}</td></tr>
  </table>
</td></tr></table>
</body></html>`
}

export function footerHtml(inst: { name?: string; address?: string; phone?: string; email?: string; website?: string }) {
  const site = (inst.website || SITE_URL).replace(/\/$/, '')
  const contact = [
    inst.phone ? `<a href="tel:${esc(inst.phone.replace(/\s+/g, ''))}" style="color:#6366F1;text-decoration:none">${esc(inst.phone)}</a>` : '',
    inst.email ? `<a href="mailto:${esc(inst.email)}" style="color:#6366F1;text-decoration:none">${esc(inst.email)}</a>` : '',
    `<a href="${esc(site)}" style="color:#6366F1;text-decoration:none">${esc(site.replace(/^https?:\/\//, ''))}</a>`,
  ].filter(Boolean)
  return `<div style="font-weight:700;color:#4A4960">${esc(inst.name || 'Quickupp Institute of Marketing & Design')}</div>
${inst.address ? `<div>${esc(inst.address)}</div>` : ''}
<div>${contact.join(' &nbsp;·&nbsp; ')}</div>
<div style="margin-top:10px;color:#A3A3B8">© ${new Date().getFullYear()} ${esc(inst.name || 'QIMD')}. All rights reserved.</div>`
}

/** Rows of label/value pairs as an email table. Empty values are skipped. */
export function emailTable(rows: { label: string; value?: unknown; html?: string }[]) {
  const shown = rows.filter((r) => r.html || (r.value !== undefined && r.value !== null && String(r.value).trim() !== ''))
  const body = shown
    .map(
      (r, i) =>
        `<tr><td valign="top" style="padding:11px 14px;${i < shown.length - 1 ? 'border-bottom:1px solid #ECEDF3;' : ''}${FONT};color:#6E6D85;font-size:13px;width:38%">${esc(r.label)}</td><td valign="top" style="padding:11px 14px;${i < shown.length - 1 ? 'border-bottom:1px solid #ECEDF3;' : ''}${FONT};color:#0F0D1A;font-size:14px;font-weight:600;word-break:break-word">${r.html ?? esc(r.value).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border:1px solid #ECEDF3;border-radius:10px;background:#FAFAFD;margin:8px 0 22px">${body}</table>`
}

/** Bulleted list in a soft box (lead lists, due fees). */
export function emailList(items: string[]) {
  if (!items.length) return ''
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border:1px solid #ECEDF3;border-radius:10px;background:#FAFAFD;margin:8px 0 22px">${items
    .map(
      (it, i) =>
        `<tr><td valign="top" width="22" style="padding:10px 0 10px 14px;${i < items.length - 1 ? 'border-bottom:1px solid #ECEDF3;' : ''}color:#6366F1;font-size:14px">&#9679;</td><td style="padding:10px 14px 10px 6px;${i < items.length - 1 ? 'border-bottom:1px solid #ECEDF3;' : ''}${FONT};font-size:14px;color:#0F0D1A">${esc(it)}</td></tr>`,
    )
    .join('')}</table>`
}

/** Call-to-action button (bulletproof: works in Outlook too). */
export function emailButton(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 4px"><tr><td align="center" bgcolor="#4F46E5" style="border-radius:8px;background:#4F46E5"><a href="${esc(href)}" style="display:inline-block;padding:12px 24px;${FONT};font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px">${esc(label)}</a></td></tr></table>`
}

/** Small grey note under the main content. */
export function emailNote(text: string) {
  return `<p style="margin:22px 0 0;padding-top:16px;border-top:1px solid #ECEDF3;font-size:12px;line-height:1.6;color:#8A8AA3">${esc(text)}</p>`
}

export type MailResult = { ok: true } | { ok: false; error: string }

/** Send an email. Never throws; returns ok/error so callers can log the delivery result. */
export async function sendMail(msg: { to: string; subject: string; html: string; text: string; replyTo?: string | null }): Promise<MailResult> {
  const tx = getTransporter()
  if (!tx) return { ok: false, error: 'Email is not set up (SMTP_HOST, SMTP_USER, SMTP_PASS).' }
  const to = msg.to
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  if (to.length === 0) return { ok: false, error: 'No recipient email address.' }
  let html = msg.html
  if (html.includes(FOOTER_MARK)) {
    let inst: any = {}
    try {
      const { getSetting } = await import('./settings')
      inst = await getSetting('institute')
    } catch {}
    html = html.replace(FOOTER_MARK, footerHtml(inst))
  }
  try {
    await Promise.race([
      tx.sendMail({
        from: (process.env.MAIL_FROM || process.env.SMTP_FROM) || `QIMD <${process.env.SMTP_USER}>`,
        to,
        replyTo: msg.replyTo || undefined,
        subject: msg.subject,
        text: msg.text,
        html,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email server timed out')), 20_000)),
    ])
    return { ok: true }
  } catch (err: any) {
    console.error('[mail] send failed:', err)
    return { ok: false, error: String(err?.message || err).slice(0, 480) }
  }
}
