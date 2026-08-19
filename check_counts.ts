import { db } from './src/lib/db'

async function checkCounts() {
  const testimonials = await db.testimonial.count()
  const studentReviews = await db.studentReview.count()

  console.log('--- DB ROW COUNTS ---')
  console.log('Testimonials count:', testimonials)
  console.log('StudentReviews count:', studentReviews)

  await db.$disconnect()
}

checkCounts()
