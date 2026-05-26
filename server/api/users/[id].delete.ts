import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { requirePermission } from '~~/server/utils/auth'

const paramSchema = z.object({ id: z.string().uuid() })

export default defineEventHandler(async (event) => {
  const actor = await requirePermission(event, 'user:delete')
  const { id } = await getValidatedRouterParams(event, paramSchema.parse)

  if (id === actor.id) {
    throw createError({ statusCode: 400, statusMessage: 'You cannot delete yourself' })
  }

  const db = useDb()
  const [target] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1)
  if (!target) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  // Admins cannot delete super_admins.
  if (actor.role === 'admin' && target.role === 'super_admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admins cannot delete super admins' })
  }

  await db.delete(schema.users).where(eq(schema.users.id, id))
  return { ok: true }
})
