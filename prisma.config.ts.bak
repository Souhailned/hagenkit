import { defineConfig, env } from 'prisma/config'

// Try to load dotenv if available (for local development)
try {
  await import('dotenv/config')
} catch {
  // dotenv not available, use environment variables directly (Docker)
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
