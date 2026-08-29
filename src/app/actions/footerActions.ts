'use server'

import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function getFooterCMSData() {
  const session = await requireAdminSession()
  try {
    let settings = await db.footerSettings.findFirst()
    if (!settings) {
      const ws = await db.websiteSettings.findFirst()
      settings = await db.footerSettings.create({
        data: {
          logo: ws?.favicon || '/images/logo/qimd-logo-white.png',
          logoAltText: 'QIMD Footer Logo',
          logoLink: '/',
          logoActive: true,
          addressLabel: 'Physical Institute Address',
          fullAddress: ws?.address || 'Office 301, Hinjewadi Phase 1, Near IT Park, Pune - 411057',
          googleMapsUrl: ws?.googleMap || 'https://maps.google.com',
          addressActive: true,
        },
      })
    }

    let phones = await db.footerContactItem.findMany({
      where: { type: 'PHONE' },
      orderBy: { displayOrder: 'asc' },
    })

    let emails = await db.footerContactItem.findMany({
      where: { type: 'EMAIL' },
      orderBy: { displayOrder: 'asc' },
    })

    let columns = await db.footerColumn.findMany({
      include: {
        links: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    })

    const ws = await db.websiteSettings.findFirst()
    const activeWhatsapp = ws?.whatsappNumber || settings.whatsappNumber;

    return {
      success: true,
      settings: {
        ...settings,
        whatsappNumber: activeWhatsapp,
      },
      phones,
      emails,
      columns,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load Footer CMS data' }
  }
}

export async function updateFooterSettingsAction(data: {
  logo?: string | null
  logoAltText?: string | null
  logoLink?: string | null
  logoActive?: boolean
  showSocialIcons?: boolean
  addressLabel?: string | null
  fullAddress?: string | null
  googleMapsUrl?: string | null
  addressActive?: boolean
  whatsappText?: string | null
  whatsappNumber?: string | null
  whatsappActive?: boolean
  showScrollToTop?: boolean
  copyrightText?: string | null
  showBottomLinks?: boolean
}) {
  const session = await requireAdminSession()
  try {
    let settings = await db.footerSettings.findFirst()

    if (settings) {
      const oldLogo = settings.logo
      const oldAddress = settings.fullAddress

      settings = await db.footerSettings.update({
        where: { id: settings.id },
        data: {
          logo: data.logo !== undefined ? data.logo : settings.logo,
          logoAltText: data.logoAltText !== undefined ? data.logoAltText : settings.logoAltText,
          logoLink: data.logoLink !== undefined ? data.logoLink : settings.logoLink,
          logoActive: data.logoActive !== undefined ? data.logoActive : settings.logoActive,
          showSocialIcons: data.showSocialIcons !== undefined ? data.showSocialIcons : settings.showSocialIcons,
          addressLabel: data.addressLabel !== undefined ? data.addressLabel : settings.addressLabel,
          fullAddress: data.fullAddress !== undefined ? data.fullAddress : settings.fullAddress,
          googleMapsUrl: data.googleMapsUrl !== undefined ? data.googleMapsUrl : settings.googleMapsUrl,
          addressActive: data.addressActive !== undefined ? data.addressActive : settings.addressActive,
          whatsappText: data.whatsappText !== undefined ? data.whatsappText : settings.whatsappText,
          whatsappNumber: data.whatsappNumber !== undefined ? data.whatsappNumber : settings.whatsappNumber,
          whatsappActive: data.whatsappActive !== undefined ? data.whatsappActive : settings.whatsappActive,
          showScrollToTop: data.showScrollToTop !== undefined ? data.showScrollToTop : settings.showScrollToTop,
          copyrightText: data.copyrightText !== undefined ? data.copyrightText : settings.copyrightText,
          showBottomLinks: data.showBottomLinks !== undefined ? data.showBottomLinks : settings.showBottomLinks,
        },
      })

      if (data.logo !== undefined && data.logo !== oldLogo) {
        await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer logo changed', recordId: settings.id })
      }
      if (data.fullAddress !== undefined && data.fullAddress !== oldAddress) {
        await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer address updated', recordId: settings.id })
      }
      if (data.whatsappNumber !== undefined || data.whatsappText !== undefined) {
        await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer WhatsApp updated', recordId: settings.id })
      }
    } else {
      settings = await db.footerSettings.create({
        data: {
          logo: data.logo || '/images/logo/qimd-logo-white.png',
          logoAltText: data.logoAltText || 'QIMD Footer Logo',
          logoLink: data.logoLink || '/',
          logoActive: data.logoActive ?? true,
          showSocialIcons: data.showSocialIcons ?? true,
          addressLabel: data.addressLabel || 'Physical Institute Address',
          fullAddress: data.fullAddress || '',
          googleMapsUrl: data.googleMapsUrl || '',
          addressActive: data.addressActive ?? true,
          whatsappText: data.whatsappText || 'Chat with Us on WhatsApp',
          whatsappNumber: data.whatsappNumber || '+919130000000',
          whatsappActive: data.whatsappActive ?? true,
          showScrollToTop: data.showScrollToTop ?? true,
          copyrightText: data.copyrightText || '© 2026 QIMD Institute. All Rights Reserved.',
          showBottomLinks: data.showBottomLinks ?? false,
        },
      })
    }

    if (data.whatsappNumber !== undefined) {
      const ws = await db.websiteSettings.findFirst()
      if (ws) {
        const currentSocial: any = ws.socialLinks || {}
        const waNum = data.whatsappNumber || ''
        await db.websiteSettings.update({
          where: { id: ws.id },
          data: {
            whatsappNumber: data.whatsappNumber,
            socialLinks: {
              ...currentSocial,
              whatsapp: waNum
                ? (waNum.startsWith('http') ? waNum : `https://wa.me/${waNum.replace(/[^\d]/g, '')}`)
                : (currentSocial.whatsapp || ''),
            },
          },
        })
      }
    }

    await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer updated', recordId: settings.id })

    revalidatePath('/', 'layout')
    revalidatePath('/admin/footer')
    return { success: true, message: 'Footer settings updated successfully', settings }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update footer settings' }
  }
}

export async function saveFooterContactItemAction(data: {
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
      await db.footerContactItem.update({
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
        module: 'FOOTER',
        action: data.type === 'PHONE' ? 'Footer phone updated' : 'Footer email updated',
        recordId: id,
      })
    } else {
      const count = await db.footerContactItem.count({ where: { type: data.type } })
      const created = await db.footerContactItem.create({
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
        module: 'FOOTER',
        action: data.type === 'PHONE' ? 'Footer phone added' : 'Footer email added',
        recordId: created.id,
      })
    }

    revalidatePath('/', 'layout')
    revalidatePath('/admin/footer')
    return { success: true, message: `Footer ${data.type === 'PHONE' ? 'Phone' : 'Email'} saved successfully` }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save contact item' }
  }
}

export async function deleteFooterContactItemAction(id: string) {
  const session = await requireAdminSession()
  try {
    const item = await db.footerContactItem.findUnique({ where: { id } })
    if (!item) return { success: false, error: 'Item not found' }

    await db.footerContactItem.delete({ where: { id } })
    await createAuditLog({
      userId: session.id,
      module: 'FOOTER',
      action: item.type === 'PHONE' ? 'Footer phone deleted' : 'Footer email deleted',
      recordId: id,
    })

    revalidatePath('/', 'layout')
    revalidatePath('/admin/footer')
    return { success: true, message: 'Contact item deleted successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete contact item' }
  }
}

export async function saveFooterColumnAction(data: {
  title: string
  description?: string | null
  icon?: string | null
  displayOrder?: number
  isActive?: boolean
}, id?: string) {
  const session = await requireAdminSession()
  try {
    if (!data.title || !data.title.trim()) {
      return { success: false, error: 'Column title is required' }
    }

    if (id) {
      await db.footerColumn.update({
        where: { id },
        data: {
          title: data.title.trim(),
          description: data.description ? data.description.trim() : null,
          icon: data.icon ? data.icon.trim() : null,
          displayOrder: data.displayOrder ?? 0,
          isActive: data.isActive ?? true,
        },
      })
      await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer column updated', recordId: id })
    } else {
      const count = await db.footerColumn.count()
      const created = await db.footerColumn.create({
        data: {
          title: data.title.trim(),
          description: data.description ? data.description.trim() : null,
          icon: data.icon ? data.icon.trim() : null,
          displayOrder: data.displayOrder ?? count + 1,
          isActive: data.isActive ?? true,
        },
      })
      await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer column created', recordId: created.id })
    }

    revalidatePath('/', 'layout')
    revalidatePath('/admin/footer')
    return { success: true, message: 'Footer column saved successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save footer column' }
  }
}

export async function deleteFooterColumnAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.footerColumn.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer column deleted', recordId: id })

    revalidatePath('/', 'layout')
    revalidatePath('/admin/footer')
    return { success: true, message: 'Footer column deleted successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete footer column' }
  }
}

