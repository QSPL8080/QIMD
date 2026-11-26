import fs from 'fs'
import path from 'path'

export const GALLERY_SET_FLAG = 'system.gallerySetInstalled'
const ROOT = () => path.join(process.cwd(), 'gallery-set')

/** Photos in /gallery-set/<Category>/*.webp, in folder then file order. */
export function galleryPhotoSet() {
  const root = ROOT()
  if (!fs.existsSync(root)) return []
  const out: { category: string; file: string; n: number }[] = []
  for (const category of fs.readdirSync(root).sort()) {
    const dir = path.join(root, category)
    if (!fs.statSync(dir).isDirectory()) continue
    const files = fs.readdirSync(dir).filter((f) => /\.(webp|jpe?g|png)$/i.test(f)).sort()
    files.forEach((f, i) => out.push({ category, file: path.join(dir, f), n: i + 1 }))
  }
  return out
}
