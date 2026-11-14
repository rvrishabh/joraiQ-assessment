import { Logger as NestLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { Logger } from 'nestjs-pino';
import helmet from '@fastify/helmet';
import { configureApp } from './app.setup';
import {
  BODY_LIMIT_BYTES,
  buildCorsOptions,
  generateRequestId,
} from './config/security.config';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: BODY_LIMIT_BYTES,
      requestIdHeader: false,
      genReqId: generateRequestId,
      // Behind a load balancer, trust X-Forwarded-For so rate limits see the
      // real client address. Leave off when the API is exposed directly.
      trustProxy: process.env.TRUST_PROXY === 'true',
    }),
    { bufferLogs: true },
  );
  app.useLogger(app.get(Logger));

  // The Swagger UI needs inline scripts, so the CSP is only enforced in
  // production, where the docs are not served.
  await app.register(helmet, {
    contentSecurityPolicy: isProduction,
    crossOriginResourcePolicy: { policy: 'same-site' },
  });

  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onSend', (req, reply, _payload, done) => {
      reply.header('x-request-id', req.id);
      done();
    });

  configureApp(app);
  app.enableCors(buildCorsOptions());

  if (!isProduction) {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('JoraIQ Quiz API')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'access-token')
        .build(),
    );
    SwaggerModule.setup('api/docs', app, doc);
  }

  app.enableShutdownHooks();
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  new NestLogger('Bootstrap').log(`API listening on :${port}`);
}

bootstrap().catch((err) => {
  new NestLogger('Bootstrap').error('Failed to start', err);
  process.exit(1);
});
