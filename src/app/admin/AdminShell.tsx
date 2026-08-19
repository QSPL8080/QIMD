'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import { logoutAdminAction } from '@/app/actions/authActions'
import { siteConfig } from '@/data'

interface AdminShellProps {
  session: {
    id: string
    fullName: string
    email: string
    roleName: string
  }
  children: React.ReactNode
}

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

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-800 flex overflow-hidden font-sans relative">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:shadow-xs lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo (h-16 matches top bar) */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white">
          <Link href="/admin/dashboard" className="flex items-center justify-center py-1 flex-1">
            <Image
              src="/images/logo/qimd-logo.png"
              alt="QIMD Institute Logo"
              width={180}
              height={50}
              className="h-10 w-auto object-contain max-w-[170px]"
              priority
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close menu"
          >
            <Icon icon="ion:close-outline" className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 p-3 space-y-6 overflow-y-auto no-scrollbar">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
              Overview
            </p>
            <div className="space-y-0.5">
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/dashboard'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:grid-outline" className="w-5 h-5 text-blue-600 flex-shrink-0" />
                Dashboard
              </Link>
            </div>
          </div>

          {/* CRM / Enquiries Block - Hidden for Content Manager */}
          {session.roleName !== 'Content Manager' && session.roleName !== 'CONTENT_MANAGER' && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                CRM / Enquiries
              </p>
              <div className="space-y-0.5">
                <Link
                  href="/admin/enquiries/contact"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === '/admin/enquiries/contact'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                  }`}
                >
                  <Icon icon="ion:mail-unread-outline" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  Contact Enquiry
                </Link>
                <Link
                  href="/admin/enquiries/careers"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === '/admin/enquiries/careers'
                      ? 'bg-purple-50 text-purple-800 font-semibold'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                  }`}
                >
                  <Icon icon="ion:briefcase-outline" className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  Career Enquiry
                </Link>
                <Link
                  href="/admin/enquiries/hire"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === '/admin/enquiries/hire'
                      ? 'bg-rose-50 text-rose-800 font-semibold'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                  }`}
                >
                  <Icon icon="ion:people-outline" className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  Company Placement Enquiry
                </Link>
                <Link
                  href="/admin/enquiries/franchise"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === '/admin/enquiries/franchise'
                      ? 'bg-indigo-50 text-indigo-800 font-semibold'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                  }`}
                >
                  <Icon icon="ion:business-outline" className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  Franchise/Partner Enquiry
                </Link>
                <Link
                  href="/admin/enquiries/admission"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === '/admin/enquiries/admission'
                      ? 'bg-amber-50 text-amber-800 font-semibold'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                  }`}
                >
                  <Icon icon="ion:school-outline" className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  Admission Enquiry
                </Link>
              </div>
            </div>
          )}

          {/* WEBSITE CMS CONTENT */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
              WEBSITE CMS CONTENT
            </p>
            <div className="space-y-0.5">
              <Link
                href="/admin/courses"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/courses'
                    ? 'bg-sky-50 text-sky-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:book-outline" className="w-5 h-5 text-sky-600 flex-shrink-0" />
                Courses
              </Link>
              <Link
                href="/admin/course-categories"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/course-categories'
                    ? 'bg-cyan-50 text-cyan-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:folder-open-outline" className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                Course Categories
              </Link>
              <Link
                href="/admin/careers"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/careers'
                    ? 'bg-violet-50 text-violet-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:newspaper-outline" className="w-5 h-5 text-violet-600 flex-shrink-0" />
                Job Openings
              </Link>
              <Link
                href="/admin/blogs"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/blogs'
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:document-text-outline" className="w-5 h-5 text-teal-600 flex-shrink-0" />
                Blogs & Articles
              </Link>
              <Link
                href="/admin/team"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/team'
                    ? 'bg-[#764DFF]/10 text-[#5c38d6] font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:people-outline" className="w-5 h-5 text-[#764DFF] flex-shrink-0" />
                Team Page
              </Link>
              <Link
                href="/admin/trainers"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/trainers'
                    ? 'bg-pink-50 text-pink-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:school-outline" className="w-5 h-5 text-pink-600 flex-shrink-0" />
                Trainer Page
              </Link>
              <Link
                href="/admin/placements"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/placements'
                    ? 'bg-amber-50 text-amber-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:trophy-outline" className="w-5 h-5 text-amber-600 flex-shrink-0" />
                Recently Placed Students
              </Link>
              <Link
                href="/admin/testimonials"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/testimonials'
                    ? 'bg-purple-50 text-purple-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:videocam-outline" className="w-5 h-5 text-purple-600 flex-shrink-0" />
                Student Testimonials
              </Link>
              <Link
                href="/admin/reviews"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/reviews'
                    ? 'bg-indigo-50 text-indigo-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:chatbubble-ellipses-outline" className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                Student Reviews
              </Link>
              <Link
                href="/admin/faqs"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/faqs'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:help-circle-outline" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                FAQs
              </Link>
              <Link
                href="/admin/partners"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/partners'
                    ? 'bg-indigo-50 text-indigo-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:briefcase-outline" className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                Hiring & EMI Partners
              </Link>
              <Link
                href="/admin/gallery"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/gallery'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:images-outline" className="w-5 h-5 text-blue-600 flex-shrink-0" />
                Gallery
              </Link>

              <Link
                href="/admin/header"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/header'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:browsers-outline" className="w-5 h-5 text-blue-600 flex-shrink-0" />
                Header
              </Link>
              <Link
                href="/admin/footer"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/footer'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:layers-outline" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                Footer
              </Link>
              <Link
                href="/admin/social-links"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/admin/social-links'
                    ? 'bg-purple-50 text-purple-800 font-semibold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon icon="ion:share-social-outline" className="w-5 h-5 text-purple-600 flex-shrink-0" />
                Social Links CMS
              </Link>
            </div>
          </div>

          {/* ADMINISTRATION */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
              ADMINISTRATION
            </p>
            <div className="space-y-0.5">
              {(session.roleName === 'SUPER_ADMIN' || session.roleName === 'Super Admin' || session.roleName === 'ADMIN' || session.roleName === 'Admin') && (
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === '/admin/users'
                      ? 'bg-indigo-50 text-indigo-800 font-semibold'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                  }`}
                >
                  <Icon icon="ion:people-circle-outline" className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  User Management
                </Link>
              )}
              {session.roleName !== 'Content Manager' && session.roleName !== 'CONTENT_MANAGER' && (
                <>
                  <Link
                    href="/admin/reports"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname === '/admin/reports'
                        ? 'bg-purple-50 text-purple-800 font-semibold'
                        : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                    }`}
                  >
                    <Icon icon="ion:stats-chart-outline" className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    Reports & Export
                  </Link>
                  <Link
                    href="/admin/audit-logs"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname === '/admin/audit-logs'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                    }`}
                  >
                    <Icon icon="ion:list-outline" className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    Audit Logs
                  </Link>
                  <Link
                    href="/admin/settings"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname === '/admin/settings'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/70'
                    }`}
                  >
                    <Icon icon="ion:settings-outline" className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    Website Settings
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Admin Profile Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
              {session.fullName ? session.fullName.charAt(0) : 'A'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{session.fullName}</p>
              <span className="inline-block text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium border border-blue-200">
                {session.roleName}
              </span>
            </div>
          </div>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              title="Sign out"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Icon icon="ion:log-out-outline" className="w-5 h-5" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
        {/* Main Header (h-16) */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-2xs flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Open Navigation Menu"
            >
              <Icon icon="ion:menu-outline" className="w-6 h-6" />
            </button>

            <Link
              href="/admin/website-management"
              className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs ${
                pathname?.startsWith('/admin/website-management')
                  ? 'bg-purple-100 text-purple-800 border border-purple-300 font-bold'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100/80 border border-purple-200'
              }`}
            >
              <Icon icon="ion:desktop-outline" className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-purple-600" />
              <span>Website Management</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-3 sm:px-3.5 py-1.5 rounded-lg hover:bg-blue-100/60 transition-colors shadow-2xs"
            >
              <Icon icon="ion:open-outline" className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="hidden sm:inline">View Public Website</span>
              <span className="sm:hidden">Website</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100/80 px-3 sm:px-4 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm">
              <Icon icon="ion:person-circle-outline" className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600 flex-shrink-0" />
              <span className="text-slate-500 font-medium hidden sm:inline">Account:</span>
              <span className="text-slate-900 font-semibold truncate max-w-[140px] sm:max-w-[260px]">{session.email}</span>
            </div>
          </div>
        </header>

        {/* Main Content View Container */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto no-scrollbar w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
