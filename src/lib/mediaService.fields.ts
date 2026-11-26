/** Media columns per table (Prisma model name → URL fields). */
export const MEDIA_FIELDS: Record<string, string[]> = {
  blog: ['featuredImage', 'images'],
  banner: ['imageUrl'],
  gallery: ['fileUrl', 'thumbnail'],
  placement: ['studentPhoto', 'companyLogo', 'videoUrl', 'videoThumbnail'],
  testimonial: ['photo', 'videoUrl', 'videoThumbnail'],
  studentReview: ['photo'],
}

