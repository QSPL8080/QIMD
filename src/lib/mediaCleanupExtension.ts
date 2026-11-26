import { Prisma, type PrismaClient } from '@prisma/client'
import { MEDIA_FIELDS } from './mediaService.fields'

/**
 * Keeps the media bucket in step with the database:
 *  - a record whose image/video is replaced → the old file is deleted (if nothing else uses it)
 *  - a record permanently deleted → its files are deleted (if nothing else uses them)
 * Moving to the Bin does not delete files, so a restore still works.
 */
export function withMediaCleanup(base: PrismaClient) {
  const touchesMedia = (model: string, data: any) => Boolean(data && MEDIA_FIELDS[model]?.some((f) => f in data))
  const cleanup = async (fn: (m: typeof import('./mediaService')) => Promise<void>) => {
    try {
      await fn(await import('./mediaService'))
    } catch (e) {
      console.error('[media] clean-up error', e)
    }
  }
  const handlers: any = {}
  for (const model of Object.keys(MEDIA_FIELDS)) {
    const delegate = () => (base as any)[model]
    handlers[model] = {
      async update({ args, query }: any) {
        if (!touchesMedia(model, args.data)) return query(args)
        const before = await delegate().findUnique({ where: args.where })
        const after = await query(args)
        await cleanup((m) => m.cleanupReplacedMedia(model, before, after))
        return after
      },
      async upsert({ args, query }: any) {
        const before = await delegate().findUnique({ where: args.where })
        const after = await query(args)
        if (before) await cleanup((m) => m.cleanupReplacedMedia(model, before, after))
        return after
      },
      async delete({ args, query }: any) {
        const removed = await query(args)
        await cleanup((m) => m.purgeRecordsMedia(model, [removed]))
        return removed
      },
      async deleteMany({ args, query }: any) {
        const rows = await delegate().findMany({ where: args?.where })
        const result = await query(args)
        await cleanup((m) => m.purgeRecordsMedia(model, rows))
        return result
      },
    }
  }
  return base.$extends(Prisma.defineExtension({ name: 'media-cleanup', query: handlers }))
}
