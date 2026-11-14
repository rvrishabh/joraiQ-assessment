import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7 keeps connection URLs out of schema.prisma. The CLI (migrate, db
// push) uses the direct connection; the running API uses DATABASE_URL through
// the driver adapter in src/prisma/prisma.service.ts. The fallback keeps
// `prisma generate` working in a build step that has no database variables.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
});
