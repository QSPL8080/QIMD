import { db } from './src/lib/db'
import { testimonialsData } from './src/data'

async function populateBothTables() {
  try {
    console.log('--- POPULATING TESTIMONIALS & STUDENT_REVIEWS TABLES ---')
    await db.testimonial.deleteMany()
    await db.studentReview.deleteMany()

    for (let i = 0; i < testimonialsData.length; i++) {
      const t = testimonialsData[i]
      await db.testimonial.create({
        data: {
          studentName: t.studentName,
          photo: t.image,
          course: t.courseTaken,
          role: t.role,
          company: t.company,
          rating: t.rating || 5,
          review: t.review,
          isVideo: t.isVideo || false,
          videoUrl: t.videoUrl || null,
          videoThumbnail: t.videoThumbnail || null,
          studentStory: t.studentStory || null,
          featured: t.isFeatured || false,
          displayOrder: i + 1,
          isActive: true,
        },
      })

      await db.studentReview.create({
        data: {
          studentName: t.studentName,
          photo: t.image,
          course: t.courseTaken,
          rating: t.rating || 5,
          review: t.review,
          company: t.company,
          displayOrder: i + 1,
          isActive: true,
        },
      })
    }

    const tCount = await db.testimonial.count()
    const rCount = await db.studentReview.count()

    console.log('✅ Success!')
    console.log('Testimonials table row count:', tCount)
    console.log('StudentReviews table row count:', rCount)
  } catch (err: any) {
    console.error('Error populating reviews:', err.message)
  } finally {
    await db.$disconnect()
  }
}

populateBothTables()
