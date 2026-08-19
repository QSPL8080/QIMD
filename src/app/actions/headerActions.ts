'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function getHeaderCMSData() {
  const session = await requireAdminSession()
  try {
    let settings = await db.headerSettings.findFirst()
    if (!settings) {
      // Migrate initial values from WebsiteSettings if available
      const ws = await db.websiteSettings.findFirst()
      settings = await db.headerSettings.create({
        data: {
          logo: ws?.logo || '/images/logo/qimd-logo.png',
          logoAltText: 'QIMD Institute Logo',
          logoLink: '/',
          logoActive: true,
          showSocialLinks: true,
          hireFromUsText: 'Hire From Us',
          hireFromUsUrl: '/hire-from-us',
          hireFromUsNewTab: false,
          hireFromUsActive: true,
          enquireNowText: 'Enquire Now',
          enquireNowUrl: '/contact',
          enquireNowNewTab: false,
          enquireNowActive: true,
          whatsappText: 'WhatsApp',
          whatsappNumber: ws?.whatsappNumber || '+919876543210',
          whatsappActive: true,
        },
      })
    }

    let phones = await db.headerContactItem.findMany({
      where: { type: 'PHONE' },
      orderBy: { displayOrder: 'asc' },
    })

    if (phones.length === 0) {
      const ws = await db.websiteSettings.findFirst()
      const initialPhone = await db.headerContactItem.create({
        data: {
          type: 'PHONE',
          label: 'Phone',
          value: ws?.contactPhone || '+91 91300 00000',
          displayOrder: 1,
          isActive: true,
        },
      })
      phones = [initialPhone]
    }

    let emails = await db.headerContactItem.findMany({
      where: { type: 'EMAIL' },
      orderBy: { displayOrder: 'asc' },
    })

    if (emails.length === 0) {
      const ws = await db.websiteSettings.findFirst()
      const initialEmail = await db.headerContactItem.create({
        data: {
          type: 'EMAIL',
          label: 'Official Email',
          value: ws?.contactEmail || 'info@qimd.in',
          displayOrder: 1,
          isActive: true,
        },
      })
      emails = [initialEmail]
    }

    const ws = await db.websiteSettings.findFirst()
    const hpSections = (ws?.homepageSections as any) || {}
    const activeWhatsapp = ws?.whatsappNumber || settings.whatsappNumber;

    return {
      success: true,
      settings: {
        ...settings,
        whatsappNumber: activeWhatsapp,
        contactPhone: ws?.contactPhone || '+91 90000 00000',
        extraTopBarButtons: hpSections.extraTopBarButtons || [],
        extraHeaderCtaButtons: hpSections.extraHeaderCtaButtons || [],
      },
      phones,
      emails,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load Header CMS data' }
  }
}

