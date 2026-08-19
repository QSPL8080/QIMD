import { seedDatabase } from './seed'
import { db } from './db'

async function run() {
  try {
    await seedDatabase()
    console.log('Seeding completed successfully!')
  } catch (error) {
    console.error('Error during database seeding:', error)
  } finally {
    await db.$disconnect()
  }
}

run()
