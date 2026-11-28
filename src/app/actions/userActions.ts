'use server'

import { recordTrash, clearTrash } from '@/lib/trash'
import { db } from '@/lib/db'
import { requirePermission, requireSuperAdminSession, getAdminSession, hashPassword, comparePassword, isSuperAdminRole, type SessionUser } from '@/lib/auth'
import { ROLE_LIST, VIEWER_MODULES, normalizeRole, roleLabel } from '@/lib/permissions'
import { notifySuperAdmin } from '@/lib/notifications'
import { sendPasswordResetEmail } from '@/lib/passwordReset'
import { audit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { emailAccountNotice } from '@/lib/staffMail'
import { SITE_URL } from '@/lib/mailer'

type Result = { success: boolean; message?: string; error?: string }
const fail = (err: any): Result => ({ success: false, error: String(err?.message || err).replace(/^(UNAUTHORIZED|FORBIDDEN): /, '') })
const isUuid = (v: unknown) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v)

/**
 * Super Admin manages everyone. Admin manages operational users only (SRS §3.1):
 * never a Super Admin account, and cannot grant the Super Admin role.
 */
function checkCanManage(session: SessionUser, target: { role?: string | null } | null, newRole?: string): string | null {
  if (isSuperAdminRole(session.roleName)) return null
  if (target && normalizeRole(target.role) === 'SUPER_ADMIN') return 'Only the Super Admin can change a Super Admin account.'
  if (newRole && normalizeRole(newRole) === 'SUPER_ADMIN') return 'Only the Super Admin can grant the Super Admin role.'
  return null
}

