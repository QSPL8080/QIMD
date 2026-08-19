'use server'

import { comparePassword, setAdminSessionCookie, clearAdminSessionCookie, signJwtToken, getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { loginSchema } from '@/lib/validations'
import { createAuditLog } from '@/lib/audit'
import { redirect } from 'next/navigation'

export async function loginAdminAction(prevState: any, formData: FormData) {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validated = loginSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const user = await db.user.findUnique({
      where: { email: validated.data.email },
    })

    if (!user || !user.status) {
      return { success: false, error: 'Invalid email or account is inactive.' }
    }

    const isValidPassword = await comparePassword(validated.data.password, user.passwordHash)
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password.' }
    }

    // Generate token and set cookie
    const token = signJwtToken({ userId: user.id })
    await setAdminSessionCookie(token)

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    // Log activity
    await createAuditLog({
      userId: user.id,
      module: 'AUTH',
      action: 'ADMIN_LOGIN_SUCCESS',
    })

    return { success: true, redirect: '/admin/dashboard' }
  } catch (err: any) {
    console.error('Login action error:', err)
    return { success: false, error: 'An unexpected server error occurred.' }
  }
}

export async function logoutAdminAction() {
  const session = await getAdminSession()
  if (session) {
    await createAuditLog({
      userId: session.id,
      module: 'AUTH',
      action: 'ADMIN_LOGOUT',
    })
  }
  await clearAdminSessionCookie()
  redirect('/admin/login')
}
