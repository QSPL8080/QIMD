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
    careerCount,
    franchiseCount,
    hireCount,
    courseCount,
    blogCount,
    trainerCount,
    placementCount,
    testimonialCount,
    faqCount,
    galleryCount,
    recentContacts,
    recentAdmissions,
    recentLogs,
  ] = await Promise.all([
    db.contactEnquiry.count({ where: { isDeleted: false } }),
    db.admissionEnquiry.count({ where: { isDeleted: false } }),
    db.careerEnquiry.count({ where: { isDeleted: false } }),
    db.franchisePartnerEnquiry.count({ where: { isDeleted: false } }),
    db.companyPlacementEnquiry.count({ where: { isDeleted: false } }),
    db.course.count({ where: { isDeleted: false } }),
    db.blog.count({ where: { isDeleted: false } }),
    db.trainer.count({ where: { isDeleted: false } }),
    db.placement.count({ where: { isDeleted: false } }),
    db.testimonial.count({ where: { isDeleted: false } }),
    db.faq.count({ where: { isDeleted: false } }),
    db.gallery.count({ where: { isDeleted: false } }),
    db.contactEnquiry.findMany({ where: { isDeleted: false }, take: 5, orderBy: { createdAt: 'desc' } }),
    db.admissionEnquiry.findMany({ where: { isDeleted: false }, take: 5, orderBy: { createdAt: 'desc' }, include: { course: true } }),
    db.auditLog.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { user: true } }),
  ])

  const totalLeads = contactCount + admissionCount + careerCount + franchiseCount + hireCount

  return (
    <div className="space-y-8 font-sans">
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

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-5 rounded-2xl shadow-2xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Total Enquiries & CRM</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Icon icon="ion:mail-unread" className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-950">{totalLeads}</div>
          <p className="text-xs sm:text-sm text-emerald-700/80 font-normal">Contact, admission, career & hiring requests</p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-2xl shadow-2xs space-y-2 hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Admission Enquiries</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Icon icon="ion:school" className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-950">{admissionCount}</div>
          <p className="text-xs sm:text-sm text-amber-700/80 font-normal">Brochure downloads & course leads</p>
        </div>

        <div className="bg-blue-50/70 border border-blue-200/80 p-5 rounded-2xl shadow-2xs space-y-2 hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">Active Courses</span>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Icon icon="ion:book" className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-950">{courseCount}</div>
          <p className="text-xs sm:text-sm text-blue-700/80 font-normal">Managed in CMS database</p>
        </div>

        <div className="bg-purple-50/70 border border-purple-200/80 p-5 rounded-2xl shadow-2xs space-y-2 hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-800">Placements Showcase</span>
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Icon icon="ion:trophy" className="w-5.5 h-5.5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-950">{placementCount}</div>
          <p className="text-xs sm:text-sm text-purple-700/80 font-normal">Student success records</p>
        </div>
      </div>

      {/* Secondary Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <div className="bg-teal-50/80 border border-teal-200/80 p-3.5 rounded-xl text-center">
          <span className="text-xs uppercase font-bold tracking-wider text-teal-700">Blogs</span>
          <p className="text-xl font-bold text-teal-900 mt-0.5">{blogCount}</p>
        </div>
        <div className="bg-indigo-50/80 border border-indigo-200/80 p-3.5 rounded-xl text-center">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-700">Trainers</span>
          <p className="text-xl font-bold text-indigo-900 mt-0.5">{trainerCount}</p>
        </div>
        <div className="bg-rose-50/80 border border-rose-200/80 p-3.5 rounded-xl text-center">
          <span className="text-xs uppercase font-bold tracking-wider text-rose-700">Testimonials</span>
          <p className="text-xl font-bold text-rose-900 mt-0.5">{testimonialCount}</p>
        </div>
        <div className="bg-sky-50/80 border border-sky-200/80 p-3.5 rounded-xl text-center">
          <span className="text-xs uppercase font-bold tracking-wider text-sky-700">FAQs</span>
          <p className="text-xl font-bold text-sky-900 mt-0.5">{faqCount}</p>
        </div>
        <div className="bg-violet-50/80 border border-violet-200/80 p-3.5 rounded-xl text-center">
          <span className="text-xs uppercase font-bold tracking-wider text-violet-700">Gallery Items</span>
          <p className="text-xl font-bold text-violet-900 mt-0.5">{galleryCount}</p>
        </div>
        <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-xl text-center">
          <span className="text-xs uppercase font-bold tracking-wider text-amber-700">Franchise Proposals</span>
          <p className="text-xl font-bold text-amber-900 mt-0.5">{franchiseCount}</p>
        </div>
      </div>

      {/* CRM Quick Actions & Leads Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admission Enquiries */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:school-outline" className="w-5 h-5 text-amber-600" />
              Recent Admission Enquiries
            </h2>
            <Link href="/admin/enquiries/admission" className="text-xs text-blue-600 font-semibold hover:underline">
              View All Admission Leads
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
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{c.studentName}</td>
                      <td className="p-3">{c.email}<br/><span className="text-slate-400">{c.phone}</span></td>
                      <td className="p-3 font-medium text-slate-800">{c.course?.courseName || 'AI Practical Program'}</td>
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

        {/* Quick Actions Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:flash-outline" className="w-5 h-5 text-amber-500" />
            Quick Admin Tools & Export
          </h2>
          <div className="space-y-2.5 text-xs">
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
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon icon="ion:download-outline" className="w-4 h-4 text-amber-600" />
                <span className="font-medium">Export Admission Leads (CSV)</span>
              </div>
              <Icon icon="ion:chevron-forward-outline" className="w-4 h-4 text-slate-400" />
            </a>

            {session.roleName === 'Super Admin' && (
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon icon="ion:people-circle-outline" className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium">Manage Admin Users & Roles</span>
                </div>
                <Icon icon="ion:chevron-forward-outline" className="w-4 h-4 text-slate-400" />
              </Link>
            )}

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

            <Link
              href="/admin/media-library"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon icon="ion:cloud-upload-outline" className="w-4 h-4 text-sky-600" />
                <span className="font-medium">Media Library & Uploads</span>
              </div>
              <Icon icon="ion:chevron-forward-outline" className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Audit Log */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Icon icon="ion:shield-outline" className="w-5 h-5 text-blue-600" />
            Security & Audit Activity Trail
          </h2>
          <Link href="/admin/audit-logs" className="text-xs text-blue-600 font-semibold hover:underline">
            View All Logs
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentLogs.map((log) => (
            <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="text-blue-700 font-bold">{log.module}</span>
                <span className="text-slate-400 text-[10px]">{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-slate-800 font-medium">{log.action}</p>
              <p className="text-[10px] text-slate-500">By: {log.user?.fullName || 'System'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
