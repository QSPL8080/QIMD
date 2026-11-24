import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'

/** Program for a lead (saved in the lead message as "Program: …") */
function programOf(lead: any): string {
  return lead?.message?.match(/^Program: (.+)$/m)?.[1] || 'Not specified'
}

const statusClass = (status: string) =>
  status === 'NEW' || status === 'PENDING' ? 'is-new' : status === 'CONTACTED' ? 'is-done' : 'is-muted'

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const [
    admissionCount,
    contactCount,
    careerCount,
    hireCount,
    franchiseCount,
    bannerCount,
    blogCount,
    jobOpeningCount,
    placementCount,
    testimonialCount,
    reviewCount,
    faqCount,
    galleryCount,
    recentAdmissions,
    recentContacts,
    recentBlogs,
  ] = await Promise.all([
    db.admissionEnquiry.count({ where: { isDeleted: false } }),
    db.contactEnquiry.count({ where: { isDeleted: false } }),
    db.careerEnquiry.count({ where: { isDeleted: false } }),
    db.companyPlacementEnquiry.count({ where: { isDeleted: false } }),
    db.franchisePartnerEnquiry.count({ where: { isDeleted: false } }),
    db.banner.count({ where: { isDeleted: false } }),
    db.blog.count({ where: { isDeleted: false } }),
    db.jobOpening.count({ where: { isDeleted: false } }),
    db.placement.count({ where: { isDeleted: false } }),
    db.testimonial.count({ where: { isDeleted: false } }),
    db.studentReview.count({ where: { isDeleted: false } }),
    db.faq.count({ where: { isDeleted: false } }),
    db.gallery.count({ where: { isDeleted: false } }),
    db.admissionEnquiry.findMany({ where: { isDeleted: false }, take: 6, orderBy: { createdAt: 'desc' } }),
    db.contactEnquiry.findMany({ where: { isDeleted: false }, take: 5, orderBy: { createdAt: 'desc' } }),
    db.blog.findMany({ where: { isDeleted: false }, take: 4, orderBy: { createdAt: 'desc' } }),
  ])

  const leads = [
    { label: 'Admission Enquiries', count: admissionCount, href: '/admin/enquiries/admission', icon: 'ion:school-outline' },
    { label: 'Contact Enquiries', count: contactCount, href: '/admin/enquiries/contact', icon: 'ion:mail-outline' },
    { label: 'Career Applications', count: careerCount, href: '/admin/enquiries/careers', icon: 'ion:briefcase-outline' },
    { label: 'Hire Requests', count: hireCount, href: '/admin/enquiries/hire', icon: 'ion:business-outline' },
    { label: 'Franchise Enquiries', count: franchiseCount, href: '/admin/enquiries/franchise', icon: 'ion:storefront-outline' },
  ]

  const content = [
    { label: 'Homepage Banners', count: bannerCount, href: '/admin/banners', icon: 'ion:images-outline' },
    { label: 'Blogs', count: blogCount, href: '/admin/blogs', icon: 'ion:document-text-outline' },
    { label: 'Job Openings', count: jobOpeningCount, href: '/admin/careers', icon: 'ion:clipboard-outline' },
    { label: 'Placed Students', count: placementCount, href: '/admin/placements', icon: 'ion:ribbon-outline' },
    { label: 'Testimonials', count: testimonialCount, href: '/admin/testimonials', icon: 'ion:videocam-outline' },
    { label: 'Student Reviews', count: reviewCount, href: '/admin/reviews', icon: 'ion:star-outline' },
    { label: 'FAQs', count: faqCount, href: '/admin/faqs', icon: 'ion:help-circle-outline' },
    { label: 'Gallery Items', count: galleryCount, href: '/admin/gallery', icon: 'ion:camera-outline' },
  ]

  return (
    <div className="qad-dash">
      {/* Welcome */}
      <section className="qad-welcome">
        <div>
          <span className="qad-kicker">Admin Dashboard</span>
          <h1 className="qad-h1">Welcome back, {session.fullName}</h1>
          <p className="qad-muted">
            Signed in as <strong>{session.roleName}</strong>
          </p>
        </div>
        <div className="qad-actions">
          <Link href="/admin/blogs" className="qad-btn qad-btn-main">
            <Icon icon="ion:add-outline" />
            <span>New Blog</span>
          </Link>
          <Link href="/" target="_blank" className="qad-btn qad-btn-light">
            <Icon icon="ion:open-outline" />
            <span>View Website</span>
          </Link>
        </div>
      </section>

      {/* Leads */}
      <section>
        <h2 className="qad-h2">Leads</h2>
        <div className="qad-leads">
          {leads.map((l) => (
            <Link key={l.href} href={l.href} className="qad-lead">
              <span className="qad-lead-ic"><Icon icon={l.icon} /></span>
              <strong>{l.count}</strong>
              <span>{l.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Content */}
      <section>
        <h2 className="qad-h2">Website Content</h2>
        <div className="qad-content">
          {content.map((c) => (
            <Link key={c.href} href={c.href} className="qad-count">
              <Icon icon={c.icon} />
              <span>{c.label}</span>
              <strong>{c.count}</strong>
            </Link>
          ))}
        </div>
      </section>

      <div className="qad-split">
        {/* Recent admissions */}
        <section className="qad-card">
          <div className="qad-card-head">
            <h2 className="qad-h3">Recent Admission Enquiries</h2>
            <Link href="/admin/enquiries/admission" className="qad-link">
              View all <Icon icon="ion:arrow-forward" />
            </Link>
          </div>
          <div className="qad-table-wrap">
            <table className="qad-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Contact</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="qad-empty">No admission enquiries yet.</td>
                  </tr>
                ) : (
                  recentAdmissions.map((c: any) => (
                    <tr key={c.id}>
                      <td className="qad-strong">{c.studentName}</td>
                      <td>
                        {c.email}
                        <small>{c.phone}</small>
                      </td>
                      <td>{programOf(c)}</td>
                      <td><span className={`qad-status ${statusClass(c.status)}`}>{c.status}</span></td>
                      <td className="qad-muted">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <small>{new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="qad-stack">
          {/* Recent contact messages */}
          <section className="qad-card">
            <div className="qad-card-head">
              <h2 className="qad-h3">Latest Contact Messages</h2>
              <Link href="/admin/enquiries/contact" className="qad-link">
                View all <Icon icon="ion:arrow-forward" />
              </Link>
            </div>
            <ul className="qad-list">
              {recentContacts.length === 0 ? (
                <li className="qad-empty">No messages yet.</li>
              ) : (
                recentContacts.map((m: any) => (
                  <li key={m.id}>
                    <span className="qad-avatar-sm">{(m.fullName || 'A').charAt(0)}</span>
                    <span className="qad-list-main">
                      <strong>{m.fullName}</strong>
                      <small>{m.subject || m.email}</small>
                    </span>
                    <span className="qad-muted">
                      {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <small className="block">{new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</small>
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* Recent blogs */}
          <section className="qad-card">
            <div className="qad-card-head">
              <h2 className="qad-h3">Recent Blogs</h2>
              <Link href="/admin/blogs" className="qad-link">
                Manage <Icon icon="ion:arrow-forward" />
              </Link>
            </div>
            <ul className="qad-list">
              {recentBlogs.length === 0 ? (
                <li className="qad-empty">No blogs yet.</li>
              ) : (
                recentBlogs.map((b: any) => (
                  <li key={b.id}>
                    <span className="qad-list-main">
                      <strong>{b.title}</strong>
                      <small>{b.status}</small>
                    </span>
                    <span className="qad-muted">{new Date(b.createdAt).toLocaleDateString()}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
