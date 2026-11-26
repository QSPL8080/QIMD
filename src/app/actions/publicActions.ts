'use server'

import { db } from '@/lib/db'

// Public read-only data for the Why QIMD pages (testimonials, placements, student reviews).

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
      image: t.photo || '',
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
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return list.map((r) => {
      const courseName = (r.course || 'AI Practical Program').replace(/\bCourses\b/gi, 'Programs').replace(/\bCourse\b/gi, 'Program')
      return {
        id: r.id,
        name: r.studentName,
        studentName: r.studentName,
        initial: r.studentName ? r.studentName.trim().charAt(0).toUpperCase() : 'S',
        course: courseName,
        courseTaken: courseName,
        program: courseName,
        rating: r.rating || 5,
        review: r.review,
        company: r.company || '',
      }
    })
  } catch (err) {
    console.error('Error in getPublicStudentReviewsAction:', err)
    return []
  }
}
