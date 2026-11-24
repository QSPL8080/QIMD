// ─── CRM & System Roles ───────────────────────────────────────
export const ROLE_SUPER_ADMIN = 'SUPER_ADMIN'
export const ROLE_ADMIN = 'ADMIN'
export const ROLE_SALES_MANAGER = 'SALES_MANAGER'
export const ROLE_COUNSELLOR = 'COUNSELLOR'
export const ROLE_ADMISSION_HEAD = 'ADMISSION_HEAD'
export const ROLE_SEO_MANAGER = 'SEO_MANAGER'
export const ROLE_VIEWER = 'VIEWER'

// Legacy / Friendly Aliases
export const ROLE_SEO = 'SEO'
export const ROLE_LEAD_MANAGER = 'LEAD_MANAGER'

export const ASSIGNABLE_ROLES = [
  ROLE_SUPER_ADMIN,
  ROLE_ADMIN,
  ROLE_SALES_MANAGER,
  ROLE_COUNSELLOR,
  ROLE_ADMISSION_HEAD,
  ROLE_SEO_MANAGER,
  ROLE_VIEWER,
] as const

export const ROLE_LABELS: Record<string, string> = {
  [ROLE_SUPER_ADMIN]: 'Super Admin',
  [ROLE_ADMIN]: 'Admin',
  [ROLE_SALES_MANAGER]: 'Sales Manager',
  [ROLE_COUNSELLOR]: 'Counsellor',
  [ROLE_ADMISSION_HEAD]: 'Admission Head',
  [ROLE_SEO_MANAGER]: 'SEO Manager',
  [ROLE_VIEWER]: 'Viewer',
  // Aliases
  [ROLE_SEO]: 'SEO Manager',
  [ROLE_LEAD_MANAGER]: 'Sales Manager',
}

export const getRoleDisplayName = (role?: string | null): string => {
  if (!role) return 'Admin'
  return ROLE_LABELS[role] || role
}

export const isSuperAdminRole = (role?: string | null) =>
  role === ROLE_SUPER_ADMIN || role === 'Super Admin'

export const isAdminRole = (role?: string | null) =>
  isSuperAdminRole(role) || role === ROLE_ADMIN || role === 'Admin'

export const isSalesManagerRole = (role?: string | null) =>
  role === ROLE_SALES_MANAGER || role === ROLE_LEAD_MANAGER || role === 'Sales Manager' || role === 'Lead Manager'

export const isCounsellorRole = (role?: string | null) =>
  role === ROLE_COUNSELLOR || role === 'Counsellor'

export const isAdmissionHeadRole = (role?: string | null) =>
  role === ROLE_ADMISSION_HEAD || role === 'Admission Head'

export const isSeoRole = (role?: string | null) =>
  role === ROLE_SEO_MANAGER || role === ROLE_SEO || role === 'SEO' || role === 'SEO Manager'

export const isViewerRole = (role?: string | null) =>
  role === ROLE_VIEWER || role === 'Viewer'

// ─── Capability Checks ──────────────────────────────────────
export const canManageBlogs = (role?: string | null) =>
  isAdminRole(role) || isSeoRole(role)

export const canManageContent = (role?: string | null) =>
  isAdminRole(role) || isSeoRole(role)

export const canManageLeads = (role?: string | null) =>
  isAdminRole(role) || isSalesManagerRole(role) || isCounsellorRole(role)

export const canAssignLeads = (role?: string | null) =>
  isAdminRole(role) || isSalesManagerRole(role)

export const canExportLeads = (role?: string | null) =>
  isAdminRole(role) || isSalesManagerRole(role)

export const canDeleteRecords = (role?: string | null) =>
  isAdminRole(role)

export const canManageAdmissions = (role?: string | null) =>
  isAdminRole(role) || isAdmissionHeadRole(role)

export const canManageExpenses = (role?: string | null) =>
  isAdminRole(role) || isAdmissionHeadRole(role)

export const canManageUsers = (role?: string | null) =>
  isSuperAdminRole(role)
