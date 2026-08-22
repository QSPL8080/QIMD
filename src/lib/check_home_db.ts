import { db } from './db'

async function check() {
  const sections = await db.pageSection.findMany()
  const banners = await db.banner.findMany()
  const gallery = await db.gallery.findMany()
  const courses = await db.course.findMany({ select: { id: true, courseName: true, bannerImage: true } })

  console.log('=== PAGE SECTIONS ===')
  console.log(JSON.stringify(sections, null, 2))

  console.log('=== BANNERS ===')
  console.log(JSON.stringify(banners, null, 2))

  console.log('=== GALLERY ===')
  console.log(JSON.stringify(gallery, null, 2))

  console.log('=== COURSES ===')
  console.log(JSON.stringify(courses, null, 2))
}

check().finally(() => db.$disconnect())
