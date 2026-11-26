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

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.qimd.in').replace(/\/$/, '')

/** Branded email shell (navy header, white card). */
export function emailLayout(title: string, bodyHtml: string, subtitle?: string) {
  return `<!doctype html><html><body style="margin:0;background:#F4F6FA;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:620px;margin:0 auto;padding:24px 12px">
  <div style="background:#15123A;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
    <div style="font-size:12px;letter-spacing:.08em;color:#C4B5FD;text-transform:uppercase">Quickupp Institute of Marketing &amp; Design</div>
    <div style="font-size:20px;font-weight:700;margin-top:4px">${esc(title)}</div>
    ${subtitle ? `<div style="font-size:12px;color:rgba(255,255,255,.7);margin-top:6px">${esc(subtitle)}</div>` : ''}
  </div>
  <div style="background:#fff;padding:20px 24px;border-radius:0 0 12px 12px;color:#15123A;font-size:14px;line-height:1.6">${bodyHtml}</div>
</div></body></html>`
}

/** Rows of label/value pairs as an email table. Empty values are skipped. */
export function emailTable(rows: { label: string; value?: unknown; html?: string }[]) {
  const body = rows
    .filter((r) => r.html || (r.value !== undefined && r.value !== null && String(r.value).trim() !== ''))
    .map(
      (r) =>
        `<tr><td style="padding:9px 12px;border-bottom:1px solid #ECEDF2;color:#6B6A80;font-size:13px;width:170px;vertical-align:top">${esc(r.label)}</td><td style="padding:9px 12px;border-bottom:1px solid #ECEDF2;color:#15123A;font-size:14px;font-weight:600">${r.html ?? esc(r.value).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0 16px">${body}</table>`
}

export function emailButton(href: string, label: string) {
  return `<a href="${esc(href)}" style="display:inline-block;background:#5B3FD9;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:700">${esc(label)}</a>`
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
  try {
    await Promise.race([
      tx.sendMail({
        from: (process.env.MAIL_FROM || process.env.SMTP_FROM) || `QIMD <${process.env.SMTP_USER}>`,
        to,
        replyTo: msg.replyTo || undefined,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email server timed out')), 20_000)),
    ])
    return { ok: true }
  } catch (err: any) {
    console.error('[mail] send failed:', err)
    return { ok: false, error: String(err?.message || err).slice(0, 480) }
  }
}
