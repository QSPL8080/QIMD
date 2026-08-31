'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { galleryData, galleryCategories } from '@/data'

interface GalleryItem {
  id: string
  album?: string
  category?: string
  mediaType: 'IMAGE' | 'VIDEO'
  fileUrl: string
  thumbnail?: string
  altText?: string
  caption?: string
  createdAt: string
}

function GalleryContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get('category')

  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Sync active category from URL parameter on initial load or change
  useEffect(() => {
    if (categoryParam) {
      const match = galleryCategories.find(
        (cat) => cat.toLowerCase() === categoryParam.toLowerCase()
      )
      if (match) {
        setActiveCategory(match)
      } else {
        setActiveCategory(categoryParam)
      }
    } else {
      setActiveCategory('All')
    }
  }, [categoryParam])

  const fetchPublicGallery = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/public-gallery')
      const data = await res.json()
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        setGalleryItems(data.items)
      } else {
        // Fallback to static gallery data
        const fallback: GalleryItem[] = galleryData.map((item, idx) => ({
          id: item.id || `gallery-static-${idx}`,
          album: item.category || 'Classroom',
          category: item.category || 'Classroom',
          mediaType: 'IMAGE',
          fileUrl: item.src,
          thumbnail: item.src,
          altText: item.alt,
          caption: item.caption,
          createdAt: new Date().toISOString(),
        }))
        setGalleryItems(fallback)
      }
    } catch (err) {
      console.error('Failed to fetch website gallery items:', err)
      // Fallback on error
      const fallback: GalleryItem[] = galleryData.map((item, idx) => ({
        id: item.id || `gallery-static-${idx}`,
        album: item.category || 'Classroom',
        category: item.category || 'Classroom',
        mediaType: 'IMAGE',
        fileUrl: item.src,
        thumbnail: item.src,
        altText: item.alt,
        caption: item.caption,
        createdAt: new Date().toISOString(),
      }))
      setGalleryItems(fallback)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicGallery()
  }, [])

  // Build list of all available categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>(galleryCategories)
    galleryItems.forEach((item) => {
      if (item.category) set.add(item.category)
    })
    return Array.from(set)
  }, [galleryItems])

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: galleryItems.length }
    galleryItems.forEach((item) => {
      const cat = item.category || 'Classroom'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [galleryItems])

  // Filter items according to activeCategory
  const filtered = useMemo(() => {
    if (activeCategory === 'All') return galleryItems
    return galleryItems.filter(
      (img) => (img.category || 'Classroom').toLowerCase() === activeCategory.toLowerCase()
    )
  }, [activeCategory, galleryItems])

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat)
    if (cat === 'All') {
      router.push('/gallery', { scroll: false })
    } else {
      router.push(`/gallery?category=${encodeURIComponent(cat)}`, { scroll: false })
    }
  }

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevImage = () =>
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filtered.length) % filtered.length : null))
  const nextImage = () =>
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filtered.length : null))

  const activeLightboxItem = lightboxIndex !== null ? filtered[lightboxIndex] : null

  return (
    <>
      <section
        className="pt-20 sm:pt-28 pb-16 lg:pb-24 border-b border-slate-200/80 dark:border-dark_border relative overflow-hidden min-h-[60vh] text-midnight_text"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #e8dcff 75%, #c8e0fe 100%)',
        }}
      >
        <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-10" data-aos="fade-up">
            <span className="inline-flex items-center gap-1.5 bg-[#764DFF]/15 border border-[#764DFF]/25 text-[#5c38d6] text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs mb-3">
              <Icon icon="mdi:image-multiple-outline" className="text-sm" />
              <span>Campus &amp; Experiential Learning</span>
            </span>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-[#111827] dark:text-white tracking-tight mb-2">
              Life at QIMD
            </h1>
            <p className="text-primary font-extrabold text-base sm:text-lg mb-4">
              Where Learning Meets Real-World Experience
            </p>
            <div className="text-slate-600 dark:text-white/70 text-xs sm:text-sm max-w-3xl mx-auto space-y-2 leading-relaxed font-medium">
              <p>
                At QIMD (Quickupp Institute of Marketing &amp; Design), learning goes beyond the classroom. Every day is filled with interactive sessions, practical workshops, live client projects, brainstorming activities, and collaborative learning that prepare students for successful careers.
              </p>
              <p className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                Our campus is designed to create an engaging environment where students learn, practice, innovate, and grow together.
              </p>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8" data-aos="fade-up">
            {categoriesList.map((cat) => {
              const isActive = cat.toLowerCase() === activeCategory.toLowerCase()
              const count = categoryCounts[cat] || 0

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-full border transition-all duration-200 cursor-pointer shadow-xs flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-md scale-105'
                      : 'bg-white dark:bg-darklight text-slate-700 dark:text-white/70 border-slate-200/80 dark:border-dark_border hover:border-primary hover:text-primary hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Filter Info Badge */}
          <div className="flex items-center justify-between mb-6 px-2 text-xs font-semibold text-slate-600 dark:text-white/70">
            <div>
              Showing <span className="text-[#764DFF] font-bold">{filtered.length}</span> {filtered.length === 1 ? 'media item' : 'media items'}{' '}
              {activeCategory !== 'All' && (
                <span>
                  in <strong className="text-slate-900 dark:text-white">"{activeCategory}"</strong>
                </span>
              )}
            </div>
            {activeCategory !== 'All' && (
              <button
                onClick={() => handleCategorySelect('All')}
                className="text-[#764DFF] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Show All Categories</span>
                <Icon icon="mdi:close-circle" className="text-sm" />
              </button>
            )}
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="text-center py-20 text-muted dark:text-white/40 text-sm">
              <Icon icon="ion:sync" className="animate-spin text-3xl mx-auto mb-2 text-primary" />
              Loading campus gallery...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto space-y-3 bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200">
              <Icon icon="mdi:image-off-outline" className="text-muted/40 text-5xl mx-auto mb-1" />
              <p className="text-midnight_text dark:text-white font-bold text-base">
                No photos found under {activeCategory === 'All' ? 'this gallery' : `the "${activeCategory}" category`}.
              </p>
              <button
                onClick={() => handleCategorySelect('All')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#764DFF] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-[#5c38d6]"
              >
                <span>View All Media ({galleryItems.length})</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((image, index) => {
                const isVideo =
                  image.mediaType === 'VIDEO' ||
                  image.fileUrl.includes('youtube') ||
                  image.fileUrl.includes('vimeo') ||
                  image.fileUrl.endsWith('.mp4')
                const categoryLabel = image.category || 'Classroom'

                return (
                  <div
                    key={image.id || index}
                    onClick={() => openLightbox(index)}
                    className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-200/80 dark:border-dark_border cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {isVideo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
                        <Icon
                          icon="ion:play-circle"
                          className="text-rose-500 text-5xl group-hover:scale-110 transition-transform mb-2"
                        />
                        <span className="text-xs font-bold truncate max-w-full">
                          {image.altText || 'Video Media'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold bg-white/10 px-2 py-0.5 rounded-full">
                          {categoryLabel}
                        </span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={image.fileUrl}
                          alt={image.altText || 'QIMD Campus Media'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Gradient Badge Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                          <span className="inline-block text-[10px] font-bold bg-[#764DFF]/90 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-sm">
                            {categoryLabel}
                          </span>
                          <p className="text-xs font-semibold text-white/95 line-clamp-1">
                            {image.caption || image.altText || 'QIMD Practical Training'}
                          </p>
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center z-20">
                          <Icon icon="mdi:magnify-plus" className="text-white text-4xl mb-2 drop-shadow-md" />
                          <span className="text-white text-xs font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                            Click to Expand
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && activeLightboxItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-rose-400 transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <Icon icon="mdi:close" className="text-3xl" />
            </button>

            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center min-h-[300px] max-h-[75vh] p-2 border border-white/10">
              {activeLightboxItem.mediaType === 'VIDEO' || activeLightboxItem.fileUrl.endsWith('.mp4') ? (
                <video controls className="w-full max-h-[70vh] rounded-2xl">
                  <source src={activeLightboxItem.fileUrl} />
                  Your browser does not support HTML video.
                </video>
              ) : activeLightboxItem.fileUrl.includes('youtube') || activeLightboxItem.fileUrl.includes('vimeo') ? (
                <iframe
                  src={activeLightboxItem.fileUrl}
                  className="w-full h-96 rounded-2xl"
                  allowFullScreen
                />
              ) : (
                <img
                  src={activeLightboxItem.fileUrl}
                  alt={activeLightboxItem.altText || 'Gallery Lightbox'}
                  className="max-h-[70vh] object-contain rounded-2xl"
                />
              )}
            </div>

            {/* Lightbox Info */}
            <div className="text-center mt-4 space-y-1">
              <div className="inline-block text-[10px] font-bold bg-[#764DFF] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                {activeLightboxItem.category || 'Classroom'}
              </div>
              <p className="text-white font-bold text-base">{activeLightboxItem.altText || 'QIMD Campus Media'}</p>
              {activeLightboxItem.caption && (
                <p className="text-slate-300 text-xs">{activeLightboxItem.caption}</p>
              )}
              <p className="text-white/40 text-xs pt-1">
                {lightboxIndex + 1} of {filtered.length}
              </p>
            </div>

            {/* Navigation buttons */}
            {filtered.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Previous Image"
                >
                  <Icon icon="mdi:chevron-left" className="text-2xl" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Next Image"
                >
                  <Icon icon="mdi:chevron-right" className="text-2xl" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default function GalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-slate-500">
          <Icon icon="ion:sync" className="animate-spin text-3xl text-primary" />
        </div>
      }
    >
      <GalleryContent />
    </Suspense>
  )
}
