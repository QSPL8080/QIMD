'use server'

import { db } from '@/lib/db'
import { requireContentManagerSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

import { safeDeleteUnusedFile } from '@/lib/mediaService'

export async function savePartnerAction(data: {
  name: string
  logo: string
  type?: string
  websiteUrl?: string
  displayOrder?: number
  isActive?: boolean
}, id?: string) {
  const session = await requireContentManagerSession()

  if (!data.name || !data.logo) {
    return { success: false, error: 'Partner name and logo URL are required' }
  }

  try {
    const isEmi = data.type === 'EMI'

    if (isEmi) {
      if (id) {
        const existing = await db.emiPartner.findUnique({ where: { id } })
        if (existing && existing.logo && existing.logo !== data.logo) {
          await safeDeleteUnusedFile(existing.logo, { table: 'emiPartner', id })
        }

        await db.emiPartner.update({
          where: { id },
          data: {
            name: data.name,
            logo: data.logo,
            description: data.websiteUrl || '0% Interest EMI Partner',
            displayOrder: Number(data.displayOrder || 0),
            isActive: data.isActive !== undefined ? data.isActive : true,
          },
        })
      } else {
        await db.emiPartner.create({
          data: {
            name: data.name,
            logo: data.logo,
            description: data.websiteUrl || '0% Interest EMI Partner',
            displayOrder: Number(data.displayOrder || 0),
            isActive: data.isActive !== undefined ? data.isActive : true,
          },
        })
      }
    } else {
      if (id) {
        const existing = await db.partner.findUnique({ where: { id } })
        if (existing && existing.logo && existing.logo !== data.logo) {
          await safeDeleteUnusedFile(existing.logo, { table: 'partner', id })
        }

        await db.partner.update({
          where: { id },
          data: {
            name: data.name,
            logo: data.logo,
            type: data.type || 'HIRING',
            websiteUrl: data.websiteUrl || null,
            displayOrder: Number(data.displayOrder || 0),
            isActive: data.isActive !== undefined ? data.isActive : true,
          },
        })
      } else {
        await db.partner.create({
          data: {
            name: data.name,
            logo: data.logo,
            type: data.type || 'HIRING',
            websiteUrl: data.websiteUrl || null,
            displayOrder: Number(data.displayOrder || 0),
            isActive: data.isActive !== undefined ? data.isActive : true,
          },
        })
      }
    }

    revalidatePath('/admin/partners')
    revalidatePath('/')
    revalidatePath('/placements')
    revalidatePath('/courses')
    return { success: true, message: 'Partner saved successfully' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save partner' }
  }
}

export async function deletePartnerPermanentlyAction(id: string, isEmi: boolean) {
  await requireContentManagerSession()
  try {
    if (isEmi) {
      const existing = await db.emiPartner.findUnique({ where: { id } })
      await db.emiPartner.delete({ where: { id } })
      if (existing?.logo) {
        await safeDeleteUnusedFile(existing.logo)
      }
    } else {
      const existing = await db.partner.findUnique({ where: { id } })
      await db.partner.delete({ where: { id } })
      if (existing?.logo) {
        await safeDeleteUnusedFile(existing.logo)
      }
    }
    revalidatePath('/admin/partners')
    revalidatePath('/')
    revalidatePath('/placements')
    revalidatePath('/courses')
    return { success: true, message: 'Partner record deleted' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete partner' }
  }
}

export async function getPublicPartnersAction(type: 'HIRING' | 'EMI' = 'HIRING') {
  try {
    if (type === 'EMI') {
      const emis = await db.emiPartner.findMany({
        where: { isActive: true, isDeleted: false },
        orderBy: { displayOrder: 'asc' },
      })
      return emis.map((e) => ({ id: e.id, name: e.name, logo: e.logo }))
    } else {
      const partners = await db.partner.findMany({
        where: { type: 'HIRING', isActive: true, isDeleted: false },
        orderBy: { displayOrder: 'asc' },
      })
      return partners.map((p) => ({ id: p.id, name: p.name, logo: p.logo }))
    }
  } catch (err) {
    console.error('Error in getPublicPartnersAction:', err)
    return []
  }
}

export async function getPublicTestimonialsAction() {
  try {
    const list = await db.testimonial.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })
    return list.map((t) => ({
      id: t.id,
      studentName: t.studentName,
      heading: t.heading || null,
      courseTaken: t.course || 'AI Practical Course',
      review: t.review,
      rating: t.rating || 5,
      image: t.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      role: t.role || 'Alumnus',
      company: t.company || '',
      isVideo: t.isVideo || false,
      videoUrl: t.videoUrl || null,
      videoThumbnail: t.videoThumbnail || null,
      isFeatured: t.featured || false,
    }))
  } catch (err) {
    console.error('Error in getPublicTestimonialsAction:', err)
    return []
  }
}

export async function getPublicPlacementsAction() {
  try {
    const list = await db.placement.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })
    if (list.length > 0) {
      return list.map((p) => ({
        id: p.id,
        name: p.studentName || 'Placed Student',
        studentName: p.studentName || 'Placed Student',
        image: p.studentPhoto || '',
        studentPhoto: p.studentPhoto || '',
        company: p.companyName || 'Hiring Partner',
        companyName: p.companyName || 'Hiring Partner',
        companyLogo: p.companyLogo || '',
        package: p.package || '',
        role: p.designation || 'Specialist',
        designation: p.designation || 'Specialist',
        course: p.courseName || 'AI Practical Course',
        location: p.location || '',
        joiningYear: p.joiningYear || '',
        isVideo: p.isVideo || false,
        videoUrl: p.videoUrl || null,
        videoThumbnail: p.videoThumbnail || null,
        isVerified: p.isVerified !== undefined ? p.isVerified : true,
        shortSuccessStory: p.successStory || '',
        quote: p.successStory || '',
      }))
    }
  } catch (err) {
    console.error('Error in getPublicPlacementsAction:', err)
  }
  return []
}

export async function getPublicStudentReviewsAction() {
  try {
    const list = await db.studentReview.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
    })
    return list.map((r) => ({
      id: r.id,
      name: r.studentName,
      studentName: r.studentName,
      photo: r.photo || null,
      image: r.photo || null,
      course: r.course || 'AI Practical Course',
      courseTaken: r.course || 'AI Practical Course',
      rating: r.rating || 5,
      review: r.review,
      company: r.company || '',
    }))
  } catch (err) {
    console.error('Error in getPublicStudentReviewsAction:', err)
    return []
  }
}
