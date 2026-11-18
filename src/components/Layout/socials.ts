// Shared social-link builder for Header & Footer.
// Keeps the exact admin visibility rules (activeStatus / headerStatus / footerStatus / customLinks).
export type SocialItem = {
  key: string
  net: string
  href: string
  label: string
  icon: string
  external: boolean
}

const BASE: Array<{ key: string; label: string; icon: string }> = [
  { key: 'instagram', label: 'Instagram', icon: 'mdi:instagram' },
  { key: 'facebook', label: 'Facebook', icon: 'ri:facebook-fill' },
  { key: 'youtube', label: 'YouTube', icon: 'mdi:youtube' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'mdi:linkedin' },
  { key: 'twitter', label: 'Twitter (X)', icon: 'ri:twitter-x-fill' },
]

export function getSocialItems(
  socialLinks: any,
  place: 'header' | 'footer',
  whatsappUrl?: string | null
): SocialItem[] {
  if (!socialLinks) return []
  const statusKey = place === 'header' ? 'headerStatus' : 'footerStatus'
  const out: SocialItem[] = []

  BASE.forEach((b) => {
    const url = socialLinks[b.key]
    if (socialLinks.activeStatus?.[b.key] !== false && socialLinks[statusKey]?.[b.key] !== false && url) {
      out.push({ key: b.key, net: b.key, href: url, label: b.label, icon: b.icon, external: true })
    }
  })

  if (whatsappUrl) {
    out.push({ key: 'whatsapp', net: 'whatsapp', href: whatsappUrl, label: 'WhatsApp', icon: 'mdi:whatsapp', external: true })
  }

  ;(socialLinks.customLinks || []).forEach((c: any) => {
    const visible = place === 'header' ? c.showHeader !== false : c.showFooter !== false
    if (c.active !== false && visible) {
      const href = c.url || '#'
      out.push({
        key: `custom-${c.id}`,
        net: 'custom',
        href,
        label: c.name,
        icon: c.icon || 'ion:link-outline',
        external: href.startsWith('http'),
      })
    }
  })

  return out
}
