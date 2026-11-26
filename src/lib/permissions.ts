/**
 * Role-based access control (SRS §3). Used by the admin UI AND every server
 * action / API route, so hiding a button is never the only protection.
 *
 * Plain module (no server imports) so client components can use it too.
 */

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SEO: 'SEO',
  SALES_MANAGER: 'SALES_MANAGER',
  COUNSELLOR: 'COUNSELLOR',
  ADMISSION_HEAD: 'ADMISSION_HEAD',
  VIEWER: 'VIEWER',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LIST: { value: Role; label: string; hint: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', hint: 'Full system access' },
  { value: 'ADMIN', label: 'Admin', hint: 'Full operational access' },
  { value: 'SEO', label: 'SEO Manager', hint: 'Website content: view, add, edit, upload' },
  { value: 'SALES_MANAGER', label: 'Sales Manager', hint: 'All leads: assign, follow up, export' },
  { value: 'COUNSELLOR', label: 'Counsellor / Pre-Sales', hint: 'Only leads assigned to them' },
  { value: 'ADMISSION_HEAD', label: 'Admission Head', hint: 'Admissions, fees, expenses' },
  { value: 'VIEWER', label: 'Viewer', hint: 'Read only, granted modules' },
]

export function normalizeRole(role?: string | null): Role {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'Super Admin':
      return 'SUPER_ADMIN'
    case 'SEO':
    case 'SEO_MANAGER':
      return 'SEO'
    case 'SALES_MANAGER':
    case 'LEAD_MANAGER': // older name of the Sales Manager role
      return 'SALES_MANAGER'
    case 'COUNSELLOR':
      return 'COUNSELLOR'
    case 'ADMISSION_HEAD':
      return 'ADMISSION_HEAD'
    case 'VIEWER':
      return 'VIEWER'
    default:
      return 'ADMIN'
  }
}

export function roleLabel(role?: string | null) {
  const r = normalizeRole(role)
  return ROLE_LIST.find((x) => x.value === r)?.label || r
}

/** Modules of the admin panel. */
export type Module =
  | 'dashboard'
  | 'leads' // admission + contact + Meta + manual leads
  | 'enquiries' // career applications, hire requests, franchise enquiries
  | 'content' // banners, blogs, job openings, placed students, testimonials, reviews, FAQs, gallery
  | 'admissions'
  | 'fees'
  | 'expenses'
  | 'reports'
  | 'users'
  | 'audit'
  | 'bin'

export type Action = 'view' | 'add' | 'edit' | 'delete' | 'export' | 'assign'

/** Modules a Viewer can be granted (read only). */
export const VIEWER_MODULES: { value: Module; label: string }[] = [
  { value: 'leads', label: 'Leads' },
  { value: 'enquiries', label: 'Other Enquiries' },
  { value: 'content', label: 'Website Content' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'fees', label: 'Fees & Payments' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'reports', label: 'Reports' },
]

const ALL: Action[] = ['view', 'add', 'edit', 'delete', 'export', 'assign']

const MATRIX: Record<Exclude<Role, 'VIEWER'>, Partial<Record<Module, Action[]>>> = {
  SUPER_ADMIN: {
    dashboard: ['view'],
    leads: ALL,
    enquiries: ALL,
    content: ALL,
    admissions: ALL,
    fees: ALL,
    expenses: ALL,
    reports: ['view', 'export'],
    users: ALL,
    audit: ['view', 'export'],
    bin: ALL,
  },
  ADMIN: {
    dashboard: ['view'],
    leads: ALL,
    enquiries: ALL,
    content: ALL,
    admissions: ALL,
    fees: ALL,
    expenses: ALL,
    reports: ['view', 'export'],
    users: ['view', 'add', 'edit', 'delete'], // operational users only — never Super Admin accounts
  },
  SEO: {
    dashboard: ['view'],
    content: ['view', 'add', 'edit'],
  },
  SALES_MANAGER: {
    dashboard: ['view'],
    leads: ['view', 'add', 'edit', 'assign', 'export'],
    enquiries: ['view', 'add', 'edit', 'export'],
    reports: ['view', 'export'],
  },
  COUNSELLOR: {
    dashboard: ['view'],
    leads: ['view', 'edit'], // only leads assigned to them
  },
  ADMISSION_HEAD: {
    dashboard: ['view'],
    admissions: ['view', 'add', 'edit'],
    fees: ['view', 'add', 'edit'],
    expenses: ['view', 'add', 'edit'],
    reports: ['view'],
  },
}

