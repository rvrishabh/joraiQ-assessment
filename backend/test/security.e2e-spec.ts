import helmet from '@fastify/helmet';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from 'src/modules/health/health.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { BODY_LIMIT_BYTES, buildCorsOptions } from 'src/config/security.config';

describe('HTTP security (e2e)', () => {
  let app: NestFastifyApplication;
  const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])],
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ bodyLimit: BODY_LIMIT_BYTES }),
    );
    await app.register(helmet, { contentSecurityPolicy: true });
    app.enableCors(buildCorsOptions({ NODE_ENV: 'production', FRONTEND_URL: 'https://app.example.com' }));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(() => app.close());

  it('answers /health and checks the database', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('ok');
  });

  it('returns 503 when the database is down', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('down'));
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(503);
  });

  it('sends security headers', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('allows only the configured origin', async () => {
    const allowed = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://app.example.com' },
    });
    expect(allowed.headers['access-control-allow-origin']).toBe('https://app.example.com');

    const blocked = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://evil.example.com' },
    });
    expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects bodies over the size limit', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/health',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ blob: 'x'.repeat(BODY_LIMIT_BYTES + 10) }),
    });
    expect(res.statusCode).toBe(413);
  });
});
