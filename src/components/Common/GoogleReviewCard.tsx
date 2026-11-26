'use client'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'

type Props = {
  name: string
  program?: string
  rating?: number
  review: string
  photo?: string | null
}

/** Student review laid out like a Google review: avatar + name, star row, text with "Read more" */
export default function GoogleReviewCard({ name, program, rating = 5, review, photo }: Props) {
  const [open, setOpen] = useState(false)
  const [clamped, setClamped] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    const check = () => setClamped(el.scrollHeight - el.clientHeight > 2)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [review])

  const stars = Math.max(0, Math.min(5, Math.round(rating)))

  return (
    <figure className="qg-card">
      <figcaption className="qg-head">
        <span className="qg-avatar" aria-hidden="true">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          ) : name ? (
            name.trim().charAt(0).toUpperCase()
          ) : (
            'S'
          )}
        </span>
        <span className="qg-who">
          <strong>{name}</strong>
          <small>Verified Student</small>
        </span>
      </figcaption>

      <div className="qg-meta">
        <span className="qg-stars" aria-label={`${stars} out of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} icon="mdi:star" className={i < stars ? 'is-on' : ''} />
          ))}
        </span>
        {program && <span className="qg-program">{program}</span>}
      </div>

      <blockquote className="qg-body">
        <p ref={textRef} className={open ? 'is-open' : ''}>{review}</p>
        {(clamped || open) && (
          <button type="button" className="qg-more" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? 'Show less' : 'Read more'}
          </button>
        )}
      </blockquote>
    </figure>
  )
}
