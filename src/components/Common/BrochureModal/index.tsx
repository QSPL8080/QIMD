'use client'

import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import PhoneInput from '@/components/Common/PhoneInput'
import { submitAdmissionEnquiryAction } from '@/app/actions/crmActions'

interface BrochureModalProps {
  isOpen: boolean
  onClose: () => void
  course?: {
    id?: string
    title?: string
    slug?: string
    image?: string
  }
}

export default function BrochureModal({ isOpen, onClose, course }: BrochureModalProps) {
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const courseTitle = course?.title || 'Program'
  const courseSlug = course?.slug || ''

  // Reset state when course changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setIsUnlocked(false)
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen, courseSlug])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

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
        courseId: courseSlug,
        city: formData.city,
        message: formData.message ? `Brochure Request: ${formData.message}` : 'Brochure Request via Modal',
      })

      setIsSubmitting(false)
      if (res.success) {
        const viewLink = `/api/public/brochures/download?view=1&courseId=${encodeURIComponent(courseSlug)}`
        const dlLink = `/api/public/brochures/download?courseId=${encodeURIComponent(courseSlug)}`
        setPdfUrl(viewLink)
        setDownloadUrl(dlLink)
        setIsUnlocked(true)

        // Automatically open the PDF in a new tab
        try {
          window.open(viewLink, '_blank')
        } catch (err) {
          console.error('Error opening PDF in new tab:', err)
        }
      } else {
        alert(res.error || 'Failed to submit details. Please try again.')
      }
    } catch (err) {
      setIsSubmitting(false)
      alert('An error occurred. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/75 backdrop-blur-md transition-all animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-darklight rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[92vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-dark_border bg-slate-50/80 dark:bg-dark">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#764DFF]/10 text-[#764DFF] flex items-center justify-center shrink-0">
              <Icon icon="mdi:file-pdf-box" className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#764DFF] bg-[#764DFF]/10 px-2.5 py-0.5 rounded-full">
                  Official Brochure
                </span>
                {isUnlocked && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Icon icon="mdi:lock-open-check" className="text-xs" />
                    Unlocked
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-midnight_text dark:text-white leading-tight mt-0.5">
                {courseTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" className="text-xl" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-[#0f172a]/60">
          {!isUnlocked ? (
            /* LOCKED STATE: PDF Background Preview with Form Popup */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Brochure Preview Summary */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-gradient-to-br from-[#1e1435] to-[#2a174c] text-white p-6 rounded-2xl shadow-lg border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#764DFF]/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-cyan-300 text-xs font-bold mb-3">
                    <Icon icon="mdi:star-check" />
                    Complete Syllabus & Details
                  </div>

                  <h4 className="text-xl font-black mb-2 leading-tight">
                    What&apos;s Inside This Brochure?
                  </h4>
                  <p className="text-white/80 text-xs leading-relaxed mb-4">
                    Download the comprehensive curriculum and training program details for {courseTitle}.
                  </p>

                  <ul className="space-y-2 text-xs text-white/90">
                    <li className="flex items-center gap-2">
                      <Icon icon="mdi:check-circle" className="text-cyan-300 text-sm shrink-0" />
                      Detailed Module Breakdown & Tools
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="mdi:check-circle" className="text-cyan-300 text-sm shrink-0" />
                      Live Client Projects & Portfolio Structure
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="mdi:check-circle" className="text-cyan-300 text-sm shrink-0" />
                      100% Placement & Internship Support
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="mdi:check-circle" className="text-cyan-300 text-sm shrink-0" />
                      Fee Structure, EMI & Batch Timing
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Admission Lead Capture Form */}
              <div className="lg:col-span-7">
                <div className="bg-white dark:bg-darklight p-6 sm:p-7 rounded-2xl shadow-xl border border-gray-200 dark:border-dark_border">
                  <div className="mb-4">
                    <h4 className="text-lg font-black text-midnight_text dark:text-white leading-tight">
                      Fill Form to View & Download Brochure
                    </h4>
                    <p className="text-xs text-muted dark:text-white/60 mt-1">
                      Enter your details below to immediately access the official PDF brochure.
                    </p>
                  </div>

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
                        <p className="text-red-500 text-[11px] mt-0.5 flex items-center gap-1 font-medium">
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
                        <p className="text-red-500 text-[11px] mt-0.5 flex items-center gap-1 font-medium">
                          <Icon icon="mdi:alert-circle-outline" className="text-xs" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Email */}
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
                        <p className="text-red-500 text-[11px] mt-0.5 flex items-center gap-1 font-medium">
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
                      className="w-full mt-2 bg-gradient-to-r from-[#764DFF] to-[#BD69F2] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Icon icon="mdi:loading" className="animate-spin text-base" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:file-download-outline" className="text-lg" />
                          <span>Unlock & View Brochure (PDF)</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-muted dark:text-white/50 pt-1">
                      🔒 Your details are secure with QIMD. We will never share your information.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* UNLOCKED STATE: Interactive PDF Viewer & Download Toolbar */
            <div className="flex flex-col h-[70vh] bg-white dark:bg-dark rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-dark_border">
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-800 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Icon icon="mdi:check-decagram" className="text-emerald-400 text-base" />
                  <span>Brochure Unlocked & Download Started!</span>
                </div>

                <div className="flex items-center gap-2.5">
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download
                      className="inline-flex items-center gap-1.5 bg-[#764DFF] hover:bg-[#5c38d6] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
                    >
                      <Icon icon="mdi:download" className="text-sm" />
                      <span>Download PDF</span>
                    </a>
                  )}
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Icon icon="mdi:open-in-new" className="text-sm" />
                      <span>Open Fullscreen</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Embedded PDF iframe */}
              <div className="flex-1 w-full bg-slate-900 relative">
                {pdfUrl ? (
                  <iframe
                    src={`${pdfUrl}#toolbar=1&navpanes=0`}
                    className="w-full h-full border-0"
                    title={`${courseTitle} Brochure PDF`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white text-sm">
                    Loading brochure...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
