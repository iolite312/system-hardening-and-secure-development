import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDb, schema } from '~~/server/db'
import { verifyPassword } from '~~/server/utils/password'
import { signAccessToken, generateRefreshToken, refreshTtl } from '~~/server/utils/jwt'
import { setAuthCookies } from '~~/server/utils/auth'

const body = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(256)
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, body.parse)
  const db = useDb()

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase())).limit(1)
  // Always verify a hash to avoid user-enumeration timing differences.
  const dummyHash = '$argon2id$v=19$m=19456,t=2,p=1$YWFhYWFhYWFhYWFhYWFhYQ$Q0hd5dPj9F2P7Xz4xKqQzZ1Hf2hH5dKj0aH8wY8nM9w'
  const ok = await verifyPassword(user?.passwordHash ?? dummyHash, password).catch(() => false)
  if (!user || !ok) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const access = await signAccessToken({ sub: user.id, role: user.role, email: user.email })
  const { token: refreshToken, hash: refreshHash } = generateRefreshToken()
  const expiresAt = new Date(Date.now() + refreshTtl() * 1000)

  await db.insert(schema.refreshTokens).values({
    userId: user.id,
    tokenHash: refreshHash,
    expiresAt,
    userAgent: getRequestHeader(event, 'user-agent')?.slice(0, 500) ?? null,
    ipAddress: getRequestIP(event, { xForwardedFor: true })?.slice(0, 64) ?? null
  })

  setAuthCookies(event, access, refreshToken)

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  }
})
