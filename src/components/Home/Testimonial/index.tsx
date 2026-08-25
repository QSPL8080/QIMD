'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { testimonialsData } from '@/data'
import type { Testimonial } from '@/types'
import VideoModal from '@/components/Common/VideoModal'

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5 flex-shrink-0">
    {Array.from({ length: 5 }).map((_, i) => (
      <Icon
        key={i}
        icon={i < rating ? 'mdi:star' : 'mdi:star-outline'}
        className={i < rating ? 'text-amber-400 text-xs sm:text-sm flex-shrink-0' : 'text-gray-300 dark:text-gray-600 text-xs sm:text-sm flex-shrink-0'}
      />
    ))}
  </div>
)

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

const HomeTestimonialCard: React.FC<{ testimonial: Testimonial; onOpenVideo: (url: string, name: string) => void }> = ({
  testimonial,
  onOpenVideo,
}) => {
  const isVideoTestimonial = !!(testimonial.isVideo && testimonial.videoUrl && testimonial.videoUrl.trim() !== '')

  return (
    <div className="bg-white dark:bg-darklight rounded-2xl p-4 sm:p-5 lg:p-6 shadow-card border border-border dark:border-dark_border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col justify-between">
      <div>
        {/* Top Header - Fully Responsive on Mobile & Tablet */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#764DFF]/30 flex-shrink-0 bg-[#764DFF]/10">
              {testimonial.image ? (
                <Image
                  src={testimonial.image}
                  alt={testimonial.studentName}
                  width={44}
                  height={44}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Icon icon="mdi:account" className="text-primary text-2xl m-auto" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-midnight_text dark:text-white text-xs sm:text-sm leading-tight truncate">
                {testimonial.studentName}
              </h4>
              <p className="text-[11px] sm:text-xs text-muted dark:text-white/60 mt-0.5 truncate">
                {testimonial.courseTaken || (testimonial as any).course}
              </p>
              {testimonial.company && (
                <p className="text-[10px] sm:text-[11px] text-[#764DFF] dark:text-[#BD69F2] font-semibold mt-0.5 truncate">
                  @ {testimonial.company}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 pt-0.5">
            <StarRating rating={testimonial.rating} />
          </div>
        </div>

        {/* Heading if provided */}
        {testimonial.heading && (
          <h5 className="text-xs font-bold text-midnight_text dark:text-white mb-2 line-clamp-1">
            &quot;{testimonial.heading}&quot;
          </h5>
        )}

        {/* TYPE A: Video Thumbnail Preview if Video Review */}
        {isVideoTestimonial && (
          <div
            onClick={() => onOpenVideo(testimonial.videoUrl!, testimonial.studentName)}
            className="relative w-full h-36 rounded-xl overflow-hidden mb-4 group cursor-pointer border border-primary/20"
          >
            <Image
              src={testimonial.videoThumbnail || testimonial.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80'}
              alt={`${testimonial.studentName} Video Review`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            <button
              aria-label="Play video review"
              className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#764DFF] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
            >
              <Icon icon="mdi:play" className="text-xl translate-x-0.5" />
            </button>
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
              <Icon icon="mdi:video" className="text-xs text-secondary" /> Video Review
            </span>
          </div>
        )}

        {/* TYPE B / Review Quote Text */}
        <p className="text-xs text-muted dark:text-white/70 leading-relaxed italic line-clamp-3 mb-3">
          &quot;{testimonial.review}&quot;
        </p>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-border/50 dark:border-dark_border/50 flex items-center justify-between text-xs">
        <span className="text-muted/60 dark:text-white/40">Verified QIMD Student</span>
        {isVideoTestimonial && (
          <button
            onClick={() => onOpenVideo(testimonial.videoUrl!, testimonial.studentName)}
            className="text-[#764DFF] dark:text-[#BD69F2] font-bold hover:underline flex items-center gap-1 cursor-pointer !border-0 !border-none !shadow-none !bg-transparent p-0"
          >
            <span>Watch Video</span>
            <Icon icon="mdi:play-circle" className="text-sm" />
          </button>
        )}
      </div>
    </div>
  )
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; name: string } | null>(null)

  const rawList = testimonials && testimonials.length > 0 ? testimonials : testimonialsData
  const videoOnlyList = rawList.filter(t => t.isVideo && t.videoUrl && t.videoUrl.trim() !== '')
  const itemsToDisplay = videoOnlyList.length > 0 ? videoOnlyList.slice(0, 3) : rawList.slice(0, 3)

  return (
    <section
      className="py-16 lg:py-24 relative overflow-hidden text-white border-y border-white/10"
      id="testimonials"
      style={{
        background: 'linear-gradient(135deg, #180e29 0%, #2b1654 35%, #3e1f7d 70%, #0284c7 100%)',
      }}
    >
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#764DFF]/20 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0284c7]/20 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/25 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md mb-3 shadow-xs">
            <Icon icon="mdi:format-quote-open" className="text-base text-cyan-300" />
            <span>Student Reviews Preview</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">
            What Our Students Say About QIMD
          </h2>
          <p className="text-slate-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Hear directly from our students about their learning experience, practical training, and career growth.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {itemsToDisplay.map((testimonial) => (
            <div key={testimonial.id} data-aos="fade-up">
              <HomeTestimonialCard
                testimonial={testimonial}
                onOpenVideo={(url, name) => setSelectedVideo({ url, name })}
              />
            </div>
          ))}
        </div>

        {/* Premium CTA to view all reviews */}
        <div className="text-center" data-aos="fade-up">
          <Link
            href="/reviews-testimonials"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#180e29] font-extrabold px-8 py-3.5 rounded-full shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span>View All Reviews</span>
            <Icon icon="mdi:arrow-right" className="text-lg text-[#764DFF]" />
          </Link>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo.url}
          title={`${selectedVideo.name} – Video Review`}
        />
      )}
    </section>
  )
}

export default TestimonialsSection