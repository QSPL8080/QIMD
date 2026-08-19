import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminLoginForm from './AdminLoginForm'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  // Security: Strip any credentials that appear in URL query params
  const params = await searchParams
  if (params && (params.email || params.password || params.token)) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 space-y-6">
        {/* Header with Official Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center pb-1">
            <Link href="/" title="Go to Website">
              <Image
                src="/images/logo/qimd-logo.png"
                alt="Quickupp Logo"
                width={190}
                height={55}
                className="h-11 sm:h-12 w-auto object-contain transition-transform hover:scale-105"
                priority
              />
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Suite</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Sign in to manage website CMS & CRM
            </p>
          </div>
        </div>

        {/* Login Form */}
        <AdminLoginForm />

        {/* Footer */}
        <div className="pt-2 text-center text-xs text-slate-400 font-medium">
          Protected System • QIMD Internal Portal v1.0
        </div>
      </div>
    </div>
  )
}
