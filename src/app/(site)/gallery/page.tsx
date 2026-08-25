'use client'

import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'

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

const categories = ['All', 'Classroom', 'Workshop', 'Live Project', 'Guest Session', 'Student Event', 'Placement Drive']

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const fetchPublicGallery = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/public-gallery')
      const data = await res.json()
      if (data.success && Array.isArray(data.items)) {
        setGalleryItems(data.items)
      }
    } catch (err) {
      console.error('Failed to fetch website gallery items:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicGallery()
  }, [])

  const filtered =
    activeCategory === 'All'
      ? galleryItems
      : galleryItems.filter(
          (img) => (img.category || 'Classroom').toLowerCase() === activeCategory.toLowerCase()
        )

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
          <div className="text-center mb-12" data-aos="fade-up">
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

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10" data-aos="fade-up">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-full border transition-all duration-200 cursor-pointer shadow-xs ${
                  cat === activeCategory
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white dark:bg-darklight text-slate-700 dark:text-white/70 border-slate-200/80 dark:border-dark_border hover:border-primary hover:text-primary hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="text-center py-16 text-muted dark:text-white/40 text-sm">
              <Icon icon="ion:sync" className="animate-spin text-3xl mx-auto mb-2 text-primary" />
              Loading campus gallery...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto space-y-2">
              <Icon icon="mdi:image-off-outline" className="text-muted/30 dark:text-white/20 text-5xl mx-auto mb-2" />
              <p className="text-midnight_text dark:text-white font-bold text-base">
                No photos or videos added under {activeCategory === 'All' ? 'this gallery' : `the "${activeCategory}" category`} yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((image, index) => {
                const isVideo = image.mediaType === 'VIDEO' || image.fileUrl.includes('youtube') || image.fileUrl.includes('vimeo') || image.fileUrl.endsWith('.mp4')

                return (
                  <div
                    key={image.id}
                    onClick={() => openLightbox(index)}
                    className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-200/80 dark:border-dark_border cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {isVideo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
                        <Icon icon="ion:play-circle" className="text-rose-500 text-5xl group-hover:scale-110 transition-transform mb-2" />
                        <span className="text-xs font-bold truncate max-w-full">{image.altText || 'Video Media'}</span>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold bg-white/10 px-2 py-0.5 rounded-full">
                          {image.category || 'Gallery Video'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={image.fileUrl}
                          alt={image.altText || 'QIMD Campus Media'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                          <Icon icon="mdi:magnify-plus" className="text-white text-4xl mb-2" />
                          <p className="text-white text-sm font-bold">{image.altText || 'View Image'}</p>
                          {image.category && (
                            <span className="mt-1.5 text-[11px] text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
                              {image.category}
                            </span>
                          )}
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
                >
                  <Icon icon="mdi:chevron-left" className="text-2xl" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer"
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
