/**
 * Student testimonial videos hosted with the website (public/videos/testimonials).
 * Matched to testimonials by the student's name, so they play even when the
 * testimonial's own video link is missing or broken.
 */
export const LOCAL_TESTIMONIAL_VIDEOS: { names: string[]; src: string; poster: string }[] = [
  { names: ['tanisha'], src: '/videos/testimonials/tanisha-bangde.mp4', poster: '/videos/testimonials/tanisha-bangde.jpg' },
  { names: ['sakshi'], src: '/videos/testimonials/sakshi-gadikar.mp4', poster: '/videos/testimonials/sakshi-gadikar.jpg' },
  { names: ['ubaid'], src: '/videos/testimonials/ubaid-maner.mp4', poster: '/videos/testimonials/ubaid-maner.jpg' },
  { names: ['gayatri'], src: '/videos/testimonials/gayatri-sitafale.mp4', poster: '/videos/testimonials/gayatri-sitafale.jpg' },
]

export function localTestimonialVideo(studentName?: string | null) {
  if (!studentName) return null
  const first = studentName.trim().toLowerCase().split(/\s+/)[0]
  return LOCAL_TESTIMONIAL_VIDEOS.find((v) => v.names.includes(first)) || null
}

export const isVideoFile = (url?: string | null) => !!url && /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)

/** Best playable URL + poster for a testimonial */
export function resolveTestimonialVideo(t: { studentName?: string; videoUrl?: string | null; videoThumbnail?: string | null; image?: string | null }) {
  const local = localTestimonialVideo(t.studentName)
  if (local) return { src: local.src, poster: local.poster, isFile: true, isLocal: true }
  return { src: t.videoUrl || '', poster: t.videoThumbnail || null, isFile: isVideoFile(t.videoUrl), isLocal: false }
}
