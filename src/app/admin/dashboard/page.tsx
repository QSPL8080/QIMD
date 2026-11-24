import React from 'react'
import { db } from '@/lib/db'
import {
  getAdminSession,
  isCounsellorRole,
  isSalesManagerRole,
  isAdmissionHeadRole,
  isSeoRole,
  getRoleDisplayName,
} from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'

/** Program for a lead (saved in the lead message as "Program: …") */
function programOf(lead: any): string {
  return lead?.message?.match(/^Program: (.+)$/m)?.[1] || 'Not specified'
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const role = session.roleName

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  // ─────────────────────────────────────────────────────────────
  // 1. COUNSELLOR DASHBOARD
  // ─────────────────────────────────────────────────────────────
  if (isCounsellorRole(role)) {
    const [
      myTotalLeads,
      myFollowUpDue,
      myConvertedLeads,
      myRecentLeads,
      upcomingFollowUps,
    ] = await Promise.all([
      db.admissionEnquiry.count({
        where: { isDeleted: false, assignedToId: session.id },
      }),
      db.admissionEnquiry.count({
        where: {
          isDeleted: false,
          assignedToId: session.id,
          status: { in: ['NEW', 'PENDING', 'FOLLOW_UP_REQUIRED', 'COUNSELLING_SCHEDULED'] },
        },
      }),
      db.admissionEnquiry.count({
        where: { isDeleted: false, assignedToId: session.id, status: 'ADMISSION_CLOSED' },
      }),
      db.admissionEnquiry.findMany({
        where: { isDeleted: false, assignedToId: session.id },
        take: 6,
        orderBy: { updatedAt: 'desc' },
      }),
      db.leadFollowUp.findMany({
        where: {
          createdById: session.id,
          nextFollowUpDate: { gte: now },
        },
        take: 5,
        orderBy: { nextFollowUpDate: 'asc' },
        include: { admissionEnquiry: true },
      }),
    ])

    return (
      <div className="space-y-6 font-sans">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
              Counsellor Workstation
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Welcome, {session.fullName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Track your assigned inquiries, record conversation notes, and manage call-back schedules
            </p>
          </div>
          <Link
            href="/admin/enquiries/admission"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <Icon icon="ion:school-outline" className="w-4 h-4" />
            <span>Open Lead Workstation</span>
          </Link>
        </div>

        {/* Counsellor Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                My Total Leads
              </span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{myTotalLeads}</span>
              <span className="text-[11px] text-slate-400 font-medium">Assigned to you</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Icon icon="ion:people-outline" className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-linear-to-br from-white to-amber-50/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider block">
                Follow-Ups Due
              </span>
              <span className="text-3xl font-black text-amber-700 mt-1 block">{myFollowUpDue}</span>
              <span className="text-[11px] text-amber-600 font-medium">Awaiting action</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Icon icon="ion:time-outline" className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Admitted / Closed
              </span>
              <span className="text-3xl font-black text-teal-700 mt-1 block">{myConvertedLeads}</span>
              <span className="text-[11px] text-slate-400 font-medium">Enrolled students</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Icon icon="ion:checkmark-circle-outline" className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Assigned Leads */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Icon icon="ion:chatbubbles-outline" className="w-5 h-5 text-amber-600" />
                Recent Assigned Leads
              </h2>
              <Link href="/admin/enquiries/admission" className="text-xs font-bold text-amber-700 hover:underline">
                View all →
              </Link>
            </div>

            {myRecentLeads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No leads assigned yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myRecentLeads.map((lead: any) => (
                  <div key={lead.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{lead.studentName}</span>
                      <span className="text-xs text-slate-500 block">
                        {programOf(lead)} • {lead.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {lead.status}
                      </span>
                      <Link
                        href={`/admin/enquiries/admission`}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-100"
                      >
                        Action
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Scheduled Callbacks */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:calendar-outline" className="w-5 h-5 text-indigo-600" />
              Scheduled Callbacks
            </h2>

            {upcomingFollowUps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No upcoming callbacks scheduled. When adding notes in lead follow-ups, select a next date!
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingFollowUps.map((item: any) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {item.admissionEnquiry?.studentName || 'Student'}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-600">
                        {new Date(item.nextFollowUpDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-1">{item.remarks}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // 2. ADMISSION HEAD DASHBOARD
  // ─────────────────────────────────────────────────────────────
  if (isAdmissionHeadRole(role)) {
    const [
      pendingVerifications,
      totalAdmissions,
      monthlyAdmissions,
      recentAdmissions,
      monthlyExpensesRaw,
    ] = await Promise.all([
      db.admission.count({
        where: { isDeleted: false, status: 'VERIFICATION_PENDING' },
      }),
      db.admission.count({ where: { isDeleted: false } }),
      db.admission.count({
        where: { isDeleted: false, admissionDate: { gte: startOfMonth } },
      }),
      db.admission.findMany({
        where: { isDeleted: false },
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
      db.expense.aggregate({
        where: { isDeleted: false, expenseDate: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
    ])

    const monthlyExpenseTotal = Number(monthlyExpensesRaw._sum.amount || 0)

    return (
      <div className="space-y-6 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
              Admission Head Portal
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Welcome, {session.fullName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Verify student documents, confirm official enrolment, and supervise operating expenditures
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/admissions"
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Icon icon="ion:id-card-outline" className="w-4 h-4" />
              <span>Admissions</span>
            </Link>
            <Link
              href="/admin/expenses"
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Icon icon="ion:receipt-outline" className="w-4 h-4" />
              <span>Expenses</span>
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-linear-to-br from-white to-amber-50/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider block">
                Pending Verification
              </span>
              <span className="text-3xl font-black text-amber-700 mt-1 block">{pendingVerifications}</span>
              <span className="text-[11px] text-amber-600 font-medium">Requires review</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Icon icon="ion:hourglass-outline" className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Admissions ({currentMonthName})
              </span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{monthlyAdmissions}</span>
              <span className="text-[11px] text-slate-400 font-medium">This month</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Icon icon="ion:calendar-outline" className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Admissions
              </span>
              <span className="text-3xl font-black text-teal-700 mt-1 block">{totalAdmissions}</span>
              <span className="text-[11px] text-slate-400 font-medium">All student registry</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Icon icon="ion:school-outline" className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Expenses This Month
              </span>
              <span className="text-xl font-black text-rose-700 mt-1 block">{formatCurrency(monthlyExpenseTotal)}</span>
              <span className="text-[11px] text-slate-400 font-medium">{currentMonthName}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Icon icon="ion:wallet-outline" className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recent Admissions List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:id-card-outline" className="w-5 h-5 text-teal-600" />
              Latest Student Admissions
            </h2>
            <Link href="/admin/admissions" className="text-xs font-bold text-teal-700 hover:underline">
              View all admissions →
            </Link>
          </div>

          {recentAdmissions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No student admissions recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAdmissions.map((adm: any) => (
                <div key={adm.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {adm.admissionNumber}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{adm.studentName}</span>
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      {adm.courseName} • {adm.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        adm.status === 'VERIFIED_ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {adm.status === 'VERIFIED_ACTIVE' ? 'Active' : 'Pending Verification'}
                    </span>
                    <Link
                      href="/admin/admissions"
                      className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg text-xs font-bold hover:bg-teal-100"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // 3. SALES MANAGER & ADMIN & SUPER ADMIN EXECUTIVE DASHBOARD
  // ─────────────────────────────────────────────────────────────
  const [
    admissionLeadCount,
    contactCount,
    careerCount,
    hireCount,
    franchiseCount,
    unassignedCount,
    convertedLeadsCount,
    totalAdmissionsCount,
    totalExpenseSumRaw,
    monthlyExpenseSumRaw,
    activeCounsellorsCount,
    recentLeads,
    recentAdmissions,
  ] = await Promise.all([
    db.admissionEnquiry.count({ where: { isDeleted: false } }),
    db.contactEnquiry.count({ where: { isDeleted: false } }),
    db.careerEnquiry.count({ where: { isDeleted: false } }),
    db.companyPlacementEnquiry.count({ where: { isDeleted: false } }),
    db.franchisePartnerEnquiry.count({ where: { isDeleted: false } }),
    db.admissionEnquiry.count({ where: { isDeleted: false, assignedToId: null } }),
    db.admissionEnquiry.count({ where: { isDeleted: false, status: 'ADMISSION_CLOSED' } }),
    db.admission.count({ where: { isDeleted: false } }),
    db.expense.aggregate({ where: { isDeleted: false }, _sum: { amount: true } }),
    db.expense.aggregate({ where: { isDeleted: false, expenseDate: { gte: startOfMonth } }, _sum: { amount: true } }),
    db.user.count({ where: { status: true, isDeleted: false, role: 'COUNSELLOR' } }),
    db.admissionEnquiry.findMany({
      where: { isDeleted: false },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: true },
    }),
    db.admission.findMany({
      where: { isDeleted: false },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const totalExpense = Number(totalExpenseSumRaw._sum.amount || 0)
  const monthlyExpense = Number(monthlyExpenseSumRaw._sum.amount || 0)

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            Executive CRM Dashboard
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Welcome back, {session.fullName}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Role: <strong>{getRoleDisplayName(session.roleName)}</strong> • Complete overview of leads, admissions, counsellors, and expenditures
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/enquiries/admission"
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Icon icon="ion:school-outline" className="w-4 h-4" />
            <span>Manage Leads</span>
          </Link>
          <Link
            href="/admin/admissions"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Icon icon="ion:id-card-outline" className="w-4 h-4" />
            <span>Admissions</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Admission Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Leads</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{admissionLeadCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">Prospective students</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Icon icon="ion:people-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Unassigned Leads Alert */}
        <div
          className={`p-5 rounded-2xl border shadow-xs flex items-center justify-between ${
            unassignedCount > 0
              ? 'bg-amber-50/50 border-amber-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider block">
              Unassigned Leads
            </span>
            <span className="text-3xl font-black text-amber-700 mt-1 block">{unassignedCount}</span>
            <span className="text-[11px] text-amber-800 font-medium">Needs counsellor assignment</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Icon icon="ion:alert-circle-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Official Admissions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Official Admissions
            </span>
            <span className="text-3xl font-black text-teal-700 mt-1 block">{totalAdmissionsCount}</span>
            <span className="text-[11px] text-teal-600 font-medium">{convertedLeadsCount} converted leads</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Icon icon="ion:school-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Expenses This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Expenses ({currentMonthName})
            </span>
            <span className="text-xl font-black text-rose-700 mt-1 block">{formatCurrency(monthlyExpense)}</span>
            <span className="text-[11px] text-slate-400 font-medium">{formatCurrency(totalExpense)} all time</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Icon icon="ion:receipt-outline" className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Inquiry Modules Quick Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          href="/admin/enquiries/admission"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-all shadow-2xs group"
        >
          <span className="text-xs text-slate-500 font-semibold block">Admissions</span>
          <span className="text-xl font-bold text-slate-900 mt-0.5 block group-hover:text-amber-600">
            {admissionLeadCount}
          </span>
        </Link>
        <Link
          href="/admin/enquiries/contact"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition-all shadow-2xs group"
        >
          <span className="text-xs text-slate-500 font-semibold block">Contact Inquiries</span>
          <span className="text-xl font-bold text-slate-900 mt-0.5 block group-hover:text-blue-600">
            {contactCount}
          </span>
        </Link>
        <Link
          href="/admin/enquiries/careers"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all shadow-2xs group"
        >
          <span className="text-xs text-slate-500 font-semibold block">Career Applicants</span>
          <span className="text-xl font-bold text-slate-900 mt-0.5 block group-hover:text-indigo-600">
            {careerCount}
          </span>
        </Link>
        <Link
          href="/admin/enquiries/hire"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 transition-all shadow-2xs group"
        >
          <span className="text-xs text-slate-500 font-semibold block">Hire Requests</span>
          <span className="text-xl font-bold text-slate-900 mt-0.5 block group-hover:text-emerald-600">
            {hireCount}
          </span>
        </Link>
        <Link
          href="/admin/enquiries/franchise"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-400 transition-all shadow-2xs group"
        >
          <span className="text-xs text-slate-500 font-semibold block">Franchise Proposals</span>
          <span className="text-xl font-bold text-slate-900 mt-0.5 block group-hover:text-purple-600">
            {franchiseCount}
          </span>
        </Link>
      </div>

      {/* Split Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Latest Leads */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:school-outline" className="w-5 h-5 text-amber-600" />
              Recent Admission Leads
            </h2>
            <Link href="/admin/enquiries/admission" className="text-xs font-bold text-amber-700 hover:underline">
              View all leads →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Program</th>
                  <th className="py-2.5 px-3">Counsellor</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentLeads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {lead.studentName}
                      <span className="text-slate-400 font-normal block">{lead.phone}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">{programOf(lead)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {lead.assignedTo?.fullName || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-amber-800">{lead.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Official Admissions */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:id-card-outline" className="w-5 h-5 text-teal-600" />
              Latest Student Admissions
            </h2>
            <Link href="/admin/admissions" className="text-xs font-bold text-teal-700 hover:underline">
              View all →
            </Link>
          </div>

          {recentAdmissions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No admissions created yet.</div>
          ) : (
            <div className="space-y-3">
              {recentAdmissions.map((adm: any) => (
                <div key={adm.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{adm.studentName}</span>
                    <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {adm.admissionNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>{adm.courseName}</span>
                    <span className="text-slate-400">{new Date(adm.admissionDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