/** Parse the Viewer's granted modules (stored as JSON text on the user). */
export function parseModuleAccess(raw?: string | null): Module[] {
  if (!raw) return []
  try {
    const list = JSON.parse(raw)
    const allowed = VIEWER_MODULES.map((m) => m.value)
    return Array.isArray(list) ? (list.filter((m) => allowed.includes(m)) as Module[]) : []
  } catch {
    return []
  }
}

export function can(role: string | null | undefined, module: Module, action: Action, moduleAccess?: Module[] | null): boolean {
  const r = normalizeRole(role)
  if (r === 'VIEWER') {
    if (module === 'dashboard') return action === 'view'
    return action === 'view' && Boolean(moduleAccess?.includes(module))
  }
  return Boolean(MATRIX[r][module]?.includes(action))
}

/** Counsellors only ever see leads assigned to them. */
export const isLeadScopedToAssignee = (role?: string | null) => normalizeRole(role) === 'COUNSELLOR'

/** Which module an admin URL belongs to (for page-level guards and the sidebar). */
export function moduleForPath(pathname: string): Module | null {
  const p = pathname.replace(/\/+$/, '')
  if (p === '/admin' || p.startsWith('/admin/dashboard')) return 'dashboard'
  if (p.startsWith('/admin/leads')) return 'leads'
  if (p.startsWith('/admin/enquiries')) return 'enquiries'
  if (
    ['/admin/banners', '/admin/blogs', '/admin/careers', '/admin/placements', '/admin/testimonials', '/admin/reviews', '/admin/faqs', '/admin/gallery'].some(
      (x) => p === x || p.startsWith(x + '/'),
    )
  )
    return 'content'
  if (p.startsWith('/admin/admissions')) return 'admissions'
  if (p.startsWith('/admin/fees') || p.startsWith('/admin/receipts')) return 'fees'
  if (p.startsWith('/admin/expenses')) return 'expenses'
  if (p.startsWith('/admin/reports')) return 'reports'
  if (p.startsWith('/admin/users') || p.startsWith('/admin/settings')) return 'users' // Super Admin / Admin only
  if (p.startsWith('/admin/audit')) return 'audit'
  if (p.startsWith('/admin/bin')) return 'bin'
  return null
}

/** Lead statuses (SRS §7.5). */
export const LEAD_STATUSES = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'FOLLOW_UP', label: 'Follow-up Required' },
  { value: 'COUNSELLING_SCHEDULED', label: 'Counselling Scheduled' },
  { value: 'NOT_INTERESTED', label: 'Not Interested' },
  { value: 'ADMISSION_CLOSED', label: 'Admission Closed' },
  { value: 'INVALID', label: 'Invalid / Duplicate' },
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]['value']

export const leadStatusLabel = (s?: string | null) => LEAD_STATUSES.find((x) => x.value === s)?.label || 'New'

export const LEAD_SOURCES = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'META', label: 'Meta Lead Ads' },
  { value: 'MANUAL', label: 'Manual Entry' },
] as const

export const LEAD_TYPES = [
  { value: 'ADMISSION', label: 'Admission Enquiry' },
  { value: 'CONTACT', label: 'Contact Enquiry' },
] as const

export const leadSourceLabel = (s?: string | null) => LEAD_SOURCES.find((x) => x.value === s)?.label || s || ''
export const leadTypeLabel = (s?: string | null) => LEAD_TYPES.find((x) => x.value === s)?.label || s || ''
