import { defineVitestConfig } from '@nuxt/test-utils/config'
import { resolve } from 'node:path'

export default defineVitestConfig({
  resolve: {
    alias: {
      '~~': resolve(__dirname, '.'),
      '~': resolve(__dirname, 'app')
    }
  },
  test: {
    // Component tests run under the full Nuxt runtime (happy-dom).
    // Unit tests override this per-file with @vitest-environment node.
    environment: 'nuxt',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['server/utils/**', 'app/utils/**', 'shared/**']
    }
  }
})
