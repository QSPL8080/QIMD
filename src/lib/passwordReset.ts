import { createHash, randomBytes } from 'crypto'
import { db } from './db'
import { sendMail, emailLayout, emailButton, emailNote, esc, SITE_URL } from './mailer'

export const RESET_MINUTES = 30
export const hashResetToken = (t: string) => createHash('sha256').update(t).digest('hex')

/** Email a single-use reset link valid for 30 minutes. */
export async function sendPasswordResetEmail(user: { id: string; fullName: string; email: string }, initiatedBy?: string) {
  const token = randomBytes(32).toString('hex')
  await db.user.update({ where: { id: user.id }, data: { passwordResetHash: hashResetToken(token), passwordResetExpires: new Date(Date.now() + RESET_MINUTES * 60000) } as any })
  const link = `${SITE_URL}/admin/reset-password?token=${token}`
  return sendMail({
    to: user.email,
    subject: 'Reset your QIMD admin password',
    text: `Hello ${user.fullName},\n\nUse this link to set a new password (valid for ${RESET_MINUTES} minutes, single use):\n${link}\n\nIf you did not ask for this, ignore this email.`,
    html: emailLayout(
      'Reset your password',
      `<p>Hello ${esc(user.fullName)},</p><p>${initiatedBy ? `${esc(initiatedBy)} started a password reset for your account.` : 'We received a request to reset your password.'} The link below works once and expires in ${RESET_MINUTES} minutes.</p>${emailButton(link, 'Set a new password')}${emailNote('If you did not ask for this, ignore this email; your password stays the same.')}`,
      'Account security',
    ),
  })
}

