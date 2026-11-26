import { db } from './db'
import { getSetting } from './settings'

/** Courses (from Settings) and people who can be the counsellor on an admission. */
export async function admissionFormOptions() {
  const [courses, counsellors] = await Promise.all([
    getSetting('courses'),
    db.user.findMany({
      where: { status: true, isDeleted: false, role: { in: ['COUNSELLOR', 'SALES_MANAGER', 'ADMISSION_HEAD', 'ADMIN', 'SUPER_ADMIN'] } },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    }),
  ])
  return { courses, counsellors }
}
