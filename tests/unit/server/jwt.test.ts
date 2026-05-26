// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'

const config = {
  jwtAccessSecret: 'test-access-secret-that-is-at-least-32-characters-long!',
  jwtRefreshSecret: 'test-refresh-secret-that-is-at-least-32-characters-long!',
  jwtAccessTtl: 900,
  jwtRefreshTtl: 604800
}

// Mock the config wrapper so useRuntimeConfig() is never called
// (it requires a live Nuxt app instance which isn't present in node tests).
vi.mock('../../../server/utils/config', () => ({
  useConfig: () => config
}))

import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken
} from '../../../server/utils/jwt'

describe('signAccessToken / verifyAccessToken', () => {
  const payload = { sub: 'user-123', role: 'admin' as const, email: 'test@example.com' }

  it('produces a non-empty JWT string', async () => {
    const token = await signAccessToken(payload)
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3) // header.payload.signature
  })

  it('roundtrip: verify returns the original claims', async () => {
    const token = await signAccessToken(payload)
    const result = await verifyAccessToken(token)
    expect(result.sub).toBe(payload.sub)
    expect(result.role).toBe(payload.role)
    expect(result.email).toBe(payload.email)
  })

  it('rejects a token signed with a different secret', async () => {
    const token = await signAccessToken(payload)
    vi.mocked(await import('../../../server/utils/config')).useConfig = () => ({
      ...config,
      jwtAccessSecret: 'a-completely-different-secret-that-is-also-long-enough!'
    })
    await expect(verifyAccessToken(token)).rejects.toThrow()
    vi.mocked(await import('../../../server/utils/config')).useConfig = () => config
  })

  it('rejects a tampered payload', async () => {
    const token = await signAccessToken(payload)
    const [header, , sig] = token.split('.')
    const fakePayload = Buffer.from(JSON.stringify({ sub: 'attacker', role: 'super_admin' })).toString('base64url')
    await expect(verifyAccessToken(`${header}.${fakePayload}.${sig}`)).rejects.toThrow()
  })

  it('rejects a malformed string', async () => {
    await expect(verifyAccessToken('not.a.token')).rejects.toThrow()
  })

  it('produces different tokens for different subjects', async () => {
    const t1 = await signAccessToken({ ...payload, sub: 'user-1' })
    const t2 = await signAccessToken({ ...payload, sub: 'user-2' })
    expect(t1).not.toBe(t2)
  })
})

describe('generateRefreshToken', () => {
  it('returns a token string and its sha-256 hash', () => {
    const { token, hash } = generateRefreshToken()
    expect(typeof token).toBe('string')
    expect(typeof hash).toBe('string')
    expect(token.length).toBeGreaterThan(32)
    expect(hash).toHaveLength(64) // hex sha-256
  })

  it('generates unique tokens on every call', () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateRefreshToken().token))
    expect(tokens.size).toBe(50)
  })

  it('hash is deterministic for the same token', () => {
    const { token } = generateRefreshToken()
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token))
  })

  it('different tokens produce different hashes', () => {
    const a = generateRefreshToken()
    const b = generateRefreshToken()
    expect(a.hash).not.toBe(b.hash)
  })

  it('generated hash matches hashRefreshToken(token)', () => {
    const { token, hash } = generateRefreshToken()
    expect(hashRefreshToken(token)).toBe(hash)
  })
})
