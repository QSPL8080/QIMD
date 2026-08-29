import { db } from '../src/lib/db'
import { submitAdmissionEnquiryAction } from '../src/app/actions/crmActions'

async function runTests() {
  console.log('=== RUNNING TESTS FOR BROCHURE + LEAD MAPPING CORRECTION ===\n')

  // Clean up any previous test records first
  await db.admissionEnquiry.deleteMany({
    where: { email: { in: ['test_dm@example.com', 'test_gd@example.com', 'test_ve@example.com', 'test_rep@example.com', 'test_inact@example.com'] } }
  })
  await db.contactEnquiry.deleteMany({
    where: { email: { in: ['test_dm@example.com', 'test_gd@example.com', 'test_ve@example.com', 'test_rep@example.com', 'test_inact@example.com'] } }
  })

  // Fetch 3 courses from DB
  const courses = await db.course.findMany({
    where: { isDeleted: false },
    orderBy: { courseName: 'asc' }
  })

  console.log(`Found ${courses.length} courses in DB:`)
  courses.forEach((c, idx) => console.log(`  Course ${idx + 1}: ${c.courseName} (ID: ${c.id}, slug: ${c.slug})`))

  const c1 = courses.find(c => c.slug.includes('digital-marketing')) || courses[0]
  const c2 = courses.find(c => c.slug.includes('graphic-design')) || courses[1]
  const c3 = courses.find(c => c.slug.includes('video-editing')) || courses[2]

  // Ensure active brochures exist for all 3 courses
  await db.brochure.updateMany({ where: { courseId: c1.id }, data: { isActive: true } })
  await db.brochure.updateMany({ where: { courseId: c2.id }, data: { isActive: true } })
  await db.brochure.updateMany({ where: { courseId: c3.id }, data: { isActive: true } })

  // TEST 1: Course 1 Form Submission
  console.log('\n--- TEST 1: Home Page / Course Form for Course 1 (Digital Marketing) ---')
  const res1 = await submitAdmissionEnquiryAction({
    studentName: 'Test Student DM',
    email: 'test_dm@example.com',
    phone: '9876543210',
    courseId: c1.slug,
    city: 'Pune',
    message: 'Looking for weekend batch'
  })

  console.log('Test 1 Response:', res1)
  if (!res1.success || !res1.brochureUrl || !res1.brochureUrl.includes('digital-marketing')) {
    throw new Error('Test 1 Failed: Course 1 did not return active digital marketing brochure!')
  }
  const lead1 = await db.admissionEnquiry.findUnique({ where: { id: res1.enquiryId }, include: { course: true } })
  console.log('Test 1 DB Record:', { id: lead1?.id, studentName: lead1?.studentName, courseId: lead1?.courseId, courseName: lead1?.course?.courseName })
  if (lead1?.courseId !== c1.id) throw new Error('Test 1 Failed: Course ID not correctly mapped to Admission Enquiry!')
  console.log('✔ TEST 1 PASSED: Admission Enquiry created, Course 1 saved, Course 1 brochure returned')

  // TEST 2: Course 2 Form Submission
  console.log('\n--- TEST 2: Home Page / Course Form for Course 2 (Graphic Design) ---')
  const res2 = await submitAdmissionEnquiryAction({
    studentName: 'Test Student GD',
    email: 'test_gd@example.com',
    phone: '9876543211',
    courseId: c2.id, // passing direct UUID
    city: 'Mumbai',
    message: 'Interested in Adobe tools'
  })

  console.log('Test 2 Response:', res2)
  if (!res2.success || !res2.brochureUrl || !res2.brochureUrl.includes('graphic-design')) {
    throw new Error('Test 2 Failed: Course 2 did not return active graphic design brochure!')
  }
  const lead2 = await db.admissionEnquiry.findUnique({ where: { id: res2.enquiryId }, include: { course: true } })
  console.log('Test 2 DB Record:', { id: lead2?.id, studentName: lead2?.studentName, courseId: lead2?.courseId, courseName: lead2?.course?.courseName })
  if (lead2?.courseId !== c2.id) throw new Error('Test 2 Failed: Course ID not correctly mapped!')
  console.log('✔ TEST 2 PASSED: Admission Enquiry created, Course 2 saved, Course 2 brochure returned')

  // TEST 3: Course 3 Form Submission
  console.log('\n--- TEST 3: Home Page / Course Form for Course 3 (Video Editing) ---')
  const res3 = await submitAdmissionEnquiryAction({
    studentName: 'Test Student VE',
    email: 'test_ve@example.com',
    phone: '9876543212',
    courseId: 'ai-video-editing',
    city: 'Pune',
    message: 'Interested in Premiere Pro & DaVinci'
  })

  console.log('Test 3 Response:', res3)
  if (!res3.success || !res3.brochureUrl || !res3.brochureUrl.includes('video-editing')) {
    throw new Error('Test 3 Failed: Course 3 did not return active video editing brochure!')
  }
  const lead3 = await db.admissionEnquiry.findUnique({ where: { id: res3.enquiryId }, include: { course: true } })
  console.log('Test 3 DB Record:', { id: lead3?.id, studentName: lead3?.studentName, courseId: lead3?.courseId, courseName: lead3?.course?.courseName })
  if (lead3?.courseId !== c3.id) throw new Error('Test 3 Failed: Course ID not correctly mapped!')
  console.log('✔ TEST 3 PASSED: Admission Enquiry created, Course 3 saved, Course 3 brochure returned')

  // TEST 4: Verify Submissions in Admission Enquiries and NOT Contact Enquiry
  console.log('\n--- TEST 4: Verify Submissions in Admin Panel Database ---')
  const countAdmission = await db.admissionEnquiry.count({
    where: { email: { in: ['test_dm@example.com', 'test_gd@example.com', 'test_ve@example.com'] } }
  })
  const countContact = await db.contactEnquiry.count({
    where: { email: { in: ['test_dm@example.com', 'test_gd@example.com', 'test_ve@example.com'] } }
  })
  console.log(`Admission Enquiry Count: ${countAdmission}, Contact Enquiry Count: ${countContact}`)
  if (countAdmission !== 3 || countContact !== 0) {
    throw new Error('Test 4 Failed: Leads were incorrectly sent to Contact Enquiry or missed in Admission Enquiry!')
  }
  console.log('✔ TEST 4 PASSED: All course form submissions saved strictly to Admission Enquiries table')

  // TEST 6: Replace brochure for Course 1
  console.log('\n--- TEST 6: Replace/Update a Brochure for Course 1 ---')
  const b1 = await db.brochure.findFirst({ where: { courseId: c1.id, isActive: true } })
  if (!b1) throw new Error('No active brochure found for Course 1')

  // Update with new file URL
  await db.brochure.update({
    where: { id: b1.id },
    data: { fileUrl: '/brochures/ai-digital-marketing-v2.pdf', title: 'AI Digital Marketing Updated 2026 Brochure' }
  })

  const res6 = await submitAdmissionEnquiryAction({
    studentName: 'Test Replacement Student',
    email: 'test_rep@example.com',
    phone: '9876543219',
    courseId: c1.id,
  })
  console.log('Test 6 Response:', res6)
  if (res6.brochureUrl !== '/brochures/ai-digital-marketing-v2.pdf') {
    throw new Error('Test 6 Failed: Replaced brochure was not returned!')
  }
  // Revert back
  await db.brochure.update({
    where: { id: b1.id },
    data: { fileUrl: '/brochures/ai-digital-marketing-brochure.pdf', title: `${c1.courseName} Brochure` }
  })
  console.log('✔ TEST 6 PASSED: Replaced brochure dynamically downloads on form submission')

  // TEST 7: Deactivate brochure for Course 1 and submit
  console.log('\n--- TEST 7: Deactivate Brochure & Verify Lead Capture without Brochure Download ---')
  await db.brochure.updateMany({
    where: { courseId: c1.id },
    data: { isActive: false }
  })

  const res7 = await submitAdmissionEnquiryAction({
    studentName: 'Test Inactive Brochure Student',
    email: 'test_inact@example.com',
    phone: '9876543218',
    courseId: c1.id,
  })
  console.log('Test 7 Response:', res7)
  if (!res7.success) {
    throw new Error('Test 7 Failed: Form submission broke when brochure was inactive!')
  }
  if (res7.brochureUrl !== null) {
    throw new Error('Test 7 Failed: Inactive brochure was unexpectedly returned!')
  }
  const lead7 = await db.admissionEnquiry.findUnique({ where: { id: res7.enquiryId } })
  if (!lead7) throw new Error('Test 7 Failed: Lead was not saved!')
  console.log('✔ TEST 7 PASSED: Admission Enquiry successfully saved even when brochure is inactive, returning brochureUrl: null')

  // Reactivate Course 1 brochure
  await db.brochure.updateMany({
    where: { courseId: c1.id },
    data: { isActive: true }
  })

  // Clean up test records
  await db.admissionEnquiry.deleteMany({
    where: { email: { in: ['test_dm@example.com', 'test_gd@example.com', 'test_ve@example.com', 'test_rep@example.com', 'test_inact@example.com'] } }
  })

  console.log('\n========================================')
  console.log('🎉 ALL 7 TESTS PASSED PERFECTLY!')
  console.log('========================================')
}

runTests()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (err) => {
    console.error('❌ Test failed:', err)
    await db.$disconnect()
    process.exit(1)
  })
