import { PrismaClient } from '@prisma/client'

async function hardWipeExtra() {
  const localUrl = 'postgresql://postgres:8080@localhost:5432/qimd_db?schema=public'
  const remoteUrl = 'postgresql://postgres.wkbzlqimfnrtnwwkbcki:QSPLProductions%408080@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'

  const allowedNames = ['Aisha Sharma', 'Arjun Patil', 'Rahul Deshmukh']

  console.log('--- PURGING UNWANTED NAMES FROM LOCAL DB ---')
  const localPrisma = new PrismaClient({ datasources: { db: { url: localUrl } } })
  try {
    const deletedLocalTestimonials = await localPrisma.testimonial.deleteMany({
      where: { studentName: { notIn: allowedNames } }
    })
    const deletedLocalReviews = await localPrisma.studentReview.deleteMany({
      where: { studentName: { notIn: allowedNames } }
    })
    console.log(`Deleted ${deletedLocalTestimonials.count} testimonials and ${deletedLocalReviews.count} reviews from LOCAL DB.`)
  } catch (e: any) {
    console.error('Local error:', e.message)
  } finally {
    await localPrisma.$disconnect()
  }

  console.log('--- PURGING UNWANTED NAMES FROM SUPABASE REMOTE DB ---')
  const remotePrisma = new PrismaClient({ datasources: { db: { url: remoteUrl } } })
  try {
    const deletedRemoteTestimonials = await remotePrisma.testimonial.deleteMany({
      where: { studentName: { notIn: allowedNames } }
    })
    const deletedRemoteReviews = await remotePrisma.studentReview.deleteMany({
      where: { studentName: { notIn: allowedNames } }
    })
    console.log(`Deleted ${deletedRemoteTestimonials.count} testimonials and ${deletedRemoteReviews.count} reviews from SUPABASE DB.`)
  } catch (e: any) {
    console.error('Remote error:', e.message)
  } finally {
    await remotePrisma.$disconnect()
  }
}

hardWipeExtra()
