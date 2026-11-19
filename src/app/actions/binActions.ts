'use server'

import { revalidatePath } from 'next/cache'
import { requireSuperAdminSession } from '@/lib/auth'
import type { TrashType } from '@/lib/trash'
import { restoreEnquiryAction, deleteEnquiryAction } from './crmActions'
import {
  restoreBlogAction, deleteBlogAction,
  restorePlacementAction, deletePlacementAction,
  restoreTestimonialAction, deleteTestimonialAction,
  restoreStudentReviewAction, deleteStudentReviewAction,
  restoreFaqAction, deleteFaqAction,
  restoreGalleryItemAction, deleteGalleryItemAction,
} from './cmsActions'
import { restoreJobOpeningAction, deleteJobOpeningPermanentlyAction } from './careerActions'
import { restoreBannerAction, deleteBannerPermanentlyAction } from './bannerActions'
import { restoreUserAction, deleteUserPermanentlyAction } from './userActions'

type Item = { type: TrashType; id: string }
type Result = { success: boolean; message?: string; error?: string }

const ENQUIRY_TYPES = ['admission', 'contact', 'career', 'hire', 'franchise'] as const

async function restoreOne({ type, id }: Item): Promise<Result> {
  if ((ENQUIRY_TYPES as readonly string[]).includes(type)) return restoreEnquiryAction(type as any, id)
  switch (type) {
    case 'blog': return restoreBlogAction(id)
    case 'job': return restoreJobOpeningAction(id)
    case 'placement': return restorePlacementAction(id)
    case 'testimonial': return restoreTestimonialAction(id)
    case 'review': return restoreStudentReviewAction(id)
    case 'faq': return restoreFaqAction(id)
    case 'gallery': return restoreGalleryItemAction(id)
    case 'banner': return restoreBannerAction(id)
    case 'user': return restoreUserAction(id)
  }
  return { success: false, error: 'Unknown item type' }
}

async function deleteOne({ type, id }: Item): Promise<Result> {
  if ((ENQUIRY_TYPES as readonly string[]).includes(type)) return deleteEnquiryAction(type as any, id)
  switch (type) {
    case 'blog': return deleteBlogAction(id)
    case 'job': return deleteJobOpeningPermanentlyAction(id)
    case 'placement': return deletePlacementAction(id)
    case 'testimonial': return deleteTestimonialAction(id)
    case 'review': return deleteStudentReviewAction(id)
    case 'faq': return deleteFaqAction(id)
    case 'gallery': return deleteGalleryItemAction(id)
    case 'banner': return deleteBannerPermanentlyAction(id)
    case 'user': return deleteUserPermanentlyAction(id)
  }
  return { success: false, error: 'Unknown item type' }
}

async function runAll(items: Item[], fn: (i: Item) => Promise<Result>, verb: string) {
  await requireSuperAdminSession()
  if (!items || items.length === 0) return { success: false, error: 'Nothing selected' }
  let done = 0
  const errors: string[] = []
  for (const item of items) {
    try {
      const res = await fn(item)
      if (res.success) done++
      else errors.push(res.error || 'Failed')
    } catch (err: any) {
      errors.push(err.message || 'Failed')
    }
  }
  revalidatePath('/admin/bin')
  if (errors.length > 0) {
    return { success: done > 0, error: `${done} ${verb}, ${errors.length} failed: ${errors[0]}` }
  }
  return { success: true, message: `${done} item(s) ${verb}` }
}

/** Super Admin: put items back where they came from. */
export async function restoreBinItemsAction(items: Item[]) {
  return runAll(items, restoreOne, 'restored')
}

/** Super Admin: delete items for good. */
export async function deleteBinItemsForeverAction(items: Item[]) {
  return runAll(items, deleteOne, 'deleted permanently')
}