function validateUser(d: any, isNew: boolean) {
  const fullName = String(d.fullName || '').trim().slice(0, 150)
  if (fullName.length < 2) return { error: 'Full name is required.' }
  const email = String(d.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' }
  const username = String(d.username || '').trim().toLowerCase() || null
  if (username && !/^[a-z0-9._-]{3,60}$/.test(username)) return { error: 'Username: 3–60 letters, numbers, dot, dash or underscore (no spaces or @).' }
  const role = String(d.role || '')
  if (!ROLE_LIST.some((r) => r.value === role)) return { error: 'Choose a role.' }
  const password = String(d.password || '')
  if (isNew && password.length < 8) return { error: 'Password must be at least 8 characters.' }
  if (!isNew && password && password.length < 8) return { error: 'Password must be at least 8 characters.' }
  const moduleAccess = role === 'VIEWER' ? (Array.isArray(d.moduleAccess) ? d.moduleAccess : []).filter((m: string) => VIEWER_MODULES.some((v) => v.value === m)) : []
  if (role === 'VIEWER' && moduleAccess.length === 0) return { error: 'Choose at least one module the Viewer can see.' }
  return {
    data: {
      fullName,
      email,
      username,
      phone: String(d.phone || '').trim().slice(0, 30) || null,
      role,
      status: d.status !== false,
      moduleAccess: role === 'VIEWER' ? JSON.stringify(moduleAccess) : null,
    },
    password,
  }
}

export async function saveUserAction(data: any, id?: string): Promise<Result> {
  try {
    const session = await requirePermission('users', id ? 'edit' : 'add')
    const v = validateUser(data, !id)
    if (v.error) return { success: false, error: v.error }
    const d = v.data!

    const target = id ? await db.user.findFirst({ where: { id, isDeleted: false } }) : null
    if (id && !target) return { success: false, error: 'User not found.' }
    const denied = checkCanManage(session, target, d.role)
    if (denied) return { success: false, error: denied }
    if (id && id === session.id && (normalizeRole(d.role) !== normalizeRole(session.roleName) || !d.status)) {
      return { success: false, error: 'You cannot change your own role or deactivate your own account.' }
    }

    const sameEmail = await db.user.findFirst({ where: { email: { equals: d.email, mode: 'insensitive' }, ...(id ? { NOT: { id } } : {}) } })
    if (sameEmail) return { success: false, error: 'Another user already has this email address.' }
    if (d.username) {
      const sameUser = await db.user.findFirst({ where: { username: { equals: d.username, mode: 'insensitive' }, ...(id ? { NOT: { id } } : {}) } as any })
      if (sameUser) return { success: false, error: 'This username is taken.' }
    }

    if (id && target) {
      const updated: any = await db.user.update({
        where: { id },
        data: { ...d, ...(v.password ? { passwordHash: await hashPassword(v.password) } : {}) } as any,
      })
      const t: any = target
      if (normalizeRole(t.role) !== normalizeRole(d.role)) {
        await audit(session, 'USER_ROLE_CHANGE', 'user', id, `${updated.fullName}: ${roleLabel(t.role)} → ${roleLabel(d.role)}`, { before: { role: t.role }, after: { role: d.role } })
      }
      if (t.status !== d.status) {
        await audit(session, d.status ? 'USER_ACTIVATE' : 'USER_DEACTIVATE', 'user', id, `${updated.fullName} ${d.status ? 'activated' : 'deactivated'}`)
      }
      if ((t.moduleAccess || null) !== (d.moduleAccess || null)) {
        await audit(session, 'USER_PERMISSIONS_CHANGE', 'user', id, `${updated.fullName}: Viewer modules changed`, { before: { modules: t.moduleAccess }, after: { modules: d.moduleAccess } })
      }
      const other = ['fullName', 'email', 'username', 'phone'].filter((k) => (t[k] || null) !== ((d as any)[k] || null))
      if (other.length) await audit(session, 'USER_UPDATE', 'user', id, `${updated.fullName}: updated ${other.join(', ')}`)
      if (v.password) {
        await audit(session, 'USER_PASSWORD_SET', 'user', id, `${session.fullName} set a new password for ${updated.fullName}`)
        await emailAccountNotice(updated, 'Your QIMD admin password was changed', 'Your password was changed', [`${session.fullName} set a new password for your QIMD admin account. They will share it with you.`, 'If you did not expect this, contact your Super Admin.'], { href: `${SITE_URL}/admin/login`, label: 'Sign in' })
        if (id !== session.id) {
          await notifySuperAdmin({ type: 'PASSWORD_SET_BY_ADMIN', title: `${session.fullName} set a new password for ${updated.fullName}`, actor: { id: session.id, fullName: session.fullName, email: session.email, role: session.roleName } })
        }
      }
    } else {
      const created = await db.user.create({ data: { ...d, passwordHash: await hashPassword(v.password!) } as any })
      await audit(session, 'USER_CREATE', 'user', created.id, `Created user ${created.fullName} (${roleLabel(d.role)})`)
      // Welcome email: where to sign in and the login name (never the password)
      await emailAccountNotice(
        created,
        'Your QIMD admin account',
        'Your admin account is ready',
        [
          `${session.fullName} created a ${roleLabel(d.role)} account for you in the QIMD admin panel.`,
          `Sign in with ${created.username ? `username "${created.username}" or ` : ''}your email ${created.email}. Your password will be shared with you separately; you can also set your own with "Forgot password?" on the sign-in page.`,
        ],
        { href: `${SITE_URL}/admin/login`, label: 'Open the admin panel' },
      )
    }
    revalidatePath('/admin/users')
    return { success: true, message: 'User account saved.' }
  } catch (err) {
    return fail(err)
  }
}

export async function trashUserAction(id: string): Promise<Result> {
  try {
    const session = await requirePermission('users', 'delete')
    if (session.id === id) return { success: false, error: 'You cannot delete your own account.' }
    const target = await db.user.findFirst({ where: { id, isDeleted: false } })
    if (!target) return { success: false, error: 'User not found.' }
    const denied = checkCanManage(session, target)
    if (denied) return { success: false, error: denied }
    await db.user.update({ where: { id }, data: { isDeleted: true, status: false } })
    await recordTrash('user', id, session)
    await audit(session, 'USER_DELETE', 'user', id, `Moved user ${target.fullName} to the Bin (deactivated)`)
    revalidatePath('/admin/users')
    return { success: true, message: 'User moved to the Bin.' }
  } catch (err) {
    return fail(err)
  }
}

export async function restoreUserAction(id: string): Promise<Result> {
  try {
    const session = await requireSuperAdminSession()
    const u = await db.user.update({ where: { id }, data: { isDeleted: false } })
    await clearTrash('user', id)
    await audit(session, 'USER_RESTORE', 'user', id, `Restored user ${u.fullName} (still inactive until activated)`)
    revalidatePath('/admin/users')
    return { success: true, message: 'User restored (inactive — activate to allow sign-in).' }
  } catch (err) {
    return fail(err)
  }
}

/** Users keep their history: permanent delete only unlinks content/lead pointers, never erases records. */
export async function deleteUserPermanentlyAction(id: string): Promise<Result> {
  try {
    const session = await requireSuperAdminSession()
    if (session.id === id) return { success: false, error: 'You cannot delete your own account.' }
    const u = await db.user.findUnique({ where: { id } })
    if (!u) return { success: false, error: 'User not found.' }
    await db.$transaction([
      db.blog.updateMany({ where: { authorId: id }, data: { authorId: null } }),
      db.gallery.updateMany({ where: { createdById: id }, data: { createdById: null } }),
      db.testimonial.updateMany({ where: { createdById: id }, data: { createdById: null } }),
      db.faq.updateMany({ where: { createdById: id }, data: { createdById: null } }),
      db.contactEnquiry.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } }),
      db.admissionEnquiry.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } }),
      db.franchisePartnerEnquiry.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } }),
      db.companyPlacementEnquiry.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } }),
      (db as any).lead.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } }),
      (db as any).admission.updateMany({ where: { counsellorId: id }, data: { counsellorId: null } }),
      db.user.delete({ where: { id } }),
    ])
    await clearTrash('user', id)
    await audit(session, 'USER_DELETE_PERMANENT', 'user', id, `Permanently deleted user ${u.fullName} (${u.email})`)
    revalidatePath('/admin/users')
    return { success: true, message: 'User account permanently deleted. Their names stay on history records.' }
  } catch (err) {
    return fail(err)
  }
}