export async function updateHeaderSettingsAction(data: {
  logo?: string | null
  logoAltText?: string | null
  logoLink?: string | null
  logoActive?: boolean
  showSocialLinks?: boolean
  hireFromUsText?: string | null
  hireFromUsUrl?: string | null
  hireFromUsNewTab?: boolean
  hireFromUsActive?: boolean
  enquireNowText?: string | null
  enquireNowUrl?: string | null
  enquireNowNewTab?: boolean
  enquireNowActive?: boolean
  whatsappText?: string | null
  whatsappNumber?: string | null
  whatsappActive?: boolean
  contactPhone?: string | null
  extraTopBarButtons?: any
  extraHeaderCtaButtons?: any
}) {
  const session = await requireAdminSession()
  try {
    let settings = await db.headerSettings.findFirst()
    const isNew = !settings

    if (settings) {
      const oldLogo = settings.logo
      settings = await db.headerSettings.update({
        where: { id: settings.id },
        data: {
          logo: data.logo !== undefined ? data.logo : settings.logo,
          logoAltText: data.logoAltText !== undefined ? data.logoAltText : settings.logoAltText,
          logoLink: data.logoLink !== undefined ? data.logoLink : settings.logoLink,
          logoActive: data.logoActive !== undefined ? data.logoActive : settings.logoActive,
          showSocialLinks: data.showSocialLinks !== undefined ? data.showSocialLinks : settings.showSocialLinks,
          hireFromUsText: data.hireFromUsText !== undefined ? data.hireFromUsText : settings.hireFromUsText,
          hireFromUsUrl: data.hireFromUsUrl !== undefined ? data.hireFromUsUrl : settings.hireFromUsUrl,
          hireFromUsNewTab: data.hireFromUsNewTab !== undefined ? data.hireFromUsNewTab : settings.hireFromUsNewTab,
          hireFromUsActive: data.hireFromUsActive !== undefined ? data.hireFromUsActive : settings.hireFromUsActive,
          enquireNowText: data.enquireNowText !== undefined ? data.enquireNowText : settings.enquireNowText,
          enquireNowUrl: data.enquireNowUrl !== undefined ? data.enquireNowUrl : settings.enquireNowUrl,
          enquireNowNewTab: data.enquireNowNewTab !== undefined ? data.enquireNowNewTab : settings.enquireNowNewTab,
          enquireNowActive: data.enquireNowActive !== undefined ? data.enquireNowActive : settings.enquireNowActive,
          whatsappText: data.whatsappText !== undefined ? data.whatsappText : settings.whatsappText,
          whatsappNumber: data.whatsappNumber !== undefined ? data.whatsappNumber : settings.whatsappNumber,
          whatsappActive: data.whatsappActive !== undefined ? data.whatsappActive : settings.whatsappActive,
        },
      })

      if (data.logo !== undefined && data.logo !== oldLogo) {
        await createAuditLog({ userId: session.id, module: 'HEADER', action: 'Header logo changed', recordId: settings.id })
      }
      if (data.hireFromUsText !== undefined || data.hireFromUsUrl !== undefined) {
        await createAuditLog({ userId: session.id, module: 'HEADER', action: 'Hire From Us updated', recordId: settings.id })
      }
      if (data.enquireNowText !== undefined || data.enquireNowUrl !== undefined) {
        await createAuditLog({ userId: session.id, module: 'HEADER', action: 'Enquire Now updated', recordId: settings.id })
      }
      if (data.whatsappNumber !== undefined || data.whatsappText !== undefined) {
        await createAuditLog({ userId: session.id, module: 'HEADER', action: 'WhatsApp updated', recordId: settings.id })
      }
    } else {
      settings = await db.headerSettings.create({
        data: {
          logo: data.logo || '/images/logo/qimd-logo.png',
          logoAltText: data.logoAltText || 'QIMD Institute Logo',
          logoLink: data.logoLink || '/',
          logoActive: data.logoActive ?? true,
          showSocialLinks: data.showSocialLinks ?? true,
          hireFromUsText: data.hireFromUsText || 'Hire From Us',
          hireFromUsUrl: data.hireFromUsUrl || '/hire-from-us',
          hireFromUsNewTab: data.hireFromUsNewTab ?? false,
          hireFromUsActive: data.hireFromUsActive ?? true,
          enquireNowText: data.enquireNowText || 'Enquire Now',
          enquireNowUrl: data.enquireNowUrl || '/contact',
          enquireNowNewTab: data.enquireNowNewTab ?? false,
          enquireNowActive: data.enquireNowActive ?? true,
          whatsappText: data.whatsappText || 'WhatsApp',
          whatsappNumber: data.whatsappNumber || '+919876543210',
          whatsappActive: data.whatsappActive ?? true,
        },
      })
    }

    // Also sync whatsappNumber, contactPhone, extraTopBarButtons & extraHeaderCtaButtons to websiteSettings
    let ws = await db.websiteSettings.findFirst()
    if (ws) {
      const updatePayload: any = {}
      if (data.whatsappNumber !== undefined) {
        updatePayload.whatsappNumber = data.whatsappNumber
      }
      if (data.contactPhone !== undefined && data.contactPhone !== null) {
        updatePayload.contactPhone = data.contactPhone
      }
      
      const currentSections = (ws.homepageSections as any) || {}
      if (data.extraTopBarButtons !== undefined || data.extraHeaderCtaButtons !== undefined) {
        updatePayload.homepageSections = {
          ...currentSections,
          extraTopBarButtons: data.extraTopBarButtons !== undefined ? data.extraTopBarButtons : currentSections.extraTopBarButtons || [],
          extraHeaderCtaButtons: data.extraHeaderCtaButtons !== undefined ? data.extraHeaderCtaButtons : currentSections.extraHeaderCtaButtons || [],
        }
      }

      await db.websiteSettings.update({
        where: { id: ws.id },
        data: updatePayload,
      })
    }

    await createAuditLog({ userId: session.id, module: 'HEADER', action: 'Header updated', recordId: settings.id })

    revalidatePath('/', 'layout')
    revalidatePath('/admin/header')
    return { success: true, message: 'Header settings updated successfully', settings }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update header settings' }
  }
}

