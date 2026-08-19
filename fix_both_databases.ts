import { PrismaClient } from '@prisma/client'

async function fixBothDatabases() {
  const localUrl = 'postgresql://postgres:8080@localhost:5432/qimd_db?schema=public'
  const remoteUrl = 'postgresql://postgres.wkbzlqimfnrtnwwkbcki:QSPLProductions%408080@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'

  console.log('--- FIXING LOCAL POSTGRESQL DATABASE ---')
  const localPrisma = new PrismaClient({ datasources: { db: { url: localUrl } } })
  try {
    await localPrisma.$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" VARCHAR(50) DEFAULT \'SUPER_ADMIN\';')
    console.log('✅ Added "role" column to LOCAL database!')
  } catch (e: any) {
    console.error('Local DB Fix Error:', e.message)
  } finally {
    await localPrisma.$disconnect()
  }

  console.log('--- FIXING SUPABASE POSTGRESQL DATABASE ---')
  const remotePrisma = new PrismaClient({ datasources: { db: { url: remoteUrl } } })
  try {
    await remotePrisma.$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" VARCHAR(50) DEFAULT \'SUPER_ADMIN\';')
    console.log('✅ Added "role" column to SUPABASE database!')
  } catch (e: any) {
    console.error('Supabase DB Fix Error:', e.message)
  } finally {
    await remotePrisma.$disconnect()
  }
}

fixBothDatabases()
