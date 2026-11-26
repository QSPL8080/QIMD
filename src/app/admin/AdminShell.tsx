'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import { logoutAdminAction } from '@/app/actions/authActions'
import { NotificationBell, AccountMenu, type TopNotification } from './AdminTopActions'
import { can, roleLabel, type Module } from '@/lib/permissions'

interface AdminShellProps {
  session: {
    id: string
    fullName: string
    email: string
    roleName: string
    moduleAccess?: string[]
  }
  /** Items in the Bin; only passed for the Super Admin */
  binCount?: number | null
  /** Notifications for the signed-in user */
  notifications?: { items: TopNotification[]; unread: number } | null
  children: React.ReactNode
}

type NavItem = { href: string; label: string; icon: string; module: Module }
type NavGroup = { title: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    title: 'Overview',
    items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: 'ion:grid-outline', module: 'dashboard' }],
  },
  {
    title: 'Leads',
    items: [{ href: '/admin/leads', label: 'All Leads', icon: 'ion:people-circle-outline', module: 'leads' }],
  },
  {
    title: 'Students & Fees',
    items: [
      { href: '/admin/admissions', label: 'Admissions', icon: 'ion:school-outline', module: 'admissions' },
      { href: '/admin/fees', label: 'Fees & Payments', icon: 'ion:wallet-outline', module: 'fees' },
      { href: '/admin/expenses', label: 'Expenses', icon: 'ion:receipt-outline', module: 'expenses' },
    ],
  },
  {
    title: 'Other Enquiries',
    items: [
      { href: '/admin/enquiries/careers', label: 'Career Applications', icon: 'ion:briefcase-outline', module: 'enquiries' },
      { href: '/admin/enquiries/hire', label: 'Hire Requests', icon: 'ion:business-outline', module: 'enquiries' },
      { href: '/admin/enquiries/franchise', label: 'Franchise Enquiries', icon: 'ion:storefront-outline', module: 'enquiries' },
    ],
  },
  {
    title: 'Website Content',
    items: [
      { href: '/admin/banners', label: 'Homepage Banners', icon: 'ion:images-outline', module: 'content' },
      { href: '/admin/blogs', label: 'Blogs & Articles', icon: 'ion:document-text-outline', module: 'content' },
      { href: '/admin/careers', label: 'Job Openings', icon: 'ion:clipboard-outline', module: 'content' },
      { href: '/admin/placements', label: 'Placed Students', icon: 'ion:ribbon-outline', module: 'content' },
      { href: '/admin/testimonials', label: 'Testimonials', icon: 'ion:videocam-outline', module: 'content' },
      { href: '/admin/reviews', label: 'Student Reviews', icon: 'ion:star-outline', module: 'content' },
      { href: '/admin/faqs', label: 'FAQs', icon: 'ion:help-circle-outline', module: 'content' },
      { href: '/admin/gallery', label: 'Gallery', icon: 'ion:camera-outline', module: 'content' },
    ],
  },
  {
    title: 'Insights',
    items: [{ href: '/admin/reports', label: 'Reports', icon: 'ion:bar-chart-outline', module: 'reports' }],
  },
  {
    title: 'Access',
    items: [
      { href: '/admin/users', label: 'Admin Users', icon: 'ion:people-outline', module: 'users' },
      { href: '/admin/audit', label: 'Audit Log', icon: 'ion:shield-checkmark-outline', module: 'audit' },
      { href: '/admin/settings', label: 'Settings', icon: 'ion:settings-outline', module: 'users' },
    ],
  },
]

export default function AdminShell({ session, binCount = null, notifications = null, children }: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile drawer when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Do not render admin sidebar or header shell on login / password pages
  if (pathname === '/admin/login' || pathname?.startsWith('/admin/forgot-password') || pathname?.startsWith('/admin/reset-password')) {
    return <>{children}</>
  }

  const groups = NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => can(session.roleName, i.module, 'view', session.moduleAccess as Module[])),
  })).filter((g) => g.items.length > 0)

  const isActive = (href: string) => pathname === href || (href !== '/admin/dashboard' && pathname?.startsWith(href + '/'))

  return (
    <div
      className="qad"
      data-content-edit={can(session.roleName, 'content', 'edit', session.moduleAccess as Module[]) ? '1' : '0'}
      data-content-delete={can(session.roleName, 'content', 'delete', session.moduleAccess as Module[]) ? '1' : '0'}
    >
      {mobileMenuOpen && <div className="qad-backdrop" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`qad-side${mobileMenuOpen ? ' is-open' : ''}`}>
        <div className="qad-brand">
          <Link href="/admin/dashboard" className="qad-brand-link" aria-label="QIMD Admin">
            <Image src="/images/logo/footer-qimd.png" alt="QIMD" width={180} height={70} priority />
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="qad-icon-btn qad-only-mobile" title="Close menu">
            <Icon icon="ion:close-outline" />
          </button>
        </div>

        <nav className="qad-nav">
          {groups.map((g) => (
              <div key={g.title} className="qad-nav-group">
                <p className="qad-nav-title">{g.title}</p>
                {g.items.map((item) => (
                  <Link key={item.href} href={item.href} className={`qad-nav-link${isActive(item.href) ? ' is-active' : ''}`}>
                    <Icon icon={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
          ))}
        </nav>

        <div className="qad-profile">
          <span className="qad-avatar">{session.fullName ? session.fullName.charAt(0) : 'A'}</span>
          <span className="qad-profile-who">
            <strong>{session.fullName}</strong>
            <small>{roleLabel(session.roleName)}</small>
          </span>
          <form action={logoutAdminAction}>
            <button type="submit" title="Sign out" className="qad-icon-btn">
              <Icon icon="ion:log-out-outline" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="qad-body">
        <header className="qad-top">
          <div className="qad-top-left">
            <button onClick={() => setMobileMenuOpen(true)} className="qad-icon-btn qad-only-mobile" title="Open menu">
              <Icon icon="ion:menu-outline" />
            </button>
            <Link href="/" target="_blank" className="qad-top-link">
              <Icon icon="ion:open-outline" />
              <span>View Website</span>
            </Link>
          </div>
          <div className="qad-top-right">
            {notifications && <NotificationBell items={notifications.items} unread={notifications.unread} />}
            {binCount !== null && (
              <Link href="/admin/bin" className={`qad-bin-link${pathname?.startsWith('/admin/bin') ? ' is-active' : ''}`}>
                <Icon icon="ion:trash-bin-outline" />
                <span>Bin</span>
                {binCount > 0 && <span className="qad-bin-count">{binCount}</span>}
              </Link>
            )}
            <AccountMenu email={session.email} />
          </div>
        </header>

        <main className="qad-main">{children}</main>
      </div>
    </div>
  )
}
