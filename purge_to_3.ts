import { db } from './src/lib/db'
import { testimonialsData } from './src/data'

async function purgeExtraAndKeepOnly3() {
  console.log('--- PURGING EXTRA TESTIMONIALS & REVIEWS TO KEEP EXACTLY 3 ---')
  
  // Wipe both tables clean
  await db.testimonial.deleteMany({})
  await db.studentReview.deleteMany({})

  console.log('Inserting exactly 3 items into testimonials & student_reviews tables...')
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
        isVideo: true,
        videoUrl: t.videoUrl || null,
        videoThumbnail: t.videoThumbnail || null,
        studentStory: t.studentStory || null,
        featured: true,
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

  console.log('✅ Final Testimonials count:', tCount)
  console.log('✅ Final StudentReviews count:', rCount)

  await db.$disconnect()
}

purgeExtraAndKeepOnly3()
