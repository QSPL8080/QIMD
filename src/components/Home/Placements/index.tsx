'use client'
import React, { useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { placementPartnersData } from '@/data'

const studentReviewsList = [
  {
    name: "Rohan Verma",
    initial: "R",
    program: "Digital Marketing Program",
    rating: 5,
    review: "I joined QIMD for the Digital Marketing Program and had a really good learning experience. The best part was the practical training and live projects. We learned about SEO, social media marketing, Google Ads and other digital marketing tools with practical examples. The trainers were supportive and cleared our doubts whenever needed."
  },
  {
    name: "Sneha More",
    initial: "S",
    program: "Digital Marketing Program",
    rating: 5,
    review: "I was looking for a good digital marketing institute in Pune and joined QIMD after checking the program details. The training was practical and easy to understand. I especially liked the live project sessions because they helped me understand how digital marketing works for real businesses."
  },
  {
    name: "Aniket Kulkarni",
    initial: "A",
    program: "Graphic Design Program",
    rating: 5,
    review: "My experience of Graphic Design Program with Pune’s QIMD was great. The program covered practical designing concepts and gave us assignments to work on. The trainers were helpful and guided us throughout the learning process."
  },
  {
    name: "Pooja Sharma",
    initial: "P",
    program: "Video Editing Program",
    rating: 5,
    review: "I joined QIMD to learn video editing and really enjoyed the practical sessions. We worked on different types of videos and learned how to improve editing, storytelling and presentation. The overall learning environment was very supportive."
  }
]

const StarRating: React.FC<{ rating?: number }> = ({ rating = 5 }) => (
  <div className="flex items-center gap-1 flex-shrink-0">
    {Array.from({ length: 5 }).map((_, i) => (
      <Icon
        key={i}
        icon="mdi:star"
        className="text-amber-400 text-sm"
      />
    ))}
  </div>
)

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

const PlacementsSection: React.FC<{ placements?: any[]; partners?: any[]; testimonials?: any[] }> = ({
  partners,
}) => {
  const displayPartners = partners && partners.length > 0 ? partners : placementPartnersData

  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden text-midnight_text border-y border-slate-100 dark:border-dark_border"
      id="student-reviews"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #f1ecff 75%, #e0edfe 100%)',
      }}
    >
      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10" data-aos="fade-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#6366F1] text-[11px] font-bold tracking-wide uppercase mb-3">
            <Icon icon="mdi:star-check" className="text-[#6366F1] text-sm" />
            <span>VERIFIED RATINGS</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#111827] dark:text-white mb-2 tracking-tight">
            What Our Students Say
          </h2>
          <p suppressHydrationWarning className="text-slate-500 dark:text-white/70 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Authentic feedback from graduates who transformed their skills and careers with us.
          </p>
        </div>

        {/* 2x2 Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-16">
          {studentReviewsList.map((item, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 80}
              className="bg-white dark:bg-darklight rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-dark_border shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full"
            >
              <div>
                {/* Header: 5 Stars + Course Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <StarRating rating={item.rating} />
                  <span className="bg-[#EDE9FE] text-[#6366F1] font-semibold text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    {item.program}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-[13px] text-slate-700 dark:text-white/80 leading-relaxed italic mb-4 font-normal">
                  &quot;{item.review}&quot;
                </p>
              </div>

              {/* Student Details Footer */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-50 dark:border-dark_border/50">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EDE9FE] text-[#6366F1] font-bold text-xs flex items-center justify-center shrink-0">
                  {item.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                    Verified Student
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Placement Partners / Hiring Companies Logo Section */}
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
