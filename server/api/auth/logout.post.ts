import { eq } from 'drizzle-orm'
import { useDb, schema } from '~~/server/db'
import { hashRefreshToken } from '~~/server/utils/jwt'
import { REFRESH_COOKIE, clearAuthCookies } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, REFRESH_COOKIE)
  if (token) {
    const db = useDb()
    await db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(schema.refreshTokens.tokenHash, hashRefreshToken(token)))
  }
  clearAuthCookies(event)
  return { ok: true }
})
