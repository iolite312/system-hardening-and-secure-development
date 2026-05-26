import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { requirePermission } from '~~/server/utils/auth'

const paramSchema = z.object({ id: z.string().uuid() })

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'comic:delete')
  const { id } = await getValidatedRouterParams(event, paramSchema.parse)
  const db = useDb()
  const result = await db.delete(schema.comics).where(eq(schema.comics.id, id)).returning({ id: schema.comics.id })
  if (result.length === 0) throw createError({ statusCode: 404, statusMessage: 'Comic not found' })
  return { ok: true }
})
