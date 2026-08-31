import React from 'react'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const [
    contactCount,
    admissionCount,
    franchiseCount,
    careerCount,
    hireCount,
    courseCount,
    blogCount,
    teamCount,
    trainerCount,
    jobOpeningCount,
    testimonialCount,
    placementCount,
    reviewCount,
    faqCount,
    galleryCount,
    recentContacts,
    recentAdmissions,
    recentFranchises,
    recentBlogs,
    recentReviews,
    recentLogs,
  ] = await Promise.all([
    db.contactEnquiry.count({ where: { isDeleted: false } }),
    db.admissionEnquiry.count({ where: { isDeleted: false } }),
    db.franchisePartnerEnquiry.count({ where: { isDeleted: false } }),
    db.careerEnquiry.count({ where: { isDeleted: false } }),
    db.companyPlacementEnquiry.count({ where: { isDeleted: false } }),
    db.course.count({ where: { isDeleted: false } }),
    db.blog.count({ where: { isDeleted: false } }),
    db.teamMember.count({ where: { isDeleted: false } }),
    db.trainer.count({ where: { isDeleted: false } }),
    db.jobOpening.count({ where: { isDeleted: false } }),
    db.testimonial.count({ where: { isDeleted: false } }),
    db.placement.count({ where: { isDeleted: false } }),
    db.studentReview.count({ where: { isDeleted: false } }),
    db.faq.count({ where: { isDeleted: false } }),
    db.gallery.count({ where: { isDeleted: false } }),
    db.contactEnquiry.findMany({ where: { isDeleted: false }, take: 5, orderBy: { createdAt: 'desc' } }),
    db.admissionEnquiry.findMany({ where: { isDeleted: false }, take: 5, orderBy: { createdAt: 'desc' }, include: { course: true } }),
    db.franchisePartnerEnquiry.findMany({ where: { isDeleted: false }, take: 4, orderBy: { createdAt: 'desc' } }),
    db.blog.findMany({ where: { isDeleted: false }, take: 4, orderBy: { createdAt: 'desc' } }),
    db.studentReview.findMany({ where: { isDeleted: false }, take: 4, orderBy: { createdAt: 'desc' } }),
    db.auditLog.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: true } }),
  ])

  return (
    <div className="space-y-6 font-sans">
      {/* Light Mode Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {session.fullName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            System Active • Role: <strong className="text-blue-700 font-semibold">{session.roleName}</strong> • PostgreSQL Local (5432)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20"
          >
            <Icon icon="ion:add-circle-outline" className="w-4.5 h-4.5" />
            Add Course
          </Link>
          <Link
            href="/admin/blogs"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm shadow-emerald-500/20"
          >
            <Icon icon="ion:document-text-outline" className="w-4.5 h-4.5" />
            New Blog
          </Link>
        </div>
      </div>

      {/* ─── ROW 1: ENQUIRIES (4 Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Admission Enquiry */}
        <Link
          href="/admin/enquiries/admission"
          className="bg-amber-50/50 hover:bg-amber-50/80 border border-amber-200/60 p-5 rounded-2xl shadow-2xs space-y-2 hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Admission Enquiry</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Icon icon="ion:school" className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{admissionCount}</div>
          <p className="text-xs text-slate-500 font-medium">Student leads & brochure downloads</p>
        </Link>

        {/* 2. Franchise Enquiry */}
        <Link
          href="/admin/enquiries/franchise"
          className="bg-orange-50/50 hover:bg-orange-50/80 border border-orange-200/60 p-5 rounded-2xl shadow-2xs space-y-2 hover:border-orange-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-800">Franchise Enquiry</span>
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Icon icon="ion:business" className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{franchiseCount}</div>
          <p className="text-xs text-slate-500 font-medium">Franchise partner proposals & leads</p>
        </Link>

        {/* 3. Career Enquiry */}
        <Link
          href="/admin/enquiries/careers"
          className="bg-emerald-50/50 hover:bg-emerald-50/80 border border-emerald-200/60 p-5 rounded-2xl shadow-2xs space-y-2 hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Career Enquiry</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Icon icon="ion:briefcase" className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{careerCount}</div>
          <p className="text-xs text-slate-500 font-medium">Job applicant submissions & resumes</p>
        </Link>

        {/* 4. Placement Enquiry */}
        <Link
          href="/admin/enquiries/hire"
          className="bg-purple-50/50 hover:bg-purple-50/80 border border-purple-200/60 p-5 rounded-2xl shadow-2xs space-y-2 hover:border-purple-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">Placement Enquiry</span>
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Icon icon="ion:people" className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{hireCount}</div>
          <p className="text-xs text-slate-500 font-medium">Company hiring & recruiter requests</p>
        </Link>
      </div>

      {/* ─── ROW 2: CMS ENTITIES (10 Cards in 1 Row) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
        {/* 1. Courses */}
        <Link
          href="/admin/courses"
          className="bg-blue-50/60 hover:bg-blue-50 border border-blue-200/60 p-3 rounded-xl text-center transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-bold tracking-wider text-blue-700 truncate">
            <Icon icon="ion:book-outline" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Courses</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{courseCount}</p>
        </Link>

        {/* 2. Blogs */}
        <Link
          href="/admin/blogs"
          className="bg-teal-50/60 hover:bg-teal-50 border border-teal-200/60 p-3 rounded-xl text-center transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-bold tracking-wider text-teal-700 truncate">
            <Icon icon="ion:newspaper-outline" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Blogs</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{blogCount}</p>
        </Link>

        {/* 3. Team */}
        <Link
          href="/admin/team"
          className="bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200/60 p-3 rounded-xl text-center transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-bold tracking-wider text-indigo-700 truncate">
            <Icon icon="ion:people-outline" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Team</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{teamCount}</p>
        </Link>

        {/* 4. Trainers */}
        <Link
          href="/admin/trainers"
          className="bg-cyan-50/60 hover:bg-cyan-50 border border-cyan-200/60 p-3 rounded-xl text-center transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-bold tracking-wider text-cyan-700 truncate">
            <Icon icon="ion:person-outline" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Trainers</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{trainerCount}</p>
        </Link>

        {/* 5. Job Openings */}
        <Link
          href="/admin/careers"
          className="bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/60 p-3 rounded-xl text-center transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-bold tracking-wider text-emerald-700 truncate">
            <Icon icon="ion:briefcase-outline" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Job Openings</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{jobOpeningCount}</p>
        </Link>

        {/* 6. Testimonial */}
        <Link
          href="/admin/testimonials"
          className="bg-rose-50/60 hover:bg-rose-50 border border-rose-200/60 p-3 rounded-xl text-center transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-bold tracking-wider text-rose-700 truncate">
            <Icon icon="ion:chatbubble-ellipses-outline" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Testimonials</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{testimonialCount}</p>
        </Link>

        {/* 7. Placed Student */}
        <Link
          href="/admin/placements"
          className="bg-fuchsia-50/60 hover:bg-fuchsia-50 border border-fuchsia-200/60 p-3 rounded-xl text-center transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-bold tracking-wider text-fuchsia-700 truncate">
            <Icon icon="ion:trophy-outline" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Placed Students</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{placementCount}</p>
        </Link>

        {/* 8. Review */}
        <Link
          href="/admin/reviews"
          className="bg-amber-50/60 hover:bg-amber-50 border border-amber-200/60 p-3 rounded-xl text-center transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-bold tracking-wider text-amber-700 truncate">
            <Icon icon="ion:star-outline" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Reviews</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{reviewCount}</p>
        </Link>

        {/* 9. FAQs */}
        <Link
          href="/admin/faqs"
          className="bg-sky-50/60 hover:bg-sky-50 border border-sky-200/60 p-3 rounded-xl text-center transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-bold tracking-wider text-sky-700 truncate">
            <Icon icon="ion:help-circle-outline" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">FAQs</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{faqCount}</p>
        </Link>

        {/* 10. Gallery Item */}
        <Link
          href="/admin/gallery"
          className="bg-violet-50/60 hover:bg-violet-50 border border-violet-200/60 p-3 rounded-xl text-center transition-all hover:scale-[1.02] shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-bold tracking-wider text-violet-700 truncate">
            <Icon icon="ion:images-outline" className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Gallery Items</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{galleryCount}</p>
        </Link>
      </div>

      {/* ─── MIDDLE SECTION: CRM LEADS & QUICK TOOLS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admission Enquiries Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:school-outline" className="w-5 h-5 text-amber-600" />
              Recent Admission Enquiries
            </h2>
            <Link href="/admin/enquiries/admission" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              <span>View All Leads</span>
              <Icon icon="ion:arrow-forward" className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Target Course</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">
                      No admission enquiries submitted yet.
                    </td>
                  </tr>
                ) : (
                  recentAdmissions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{c.studentName}</td>
                      <td className="p-3">
                        <span className="font-medium text-slate-800">{c.email}</span>
                        <br />
                        <span className="text-slate-400 text-[11px]">{c.phone}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{c.course?.courseName || 'General Enquiry'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'NEW' || c.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          c.status === 'CONTACTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Tools & Shortcuts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:flash-outline" className="w-5 h-5 text-amber-500" />
              Quick Admin Tools
            </h2>
            <p className="text-xs text-slate-500 mt-1">Frequently used platform actions and exports</p>
          </div>

          <div className="space-y-2 text-xs">
            <Link
              href="/admin/brochures"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200 text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon icon="ion:document-attach-outline" className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Manage Course Brochures</span>
              </div>
              <Icon icon="ion:chevron-forward-outline" className="w-4 h-4 text-slate-400" />
            </Link>

            <a
              href="/api/export?type=admission"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon icon="ion:download-outline" className="w-4 h-4 text-amber-600" />
                <span className="font-medium">Export Admission Leads (CSV)</span>
              </div>
              <Icon icon="ion:chevron-forward-outline" className="w-4 h-4 text-slate-400" />
            </a>

            <Link
              href="/admin/media-library"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200 text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon icon="ion:cloud-upload-outline" className="w-4 h-4 text-sky-600" />
                <span className="font-medium">Media Library & Files</span>
              </div>
              <Icon icon="ion:chevron-forward-outline" className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon icon="ion:settings-outline" className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Website Settings & SEO</span>
              </div>
              <Icon icon="ion:chevron-forward-outline" className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Next.js 15 App Router</span>
            <span className="font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> DB Healthy
            </span>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM SECTION: RECENT CONTENT & COMPACT SECURITY AUDIT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compact Security & Audit Activity Trail */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:shield-checkmark-outline" className="w-4.5 h-4.5 text-blue-600" />
              Security & Audit Activity Trail
            </h2>
            <Link href="/admin/audit-logs" className="text-xs text-blue-600 font-semibold hover:underline">
              View All Logs
            </Link>
          </div>

          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200/60 uppercase shrink-0">
                    {log.module}
                  </span>
                  <span className="font-medium text-slate-800 truncate">{log.action}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-slate-400 text-[11px]">
                  <span className="text-slate-500 font-medium hidden sm:inline">{log.user?.fullName || 'System'}</span>
                  <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Blogs & Website Content Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:newspaper-outline" className="w-4.5 h-4.5 text-emerald-600" />
              Recent Blogs & Published Updates
            </h2>
            <Link href="/admin/blogs" className="text-xs text-blue-600 font-semibold hover:underline">
              Manage Blogs
            </Link>
          </div>

          <div className="space-y-2">
            {recentBlogs.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No blogs published yet.</p>
            ) : (
              recentBlogs.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon icon="ion:document-text-outline" className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{b.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                    <Link href={`/admin/blogs`} className="text-blue-600 hover:text-blue-700 font-semibold text-[11px]">
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

