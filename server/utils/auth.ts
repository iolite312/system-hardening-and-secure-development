import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { useDb, schema } from '../db'
import { verifyAccessToken, type AccessTokenPayload } from './jwt'
import { hasPermission } from './rbac'
import { useConfig } from './config'
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
  const config = useConfig()
  setCookie(event, ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'strict',
    path: '/',
    maxAge: config.jwtAccessTtl
  })
  setCookie(event, REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: config.jwtRefreshTtl
  })
}

export function clearAuthCookies(event: H3Event) {
  deleteCookie(event, ACCESS_COOKIE, { path: '/' })
  deleteCookie(event, REFRESH_COOKIE, { path: '/api/auth' })
}
