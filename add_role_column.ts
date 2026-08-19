import { db } from './src/lib/db'

async function addRoleColumn() {
  try {
    console.log('--- Checking & adding "role" column to users table ---')
    await db.$executeRawUnsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" VARCHAR(50) DEFAULT 'ADMIN';
    `)
    console.log('✅ Column "role" successfully added to "users" table!')
  } catch (err: any) {
    console.error('Error adding role column:', err)
  } finally {
    await db.$disconnect()
  }
}

addRoleColumn()
