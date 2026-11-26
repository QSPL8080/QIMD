import { db } from './db'

/** Institute settings, editable from Admin → Settings. Defaults apply until saved. */

export type InstituteSettings = {
  name: string
  shortName: string
  address: string
  phone: string
  email: string
  website: string
  receiptFooter: string
}

export type CourseSetting = { name: string; durationMonths: number | null; fee: number | null }

export type SettingsShape = {
  institute: InstituteSettings
  courses: CourseSetting[]
  expenseCategories: string[]
  /** Website gallery categories, in display order (managed on Admin → Gallery). */
  galleryCategories: string[]
  /** Where website form submissions are emailed (comma-separated for more than one). */
  leadNotifyEmail: string
}

export const DEFAULT_SETTINGS: SettingsShape = {
  institute: {
    name: 'Quickupp Institute of Marketing & Design',
    shortName: 'QIMD',
    address: 'Suratwala Mark Plazzo, Hinjawadi Rd, Phase 1, Pune 411057',
    phone: '',
    email: 'info@quickuppinstitute.com',
    website: 'https://www.quickuppinstitute.com',
    receiptFooter: 'This is a computer-generated receipt.',
  },
  // From the institute's admission form
  courses: [
    { name: 'Digital Marketing', durationMonths: 6, fee: null },
    { name: 'Graphic Design', durationMonths: 8, fee: null },
    { name: 'Video Editing', durationMonths: 8, fee: null },
  ],
  expenseCategories: ['Rent', 'Salary', 'Marketing', 'Utilities', 'Supplies', 'Maintenance', 'Other'],
  galleryCategories: ['Classroom', 'Training', 'Workshop', 'Activities', 'Facilities', 'Placements'],
  leadNotifyEmail: 'info@quickuppinstitute.com',
}

export type SettingKey = keyof SettingsShape

export async function getSetting<K extends SettingKey>(key: K): Promise<SettingsShape[K]> {
  try {
    const row = await (db as any).appSetting.findUnique({ where: { key } })
    if (row?.value !== undefined && row?.value !== null) {
      const def = DEFAULT_SETTINGS[key]
      if (Array.isArray(def)) return (Array.isArray(row.value) ? row.value : def) as SettingsShape[K]
      if (typeof def === 'object') return { ...(def as object), ...(row.value as object) } as SettingsShape[K]
      return (typeof row.value === typeof def ? row.value : def) as SettingsShape[K]
    }
  } catch (err) {
    console.warn('[settings] using default for', key, err instanceof Error ? err.message : err)
  }
  return DEFAULT_SETTINGS[key]
}

export async function getAllSettings(): Promise<SettingsShape> {
  const [institute, courses, expenseCategories, galleryCategories, leadNotifyEmail] = await Promise.all([
    getSetting('institute'),
    getSetting('courses'),
    getSetting('expenseCategories'),
    getSetting('galleryCategories'),
    getSetting('leadNotifyEmail'),
  ])
  return { institute, courses, expenseCategories, galleryCategories, leadNotifyEmail }
}

/** Gallery categories for the website: setting order first, then any other category that has items. */
export function orderGalleryCategories(setting: string[], itemCategories: (string | null | undefined)[]) {
  const used = new Set(itemCategories.filter(Boolean).map((c) => String(c)))
  const ordered = setting.filter((c) => used.has(c))
  for (const c of used) if (!ordered.includes(c)) ordered.push(c)
  return ordered
}
