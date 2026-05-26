import { and, eq, isNull } from 'drizzle-orm'
import { useDb, schema } from '~~/server/db'
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  refreshTtl
} from '~~/server/utils/jwt'
import { REFRESH_COOKIE, setAuthCookies, clearAuthCookies } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const presented = getCookie(event, REFRESH_COOKIE)
  if (!presented) {
    throw createError({ statusCode: 401, statusMessage: 'No refresh token' })
  }
  const db = useDb()
  const hash = hashRefreshToken(presented)

  const [row] = await db
    .select()
    .from(schema.refreshTokens)
    .where(eq(schema.refreshTokens.tokenHash, hash))
    .limit(1)

  if (!row) {
    clearAuthCookies(event)
    throw createError({ statusCode: 401, statusMessage: 'Invalid refresh token' })
  }

  // Reuse detection: presented token was previously revoked -> nuke all this user's sessions.
  if (row.revokedAt !== null) {
    await db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(schema.refreshTokens.userId, row.userId), isNull(schema.refreshTokens.revokedAt)))
    clearAuthCookies(event)
    throw createError({ statusCode: 401, statusMessage: 'Refresh token reuse detected' })
  }

  if (row.expiresAt.getTime() <= Date.now()) {
    clearAuthCookies(event)
    throw createError({ statusCode: 401, statusMessage: 'Refresh token expired' })
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, row.userId)).limit(1)
  if (!user) {
    clearAuthCookies(event)
    throw createError({ statusCode: 401, statusMessage: 'User no longer exists' })
  }

  // Rotate
  const { token: newToken, hash: newHash } = generateRefreshToken()
  const expiresAt = new Date(Date.now() + refreshTtl() * 1000)

  const [inserted] = await db
    .insert(schema.refreshTokens)
    .values({
      userId: user.id,
      tokenHash: newHash,
      expiresAt,
      userAgent: getRequestHeader(event, 'user-agent')?.slice(0, 500) ?? null,
      ipAddress: getRequestIP(event, { xForwardedFor: true })?.slice(0, 64) ?? null
    })
    .returning({ id: schema.refreshTokens.id })

  await db
    .update(schema.refreshTokens)
    .set({ revokedAt: new Date(), replacedById: inserted?.id })
    .where(eq(schema.refreshTokens.id, row.id))

  const access = await signAccessToken({ sub: user.id, role: user.role as UserRole, email: user.email })
  setAuthCookies(event, access, newToken)

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  }
})
