import type { Params } from 'nestjs-pino';

const isProduction = process.env.NODE_ENV === 'production';

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
    // Tokens and cookies never reach the logs.
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      censor: '[redacted]',
    },
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
    autoLogging: { ignore: (req) => (req.url ?? '').endsWith('/health') },
    transport: isProduction
      ? undefined
      : { target: 'pino-pretty', options: { singleLine: true, colorize: true } },
  },
};
