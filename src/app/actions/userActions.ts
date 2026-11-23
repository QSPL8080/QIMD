'use server'

import { recordTrash, clearTrash } from '@/lib/trash'

import { db } from '@/lib/db'
import { userSchema } from '@/lib/validations'
import {
  requireAdminSession,
  requireSuperAdminSession,
  getAdminSession,
  hashPassword,
  comparePassword,
  isSuperAdminRole,
} from '@/lib/auth'
import { notifySuperAdmin } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function saveUserAction(data: any, id?: string) {
  const session = await requireAdminSession()

  // Verify Super Admin
  if (!isSuperAdminRole(session.roleName)) {
    return { success: false, error: 'FORBIDDEN: Only Super Admin can manage user accounts.' }
  }

  try {
    const validated = userSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { fullName, password, phone, role, status } = validated.data
    const email = validated.data.email.trim().toLowerCase()

    // The email must not belong to another account
    const sameEmail = await db.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, ...(id ? { NOT: { id } } : {}) },
    })
    if (sameEmail) {
      return { success: false, error: 'Another user already has this email address.' }
    }

    // A Super Admin can't lock themselves out
    if (id && id === session.id && (!isSuperAdminRole(role) || !status)) {
      return { success: false, error: 'You cannot remove your own Super Admin role or deactivate your own account.' }
    }

    if (id) {
      // Edit User
      const updateData: any = {
        fullName,
        email,
        phone: phone || null,
        role: role || 'ADMIN',
        status,
      }

      if (password && password.trim() !== '') {
        updateData.passwordHash = await hashPassword(password)
      }

      const updated = await db.user.update({
        where: { id },
        data: updateData,
      })

      if (updateData.passwordHash && id !== session.id) {
        await notifySuperAdmin({
          type: 'PASSWORD_SET_BY_ADMIN',
          title: `${session.fullName} set a new password for ${updated?.fullName || fullName}`,
          actor: { id: session.id, fullName: session.fullName, email: session.email, role: session.roleName },
        })
      }

    } else {
      // Create User
      if (!password || password.trim() === '') {
        return { success: false, error: 'Password is required for new user creation.' }
      }

      const hashedPassword = await hashPassword(password)
      const created = await db.user.create({
        data: {
          fullName,
          email,
          passwordHash: hashedPassword,
          phone: phone || null,
          role: role || 'ADMIN',
          status,
        },
      })

    }

    revalidatePath('/admin/users')
    return { success: true, message: 'User account saved successfully.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save user account.' }
  }
}

export async function trashUserAction(id: string) {
  const session = await requireAdminSession()
  if (!isSuperAdminRole(session.roleName)) {
    return { success: false, error: 'FORBIDDEN: Only Super Admin can delete users.' }
  }

  if (session.id === id) {
    return { success: false, error: 'CAUTION: You cannot delete your own account while logged in.' }
  }

  try {
    await db.user.update({
      where: { id },
      data: { isDeleted: true },
    })


    revalidatePath('/admin/users')
    await recordTrash('user', id, session)
    return { success: true, message: 'User moved to Trash.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash user.' }
  }
}

export async function restoreUserAction(id: string) {
  const session = await requireSuperAdminSession()
  if (!isSuperAdminRole(session.roleName)) {
    return { success: false, error: 'FORBIDDEN: Only Super Admin can restore users.' }
  }

  try {
    await db.user.update({
      where: { id },
      data: { isDeleted: false },
    })


    revalidatePath('/admin/users')
    await clearTrash('user', id)
    return { success: true, message: 'User restored from Trash.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore user.' }
  }
}

export async function deleteUserPermanentlyAction(id: string) {
  const session = await requireSuperAdminSession()
  if (!isSuperAdminRole(session.roleName)) {
    return { success: false, error: 'FORBIDDEN: Only Super Admin can permanently delete users.' }
  }

  try {
    if (session.id === id) {
      return { success: false, error: 'You cannot delete your own account.' }
    }

    // Keep their blogs, leads and content: just unlink them from this user, then delete
    await db.$transaction([
      db.blog.updateMany({ where: { authorId: id }, data: { authorId: null } }),
      db.gallery.updateMany({ where: { createdById: id }, data: { createdById: null } }),
      db.testimonial.updateMany({ where: { createdById: id }, data: { createdById: null } }),
      db.faq.updateMany({ where: { createdById: id }, data: { createdById: null } }),
      db.contactEnquiry.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } }),
      db.admissionEnquiry.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } }),
      db.franchisePartnerEnquiry.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } }),
      db.companyPlacementEnquiry.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } }),
      db.user.delete({ where: { id } }),
    ])

    revalidatePath('/admin/users')
    await clearTrash('user', id)
    return { success: true, message: 'User account permanently deleted.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to permanently delete user.' }
  }
}

/** Super Admin sets a new password for any user. */
export async function resetUserPasswordAction(id: string, password: string) {
  const session = await requireSuperAdminSession()

  const pwd = String(password || '').trim()
  if (pwd.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' }
  }

  try {
    const updated = await db.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(pwd) },
    })
    if (id !== session.id) {
      await notifySuperAdmin({
        type: 'PASSWORD_SET_BY_ADMIN',
        title: `${session.fullName} set a new password for ${updated?.fullName || 'a user'}`,
        actor: { id: session.id, fullName: session.fullName, email: session.email, role: session.roleName },
      })
    }
    revalidatePath('/admin/users')
    return { success: true, message: 'Password updated.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update password.' }
  }
}

/** Any signed-in user changes their own password. The Super Admin is notified. */
export async function changeOwnPasswordAction(currentPassword: string, newPassword: string) {
  const session = await getAdminSession()
  if (!session) {
    return { success: false, error: 'Please sign in again.' }
  }

  const next = String(newPassword || '').trim()
  if (next.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' }
  }

  try {
    const user = await db.user.findUnique({ where: { id: session.id } })
    if (!user) {
      return { success: false, error: 'Account not found.' }
    }
    const ok = await comparePassword(String(currentPassword || ''), user.passwordHash)
    if (!ok) {
      return { success: false, error: 'Current password is incorrect.' }
    }
    if (await comparePassword(next, user.passwordHash)) {
      return { success: false, error: 'New password must be different from the current one.' }
    }

    await db.user.update({
      where: { id: session.id },
      data: { passwordHash: await hashPassword(next) },
    })

    await notifySuperAdmin({
      type: 'PASSWORD_CHANGED',
      title: `${user.fullName} changed their password`,
      actor: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    })

    revalidatePath('/admin', 'layout')
    return { success: true, message: 'Password changed.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to change password.' }
  }
}
