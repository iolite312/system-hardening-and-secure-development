import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { requireUser } from '~~/server/utils/auth'
import { canCreateRole } from '~~/server/utils/rbac'
import { hashPassword } from '~~/server/utils/password'

const body = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(120),
  password: z.string().min(8).max(256),
  role: z.enum(['super_admin', 'admin', 'friend'])
})

export default defineEventHandler(async (event) => {
  const actor = await requireUser(event)
  const data = await readValidatedBody(event, body.parse)

  if (!canCreateRole(actor.role, data.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Role ${actor.role} cannot create users with role ${data.role}`
    })
  }

  const db = useDb()
  const passwordHash = await hashPassword(data.password)

  try {
    const [created] = await db
      .insert(schema.users)
      .values({
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash,
        role: data.role
      })
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        role: schema.users.role,
        createdAt: schema.users.createdAt
      })
    setResponseStatus(event, 201)
    return { user: created }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Email already in use' })
    }
    throw err
  }
})
