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
      className="py-12 sm:py-16 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 60%, #f4efff 82%, #e9f3fd 100%)',
      }}
    >
      {/* Soft decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#764DFF]/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#4999D4]/10 blur-3xl" />
      </div>

      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
        <div className="rounded-3xl p-6 sm:p-10 border border-white/60 shadow-xl backdrop-blur-sm bg-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5">
              {/* Badge - Highlighted & Radiant */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/15 via-[#764DFF]/15 to-[#BD69F2]/15 border border-primary/30 shadow-xs shadow-indigo-500/10 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:border-primary/50 hover:scale-[1.02]">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Icon icon="mdi:star-four-points" className="text-primary text-xs animate-pulse" />
                </div>
                <span className="text-xs sm:text-[13px] font-extrabold text-[#111827] dark:text-white tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-[#764DFF] to-[#BD69F2] bg-clip-text text-transparent font-black">
                    India&apos;s #1
                  </span>{" "}
                  AI-Powered Marketing &amp; Design Institute
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] leading-tight">
                Connect With Our Career Counselling Team
              </h2>

              {/* Subtext */}
              <p className="text-[#374151] text-sm sm:text-base leading-relaxed max-w-xl">
                Not sure which course is right for you? Our experts will help you choose the best program based on your career goals, skills, and interests.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { icon: 'mdi:account-group-outline', label: '10,000+', sub: 'Trained Students', color: 'text-primary' },
                  { icon: 'mdi:briefcase-check-outline', label: '100%', sub: 'Job Assistance', color: 'text-[#764DFF]' },
                  { icon: 'mdi:laptop', label: '100%', sub: 'Live Client Work', color: 'text-[#4999D4]' },
                  { icon: 'mdi:calendar-sync-outline', label: '2 Years', sub: 'Repeat Access', color: 'text-[#BD69F2]' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group bg-white/85 dark:bg-darklight/80 border-[1.5px] border-white dark:border-dark_border hover:border-primary/40 hover:bg-white dark:hover:bg-darklight rounded-2xl p-3 text-center shadow-xs hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-1.5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Icon icon={item.icon} className="text-base" />
                    </div>
                    <p className="text-base sm:text-lg font-extrabold text-[#764DFF] group-hover:text-primary transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-[#374151] dark:text-white/80 font-bold leading-tight mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-darkprimary text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Icon icon="mdi:send-check" className="text-base" />
                  <span>Apply Now</span>
                </Link>

                <button
                  onClick={handleBrochureDownload}
                  className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-primary font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl border border-primary/30 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5"
                >
                  <Icon icon="mdi:file-download-outline" className="text-base text-primary" />
                  <span>{isBrochureDownloaded ? 'Downloading...' : 'Download Brochure'}</span>
                </button>

                <Link
                  href={siteConfig.socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
                >
                  <Icon icon="mdi:whatsapp" className="text-base" />
                  <span>Talk to Expert</span>
                </Link>

                <Link
                  href="/hire-from-us"
                  className="inline-flex items-center gap-2 bg-white/60 hover:bg-white/80 text-[#374151] font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#764DFF]/20 transition-all hover:-translate-y-0.5"
                >
                  <Icon icon="mdi:briefcase-account" className="text-base text-[#4999D4]" />
                  <span>Hire From Us</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-white/80">
                <div className="mb-4">
                  <h3 className="text-lg font-extrabold text-[#111827] leading-snug">
                    Get Personalized Guidance
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1">
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
