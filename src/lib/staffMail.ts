import { db } from './db'
import { emailButton, emailLayout, emailList, emailNote, esc, mailConfigured, sendMail, SITE_URL } from './mailer'

/**
 * Emails to staff (counsellors, Admission Head, admins) about CRM events.
 * Goes to each user's own account email. Never throws and never blocks the action.
 */
export async function emailStaff(
  to: { userIds?: string[]; roles?: string[]; exceptUserId?: string | null },
  msg: { subject: string; title: string; intro: string; items?: string[]; link?: string; linkLabel?: string },
) {
  try {
    if (!mailConfigured()) return 0
    const or: any[] = []
    if (to.userIds?.length) or.push({ id: { in: to.userIds } })
    if (to.roles?.length) or.push({ role: { in: to.roles } })
    if (!or.length) return 0
    const users = await db.user.findMany({ where: { OR: or, status: true, isDeleted: false }, select: { id: true, email: true } })
    const emails: string[] = [...new Set<string>(users.filter((u: any) => u.id !== to.exceptUserId && u.email).map((u: any) => String(u.email).trim().toLowerCase()))]
    if (!emails.length) return 0
    const url = msg.link ? (msg.link.startsWith('http') ? msg.link : `${SITE_URL}${msg.link}`) : ''
    const html = emailLayout(
      msg.title,
      `<p>${esc(msg.intro)}</p>${emailList(msg.items || [])}${url ? emailButton(url, msg.linkLabel || 'Open in CRM') : ''}${emailNote('You are receiving this because of your role in the QIMD admin panel.')}`,
      'QIMD Admin Panel',
    )
    const text = [msg.intro, ...(msg.items || []).map((i) => `- ${i}`), url ? `\n${msg.linkLabel || 'Open in CRM'}: ${url}` : ''].join('\n')
    // One email per person, so addresses are not shared between staff
    const results = await Promise.all(emails.map((e) => sendMail({ to: e, subject: msg.subject, html, text })))
    return results.filter((r) => r.ok).length
  } catch (err) {
    console.error('[staff mail] failed:', err)
    return 0
  }
}

/** Security notice to a user about their own account (password changed, account locked, new account). */
export async function emailAccountNotice(user: { email?: string | null; fullName?: string | null }, subject: string, title: string, lines: string[], link?: { href: string; label: string }) {
  try {
    if (!mailConfigured() || !user.email) return false
    const body =
      lines.map((l) => `<p>${esc(l)}</p>`).join('') +
      (link ? emailButton(link.href, link.label) : '') +
      emailNote('This is an automatic security email about your QIMD admin account.')
    const r = await sendMail({
      to: user.email,
      subject,
      html: emailLayout(title, `<p>Hi ${esc(user.fullName || '')},</p>${body}`, 'Account security'),
      text: [`Hi ${user.fullName || ''},`, ...lines, link ? `${link.label}: ${link.href}` : ''].join('\n\n'),
    })
    return r.ok
  } catch {
    return false
  }
}
