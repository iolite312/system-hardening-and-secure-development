import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'
import { useConfig } from '../utils/config'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null
let _pool: Pool | null = null

function getPool(): Pool {
  if (_pool) return _pool
  const url = useConfig().databaseUrl
  if (!url) throw new Error('databaseUrl is not set in runtimeConfig')
  _pool = new Pool({ connectionString: url, max: 10 })
  return _pool
}

export function useDb() {
  if (_db) return _db
  _db = drizzle(getPool(), { schema })
  return _db
}

export { schema }
