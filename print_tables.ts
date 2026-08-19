import { db } from './src/lib/db'

async function printTables() {
  console.log('--- TESTIMONIALS TABLE ---')
  const testimonials = await db.testimonial.findMany({
    select: { id: true, studentName: true, course: true, isVideo: true, videoUrl: true }
  })
  console.log(testimonials)

  console.log('--- STUDENT_REVIEWS TABLE ---')
  const reviews = await db.studentReview.findMany({
    select: { id: true, studentName: true, course: true }
  })
  console.log(reviews)

  await db.$disconnect()
}

printTables()
