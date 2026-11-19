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

    if (!user || !user.status || user.isDeleted) return null

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

// ─── Roles ──────────────────────────────────────────────────
// SUPER_ADMIN – everything, including admin users
// ADMIN       – leads and all website content
// SEO         – blogs only
export const ROLE_SUPER_ADMIN = 'SUPER_ADMIN'
export const ROLE_ADMIN = 'ADMIN'
export const ROLE_SEO = 'SEO'
export const ASSIGNABLE_ROLES = [ROLE_SUPER_ADMIN, ROLE_ADMIN, ROLE_SEO] as const

export const isSuperAdminRole = (role?: string | null) => role === ROLE_SUPER_ADMIN || role === 'Super Admin'
export const isAdminRole = (role?: string | null) => isSuperAdminRole(role) || role === ROLE_ADMIN || role === 'Admin'
export const isSeoRole = (role?: string | null) => role === ROLE_SEO
export const canManageBlogs = (role?: string | null) => isAdminRole(role) || isSeoRole(role)

/** Signed-in Super Admin or Admin (the SEO role is not allowed). */
export async function requireAdminSession(): Promise<SessionUser> {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('UNAUTHORIZED: Admin authentication required')
  }
  if (!isAdminRole(session.roleName)) {
    throw new Error('FORBIDDEN: Admin role privileges required')
  }
  return session
}

/** Signed-in Super Admin only. */
export async function requireSuperAdminSession(): Promise<SessionUser> {
  const session = await requireAdminSession()
  if (!isSuperAdminRole(session.roleName)) {
    throw new Error('FORBIDDEN: Super Admin role privileges required')
  }
  return session
}

/** Signed-in user who may write blogs: Super Admin, Admin or SEO. */
export async function requireBlogEditorSession(): Promise<SessionUser> {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('UNAUTHORIZED: Admin authentication required')
  }
  if (!canManageBlogs(session.roleName)) {
    throw new Error('FORBIDDEN: Blog editor privileges required')
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
