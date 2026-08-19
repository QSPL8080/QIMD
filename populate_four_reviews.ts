import { PrismaClient } from '@prisma/client'

async function populateAllFourReviews() {
  const localUrl = 'postgresql://postgres:8080@localhost:5432/qimd_db?schema=public'
  const remoteUrl = 'postgresql://postgres.wkbzlqimfnrtnwwkbcki:QSPLProductions%408080@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'

  const fourReviews = [
    {
      studentName: "Rohan V.",
      course: "Digital Marketing Master Program",
      review: "The practical training and live client projects helped me build confidence and prepare for interviews. The trainers were supportive throughout my learning journey.",
      rating: 5,
      company: "Growth Media Agency",
      displayOrder: 1,
      isActive: true,
    },
    {
      studentName: "Sneha M.",
      course: "UI/UX & Graphic Design Course",
      review: "The AI-powered curriculum, internships, and placement guidance gave me the skills I needed to start my career with confidence.",
      rating: 5,
      company: "Creative Studio",
      displayOrder: 2,
      isActive: true,
    },
    {
      studentName: "Aniket K.",
      course: "Video Editing & Content Creation",
      review: "Unlike traditional institutes, QIMD focuses on practical implementation. Every assignment and project helped me understand how the industry actually works.",
      rating: 5,
      company: "Media House",
      displayOrder: 3,
      isActive: true,
    },
    {
      studentName: "Pooja S.",
      course: "Full-Stack Digital Marketing & AI",
      review: "From zero experience to working on real client projects, the journey at QIMD has been truly rewarding. I highly recommend it to anyone looking to build a career in the digital industry.",
      rating: 5,
      company: "Tech Agency",
      displayOrder: 4,
      isActive: true,
    },
  ]

  console.log('--- SEEDING 4 STUDENT REVIEWS IN LOCAL DB ---')
  const localPrisma = new PrismaClient({ datasources: { db: { url: localUrl } } })
  try {
    await localPrisma.studentReview.deleteMany({})
    for (const r of fourReviews) {
      await localPrisma.studentReview.create({ data: r })
    }
    console.log('✅ Added 4 student reviews to LOCAL DB!')
  } catch (e: any) {
    console.error('Local DB Error:', e.message)
  } finally {
    await localPrisma.$disconnect()
  }

  console.log('--- SEEDING 4 STUDENT REVIEWS IN SUPABASE REMOTE DB ---')
  const remotePrisma = new PrismaClient({ datasources: { db: { url: remoteUrl } } })
  try {
    await remotePrisma.studentReview.deleteMany({})
    for (const r of fourReviews) {
      await remotePrisma.studentReview.create({ data: r })
    }
    console.log('✅ Added 4 student reviews to SUPABASE DB!')
  } catch (e: any) {
    console.error('Supabase DB Error:', e.message)
  } finally {
    await remotePrisma.$disconnect()
  }
}

populateAllFourReviews()
