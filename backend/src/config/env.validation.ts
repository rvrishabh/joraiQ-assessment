const REQUIRED = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

/** Extra variables that must be set when the API runs in production. */
const REQUIRED_IN_PRODUCTION = ['FRONTEND_URL'] as const;

export function validateEnv(config: Record<string, unknown>) {
  const errors: string[] = [];

  const missing = REQUIRED.filter((key) => !config[key]);
  if (missing.length) errors.push(`Missing environment variables: ${missing.join(', ')}`);

  const nodeEnv = String(config.NODE_ENV ?? 'development');
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    errors.push('NODE_ENV must be development, test or production');
  }

  if (config.PORT !== undefined && config.PORT !== '') {
    const port = Number(config.PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      errors.push('PORT must be an integer between 1 and 65535');
    }
  }

  if (!/^https?:\/\//.test(String(config.SUPABASE_URL ?? ''))) {
    if (config.SUPABASE_URL) errors.push('SUPABASE_URL must start with http:// or https://');
  }

  if (nodeEnv === 'production') {
    const absent = REQUIRED_IN_PRODUCTION.filter((key) => !config[key]);
    if (absent.length) {
      errors.push(`Missing in production: ${absent.join(', ')}`);
    }
  }

  if (errors.length) throw new Error(errors.join('. '));
  return config;
}
