'use server'

import { createHash } from 'crypto'
import { comparePassword, hashPassword, setAdminSessionCookie, clearAdminSessionCookie, signJwtToken, getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { audit } from '@/lib/audit'
import { normalizeRole } from '@/lib/permissions'
import { sendPasswordResetEmail } from '@/lib/passwordReset'
import { notifySuperAdmin } from '@/lib/notifications'
import { emailAccountNotice } from '@/lib/staffMail'
import { SITE_URL } from '@/lib/mailer'

const MAX_ATTEMPTS = 5
const LOCK_MINUTES = 15
const hashToken = (t: string) => createHash('sha256').update(t).digest('hex')

/** Sign in with email address or username (SRS §4). Locks the account for 15 minutes after 5 wrong passwords. */
export async function loginAdminAction(prevState: any, formData: FormData) {
  try {
    const login = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')
    if (!login || !password) return { success: false, error: 'Enter your email / username and password.' }

    const user = await db.user.findFirst({
      where: login.includes('@') ? { email: { equals: login, mode: 'insensitive' } } : { username: { equals: login, mode: 'insensitive' } } as any,
    })
    // Same message for unknown accounts and wrong passwords (no account guessing)
    const generic = { success: false, error: 'Invalid email / username or password.' }
    if (!user || user.isDeleted) return generic
    const u: any = user
    if (u.lockedUntil && new Date(u.lockedUntil).getTime() > Date.now()) {
      const mins = Math.ceil((new Date(u.lockedUntil).getTime() - Date.now()) / 60000)
      return { success: false, error: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}, or reset your password.` }
    }

    const ok = await comparePassword(password, user.passwordHash)
    if (!ok) {
      const count = (u.failedLoginCount || 0) + 1
      const lock = count >= MAX_ATTEMPTS
      await db.user.update({
        where: { id: user.id },
        data: { failedLoginCount: lock ? 0 : count, lastFailedLogin: new Date(), ...(lock ? { lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60000) } : {}) } as any,
      })
      await audit({ id: user.id, fullName: user.fullName, roleName: user.role }, lock ? 'LOGIN_LOCKED' : 'LOGIN_FAILED', 'user', user.id, lock ? `Account locked for ${LOCK_MINUTES} min after ${MAX_ATTEMPTS} failed logins` : `Failed login (${count}/${MAX_ATTEMPTS})`)
      if (lock) {
        await emailAccountNotice(user, 'Your QIMD admin account was locked', 'Account locked for 15 minutes', [`There were ${MAX_ATTEMPTS} wrong password attempts on your QIMD admin account, so it is locked for ${LOCK_MINUTES} minutes.`, 'If this was not you, reset your password now and tell your Super Admin.'], { href: `${SITE_URL}/admin/forgot-password`, label: 'Reset password' })
        await notifySuperAdmin({ type: 'LOGIN_LOCKED', title: `${user.fullName}'s account was locked after ${MAX_ATTEMPTS} failed logins`, actor: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } })
        return { success: false, error: `Too many failed attempts. Your account is locked for ${LOCK_MINUTES} minutes.` }
      }
      return generic
    }
    if (!user.status) {
      await audit({ id: user.id, fullName: user.fullName, roleName: user.role }, 'LOGIN_BLOCKED', 'user', user.id, 'Login attempt on a deactivated account')
      return { success: false, error: 'This account is deactivated. Contact the administrator.' }
    }

    const token = signJwtToken({ userId: user.id })
    await setAdminSessionCookie(token)
    await db.user.update({ where: { id: user.id }, data: { lastLogin: new Date(), failedLoginCount: 0, lockedUntil: null } as any })
    await audit({ id: user.id, fullName: user.fullName, roleName: normalizeRole(user.role) }, 'LOGIN', 'user', user.id, `${user.fullName} signed in`)
    return { success: true, redirect: '/admin/dashboard' }
  } catch (err: any) {
    console.error('Login action error details:', err)
    return { success: false, error: 'Sign-in failed. Please try again.' }
  }
}

export async function logoutAdminAction() {
  const session = await getAdminSession()
  if (session) await audit(session, 'LOGOUT', 'user', session.id, `${session.fullName} signed out`)
  await clearAdminSessionCookie()
  redirect('/admin/login')
}

/** Forgot password. Always answers the same way so nobody can check which emails have accounts. */
type FormResult = { success: boolean; message?: string; error?: string }

export async function requestPasswordResetAction(_prev: any, formData: FormData): Promise<FormResult> {
  const login = String(formData.get('email') || '').trim()
  const done: FormResult = { success: true, message: 'If an active account matches, a reset link has been emailed. It is valid for 30 minutes.' }
  if (!login) return { success: false, error: 'Enter your email address or username.' }
  try {
    const user = await db.user.findFirst({
      where: { ...(login.includes('@') ? { email: { equals: login, mode: 'insensitive' } } : ({ username: { equals: login, mode: 'insensitive' } } as any)), status: true, isDeleted: false },
    })
    if (user) {
      const r = await sendPasswordResetEmail(user)
      await audit({ id: user.id, fullName: user.fullName, roleName: user.role }, r.ok ? 'PASSWORD_RESET_REQUESTED' : 'PASSWORD_RESET_EMAIL_FAILED', 'user', user.id, r.ok ? 'Password reset link emailed' : `Reset email failed: ${r.error}`)
    }
  } catch (err) {
    console.error('Password reset request error:', err)
  }
  return done
}

/** Set a new password from a reset link. */
export async function resetPasswordAction(_prev: any, formData: FormData): Promise<FormResult> {
  const token = String(formData.get('token') || '')
  const password = String(formData.get('password') || '')
  const confirm = String(formData.get('confirm') || '')
  if (!/^[a-f0-9]{64}$/.test(token)) return { success: false, error: 'This reset link is not valid. Ask for a new one.' }
  if (password.length < 8) return { success: false, error: 'Password must be at least 8 characters.' }
  if (password !== confirm) return { success: false, error: 'Passwords do not match.' }
  try {
    const user: any = await db.user.findFirst({ where: { passwordResetHash: hashToken(token), isDeleted: false } as any })
    if (!user || !user.passwordResetExpires || new Date(user.passwordResetExpires).getTime() < Date.now()) {
      return { success: false, error: 'This reset link has expired or was already used. Ask for a new one.' }
    }
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password), passwordResetHash: null, passwordResetExpires: null, failedLoginCount: 0, lockedUntil: null } as any,
    })
    await audit({ id: user.id, fullName: user.fullName, roleName: user.role }, 'PASSWORD_RESET', 'user', user.id, `${user.fullName} reset their password with an emailed link`)
    await emailAccountNotice(user, 'Your QIMD admin password was changed', 'Your password was changed', ['Your QIMD admin password was reset using an emailed link.', 'If this was not you, contact your Super Admin immediately.'])
    await notifySuperAdmin({ type: 'PASSWORD_CHANGED', title: `${user.fullName} reset their password`, actor: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } })
    return { success: true, message: 'Your password has been changed. You can sign in now.' }
  } catch (err) {
    console.error('Reset password error:', err)
    return { success: false, error: 'Could not reset the password. Please try again.' }
  }
}
