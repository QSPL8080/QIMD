import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { db } from './db'
import { ROLES, ROLE_LIST, can, normalizeRole, parseModuleAccess, type Action, type Module } from './permissions'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Please configure it in your .env file.')
}
const COOKIE_NAME = 'qimd_admin_token'

export interface SessionUser {
  id: string
  fullName: string
  email: string
  /** Normalised role (see ./permissions) */
  role: string
  roleName: string
  /** Modules granted to a Viewer */
  moduleAccess: Module[]
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signJwtToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '12h' })
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

    const role = normalizeRole(user.role)
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role,
      roleName: role,
      moduleAccess: parseModuleAccess((user as any).moduleAccess),
    }
  } catch (err) {
    console.error('Session retrieval error:', err)
    return null
  }
}

// ─── Roles & permissions ────────────────────────────────────
// The full matrix lives in ./permissions (SRS §3).
export const ROLE_SUPER_ADMIN = ROLES.SUPER_ADMIN
export const ROLE_ADMIN = ROLES.ADMIN
export const ROLE_SEO = ROLES.SEO
export const ROLE_SALES_MANAGER = ROLES.SALES_MANAGER
export const ASSIGNABLE_ROLES = ROLE_LIST.map((r) => r.value)

export const isSuperAdminRole = (role?: string | null) => normalizeRole(role) === 'SUPER_ADMIN'
export const isAdminRole = (role?: string | null) => ['SUPER_ADMIN', 'ADMIN'].includes(normalizeRole(role))
export const isSeoRole = (role?: string | null) => normalizeRole(role) === 'SEO'
export const canManageBlogs = (role?: string | null) => can(role, 'content', 'edit')
export const canManageLeads = (role?: string | null) => can(role, 'leads', 'view')

export class PermissionError extends Error {}

/** Signed-in user allowed to do `action` in `module`; throws otherwise. */
export async function requirePermission(module: Module, action: Action): Promise<SessionUser> {
  const session = await getAdminSession()
  if (!session) {
    throw new PermissionError('UNAUTHORIZED: Please sign in again.')
  }
  if (!can(session.roleName, module, action, session.moduleAccess)) {
    throw new PermissionError('FORBIDDEN: Your role does not allow this action.')
  }
  return session
}

/** Signed-in Super Admin or Admin. */
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

/** Signed-in user who may view leads. */
export async function requireLeadsSession(): Promise<SessionUser> {
  return requirePermission('leads', 'view')
}

/** Signed-in user who may edit website content (blogs etc.). */
export async function requireBlogEditorSession(): Promise<SessionUser> {
  return requirePermission('content', 'edit')
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 12 * 60 * 60, // 12 hours (session expiry)
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
