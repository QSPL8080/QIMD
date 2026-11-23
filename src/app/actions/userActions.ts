'use server'

import { recordTrash, clearTrash } from '@/lib/trash'

import { db } from '@/lib/db'
import { userSchema } from '@/lib/validations'
import { requireAdminSession, requireSuperAdminSession, hashPassword, isSuperAdminRole } from '@/lib/auth'
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

    const { fullName, email, password, phone, role, status } = validated.data

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

      await db.user.update({
        where: { id },
        data: updateData,
      })

    } else {
      // Create User
      if (!password || password.trim() === '') {
        return { success: false, error: 'Password is required for new user creation.' }
      }

      const existing = await db.user.findUnique({ where: { email } })
      if (existing) {
        return { success: false, error: 'User with this email address already exists.' }
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
    await db.user.delete({ where: { id } })

    revalidatePath('/admin/users')
    await clearTrash('user', id)
    return { success: true, message: 'User account permanently deleted.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to permanently delete user.' }
  }
}

/** Super Admin sets a new password for any user. */
export async function resetUserPasswordAction(id: string, password: string) {
  await requireSuperAdminSession()

  const pwd = String(password || '').trim()
  if (pwd.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' }
  }

  try {
    await db.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(pwd) },
    })
    revalidatePath('/admin/users')
    return { success: true, message: 'Password updated.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update password.' }
  }
}
