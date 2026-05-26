import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import argon2 from 'argon2'
import * as schema from '../db/schema'

async function main() {
  const email = (process.env.SEED_SUPERADMIN_EMAIL ?? '').toLowerCase()
  const password = process.env.SEED_SUPERADMIN_PASSWORD ?? ''
  const name = process.env.SEED_SUPERADMIN_NAME ?? 'Super Admin'

  if (!email || !password) {
    console.error('SEED_SUPERADMIN_EMAIL and SEED_SUPERADMIN_PASSWORD must be set in .env')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool, { schema })

  const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
  if (existing) {
    console.log(`Super admin already exists (${email}). Skipping.`)
    await pool.end()
    return
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 })
  await db.insert(schema.users).values({ email, name, passwordHash, role: 'super_admin' })
  console.log(`Created super admin: ${email}`)
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