/** Super Admin / Admin sets a new password for a user. */
export async function resetUserPasswordAction(id: string, password: string): Promise<Result> {
  try {
    const session = await requirePermission('users', 'edit')
    const target = await db.user.findFirst({ where: { id, isDeleted: false } })
    if (!target) return { success: false, error: 'User not found.' }
    const denied = checkCanManage(session, target)
    if (denied) return { success: false, error: denied }
    const pwd = String(password || '')
    if (pwd.length < 8) return { success: false, error: 'Password must be at least 8 characters.' }
    await db.user.update({ where: { id }, data: { passwordHash: await hashPassword(pwd), failedLoginCount: 0, lockedUntil: null } as any })
    await audit(session, 'USER_PASSWORD_SET', 'user', id, `${session.fullName} set a new password for ${target.fullName}`)
    await emailAccountNotice(target, 'Your QIMD admin password was changed', 'Your password was changed', [`${session.fullName} set a new password for your QIMD admin account. They will share it with you.`, 'If you did not expect this, contact your Super Admin.'], { href: `${SITE_URL}/admin/login`, label: 'Sign in' })
    if (id !== session.id) {
      await notifySuperAdmin({ type: 'PASSWORD_SET_BY_ADMIN', title: `${session.fullName} set a new password for ${target.fullName}`, actor: { id: session.id, fullName: session.fullName, email: session.email, role: session.roleName } })
    }
    revalidatePath('/admin/users')
    return { success: true, message: 'Password updated.' }
  } catch (err) {
    return fail(err)
  }
}

/** Super Admin / Admin emails the user a single-use reset link. */
export async function sendResetLinkAction(id: string): Promise<Result> {
  try {
    const session = await requirePermission('users', 'edit')
    if (!isUuid(id)) return { success: false, error: 'User not found.' }
    const target = await db.user.findFirst({ where: { id, isDeleted: false } })
    if (!target) return { success: false, error: 'User not found.' }
    const denied = checkCanManage(session, target)
    if (denied) return { success: false, error: denied }
    const r = await sendPasswordResetEmail(target, session.fullName)
    await audit(session, r.ok ? 'PASSWORD_RESET_INITIATED' : 'PASSWORD_RESET_EMAIL_FAILED', 'user', id, r.ok ? `${session.fullName} emailed a reset link to ${target.email}` : `Reset email to ${target.email} failed: ${r.error}`)
    return r.ok ? { success: true, message: `Reset link emailed to ${target.email}.` } : { success: false, error: r.error }
  } catch (err) {
    return fail(err)
  }
}

/** Unlock an account locked by failed logins. */
export async function unlockUserAction(id: string): Promise<Result> {
  try {
    const session = await requirePermission('users', 'edit')
    const target = await db.user.findFirst({ where: { id, isDeleted: false } })
    if (!target) return { success: false, error: 'User not found.' }
    const denied = checkCanManage(session, target)
    if (denied) return { success: false, error: denied }
    await db.user.update({ where: { id }, data: { failedLoginCount: 0, lockedUntil: null } as any })
    await audit(session, 'USER_UNLOCK', 'user', id, `Unlocked ${target.fullName}`)
    revalidatePath('/admin/users')
    return { success: true, message: 'Account unlocked.' }
  } catch (err) {
    return fail(err)
  }
}

/** Any signed-in user changes their own password. The Super Admin is notified. */
export async function changeOwnPasswordAction(currentPassword: string, newPassword: string): Promise<Result> {
  const session = await getAdminSession()
  if (!session) return { success: false, error: 'Please sign in again.' }
  const next = String(newPassword || '')
  if (next.length < 8) return { success: false, error: 'New password must be at least 8 characters.' }
  try {
    const user = await db.user.findUnique({ where: { id: session.id } })
    if (!user) return { success: false, error: 'Account not found.' }
    if (!(await comparePassword(String(currentPassword || ''), user.passwordHash))) return { success: false, error: 'Current password is incorrect.' }
    if (await comparePassword(next, user.passwordHash)) return { success: false, error: 'New password must be different from the current one.' }
    await db.user.update({ where: { id: session.id }, data: { passwordHash: await hashPassword(next) } })
    await audit(session, 'PASSWORD_CHANGE', 'user', session.id, `${user.fullName} changed their password`)
    await emailAccountNotice(user, 'Your QIMD admin password was changed', 'Your password was changed', ['The password for your QIMD admin account was just changed from your profile.', 'If this was not you, contact your Super Admin immediately.'])
    await notifySuperAdmin({ type: 'PASSWORD_CHANGED', title: `${user.fullName} changed their password`, actor: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } })
    revalidatePath('/admin', 'layout')
    return { success: true, message: 'Password changed.' }
  } catch (err) {
    return fail(err)
  }
}
