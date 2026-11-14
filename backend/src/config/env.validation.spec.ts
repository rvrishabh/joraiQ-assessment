import { validateEnv } from './env.validation';

const base = {
  DATABASE_URL: 'postgresql://x',
  SUPABASE_URL: 'https://p.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'k',
};

describe('validateEnv', () => {
  it('accepts a complete development config', () => {
    expect(() => validateEnv(base)).not.toThrow();
  });

  it('lists every missing required variable', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY/);
  });

  it('rejects a bad port and an unknown NODE_ENV', () => {
    expect(() => validateEnv({ ...base, PORT: '99999' })).toThrow(/PORT/);
    expect(() => validateEnv({ ...base, NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });

  it('requires the frontend URL in production', () => {
    expect(() => validateEnv({ ...base, NODE_ENV: 'production' })).toThrow(/FRONTEND_URL/);
    expect(() =>
      validateEnv({ ...base, NODE_ENV: 'production', FRONTEND_URL: 'https://app.example.com' }),
    ).not.toThrow();
  });
});
