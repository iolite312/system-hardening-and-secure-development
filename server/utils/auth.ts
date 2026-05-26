import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { useDb, schema } from '../db'
import { verifyAccessToken, type AccessTokenPayload } from './jwt'
import { hasPermission } from './rbac'
import type { Permission } from '~~/shared/types/rbac'
import type { AuthUser } from '~~/shared/types/auth'

export const ACCESS_COOKIE = 'cl_access'
export const REFRESH_COOKIE = 'cl_refresh'

export type AuthedUser = AuthUser

export async function getUserFromEvent(event: H3Event): Promise<AuthedUser | null> {
  const token = getCookie(event, ACCESS_COOKIE)
  if (!token) return null
  let payload: AccessTokenPayload
  try {
    payload = await verifyAccessToken(token)
  } catch {
    return null
  }
  const db = useDb()
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, payload.sub)).limit(1)
  if (!user) return null
  return { id: user.id, email: user.email, name: user.name, role: user.role as UserRole }
}

export async function requireUser(event: H3Event): Promise<AuthedUser> {
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user
}

export async function requirePermission(event: H3Event, perm: Permission): Promise<AuthedUser> {
  const user = await requireUser(event)
  if (!hasPermission(user.role, perm)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return user
}

export function setAuthCookies(event: H3Event, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production'
  const accessTtl = Number(process.env.JWT_ACCESS_TTL ?? 900)
  const refreshTtl = Number(process.env.JWT_REFRESH_TTL ?? 60 * 60 * 24 * 7)

  setCookie(event, ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: accessTtl
  })
  setCookie(event, REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: refreshTtl
  })
}

export function clearAuthCookies(event: H3Event) {
  deleteCookie(event, ACCESS_COOKIE, { path: '/' })
  deleteCookie(event, REFRESH_COOKIE, { path: '/api/auth' })
}
