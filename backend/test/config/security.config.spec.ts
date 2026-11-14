import { buildCorsOptions } from 'src/config/security.config';

describe('buildCorsOptions', () => {
  it('allows only the configured frontend in production', () => {
    const options = buildCorsOptions({
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://app.example.com/',
    });
    expect(options.origin).toEqual(['https://app.example.com']);
  });

  it('never opens CORS to every origin when FRONTEND_URL is missing', () => {
    const options = buildCorsOptions({ NODE_ENV: 'production' });
    expect(options.origin).toEqual([]);
  });

  it('adds local dev origins outside production', () => {
    const options = buildCorsOptions({ NODE_ENV: 'development' });
    expect(options.origin).toContain('http://localhost:5173');
  });

  it('supports several comma separated origins', () => {
    const options = buildCorsOptions({
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://a.example.com, https://b.example.com',
    });
    expect(options.origin).toEqual(['https://a.example.com', 'https://b.example.com']);
  });
});
