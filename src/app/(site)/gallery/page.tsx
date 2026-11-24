'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { galleryData, galleryCategories } from '@/data'
import { QwHero } from '@/components/WhyQimd/WhyKit'

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
      const res = await fetch('/api/public-gallery', { cache: 'no-store' })
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
    <div className="qw">
      <QwHero
        kicker="Campus & Experiential Learning"
        icon="mdi:image-multiple-outline"
        title="Life at QIMD"
        intro={
          <>
            <p className="qw-sub">Where Learning Meets Real-World Experience</p>
            <p>
              At QIMD (Quickupp Institute of Marketing &amp; Design), learning goes beyond the classroom. Every day is filled with interactive sessions, practical workshops, live client projects, brainstorming activities, and collaborative learning that prepare students for successful careers.
            </p>
          </>
        }
        aside={
          <p>
            Our campus is designed to create an engaging environment where students learn, practice, innovate, and grow together.
          </p>
        }
      />

      <section className="qw-sec qw-sec-tint qw-gallery-sec">
        <div className="qw-wrap">
          {/* Category filter */}
          <div className="qw-filters" role="tablist" aria-label="Gallery categories">
            {categoriesList.map((cat) => {
              const isActive = cat.toLowerCase() === activeCategory.toLowerCase()
              const count = categoryCounts[cat] || 0
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`qw-filter${isActive ? ' is-active' : ''}`}
                >
                  <span>{cat}</span>
                  <span className="qw-filter-count">{count}</span>
                </button>
              )
            })}
          </div>

          {/* Active filter info */}
          <div className="qw-filter-info">
            <div>
              Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'media item' : 'media items'}{' '}
              {activeCategory !== 'All' && (
                <span>
                  in <strong className="qw-accent">"{activeCategory}"</strong>
                </span>
              )}
            </div>
            {activeCategory !== 'All' && (
              <button type="button" onClick={() => handleCategorySelect('All')} className="qw-filter-clear">
                <span>Show All Categories</span>
                <Icon icon="mdi:close-circle" />
              </button>
            )}
          </div>

          {/* Gallery */}
          {loading ? (
            <div className="qw-gallery-state">
              <Icon icon="ion:sync" className="qw-spin" />
              Loading campus gallery...
            </div>
          ) : filtered.length === 0 ? (
            <div className="qw-gallery-state">
              <Icon icon="mdi:image-off-outline" />
              <p>
                No photos found under {activeCategory === 'All' ? 'this gallery' : `the "${activeCategory}" category`}.
              </p>
              <button type="button" onClick={() => handleCategorySelect('All')} className="qw-btn qw-btn-main">
                <span>View All Media ({galleryItems.length})</span>
              </button>
            </div>
          ) : (
            <div className="qw-masonry">
              {filtered.map((image, index) => {
                const isVideo =
                  image.mediaType === 'VIDEO' ||
                  image.fileUrl.includes('youtube') ||
                  image.fileUrl.includes('vimeo') ||
                  image.fileUrl.endsWith('.mp4')
                const categoryLabel = image.category || 'Classroom'
                return (
                  <button
                    type="button"
                    key={image.id || index}
                    onClick={() => openLightbox(index)}
                    className={`qw-shot t${index % 3}`}
                  >
                    {isVideo ? (
                      <span className="qw-shot-video">
                        <Icon icon="ion:play-circle" />
                        <span className="qw-shot-video-title">{image.altText || 'Video Media'}</span>
                        <span className="qw-shot-cat">{categoryLabel}</span>
                      </span>
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.fileUrl} alt={image.altText || 'QIMD Campus Media'} loading="lazy" />
                        <span className="qw-shot-caption">
                          <span className="qw-shot-cat">{categoryLabel}</span>
                          <span className="qw-shot-text">{image.caption || image.altText || 'QIMD Practical Training'}</span>
                        </span>
                        <span className="qw-shot-zoom">
                          <Icon icon="mdi:magnify-plus" />
                          <span>Click to Expand</span>
                        </span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && activeLightboxItem && (
        <div className="qw-lightbox" onClick={closeLightbox}>
          <div className="qw-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={closeLightbox} className="qw-lb-btn qw-lb-close" aria-label="Close Lightbox">
              <Icon icon="mdi:close" />
            </button>
            <div className="qw-lightbox-media">
              {activeLightboxItem.mediaType === 'VIDEO' || activeLightboxItem.fileUrl.endsWith('.mp4') ? (
                <video controls>
                  <source src={activeLightboxItem.fileUrl} />
                  Your browser does not support HTML video.
                </video>
              ) : activeLightboxItem.fileUrl.includes('youtube') || activeLightboxItem.fileUrl.includes('vimeo') ? (
                <iframe src={activeLightboxItem.fileUrl} allowFullScreen />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeLightboxItem.fileUrl} alt={activeLightboxItem.altText || 'Gallery Lightbox'} />
              )}
            </div>
            <div className="qw-lightbox-info">
              <span className="qw-shot-cat">{activeLightboxItem.category || 'Classroom'}</span>
              <p className="qw-lightbox-title">{activeLightboxItem.altText || 'QIMD Campus Media'}</p>
              {activeLightboxItem.caption && <p className="qw-lightbox-caption">{activeLightboxItem.caption}</p>}
              <p className="qw-lightbox-count">
                {lightboxIndex + 1} of {filtered.length}
              </p>
            </div>
            {filtered.length > 1 && (
              <>
                <button type="button" onClick={prevImage} className="qw-lb-btn qw-lb-prev" aria-label="Previous Image">
                  <Icon icon="mdi:chevron-left" />
                </button>
                <button type="button" onClick={nextImage} className="qw-lb-btn qw-lb-next" aria-label="Next Image">
                  <Icon icon="mdi:chevron-right" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
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
