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
    }, 4000)

    return () => clearInterval(interval)
  }, [banners.length])

  // If no banners are in DB or active, render a blank space placeholder
  if (banners.length === 0) {
    return (
      <div className="hero-card-slide-right w-full">
        <div className="relative overflow-hidden rounded-2xl min-h-[220px] sm:min-h-[240px] border border-dashed border-slate-300/60 bg-white/20 backdrop-blur-xs flex items-center justify-center" />
      </div>
    )
  }

  // When banners are added in CMS, display image carousel directly
  return (
    <div className="hero-card-slide-right w-full">
      <div className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 min-h-[220px] flex items-center justify-center bg-white/50 border border-white/80">
        <div className="relative w-full min-h-[220px] sm:min-h-[240px] overflow-hidden rounded-2xl">
          {banners.map((banner, index) => {
            const isCurrent = index === currentIndex

            return (
              <div
                key={banner.id}
                className={`transition-all duration-700 ease-in-out ${
                  isCurrent
                    ? 'opacity-100 z-10 relative scale-100'
                    : 'opacity-0 z-0 absolute inset-0 pointer-events-none scale-95'
                }`}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title || `Homepage Banner ${index + 1}`}
                  className="w-full h-full object-contain rounded-2xl block"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
