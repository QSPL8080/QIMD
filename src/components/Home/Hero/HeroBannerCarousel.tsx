'use client'

import React, { useEffect, useState } from 'react'

export interface Banner {
  id: string
  title?: string | null
  imageUrl: string
  displayOrder?: number
}

function getFallbackImageUrl(title?: string | null, currentUrl?: string): string {
  const t = (title || '').toLowerCase()
  const c = (currentUrl || '').toLowerCase()

  if (t.includes('graphic') || c.includes('graphic')) {
    return c.includes('graphic-design.jpeg')
      ? '/images/Banner/web banner_graphic designer  2.jpg.jpeg'
      : '/images/Banner/graphic-design.jpeg'
  }
  if (t.includes('digital') || c.includes('digital') || t.includes('market') || c.includes('market')) {
    return c.includes('digital-marketing.jpeg')
      ? '/images/Banner/web banner_digital marketing 2.jpg.jpeg'
      : '/images/Banner/digital-marketing.jpeg'
  }
  if (t.includes('video') || c.includes('video')) {
    return c.includes('video-editing.jpeg')
      ? '/images/Banner/web banner_video editor  2.jpg.jpeg'
      : '/images/Banner/video-editing.jpeg'
  }
  return '/images/Banner/graphic-design.jpeg'
}

export default function HeroBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activePreview, setActivePreview] = useState<string | null>(null)

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

    return () => {
      isMounted = false
      window.removeEventListener('bannerUpdated', handleUpdate)
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
    <>
      <div className="hero-card-slide-right w-full">
        <div 
          className="relative w-full aspect-[16/8.8] sm:aspect-[16/8.5] rounded-xl overflow-hidden shadow-xl group cursor-pointer"
          onClick={() => setActivePreview(banners[currentIndex]?.imageUrl || null)}
          title="Click to view full banner in high resolution"
        >
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
                    className="w-full h-full object-fill rounded-xl block select-none"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      const target = e.currentTarget
                      if (!target.dataset.fallbackTried) {
                        target.dataset.fallbackTried = 'true'
                        target.src = getFallbackImageUrl(banner.title, target.src)
                      }
                    }}
                  />
                </div>
              )
            })}
          </div>

          {/* Top-Right Mini Slide Indicators */}
          {banners.length > 1 && (
            <div 
              className="absolute top-2 right-2 z-30 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-3.5 bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.9)]' : 'w-1.5 bg-white/40 hover:bg-white/80'
                  }`}
                  aria-label={`Go to banner ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* High-Resolution Full Banner Lightbox Modal */}
      {activePreview && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setActivePreview(null)}
        >
          <div 
            className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePreview(null)}
              className="absolute top-3 right-3 z-30 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110"
              title="Close Preview"
            >
              ✕
            </button>
            <img 
              src={activePreview} 
              alt="Banner Full Preview" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl block"
              onError={(e) => {
                const target = e.currentTarget
                if (!target.dataset.fallbackTried) {
                  target.dataset.fallbackTried = 'true'
                  target.src = getFallbackImageUrl(undefined, target.src)
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
