'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { testimonialsData } from '@/data'
import type { Testimonial } from '@/types'
import VideoModal from '@/components/Common/VideoModal'
import { resolveTestimonialVideo } from '@/lib/testimonialVideos'

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <span className="qo-stars" aria-label={`${rating} out of 5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Icon key={i} icon={i < rating ? 'mdi:star' : 'mdi:star-outline'} className={i < rating ? 'is-on' : ''} />
    ))}
  </span>
)

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

const HomeTestimonialCard: React.FC<{ testimonial: Testimonial; onOpenVideo: (url: string, name: string) => void }> = ({
  testimonial,
  onOpenVideo,
}) => {
  const isVideoTestimonial = !!(testimonial.isVideo && testimonial.videoUrl && testimonial.videoUrl.trim() !== '')
  const resolved = resolveTestimonialVideo(testimonial)
  const open = () => onOpenVideo(resolved.src || testimonial.videoUrl!, testimonial.studentName)

  return (
    <article className={`qo-voice${resolved.isLocal ? ' is-reel' : ''}`}>
      {isVideoTestimonial && (
        <button type="button" onClick={open} className="qo-voice-media" aria-label="Play video review">
          <Image
            src={resolved.poster || testimonial.videoThumbnail || testimonial.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80'}
            alt={`${testimonial.studentName} Video Review`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <span className="qo-voice-play">
            <Icon icon="mdi:play" />
          </span>
          <span className="qo-voice-tag">
            <Icon icon="mdi:video" /> Video Review
          </span>
        </button>
      )}

      <div className="qo-voice-body">
        <div className="qo-voice-person">
          <div className="qo-voice-avatar">
            {testimonial.image ? (
              <Image src={testimonial.image} alt={testimonial.studentName} width={44} height={44} />
            ) : (
              <Icon icon="mdi:account" />
            )}
          </div>
          <div className="qo-voice-who">
            <h4>{testimonial.studentName}</h4>
            <p>{testimonial.courseTaken || (testimonial as any).course}</p>
            {testimonial.company && <p className="qo-voice-company">@ {testimonial.company}</p>}
          </div>
          <StarRating rating={testimonial.rating} />
        </div>

        {testimonial.heading && <h5 className="qo-voice-heading">&quot;{testimonial.heading}&quot;</h5>}

        <p className="qo-voice-quote">&quot;{testimonial.review}&quot;</p>

        <div className="qo-voice-foot">
          <span>Verified QIMD Student</span>
          {isVideoTestimonial && (
            <button type="button" onClick={open} className="qo-voice-watch">
              <span>Watch Video</span>
              <Icon icon="mdi:play-circle" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; name: string } | null>(null)

  const rawList = testimonials && testimonials.length > 0 ? testimonials : testimonialsData
  const videoOnlyList = rawList.filter(t => t.isVideo && t.videoUrl && t.videoUrl.trim() !== '')
  const itemsToDisplay = videoOnlyList.length > 0 ? videoOnlyList.slice(0, 3) : rawList.slice(0, 3)

  return (
    <section className="qo-sec qo-voices" id="testimonials">
      <div className="qo-wrap qo-voices-grid">
        <div className="qo-voices-head">
          <span className="qo-kicker is-light">
            <Icon icon="mdi:video-outline" />
            Real Student Stories
          </span>
          <h2 className="qo-h2 is-light">Student Video Testimonials</h2>
          <p>Hear directly from our students about their learning experience, practical training, and career growth.</p>
          <Link href="/reviews-testimonials" className="qo-btn qo-btn-light">
            <span>View All Reviews</span>
            <Icon icon="mdi:arrow-right" />
          </Link>
        </div>

        <div className="qo-voices-list">
          {itemsToDisplay.map((testimonial) => (
            <HomeTestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              onOpenVideo={(url, name) => setSelectedVideo({ url, name })}
            />
          ))}
        </div>
      </div>

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
