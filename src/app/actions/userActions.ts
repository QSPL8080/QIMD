'use server'

import { db } from '@/lib/db'
import { userSchema } from '@/lib/validations'
import { requireAdminSession, hashPassword } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function saveUserAction(data: any, id?: string) {
  const session = await requireAdminSession()

  // Verify Super Admin
  if (session.roleName !== 'Super Admin') {
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

      await createAuditLog({
        userId: session.id,
        module: 'USER_MANAGEMENT',
        action: 'UPDATE_USER',
        recordId: id,
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

      await createAuditLog({
        userId: session.id,
        module: 'USER_MANAGEMENT',
        action: 'CREATE_USER',
        recordId: created.id,
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
  if (session.roleName !== 'Super Admin') {
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

    await createAuditLog({
      userId: session.id,
      module: 'USER_MANAGEMENT',
      action: 'MOVE_USER_TO_TRASH',
      recordId: id,
    })

    revalidatePath('/admin/users')
    return { success: true, message: 'User moved to Trash.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to trash user.' }
  }
}

export async function restoreUserAction(id: string) {
  const session = await requireAdminSession()
  if (session.roleName !== 'Super Admin') {
    return { success: false, error: 'FORBIDDEN: Only Super Admin can restore users.' }
  }

  try {
    await db.user.update({
      where: { id },
      data: { isDeleted: false },
    })

    await createAuditLog({
      userId: session.id,
      module: 'USER_MANAGEMENT',
      action: 'RESTORE_USER',
      recordId: id,
    })

    revalidatePath('/admin/users')
    return { success: true, message: 'User restored from Trash.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to restore user.' }
  }
}

export async function deleteUserPermanentlyAction(id: string) {
  const session = await requireAdminSession()
  if (session.roleName !== 'Super Admin') {
    return { success: false, error: 'FORBIDDEN: Only Super Admin can permanently delete users.' }
  }

  try {
    await db.user.delete({ where: { id } })
    await createAuditLog({
      userId: session.id,
      module: 'USER_MANAGEMENT',
      action: 'PERMANENT_DELETE_USER',
      recordId: id,
    })

    revalidatePath('/admin/users')
    return { success: true, message: 'User account permanently deleted.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to permanently delete user.' }
  }
}
