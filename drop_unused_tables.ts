import { db } from './src/lib/db'

async function dropTables() {
  try {
    await db.$executeRawUnsafe('DROP TABLE IF EXISTS "roles", "media_library" CASCADE;')
    console.log('Successfully dropped "roles" and "media_library" tables directly from PostgreSQL!')
  } catch (err) {
    console.error('Error dropping tables:', err)
  } finally {
    await db.$disconnect()
  }
}

dropTables()
