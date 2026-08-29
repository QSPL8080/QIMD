'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { siteConfig } from '@/data'
import EnquiryForm from '@/components/Common/EnquiryForm'

const CareerCounsellingCTA: React.FC = () => {
  const [highlightForm, setHighlightForm] = useState(false)

  const handleBrochureDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    setHighlightForm(true)
    const formCard = document.getElementById('career-counselling-form-card')
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Focus strictly the input inside THIS beside form
      const nameInput = formCard.querySelector('input[name="name"]') as HTMLInputElement || formCard.querySelector('input') as HTMLInputElement
      if (nameInput) {
        setTimeout(() => {
          nameInput.focus()
        }, 150)
      }
    }
    setTimeout(() => {
      setHighlightForm(false)
    }, 3500)
  }

  return (
    <section
      className="py-14 sm:py-18 relative overflow-hidden text-white border-y border-white/10"
      style={{
        background: 'linear-gradient(135deg, #140b24 0%, #231242 35%, #351a6b 70%, #0369a1 100%)',
      }}
    >
      {/* Soft decorative background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#764DFF]/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#0284c7]/25 blur-3xl" />
      </div>

      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
        <div className="rounded-3xl p-6 sm:p-10 lg:p-12 border border-white/20 shadow-2xl backdrop-blur-xl bg-white/[0.08]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 shadow-xs backdrop-blur-md">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Icon icon="mdi:star-four-points" className="text-cyan-300 text-xs animate-pulse" />
                </div>
                <span className="text-xs sm:text-[13px] font-extrabold text-white tracking-tight">
                  <span className="text-cyan-300 font-black">
                    India&apos;s #1
                  </span>{" "}
                  AI-Powered Marketing &amp; Design Institute
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Connect With Our Career Counselling Team
              </h2>

              {/* Subtext */}
              <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                Not sure which course is right for you? Our experts will help you choose the best program based on your career goals, skills, and interests.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { icon: 'mdi:account-group-outline', label: '10,000+', sub: 'Trained Students' },
                  { icon: 'mdi:briefcase-check-outline', label: '100%', sub: 'Job Assistance' },
                  { icon: 'mdi:laptop', label: '100%', sub: 'Live Client Work' },
                  { icon: 'mdi:calendar-sync-outline', label: '2 Years', sub: 'Repeat Access' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-sm border border-white/15 hover:border-cyan-300/60 rounded-2xl p-3.5 text-center shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-2 text-cyan-300 group-hover:bg-white group-hover:text-[#180e29] transition-colors duration-300">
                      <Icon icon={item.icon} className="text-base" />
                    </div>
                    <p className="text-lg sm:text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-white/80 font-medium leading-tight mt-1">
                      {item.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons: Spacious 2x2 Symmetrical Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={handleBrochureDownload}
                  className="flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 text-[#140b24] font-extrabold text-sm px-5 py-3.5 rounded-xl transition-all shadow-xl hover:-translate-y-0.5 cursor-pointer text-center group w-full"
                >
                  <Icon icon="mdi:file-download-outline" className="text-lg text-[#764DFF] group-hover:scale-110 transition-transform shrink-0" />
                  <span className="font-black">Download Brochure</span>
                </button>

                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-5 py-3.5 rounded-xl border border-white/30 transition-all hover:-translate-y-0.5 backdrop-blur-md text-center w-full"
                >
                  <Icon icon="mdi:email-outline" className="text-lg text-cyan-300 shrink-0" />
                  <span>Contact Us</span>
                </Link>

                <Link
                  href={siteConfig.socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm px-5 py-3.5 rounded-xl transition-all shadow-md hover:-translate-y-0.5 text-center w-full"
                >
                  <Icon icon="mdi:whatsapp" className="text-lg shrink-0" />
                  <span>Talk to Expert</span>
                </Link>

                <Link
                  href="/hire-from-us"
                  className="flex items-center justify-center gap-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-sm px-5 py-3.5 rounded-xl border border-white/30 transition-all hover:-translate-y-0.5 backdrop-blur-md text-center w-full"
                >
                  <Icon icon="mdi:briefcase-account" className="text-lg text-cyan-300 shrink-0" />
                  <span>Hire From Us</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-5">
              <div
                id="career-counselling-form-card"
                className={`bg-white rounded-3xl p-6 sm:p-7 shadow-2xl transition-all duration-300 ${
                  highlightForm
                    ? 'ring-2 ring-cyan-400 border-2 border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.4)] scale-[1.01]'
                    : 'border border-white/90'
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-[#111827] leading-snug">
                      Get Personalized Guidance
                    </h3>
                    {highlightForm && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 animate-bounce">
                        Fill Form Below ↓
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    Fill in your details below and an expert counsellor will contact you within 30 minutes.
                  </p>
                </div>
                <EnquiryForm showTitle={false} compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CareerCounsellingCTA
