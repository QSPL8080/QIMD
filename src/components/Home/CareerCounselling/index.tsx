'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { siteConfig } from '@/data'
import EnquiryForm from '@/components/Common/EnquiryForm'

const CareerCounsellingCTA: React.FC = () => {
  const [isBrochureDownloaded, setIsBrochureDownloaded] = useState(false)

  const handleBrochureDownload = () => {
    setIsBrochureDownloaded(true)
    setTimeout(() => {
      alert('Thank you! The QIMD Course Brochure has started downloading.')
      setIsBrochureDownloaded(false)
    }, 500)
  }

  return (
    <section
      className="py-12 sm:py-16 relative overflow-hidden text-white border-y border-white/10"
      style={{
        background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
      }}
    >
      {/* Soft decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#764DFF]/20 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#0284c7]/20 blur-3xl" />
      </div>

      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
        <div className="rounded-3xl p-6 sm:p-10 border border-white/20 shadow-2xl backdrop-blur-md bg-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5">
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
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug">
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
                    className="group bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-sm border border-white/15 hover:border-cyan-300/60 rounded-2xl p-3.5 text-center shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2 text-cyan-300 group-hover:bg-white group-hover:text-[#180e29] transition-colors duration-300">
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

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#180e29] font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-xl hover:-translate-y-0.5"
                >
                  <Icon icon="mdi:send-check" className="text-base text-[#764DFF]" />
                  <span>Apply Now</span>
                </Link>

                <button
                  onClick={handleBrochureDownload}
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/30 transition-all cursor-pointer shadow-md hover:-translate-y-0.5 backdrop-blur-md"
                >
                  <Icon icon="mdi:file-download-outline" className="text-base text-cyan-300" />
                  <span>{isBrochureDownloaded ? 'Downloading...' : 'Download Brochure'}</span>
                </button>

                <Link
                  href={siteConfig.socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl transition-all shadow-md hover:-translate-y-0.5"
                >
                  <Icon icon="mdi:whatsapp" className="text-base" />
                  <span>Talk to Expert</span>
                </Link>

                <Link
                  href="/hire-from-us"
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/30 transition-all hover:-translate-y-0.5 backdrop-blur-md"
                >
                  <Icon icon="mdi:briefcase-account" className="text-base text-cyan-300" />
                  <span>Hire From Us</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/80">
                <div className="mb-4">
                  <h3 className="text-lg font-black text-[#111827] leading-snug">
                    Get Personalized Guidance
                  </h3>
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
