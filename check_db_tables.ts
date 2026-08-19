import { db } from './src/lib/db'

async function checkTables() {
  try {
    const tables: any[] = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `
    console.log('--- CURRENT TABLES IN POSTGRESQL DATABASE ---')
    console.log(tables.map(t => t.table_name))
  } catch (err) {
    console.error('Error checking tables:', err)
  } finally {
    await db.$disconnect()
  }
}

checkTables()
