import React from 'react'
import AuthCard from '@/components/Admin/AuthCard'
import ForgotForm from './ForgotForm'

export const metadata = { title: 'Forgot password', robots: { index: false, follow: false } }

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot password" subtitle="Enter your email or username. If the account is active, we will email a reset link valid for 30 minutes.">
      <ForgotForm />
    </AuthCard>
  )
}
