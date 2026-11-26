import React from 'react'
import AuthCard from '@/components/Admin/AuthCard'
import ResetForm from './ResetForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Reset password', robots: { index: false, follow: false } }

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  const valid = typeof token === 'string' && /^[a-f0-9]{64}$/.test(token)
  return (
    <AuthCard title="Set a new password" subtitle={valid ? 'Choose a password of at least 8 characters.' : undefined}>
      {valid ? <ResetForm token={token!} /> : <p className="rounded-xl bg-rose-50 text-rose-700 text-sm px-4 py-3">This reset link is not valid. Ask for a new one from the sign-in page.</p>}
    </AuthCard>
  )
}
