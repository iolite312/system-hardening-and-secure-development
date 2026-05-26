// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../../../server/utils/password'

// argon2id is intentionally slow. These tests stay under ~2s total on modern hardware.
describe('hashPassword', () => {
  it('returns an argon2id hash string', async () => {
    const hash = await hashPassword('correct-horse-battery-staple')
    expect(hash).toMatch(/^\$argon2id\$/)
  })

  it('produces a different hash each call (random salt)', async () => {
    const h1 = await hashPassword('same-password')
    const h2 = await hashPassword('same-password')
    expect(h1).not.toBe(h2)
  })
})

describe('verifyPassword', () => {
  it('returns true for the correct password', async () => {
    const hash = await hashPassword('my-secret-password')
    await expect(verifyPassword(hash, 'my-secret-password')).resolves.toBe(true)
  })

  it('returns false for a wrong password', async () => {
    const hash = await hashPassword('my-secret-password')
    await expect(verifyPassword(hash, 'wrong-password')).resolves.toBe(false)
  })

  it('returns false for an empty password against a real hash', async () => {
    const hash = await hashPassword('non-empty')
    await expect(verifyPassword(hash, '')).resolves.toBe(false)
  })

  it('is consistent across multiple verifications', async () => {
    const hash = await hashPassword('stable-password')
    const results = await Promise.all([
      verifyPassword(hash, 'stable-password'),
      verifyPassword(hash, 'stable-password'),
      verifyPassword(hash, 'stable-password')
    ])
    expect(results).toEqual([true, true, true])
  })
})
