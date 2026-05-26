import { Readable } from 'node:stream'
import { parse } from 'csv-parse'
import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { requirePermission } from '~~/server/utils/auth'

// Hard caps to keep memory and response size bounded even on huge files.
const MAX_BYTES = 50 * 1024 * 1024 // 50 MB
const BATCH_SIZE = 500 // rows per INSERT
const MAX_REPORTED_ERRORS = 100

const rowSchema = z.object({
  title: z.string().trim().min(1).max(200),
  serie: z.string().trim().min(1).max(200),
  number: z.string().trim().min(1).max(200)
})

interface RowError {
  row: number
  message: string
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'comic:create')

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'file' && p.filename)
  if (!filePart) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded (expected field "file")' })
  }
  if (filePart.data.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: `File too large (max ${MAX_BYTES} bytes)` })
  }

  const db = useDb()

  const parser = Readable.from(filePart.data).pipe(
    parse({
      bom: true,
      columns: header => header.map((h: string) => h.trim().toLowerCase()),
      trim: true,
      skip_empty_lines: true,
      relax_quotes: true
    })
  )

  let totalRows = 0
  let imported = 0
  const errors: RowError[] = []
  let batch: Array<{ title: string, serie: string, number: string }> = []

  async function flush() {
    if (batch.length === 0) return
    try {
      await db.insert(schema.comics).values(batch)
      imported += batch.length
    } catch (err: unknown) {
      // If the bulk insert fails, fall back to per-row inserts so one bad row
      // (e.g. constraint violation) doesn't lose the whole batch.
      for (const value of batch) {
        try {
          await db.insert(schema.comics).values(value)
          imported += 1
        } catch (innerErr: unknown) {
          if (errors.length < MAX_REPORTED_ERRORS) {
            errors.push({
              row: -1,
              message: (innerErr as Error)?.message ?? 'Insert failed'
            })
          }
        }
      }
      void err
    }
    batch = []
  }

  for await (const record of parser) {
    totalRows += 1
    const parsed = rowSchema.safeParse(record)
    if (!parsed.success) {
      if (errors.length < MAX_REPORTED_ERRORS) {
        errors.push({
          row: totalRows + 1, // +1 to account for header row in user's CSV
          message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
        })
      }
      continue
    }
    batch.push(parsed.data)
    if (batch.length >= BATCH_SIZE) await flush()
  }
  await flush()

  return {
    totalRows,
    imported,
    failed: totalRows - imported,
    errors,
    truncatedErrors: errors.length >= MAX_REPORTED_ERRORS
  }
})
