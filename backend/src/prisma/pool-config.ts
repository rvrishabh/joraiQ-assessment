import type { PoolConfig } from 'pg';

/** Query parameters that only Prisma's own engine understood. */
const PRISMA_ONLY_PARAMS = ['pgbouncer', 'connection_limit', 'pool_timeout', 'connect_timeout'];

/**
 * Builds node-postgres settings from a Supabase connection string. The
 * Prisma-only parameters are dropped from the URL and replaced with the
 * equivalent pool options, so existing .env files keep working.
 */
export function toPoolConfig(connectionString: string): PoolConfig {
  const url = new URL(connectionString);
  const read = (name: string) => url.searchParams.get(name);

  const max = Number(read('connection_limit')) || 5;
  const connectSeconds = Number(read('connect_timeout')) || 30;
  PRISMA_ONLY_PARAMS.forEach((param) => url.searchParams.delete(param));

  return {
    connectionString: url.toString(),
    max,
    connectionTimeoutMillis: connectSeconds * 1000,
    idleTimeoutMillis: 30_000,
    // Supabase poolers terminate TLS. Local databases do not.
    ssl: /supabase\.(co|com)$/.test(url.hostname) ? { rejectUnauthorized: false } : undefined,
  };
}
