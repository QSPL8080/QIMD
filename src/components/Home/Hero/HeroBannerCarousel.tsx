'use client'

import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'

export interface Banner {
  id: string
  title?: string | null
  imageUrl: string
  displayOrder?: number
}

const bannerThemes = [
  {
    badge: 'CAREER BOOSTER',
    title: 'Upgrade Your Skills.',
    titleAccent: 'Upgrade Your Future.',
    sub: 'Master in-demand digital skills through live practical projects.',
    tag: '100% Job Assistance',
    accentColor: '#764DFF',
    icon: 'mdi:rocket-launch',
  },
  {
    badge: 'ENROLL NOW',
    title: 'Learn. Practice.',
    titleAccent: 'Get Hired.',
    sub: 'Industry-focused training with real-world project portfolios.',
    tag: 'Limited Seats Available',
    accentColor: '#0284c7',
    icon: 'mdi:school',
  },
  {
    badge: 'AI PRACTICAL',
    title: 'Master AI Tools.',
    titleAccent: 'Accelerate Career.',
    sub: 'Learn ChatGPT, Midjourney & AI Workflows for Marketing & Design.',
    tag: '100% Practical Projects',
    accentColor: '#16a34a',
    icon: 'mdi:brain',
  },
  {
    badge: 'SCHOLARSHIP',
    title: 'Transform Skills.',
    titleAccent: 'Build Portfolio.',
    sub: 'Work on live client projects with dedicated industry expert mentors.',
    tag: 'Certified Programs',
    accentColor: '#ea580c',
    icon: 'mdi:trophy',
  },
]

export default function HeroBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function fetchBanners() {
      try {
        const res = await fetch('/api/public/banners')
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data.banners && Array.isArray(data.banners)) {
            setBanners(data.banners)
          }
        }
      } catch (err) {
        console.error('Failed to fetch carousel banners:', err)
      } finally {
        if (isMounted) setLoaded(true)
      }
    }
    fetchBanners()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [banners.length])

  return (
    <div className="hero-card-slide-right w-full">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/80 shadow-2xl p-5 sm:p-6 text-[#0f172a] transition-all duration-300 min-h-[220px] flex flex-col justify-center"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(30px)' }}
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#764DFF]/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-[#0284c7]/15 blur-2xl pointer-events-none" />

        {loaded && banners.length > 0 ? (
          <div className="relative z-10 min-h-[175px]">
            {banners.map((banner, index) => {
              const isCurrent = index === currentIndex
              const theme = bannerThemes[index % bannerThemes.length]

              return (
                <div
                  key={banner.id}
                  className={`transition-all duration-700 ease-in-out ${
                    isCurrent ? 'opacity-100 z-10 relative scale-100' : 'opacity-0 z-0 absolute inset-0 pointer-events-none scale-95'
                  }`}
                >
                  <div className="grid grid-cols-12 gap-3 items-center">
                    {/* Left Column Text Content */}
                    <div className="col-span-8 space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase border shadow-2xs"
                          style={{
                            backgroundColor: `${theme.accentColor}15`,
                            borderColor: `${theme.accentColor}30`,
                            color: theme.accentColor,
                          }}
                        >
                          <Icon icon="mdi:lightning-bolt" className="text-sm animate-pulse" />
                          {theme.badge}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                          Offline Courses
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-[#0f172a] leading-tight tracking-tight">
                        {banner.title ? (
                          banner.title
                        ) : (
                          <>
                            {theme.title} <br />
                            <span style={{ color: theme.accentColor }}>{theme.titleAccent}</span>
                          </>
                        )}
                      </h3>

                      <p className="text-slate-600 text-xs sm:text-sm font-semibold leading-relaxed max-w-sm">
                        {theme.sub}
                      </p>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
                        <Icon icon="mdi:shield-check" className="text-lg" style={{ color: theme.accentColor }} />
                        <span className="text-xs font-extrabold text-[#0f172a]">{theme.tag}</span>
                      </div>
                    </div>

                    {/* Right Column 3D Floating Icon Graphics & Podium Artwork */}
                    <div className="col-span-4 flex items-center justify-center relative min-h-[140px]">
                      {/* Decorative Podium Glow Circle */}
                      <div
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center relative shadow-xl backdrop-blur-md transition-transform duration-500 hover:scale-105"
                        style={{
                          background: `radial-gradient(circle, ${theme.accentColor}25 0%, ${theme.accentColor}05 70%, transparent 100%)`,
                          border: `1.5px solid ${theme.accentColor}35`,
                        }}
                      >
                        <div
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-inner"
                          style={{
                            background: `linear-gradient(135deg, ${theme.accentColor}20 0%, ${theme.accentColor}08 100%)`,
                          }}
                        >
                          <Icon icon={theme.icon} className="text-5xl sm:text-6xl drop-shadow-md animate-bounce" style={{ color: theme.accentColor }} />
                        </div>
                      </div>

                      {/* Small floating 3D orb badges */}
                      <div
                        className="absolute -top-1 right-2 p-1.5 rounded-full shadow-md backdrop-blur-xs border"
                        style={{ backgroundColor: `${theme.accentColor}15`, borderColor: `${theme.accentColor}40` }}
                      >
                        <Icon icon="mdi:star-four-points" className="text-sm" style={{ color: theme.accentColor }} />
                      </div>
                      <div
                        className="absolute bottom-1 left-2 p-1.5 rounded-full shadow-md backdrop-blur-xs border"
                        style={{ backgroundColor: `${theme.accentColor}15`, borderColor: `${theme.accentColor}40` }}
                      >
                        <Icon icon="mdi:check-decagram" className="text-sm" style={{ color: theme.accentColor }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-[#764DFF]/10 border border-[#764DFF]/20 text-[#764DFF] text-xs font-bold px-3 py-1 rounded-lg tracking-wider uppercase">
                <Icon icon="mdi:lightning-bolt" className="text-sm animate-pulse" />
                New Batch Starting Soon
              </span>
              <span className="text-[11px] font-semibold text-[#374151] bg-[#764DFF]/10 border border-[#764DFF]/20 px-2.5 py-0.5 rounded-full">
                Offline Courses
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#111827] leading-tight mb-2">
              AI-Powered Courses <br />
              <span className="text-[#764DFF] font-black">100% Job Assistance</span>
            </h3>

            <p className="text-[#374151] text-xs sm:text-sm leading-relaxed mb-4">
              Join India&apos;s First Industry-Oriented AI Powered Marketing &amp; Design Institute. Hands-on practical live projects &amp; career guidance.
            </p>

            <div className="flex items-center gap-2 pt-1 border-t border-white/20">
              <Icon icon="mdi:shield-check" className="text-[#764DFF] text-lg" />
              <span className="text-xs font-semibold text-[#374151]">Limited Seats Available</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
