'use client'

/**
 * WhyKit — shared "wall of fame" UI for the Why QIMD sub-pages:
 * Success Stories · Our Placements · Reviews & Testimonials · Life at QIMD
 */
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'

const WHY_TABS = [
  { href: '/success-stories', label: 'Success Stories' },
  { href: '/placements', label: 'Our Placements' },
  { href: '/reviews-testimonials', label: 'Reviews & Testimonials' },
  { href: '/gallery', label: 'Life at QIMD' },
]

export function QwTabs() {
  const path = usePathname()
  return (
    <nav className="qw-tabs" aria-label="Why QIMD pages">
      {WHY_TABS.map((t) => (
        <Link key={t.href} href={t.href} className={`qw-tab${path === t.href ? ' is-active' : ''}`}>
          {t.label}
        </Link>
      ))}
    </nav>
  )
}

export function QwKicker({ children, icon, light = false }: { children: React.ReactNode; icon?: string; light?: boolean }) {
  return (
    <span className={`qw-kicker${light ? ' is-light' : ''}`}>
      <Icon icon={icon || 'mdi:star-four-points'} />
      <span>{children}</span>
    </span>
  )
}

export function QwHero({
  kicker,
  icon,
  title,
  intro,
  actions,
  aside,
}: {
  kicker: React.ReactNode
  icon?: string
  title: React.ReactNode
  intro?: React.ReactNode
  actions?: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <section className="qw-hero" data-qx="off">
      <div className="qw-wrap">
        <QwTabs />
        <div className="qw-hero-body">
          <QwKicker icon={icon}>{kicker}</QwKicker>
          <h1 className="qw-h1">{title}</h1>
          {intro && <div className="qw-hero-intro">{intro}</div>}
          {actions && <div className="qw-actions">{actions}</div>}
        </div>
        {aside && (
          <div className="qw-hero-aside">
            <Icon icon="mdi:format-quote-open" className="qw-hero-aside-ic" />
            <div>{aside}</div>
          </div>
        )}
      </div>
    </section>
  )
}

export function QwHead({
  kicker,
  icon,
  title,
  desc,
  light = false,
}: {
  kicker: React.ReactNode
  icon?: string
  title: React.ReactNode
  desc?: React.ReactNode
  light?: boolean
}) {
  return (
    <div className={`qw-head${light ? ' is-light' : ''}`}>
      <QwKicker icon={icon} light={light}>{kicker}</QwKicker>
      <h2 className="qw-h2">{title}</h2>
      {desc && <div className="qw-desc">{desc}</div>}
    </div>
  )
}

export function QwStars({ rating = 5 }: { rating?: number }) {
  return (
    <span className="qw-stars" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} icon={i < rating ? 'mdi:star' : 'mdi:star-outline'} className={i < rating ? 'is-on' : ''} />
      ))}
    </span>
  )
}

/** Sticker-style chips — tints cycle through the logo colours */
export function QwStickers({ items, light = false }: { items: { label: string; icon?: string }[]; light?: boolean }) {
  return (
    <div className={`qw-stickers${light ? ' is-light' : ''}`}>
      {items.map((it, i) => (
        <span key={i} className={`qw-sticker t${i % 3}`}>
          <Icon icon={it.icon || 'mdi:check-bold'} />
          <span>{it.label}</span>
        </span>
      ))}
    </div>
  )
}

/** Text review as a speech bubble with the author underneath */
export function QwReview({ rev, index = 0 }: { rev: any; index?: number }) {
  const name = rev.studentName || rev.name || 'Anonymous Student'
  const courseName = rev.courseTaken || rev.course || 'QIMD Program'
  return (
    <figure className={`qw-review t${index % 3}`}>
      <blockquote className="qw-bubble">
        <div className="qw-bubble-top">
          <QwStars rating={rev.rating || 5} />
          <span className="qw-bubble-course">{courseName}</span>
        </div>
        <p>&quot;{rev.review}&quot;</p>
      </blockquote>
      <figcaption className="qw-author">
        {rev.photo || rev.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={rev.photo || rev.image} alt={name} />
        ) : (
          <span className="qw-author-initial">{name.charAt(0)}</span>
        )}
        <span>
          <strong>{name}</strong>
          <small>Verified Student</small>
        </span>
      </figcaption>
    </figure>
  )
}

/** YouTube video id from any YouTube URL (watch, youtu.be, embed, shorts) */
export function youTubeId(url?: string | null): string | null {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|v\/|watch\?(?:.*&)?v=))([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

/** Video testimonial as a film frame — shows the real video frame and plays inline */
export function QwVideo({ review, onPlay }: { review: any; onPlay: () => void }) {
  const [playing, setPlaying] = React.useState(false)
  const ytId = youTubeId(review.videoUrl)
  const isFile = !ytId && /\.(mp4|webm|mov)(\?|$)/i.test(review.videoUrl || '')

  // Poster: the video's own YouTube frame → admin thumbnail → student photo
  const candidates = [ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null, review.videoThumbnail, review.image].filter(Boolean) as string[]
  const [posterIdx, setPosterIdx] = React.useState(0)
  const poster = candidates[posterIdx]
  const imgRef = React.useRef<HTMLImageElement>(null)
  const nextPoster = React.useCallback(() => setPosterIdx((i) => (i + 1 < candidates.length ? i + 1 : i)), [candidates.length])
  // An image that failed before hydration never fires onError in React — check it once mounted
  React.useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0) nextPoster()
  }, [posterIdx, nextPoster])

  const embedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`
    : review.videoUrl

  return (
    <article className="qw-film">
      <div className="qw-film-frame">
        {playing ? (
          isFile ? (
            <video src={review.videoUrl} controls autoPlay playsInline className="qw-film-media" />
          ) : (
            <iframe
              src={embedSrc}
              title={`${review.studentName} Video Review`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="qw-film-media"
            />
          )
        ) : (
          <button type="button" className="qw-film-poster" onClick={() => setPlaying(true)} aria-label="Play review video">
            {isFile && !review.videoThumbnail ? (
              <video src={`${review.videoUrl}#t=0.5`} preload="metadata" muted playsInline className="qw-film-media" />
            ) : poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt={review.studentName}
                className="qw-film-media"
                loading="lazy"
                ref={imgRef}
                onError={nextPoster}
              />
            ) : null}
            <span className="qw-film-play">
              <Icon icon="mdi:play" />
            </span>
            <span className="qw-film-tag">
              <Icon icon="mdi:video" /> Video Review
            </span>
          </button>
        )}
      </div>
      <div className="qw-film-body">
        <div className="qw-film-top">
          <h4>{review.studentName}</h4>
          <QwStars rating={review.rating || 5} />
        </div>
        <p className="qw-film-course">{review.courseTaken || review.course}</p>
        <p className="qw-film-quote">&quot;{review.review}&quot;</p>
        <button type="button" className="qw-film-link" onClick={onPlay}>
          <Icon icon="mdi:play-circle" />
          <span>Watch Full Story</span>
        </button>
      </div>
    </article>
  )
}

export function QwCta({
  kicker,
  icon,
  title,
  children,
  actions,
}: {
  kicker: React.ReactNode
  icon?: string
  title: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <section className="qw-sec qw-sec-cta">
      <div className="qw-wrap">
        <div className="qw-cta">
          <QwKicker icon={icon} light>{kicker}</QwKicker>
          <h2 className="qw-h2 is-light">{title}</h2>
          {children && <div className="qw-cta-body">{children}</div>}
          {actions && <div className="qw-actions">{actions}</div>}
        </div>
      </div>
    </section>
  )
}
