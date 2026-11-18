'use client'

/**
 * SiteMotion — site-wide, non-intrusive scroll reveal for every section.
 * - Pure visual layer: never changes content, markup structure or behaviour.
 * - Skips anything that already animates itself (AOS, marquees, sliders, header/footer, forms).
 * - Hidden state is applied by JS only, so content is always visible without JS.
 * - Respects prefers-reduced-motion and is disabled inside /admin.
 */
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const SKIP_CLOSEST =
  '[data-aos], .slick-slider, [class*="animate-marquee"], header, footer, form, nav, [role="dialog"], .fixed, .absolute, .sticky'

const ITEM_SELECTOR = [
  'h1',
  'h2',
  'h1 + p',
  'h2 + p',
  '.text-center > .inline-flex:first-child',
  '.grid > *',
  'img.rounded-2xl',
  'img.rounded-3xl',
].join(',')

export default function SiteMotion() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    const isAdmin = !!pathname?.startsWith('/admin')
    root.setAttribute('data-area', isAdmin ? 'admin' : 'site')
    if (isAdmin) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!('IntersectionObserver' in window)) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          if (el.classList.contains('qx-sec')) el.classList.add('qx-in')
          else el.classList.add('qx-shown')
          io.unobserve(el)
        })
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    )

    const scan = () => {
      const main = document.querySelector('main')
      if (!main) return
      // Re-attach anything still waiting (e.g. DOM reused across client navigation)
      main.querySelectorAll('.qx-item:not(.qx-shown), .qx-sec:not(.qx-in)').forEach((el) => io.observe(el))
      const sections = Array.from(main.querySelectorAll<HTMLElement>('section:not([data-qx])'))
      sections.forEach((section, sIndex) => {
        section.setAttribute('data-qx', '1')
        // Home hero already has its own entrance animation
        if (pathname === '/' && section === main.querySelector('section')) return
        section.classList.add('qx-sec')
        io.observe(section)

        const candidates = Array.from(section.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
        const gridIndex = new Map<Element, number>()
        candidates.forEach((el) => {
          if (el.classList.contains('qx-item')) return
          if (el.closest('section') !== section) return // nested section handles itself
          if (el.closest(SKIP_CLOSEST)) return
          if (el.querySelector('[data-aos], form, iframe, video')) return
          // do not animate inside something that is already animating
          const parentItem = el.parentElement?.closest('.qx-item')
          if (parentItem && section.contains(parentItem)) return

          let delay = 0
          const parent = el.parentElement
          if (parent && parent.classList.contains('grid')) {
            const i = gridIndex.get(parent) ?? 0
            gridIndex.set(parent, i + 1)
            delay = Math.min(i, 8) * 90
          } else if (el.tagName === 'P') {
            delay = 120
          } else if (el.tagName === 'H1' || el.tagName === 'H2') {
            delay = 60
          }
          el.style.setProperty('--qx-d', `${delay}ms`)
          el.classList.add('qx-item')
          if (el.tagName === 'IMG') el.classList.add('qx-zoom')
          io.observe(el)
        })
        void sIndex
      })
    }

    // First pass after paint, then watch for client-rendered sections
    const t = window.setTimeout(scan, 60)
    let raf = 0
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => scan())
    })
    const main = document.querySelector('main')
    if (main) mo.observe(main, { childList: true, subtree: true })

    // Safety net: never leave anything hidden
    const safety = window.setTimeout(() => {
      document.querySelectorAll('.qx-item:not(.qx-shown)').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight) el.classList.add('qx-shown')
      })
    }, 2500)

    return () => {
      window.clearTimeout(t)
      window.clearTimeout(safety)
      cancelAnimationFrame(raf)
      mo.disconnect()
      io.disconnect()
    }
  }, [pathname])

  return null
}
