import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes (except the sign-in and password-reset pages)
  const open = ['/admin/login', '/admin/forgot-password', '/admin/reset-password']
  if (pathname.startsWith('/admin') && !open.includes(pathname.replace(/\/+$/, ''))) {
    const token = request.cookies.get('qimd_admin_token')?.value

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Pass the path on so the admin layout can apply role-based page access
  const headers = new Headers(request.headers)
  headers.set('x-pathname', pathname)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/admin/:path*'],
}
