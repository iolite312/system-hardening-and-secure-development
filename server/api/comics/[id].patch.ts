import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { requirePermission } from '~~/server/utils/auth'

const paramSchema = z.object({ id: z.string().uuid() })

const body = z.object({
  title: z.string().min(1).max(200).optional(),
  serie: z.string().min(1).max(200).optional(),
  number: z.string().min(1).max(200).optional()
})

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'comic:update')
  const { id } = await getValidatedRouterParams(event, paramSchema.parse)
  const data = await readValidatedBody(event, body.parse)
  const db = useDb()
  const [comic] = await db
    .update(schema.comics)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.comics.id, id))
    .returning()
  if (!comic) throw createError({ statusCode: 404, statusMessage: 'Comic not found' })
  return { comic }
})
