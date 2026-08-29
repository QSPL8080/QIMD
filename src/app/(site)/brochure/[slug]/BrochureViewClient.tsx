'use client'

import React, { useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import PhoneInput from '@/components/Common/PhoneInput'
import { submitAdmissionEnquiryAction } from '@/app/actions/crmActions'

interface BrochureViewClientProps {
  course: {
    id: string
    title: string
    slug: string
    description?: string
  }
}

export default function BrochureViewClient({ course }: BrochureViewClientProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)

  const pdfViewUrl = `/api/public/brochures/download?view=1&courseId=${encodeURIComponent(course.slug)}`

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = 'Full name is required'
    if (!formData.phone.trim() || formData.phone.replace(/[^\d]/g, '').length < 5) {
      errs.phone = 'Valid phone number is required'
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Valid email address is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const res = await submitAdmissionEnquiryAction({
        studentName: formData.name,
        email: formData.email,
        phone: formData.phone,
        courseId: course.slug,
        city: formData.city,
        message: formData.message ? `Brochure Page: ${formData.message}` : 'Brochure Page Request',
      })

      setIsSubmitting(false)
      if (res.success) {
        setIsUnlocked(true)
      } else {
        alert(res.error || 'Failed to submit details. Please try again.')
      }
    } catch (err) {
      setIsSubmitting(false)
      alert('An error occurred. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-900 z-50">
      {/* 100% Full-Screen Pure PDF Viewer */}
      <iframe
        src={`${pdfViewUrl}#toolbar=1&navpanes=0`}
        className="w-full h-full border-0 absolute inset-0 z-10"
        title={`${course.title} Brochure PDF`}
      />

      {/* BEFORE UNLOCK: Centered Lead Capture Popup Overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-darklight text-midnight_text dark:text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 animate-fadeIn relative">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#764DFF]/10 text-[#764DFF] text-xs font-bold mb-3">
              <Icon icon="mdi:file-pdf-box" className="text-sm" />
              <span>{course.title} Brochure</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-midnight_text dark:text-white leading-tight">
              View Official Brochure
            </h2>
            <p className="text-xs sm:text-sm text-muted dark:text-white/70 mt-1 mb-5 leading-relaxed">
              Fill in your details to immediately view the complete syllabus and curriculum PDF.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              {/* Full Name */}
              <div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Icon icon="mdi:account-outline" className="text-lg" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, name: e.target.value }))
                      if (errors.name) setErrors((p) => ({ ...p, name: '' }))
                    }}
                    placeholder="Your Full Name *"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50 dark:bg-dark focus:outline-none transition-all font-medium ${
                      errors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-dark_border focus:border-primary focus:bg-white'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <Icon icon="mdi:alert-circle-outline" className="text-xs" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <PhoneInput
                  value={formData.phone}
                  onChange={(val) => {
                    setFormData((p) => ({ ...p, phone: val }))
                    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }))
                  }}
                  placeholder="Phone Number *"
                  inputClassName={`text-xs sm:text-sm ${
                    errors.phone ? 'border-red-500 bg-red-50/50' : ''
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <Icon icon="mdi:alert-circle-outline" className="text-xs" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Icon icon="mdi:email-outline" className="text-lg" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, email: e.target.value }))
                      if (errors.email) setErrors((p) => ({ ...p, email: '' }))
                    }}
                    placeholder="Email Address *"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50 dark:bg-dark focus:outline-none transition-all font-medium ${
                      errors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-200 dark:border-dark_border focus:border-primary focus:bg-white'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1 font-medium">
                    <Icon icon="mdi:alert-circle-outline" className="text-xs" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* City / Location */}
              <div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Icon icon="mdi:map-marker-outline" className="text-lg" />
                  </div>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                    placeholder="City / Location (Optional)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark_border text-xs sm:text-sm text-midnight_text dark:text-white bg-gray-50 dark:bg-dark focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-gradient-to-r from-[#764DFF] to-[#BD69F2] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="mdi:loading" className="animate-spin text-base" />
                    <span>Opening PDF...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:file-pdf-box" className="text-lg" />
                    <span>View Brochure PDF</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-muted dark:text-white/50 pt-1">
                🔒 Your details will be registered for admission enquiry.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
