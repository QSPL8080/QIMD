import { PrismaClient } from '@prisma/client'

async function checkBoth() {
  const localUrl = 'postgresql://postgres:8080@localhost:5432/qimd_db?schema=public'
  const remoteUrl = 'postgresql://postgres.wkbzlqimfnrtnwwkbcki:QSPLProductions%408080@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'

  console.log('--- LOCAL DB TABLES ---')
  const pLocal = new PrismaClient({ datasources: { db: { url: localUrl } } })
  try {
    const res: any[] = await pLocal.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;`
    console.log(res.map(r => r.table_name))
  } catch(e: any) {
    console.log('Local err:', e.message)
  } finally {
    await pLocal.$disconnect()
  }

  console.log('--- SUPABASE DB TABLES ---')
  const pRemote = new PrismaClient({ datasources: { db: { url: remoteUrl } } })
  try {
    const res: any[] = await pRemote.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;`
    console.log(res.map(r => r.table_name))
  } catch(e: any) {
    console.log('Remote err:', e.message)
  } finally {
    await pRemote.$disconnect()
  }
}

checkBoth()
