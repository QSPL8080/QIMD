import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

/** Centered card used by sign-in, forgot-password and reset-password pages. */
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center pb-1">
            <Link href="/" title="Go to Website">
              <Image src="/images/logo/qimd-logo.png" alt="QIMD" width={190} height={55} className="h-11 sm:h-12 w-auto object-contain" priority />
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
          </div>
        </div>
        {children}
        <div className="pt-2 text-center text-xs">
          <Link href="/admin/login" className="font-semibold text-zinc-900 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
