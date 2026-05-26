import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { requirePermission } from '~~/server/utils/auth'

const body = z.object({
  title: z.string().min(1).max(200),
  serie: z.string().min(1).max(200),
  number: z.string().min(1).max(200)
})

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'comic:create')
  const data = await readValidatedBody(event, body.parse)
  const db = useDb()
  const [comic] = await db.insert(schema.comics).values(data).returning()
  setResponseStatus(event, 201)
  return { comic }
})
