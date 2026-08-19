import { db } from './src/lib/db'
import { hashPassword } from './src/lib/auth'

async function seedAdminOnly() {
  try {
    const passwordHash = await hashPassword('Superadmin@123')
    
    const user = await db.user.upsert({
      where: { email: 'superadmin@gmail.com' },
      update: {
        passwordHash,
        status: true,
        isDeleted: false,
        role: 'SUPER_ADMIN',
      },
      create: {
        fullName: 'Super Admin',
        email: 'superadmin@gmail.com',
        passwordHash,
        phone: '+919000000000',
        role: 'SUPER_ADMIN',
        status: true,
        isDeleted: false,
      },
    })

    console.log('✅ SUPER ADMIN ACCOUNT CREATED & UPDATED:', user.email)
  } catch (err: any) {
    console.error('Error seeding admin user:', err.message)
  } finally {
    await db.$disconnect()
  }
}

seedAdminOnly()
