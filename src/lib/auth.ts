import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Please configure it in your .env file.')
}
const COOKIE_NAME = 'qimd_admin_token'

export interface SessionUser {
  id: string
  fullName: string
  email: string
  role: string
  roleName: string
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signJwtToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '7d' })
}

export function verifyJwtToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as { userId: string }
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const decoded = verifyJwtToken(token)
    if (!decoded?.userId) return null

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.status) return null

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role || 'ADMIN',
      roleName: user.role || 'ADMIN',
    }
  } catch (err) {
    console.error('Session retrieval error:', err)
    return null
  }
}

export async function requireAdminSession(): Promise<SessionUser> {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('UNAUTHORIZED: Admin authentication required')
  }
  return session
}

export async function requireSuperAdminSession(): Promise<SessionUser> {
  const session = await requireAdminSession()
  const allowed = ['SUPER_ADMIN', 'Super Admin']
  if (!allowed.includes(session.roleName)) {
    throw new Error('FORBIDDEN: Super Admin role privileges required')
  }
  return session
}

export async function requireContentManagerSession(): Promise<SessionUser> {
  const session = await requireAdminSession()
  const allowed = ['SUPER_ADMIN', 'Super Admin', 'ADMIN', 'Admin', 'CONTENT_MANAGER', 'Content Manager', 'EMPLOYEE', 'Employee']
  if (!allowed.includes(session.roleName)) {
    throw new Error('FORBIDDEN: Content Manager privileges required')
  }
  return session
}


export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'
  
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  })
}
