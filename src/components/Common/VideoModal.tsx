'use client'
import React, { useEffect } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title?: string
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title = 'Student Success Story Video',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !videoUrl) return null

  const embedSrc = videoUrl.includes('?')
    ? `${videoUrl}&autoplay=1`
    : `${videoUrl}?autoplay=1`

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeInUp"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-midnight_text dark:bg-darklight rounded-2xl overflow-hidden shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-primary/40">
          <div className="flex items-center gap-2 text-white font-semibold text-base sm:text-lg">
            <Icon icon="mdi:play-circle" className="text-secondary text-2xl" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <Icon icon="mdi:close" className="text-xl" />
          </button>
        </div>

        {/* Video Frame */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={embedSrc}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

export default VideoModal
