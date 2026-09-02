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
    <div className="hero-card-slide-right w-full space-y-2">
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl bg-[#0f0728] border border-white/25">
        <div className="relative w-full h-full">
          {banners.map((banner, index) => {
            const isCurrent = index === currentIndex

            return (
              <div
                key={banner.id}
                className={`transition-opacity duration-700 ease-in-out absolute inset-0 w-full h-full ${
                  isCurrent
                    ? 'opacity-100 z-10 pointer-events-auto'
                    : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title || `Homepage Banner ${index + 1}`}
                  className="w-full h-full object-fill block select-none"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            )
          })}
        </div>

        {/* Top-Right Mini Slide Badges so nothing at the bottom is blocked */}
        {banners.length > 1 && (
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-md">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-4 bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.9)]' : 'w-1.5 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Go to banner ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
