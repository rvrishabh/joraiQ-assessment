import { randomUUID } from 'crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

type CorsOptions = NonNullable<Parameters<NestFastifyApplication['enableCors']>[0]>;

const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

/**
 * Only the configured frontend may call the API from a browser. Local dev
 * origins are allowed outside production; a missing FRONTEND_URL never
 * widens CORS to every origin.
 */
export function buildCorsOptions(
  env: NodeJS.ProcessEnv = process.env,
): CorsOptions {
  const allowed = new Set<string>(
    (env.FRONTEND_URL ?? '')
      .split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean),
  );
  if (env.NODE_ENV !== 'production') DEV_ORIGINS.forEach((o) => allowed.add(o));

  return {
    // Requests without an Origin header (curl, server to server) are not
    // subject to CORS, so only browsers are restricted by this list.
    origin: [...allowed],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 600,
  };
}

export const BODY_LIMIT_BYTES = 256 * 1024;

/** Reuses a well-formed X-Request-Id from a proxy, otherwise makes a new one. */
export function generateRequestId(req: { headers: Record<string, unknown> }): string {
  const incoming = req.headers['x-request-id'];
  return typeof incoming === 'string' && /^[\w-]{8,64}$/.test(incoming)
    ? incoming
    : randomUUID();
}
