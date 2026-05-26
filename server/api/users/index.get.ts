import { desc } from 'drizzle-orm'
import { useDb, schema } from '~~/server/db'
import { requirePermission } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'user:list')
  const db = useDb()
  const rows = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      createdAt: schema.users.createdAt
    })
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt))
  return { users: rows }
})
