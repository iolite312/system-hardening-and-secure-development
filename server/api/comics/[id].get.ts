import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { requirePermission } from '~~/server/utils/auth'

const paramSchema = z.object({ id: z.string().uuid() })

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'comic:view')
  const { id } = await getValidatedRouterParams(event, paramSchema.parse)
  const db = useDb()
  const [comic] = await db.select().from(schema.comics).where(eq(schema.comics.id, id)).limit(1)
  if (!comic) throw createError({ statusCode: 404, statusMessage: 'Comic not found' })
  return { comic }
})
