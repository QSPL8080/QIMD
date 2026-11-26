import { PrismaClient } from '@prisma/client'
import { withMediaCleanup } from './mediaCleanupExtension'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Direct PostgreSQL connection (Bypasses PgBouncer pooler connection limits & ECIRCUITBREAKER rate-limits)
const dbUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  "postgresql://postgres.wkbzlqimfnrtnwwkbcki:QSPLProductions%408080@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?connection_limit=2"

const baseDb =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres.wkbzlqimfnrtnwwkbcki:QSPLProductions%408080@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?connection_limit=2",
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = baseDb

/** Database client. Replacing or permanently deleting website media also removes the old file from storage. */
export const db = withMediaCleanup(baseDb)
