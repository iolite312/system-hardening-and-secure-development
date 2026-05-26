import { desc, count } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { requirePermission } from '~~/server/utils/auth'

const query = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'comic:view')
  const { page, limit } = await getValidatedQuery(event, query.parse)
  const offset = (page - 1) * limit
  const db = useDb()

  // @ts-ignore
  const [{ total }] = await db.select({ total: count() }).from(schema.comics)
  const comics = await db
    .select()
    .from(schema.comics)
    .orderBy(desc(schema.comics.createdAt))
    .limit(limit)
    .offset(offset)

  return { comics, total, page, limit, pages: Math.ceil(total / limit) }
})
