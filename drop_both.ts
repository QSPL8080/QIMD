import { PrismaClient } from '@prisma/client'

async function dropBoth() {
  const localUrl = 'postgresql://postgres:8080@localhost:5432/qimd_db?schema=public'
  const remoteUrl = 'postgresql://postgres.wkbzlqimfnrtnwwkbcki:QSPLProductions%408080@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'

  console.log('--- Purging from Local DB ---')
  const localPrisma = new PrismaClient({ datasources: { db: { url: localUrl } } })
  try {
    await localPrisma.$executeRawUnsafe('DROP TABLE IF EXISTS "roles", "media_library", "Roles", "Media_library" CASCADE;')
    console.log('✅ Local DB purged successfully!')
  } catch (e: any) {
    console.error('Local error:', e.message)
  } finally {
    await localPrisma.$disconnect()
  }

  console.log('--- Purging from Supabase DB ---')
  const remotePrisma = new PrismaClient({ datasources: { db: { url: remoteUrl } } })
  try {
    await remotePrisma.$executeRawUnsafe('DROP TABLE IF EXISTS "roles", "media_library", "Roles", "Media_library" CASCADE;')
    console.log('✅ Supabase DB purged successfully!')
  } catch (e: any) {
    console.error('Remote error:', e.message)
  } finally {
    await remotePrisma.$disconnect()
  }
}

dropBoth()
