'use client'

import React, { useEffect, useState } from 'react'

export interface Banner {
  id: string
  title?: string | null
  imageUrl: string
  displayOrder?: number
}

export default function HeroBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

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
      }
    }
    fetchBanners()

    const handleUpdate = () => {
      fetchBanners()
    }
    window.addEventListener('bannerUpdated', handleUpdate)
    window.addEventListener('websiteSettingsUpdated', handleUpdate)

    return () => {
      isMounted = false
      window.removeEventListener('bannerUpdated', handleUpdate)
      window.removeEventListener('websiteSettingsUpdated', handleUpdate)
    }
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [banners.length])

  // If no banners are in DB or active, render a blank space placeholder
  if (banners.length === 0) {
    return (
      <div className="hero-card-slide-right w-full">
        <div className="relative overflow-hidden rounded-2xl min-h-[200px] sm:min-h-[220px] border border-dashed border-white/20 bg-white/10 backdrop-blur-xs flex items-center justify-center text-xs text-white/50">
          No Banners Configured
        </div>
      </div>
    )
  }

  // When banners are added in CMS, display image carousel directly
  return (
    <div className="hero-card-slide-right w-full">
      <div className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 min-h-[190px] sm:min-h-[220px] lg:min-h-[230px] flex items-center justify-center bg-black/30 border border-white/20 backdrop-blur-md">
        <div className="relative w-full h-[190px] sm:h-[220px] lg:h-[230px] overflow-hidden rounded-2xl">
          {banners.map((banner, index) => {
            const isCurrent = index === currentIndex

            return (
              <div
                key={banner.id}
                className={`transition-all duration-700 ease-in-out absolute inset-0 w-full h-full flex items-center justify-center ${
                  isCurrent
                    ? 'opacity-100 z-10 scale-100'
                    : 'opacity-0 z-0 pointer-events-none scale-95'
                }`}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title || `Homepage Banner ${index + 1}`}
                  className="w-full h-full object-cover rounded-2xl block"
                />
              </div>
            )
          })}
        </div>

        {/* Carousel indicators if more than 1 banner */}
        {banners.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-5 bg-cyan-300' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
