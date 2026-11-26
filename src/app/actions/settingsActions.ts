'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getAdminSession, isAdminRole, isSuperAdminRole } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { audit } from '@/lib/audit'
import { getSetting, type SettingKey } from '@/lib/settings'

type Result = { success: boolean; message?: string; error?: string }
const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

/** Admin may manage courses and expense categories; only the Super Admin changes institute details and the lead email. */
const ADMIN_KEYS: SettingKey[] = ['courses', 'expenseCategories']

function clean(key: SettingKey, value: any): { value?: any; error?: string } {
  switch (key) {
    case 'institute': {
      const v = {
        name: str(value?.name, 200),
        shortName: str(value?.shortName, 40),
        address: str(value?.address, 500),
        phone: str(value?.phone, 40),
        email: str(value?.email, 255),
        website: str(value?.website, 255),
        receiptFooter: str(value?.receiptFooter, 500),
      }
      if (!v.name) return { error: 'Institute name is required.' }
      if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return { error: 'Institute email is not valid.' }
      return { value: v }
    }
    case 'courses': {
      if (!Array.isArray(value)) return { error: 'Invalid course list.' }
      const list = []
      const seen = new Set<string>()
      for (const c of value) {
        const name = str(c?.name, 200)
        if (!name) continue
        if (seen.has(name.toLowerCase())) return { error: `"${name}" is listed twice.` }
        seen.add(name.toLowerCase())
        const dur = c?.durationMonths === '' || c?.durationMonths == null ? null : Math.round(Number(c.durationMonths))
        if (dur !== null && (!Number.isFinite(dur) || dur < 1 || dur > 60)) return { error: `${name}: duration must be 1–60 months.` }
        const fee = c?.fee === '' || c?.fee == null ? null : Math.round(Number(c.fee) * 100) / 100
        if (fee !== null && (!Number.isFinite(fee) || fee < 0)) return { error: `${name}: fee is not valid.` }
        list.push({ name, durationMonths: dur, fee })
      }
      if (list.length === 0) return { error: 'Add at least one course.' }
      return { value: list }
    }
    case 'galleryCategories':
    case 'expenseCategories': {
      if (!Array.isArray(value)) return { error: 'Invalid category list.' }
      const list = [...new Set(value.map((x: unknown) => str(x, 100)).filter(Boolean))]
      if (list.length === 0) return { error: 'Add at least one category.' }
      return { value: list }
    }
    case 'leadNotifyEmail': {
      const emails = String(value || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
      if (emails.length === 0) return { error: 'Enter at least one email address.' }
      const bad = emails.find((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      if (bad) return { error: `${bad} is not a valid email address.` }
      return { value: emails.join(', ') }
    }
  }
  return { error: 'Unknown setting.' }
}

export async function saveSettingAction(key: SettingKey, value: any): Promise<Result> {
  try {
    const session = await getAdminSession()
    if (!session) return { success: false, error: 'Please sign in again.' }
    if (key === 'galleryCategories') {
      // Website content editors (incl. SEO) manage gallery categories
      if (!can(session.roleName, 'content', 'edit', session.moduleAccess)) return { success: false, error: 'Your role cannot change the gallery.' }
    } else {
      if (!isAdminRole(session.roleName)) return { success: false, error: 'Your role cannot change settings.' }
      if (!isSuperAdminRole(session.roleName) && !ADMIN_KEYS.includes(key)) return { success: false, error: 'Only the Super Admin can change this setting.' }
    }
    const c = clean(key, value)
    if (c.error) return { success: false, error: c.error }
    const before = await getSetting(key)
    await (db as any).appSetting.upsert({
      where: { key },
      create: { key, value: c.value, updatedById: session.id, updatedByName: session.fullName },
      update: { value: c.value, updatedById: session.id, updatedByName: session.fullName },
    })
    await audit(session, 'SETTINGS_UPDATE', 'setting', key, `Updated setting: ${key}`, { before, after: c.value })
    revalidatePath('/admin', 'layout')
    return { success: true, message: 'Saved.' }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Could not save.' }
  }
}
