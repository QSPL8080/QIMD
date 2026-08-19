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
        background: 'linear-gradient(135deg, #c4b0ff 0%, #ddb8f8 28%, #ffffff 50%, #b8d9f0 72%, #a8c4e8 100%)',
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
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#764DFF]/10 text-[#764DFF] text-xs font-bold border border-[#764DFF]/20">
                <Icon icon="mdi:sparkles" className="text-[#764DFF] text-sm" />
                <span>India&apos;s #1 AI-Powered Marketing &amp; Design Institute</span>
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
                  { icon: 'mdi:account-group', label: '10,000+', sub: 'Trained Students' },
                  { icon: 'mdi:briefcase-check', label: '100%', sub: 'Job Assistance' },
                  { icon: 'mdi:laptop-mac', label: '100%', sub: 'Live Client Work' },
                  { icon: 'mdi:refresh-auto', label: '2 Years', sub: 'Repeat Access' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/70 border border-white/80 rounded-xl p-2.5 text-center shadow-sm">
                    <p className="text-base sm:text-lg font-bold text-[#764DFF]">{item.label}</p>
                    <p className="text-[11px] text-[#374151] font-medium">{item.sub}</p>
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
