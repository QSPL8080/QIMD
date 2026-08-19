import { PrismaClient } from '@prisma/client'

async function dropLocal() {
  const localDbUrl = 'postgresql://postgres:8080@localhost:5432/qimd_db?schema=public'
  console.log('Connecting to local DB:', localDbUrl)
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url: localDbUrl }
    }
  })

  try {
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "roles", "media_library", "roles", "Media_library", "Roles" CASCADE;')
    console.log('✅ Successfully dropped "roles" and "media_library" from LOCAL PostgreSQL database (qimd_db)!')
  } catch (err: any) {
    console.error('Error dropping from local DB:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

dropLocal()
