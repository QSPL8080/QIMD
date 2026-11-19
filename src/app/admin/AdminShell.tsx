'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import { logoutAdminAction } from '@/app/actions/authActions'

interface AdminShellProps {
  session: {
    id: string
    fullName: string
    email: string
    roleName: string
  }
  children: React.ReactNode
}

type NavItem = { href: string; label: string; icon: string }
type NavGroup = { title: string; items: NavItem[]; show?: boolean }

const isSuperAdminRole = (role: string) => role === 'SUPER_ADMIN' || role === 'Super Admin'
const isSeoRole = (role: string) => role === 'SEO'

export default function AdminShell({ session, children }: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile drawer when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Do not render admin sidebar or header shell on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const seoGroups: NavGroup[] = [
    {
      title: 'Website Content',
      items: [{ href: '/admin/blogs', label: 'Blogs & Articles', icon: 'ion:document-text-outline' }],
    },
  ]

  const adminGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: 'ion:grid-outline' }],
    },
    {
      title: 'Leads',
      items: [
        { href: '/admin/enquiries/admission', label: 'Admission Enquiries', icon: 'ion:school-outline' },
        { href: '/admin/enquiries/contact', label: 'Contact Enquiries', icon: 'ion:mail-outline' },
        { href: '/admin/enquiries/careers', label: 'Career Applications', icon: 'ion:briefcase-outline' },
        { href: '/admin/enquiries/hire', label: 'Hire Requests', icon: 'ion:business-outline' },
        { href: '/admin/enquiries/franchise', label: 'Franchise Enquiries', icon: 'ion:storefront-outline' },
      ],
    },
    {
      title: 'Website Content',
      items: [
        { href: '/admin/banners', label: 'Homepage Banners', icon: 'ion:images-outline' },
        { href: '/admin/blogs', label: 'Blogs & Articles', icon: 'ion:document-text-outline' },
        { href: '/admin/careers', label: 'Job Openings', icon: 'ion:clipboard-outline' },
        { href: '/admin/placements', label: 'Placed Students', icon: 'ion:ribbon-outline' },
        { href: '/admin/testimonials', label: 'Testimonials', icon: 'ion:videocam-outline' },
        { href: '/admin/reviews', label: 'Student Reviews', icon: 'ion:star-outline' },
        { href: '/admin/faqs', label: 'FAQs', icon: 'ion:help-circle-outline' },
        { href: '/admin/gallery', label: 'Gallery', icon: 'ion:camera-outline' },
      ],
    },
    {
      title: 'Access',
      show: isSuperAdminRole(session.roleName),
      items: [{ href: '/admin/users', label: 'Admin Users', icon: 'ion:people-outline' }],
    },
  ]

  const groups = isSeoRole(session.roleName) ? seoGroups : adminGroups

  const isActive = (href: string) => pathname === href || (href !== '/admin/dashboard' && pathname?.startsWith(href + '/'))

  return (
    <div className="qad">
      {mobileMenuOpen && <div className="qad-backdrop" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`qad-side${mobileMenuOpen ? ' is-open' : ''}`}>
        <div className="qad-brand">
          <Link href={isSeoRole(session.roleName) ? '/admin/blogs' : '/admin/dashboard'} className="qad-brand-link" aria-label="QIMD Admin">
            <Image src="/images/logo/footer-qimd.png" alt="QIMD" width={180} height={70} priority />
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="qad-icon-btn qad-only-mobile" title="Close menu">
            <Icon icon="ion:close-outline" />
          </button>
        </div>

        <nav className="qad-nav">
          {groups
            .filter((g) => g.show !== false)
            .map((g) => (
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
            <small>{session.roleName}</small>
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
          <div className="qad-account">
            <Icon icon="ion:person-circle-outline" />
            <span className="qad-account-email">{session.email}</span>
          </div>
        </header>

        <main className="qad-main">{children}</main>
      </div>
    </div>
  )
}
