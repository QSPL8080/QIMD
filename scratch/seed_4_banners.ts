import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Resetting and seeding 4 new banners...')
  await prisma.banner.deleteMany({})

  await prisma.banner.createMany({
    data: [
      {
        title: 'Career Booster - Upgrade Your Skills',
        imageUrl: '/images/Banner/Banner 1.png',
        displayOrder: 1,
        isActive: true,
      },
      {
        title: 'Enroll Now - Learn Practice Get Hired',
        imageUrl: '/images/Banner/Banner 2.png',
        displayOrder: 2,
        isActive: true,
      },
      {
        title: 'AI Practical - Master AI Tools',
        imageUrl: '/images/Banner/Banner 3.png',
        displayOrder: 3,
        isActive: true,
      },
      {
        title: 'Scholarship - Build Live Portfolio',
        imageUrl: '/images/Banner/Banner 4.png',
        displayOrder: 4,
        isActive: true,
      },
    ],
  })

  console.log('Successfully seeded 4 banners into database.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
