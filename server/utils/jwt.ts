import { SignJWT, jwtVerify } from 'jose'
import { randomBytes, createHash } from 'node:crypto'
import type { UserRole } from '~~/shared/types/rbac'

export interface AccessTokenPayload {
  sub: string
  role: UserRole
  email: string
}

function getAccessSecret(): Uint8Array {
  const s = process.env.JWT_ACCESS_SECRET
  if (!s || s.length < 32) throw new Error('JWT_ACCESS_SECRET must be set (>=32 chars)')
  return new TextEncoder().encode(s)
}

function accessTtl(): number {
  return Number(process.env.JWT_ACCESS_TTL ?? 900)
}

export function refreshTtl(): number {
  return Number(process.env.JWT_REFRESH_TTL ?? 60 * 60 * 24 * 7)
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return await new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(payload.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + accessTtl())
    .setIssuer('comic-library')
    .setAudience('comic-library-web')
    .sign(getAccessSecret())
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getAccessSecret(), {
    issuer: 'comic-library',
    audience: 'comic-library-web'
  })
  if (typeof payload.sub !== 'string') throw new Error('invalid token subject')
  return {
    sub: payload.sub,
    role: payload.role as UserRole,
    email: payload.email as string
  }
}

/**
 * Refresh tokens are opaque random strings. We only store their SHA-256 hash in the DB
 * so a DB leak doesn't expose usable tokens.
 */
export function generateRefreshToken(): { token: string, hash: string } {
  const token = randomBytes(48).toString('base64url')
  const hash = createHash('sha256').update(token).digest('hex')
  return { token, hash }
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