export async function reorderFooterColumnsAction(columns: { id: string; displayOrder: number }[]) {
  const session = await requireAdminSession()
  try {
    for (const col of columns) {
      await db.footerColumn.update({
        where: { id: col.id },
        data: { displayOrder: col.displayOrder },
      })
    }

    await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer ordering changed' })
    revalidatePath('/', 'layout')
    revalidatePath('/admin/footer')
    return { success: true, message: 'Columns reordered successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reorder columns' }
  }
}

export async function saveFooterColumnLinkAction(data: {
  columnId: string
  title: string
  url: string
  linkType?: 'INTERNAL' | 'EXTERNAL' | 'BUTTON'
  openInNewTab?: boolean
  displayOrder?: number
  isActive?: boolean
}, id?: string) {
  const session = await requireAdminSession()
  try {
    if (!data.title || !data.title.trim()) {
      return { success: false, error: 'Link title is required' }
    }
    if (!data.url || !data.url.trim()) {
      return { success: false, error: 'Link URL is required' }
    }

    if (id) {
      await db.footerColumnLink.update({
        where: { id },
        data: {
          columnId: data.columnId,
          title: data.title.trim(),
          url: data.url.trim(),
          linkType: data.linkType || 'INTERNAL',
          openInNewTab: data.openInNewTab ?? false,
          displayOrder: data.displayOrder ?? 0,
          isActive: data.isActive ?? true,
        },
      })
      await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer link updated', recordId: id })
    } else {
      const count = await db.footerColumnLink.count({ where: { columnId: data.columnId } })
      const created = await db.footerColumnLink.create({
        data: {
          columnId: data.columnId,
          title: data.title.trim(),
          url: data.url.trim(),
          linkType: data.linkType || 'INTERNAL',
          openInNewTab: data.openInNewTab ?? false,
          displayOrder: data.displayOrder ?? count + 1,
          isActive: data.isActive ?? true,
        },
      })
      await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer link created', recordId: created.id })
    }

    revalidatePath('/', 'layout')
    revalidatePath('/admin/footer')
    return { success: true, message: 'Footer link saved successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save footer link' }
  }
}

export async function deleteFooterColumnLinkAction(id: string) {
  const session = await requireAdminSession()
  try {
    await db.footerColumnLink.delete({ where: { id } })
    await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer link deleted', recordId: id })

    revalidatePath('/', 'layout')
    revalidatePath('/admin/footer')
    return { success: true, message: 'Footer link deleted successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete footer link' }
  }
}

export async function reorderFooterColumnLinksAction(links: { id: string; displayOrder: number }[]) {
  const session = await requireAdminSession()
  try {
    for (const item of links) {
      await db.footerColumnLink.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    }

    await createAuditLog({ userId: session.id, module: 'FOOTER', action: 'Footer ordering changed' })
    revalidatePath('/', 'layout')
    revalidatePath('/admin/footer')
    return { success: true, message: 'Links reordered successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reorder links' }
  }
}