export async function saveHeaderContactItemAction(data: {
  type: 'PHONE' | 'EMAIL'
  label: string
  value: string
  displayOrder?: number
  isActive?: boolean
}, id?: string) {
  const session = await requireAdminSession()
  try {
    if (!data.label || !data.label.trim()) {
      return { success: false, error: 'Label is required' }
    }
    if (!data.value || !data.value.trim()) {
      return { success: false, error: `${data.type === 'PHONE' ? 'Phone Number' : 'Email Address'} is required` }
    }

    if (data.type === 'EMAIL') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.value.trim())) {
        return { success: false, error: 'Invalid email address format' }
      }
    } else {
      const phoneRegex = /^[\+\d\s\-\(\)]{7,20}$/
      if (!phoneRegex.test(data.value.trim())) {
        return { success: false, error: 'Invalid phone number format' }
      }
    }

    if (id) {
      const updated = await db.headerContactItem.update({
        where: { id },
        data: {
          label: data.label.trim(),
          value: data.value.trim(),
          displayOrder: data.displayOrder ?? 0,
          isActive: data.isActive ?? true,
        },
      })
      await createAuditLog({
        userId: session.id,
        module: 'HEADER',
        action: data.type === 'PHONE' ? 'Header phone updated' : 'Header email updated',
        recordId: id,
      })
    } else {
      const count = await db.headerContactItem.count({ where: { type: data.type } })
      const created = await db.headerContactItem.create({
        data: {
          type: data.type,
          label: data.label.trim(),
          value: data.value.trim(),
          displayOrder: data.displayOrder ?? count + 1,
          isActive: data.isActive ?? true,
        },
      })
      await createAuditLog({
        userId: session.id,
        module: 'HEADER',
        action: data.type === 'PHONE' ? 'Header phone added' : 'Header email added',
        recordId: created.id,
      })
    }

    revalidatePath('/', 'layout')
    revalidatePath('/admin/header')
    return { success: true, message: `${data.type === 'PHONE' ? 'Phone' : 'Email'} item saved successfully` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save contact item' }
  }
}

export async function deleteHeaderContactItemAction(id: string) {
  const session = await requireAdminSession()
  try {
    const item = await db.headerContactItem.findUnique({ where: { id } })
    if (!item) {
      return { success: false, error: 'Contact item not found' }
    }

    await db.headerContactItem.delete({ where: { id } })
    await createAuditLog({
      userId: session.id,
      module: 'HEADER',
      action: item.type === 'PHONE' ? 'Header phone deleted' : 'Header email deleted',
      recordId: id,
    })

    revalidatePath('/', 'layout')
    revalidatePath('/admin/header')
    return { success: true, message: 'Contact item deleted successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete contact item' }
  }
}

export async function reorderHeaderContactItemsAction(items: { id: string; displayOrder: number }[]) {
  const session = await requireAdminSession()
  try {
    for (const item of items) {
      await db.headerContactItem.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    }

    await createAuditLog({ userId: session.id, module: 'HEADER', action: 'Header ordering changed' })
    revalidatePath('/', 'layout')
    revalidatePath('/admin/header')
    return { success: true, message: 'Display order updated successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reorder items' }
  }
}
