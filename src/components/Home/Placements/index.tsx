'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { placedStudentsData, placementPartnersData } from '@/data'
import PlacementCard from '@/components/Common/PlacementCard'

const PartnerLogoItem: React.FC<{ partner: any }> = ({ partner }) => {
  const fallback = placementPartnersData.find(
    (p) => p.name.toLowerCase() === (partner.name || '').toLowerCase()
  )?.logo || ''

  const [src, setSrc] = useState<string>(partner.logo || fallback)
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return (
      <span className="text-xs sm:text-sm font-bold text-[#374151] px-3 py-1.5 bg-white/70 rounded-lg border border-slate-200 shadow-2xs">
        {partner.name}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={partner.name}
      onError={() => {
        if (fallback && src !== fallback) {
          setSrc(fallback)
        } else {
          setHasError(true)
        }
      }}
      className="max-h-12 max-w-full object-contain filter drop-shadow-xs transition-transform duration-300 hover:scale-105"
    />
  )
}

const PlacementsSection: React.FC<{ placements?: any[]; partners?: any[] }> = ({ placements, partners }) => {
  const displayPlacements = placements && placements.length > 0 ? placements.slice(0, 4) : placedStudentsData.slice(0, 4)
  const displayPartners = partners && partners.length > 0 ? partners : placementPartnersData

  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden text-midnight_text border-y border-slate-200/80 dark:border-dark_border"
      id="placements"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
      }}
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#764DFF]/10 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-[#38bdf8]/10 blur-3xl" />
      </div>

      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#764DFF]/15 text-[#5c38d6] border border-[#764DFF]/25 text-xs font-bold mb-3 shadow-xs">
            <Icon icon="mdi:briefcase-check" className="text-[#764DFF] text-sm" />
            <span>Career Success Stories</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#111827] dark:text-white mb-4 tracking-tight">
            Meet Our Recently Placed Students
          </h2>
          <p suppressHydrationWarning className="text-slate-700 dark:text-white/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            See how QIMD&apos;s practical training, internships, and placement support helped students launch successful careers.
          </p>
        </div>

        {/* Placed Students Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {displayPlacements.map((student, index) => (
            <PlacementCard key={student.id} student={student} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mb-16" data-aos="fade-up">
          <Link
            href="/placements#success-stories"
            className="inline-flex items-center gap-2 bg-[#764DFF] hover:bg-[#5c38d6] text-white font-extrabold px-8 py-3.5 rounded-full shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span>View All Placement Success Stories</span>
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </Link>
        </div>

        {/* Placement Partners */}
        <div className="mt-4 text-center" data-aos="fade-up">
          <p className="text-xs font-bold text-slate-700 dark:text-white/80 uppercase tracking-widest mb-6">
            Trusted Hiring Partners &amp; Recruiters
          </p>
          <div className="w-full overflow-hidden select-none py-2">
            <div className="flex animate-marquee-left items-center gap-12 sm:gap-16">
              {[...displayPartners, ...displayPartners, ...displayPartners].map((partner, i) => (
                <div
                  key={`${partner.id || i}-${i}`}
                  className="flex items-center justify-center h-16 w-36 sm:w-44 flex-shrink-0"
                >
                  <PartnerLogoItem partner={partner} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PlacementsSection
