import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export interface VerifiedToken {
  sub: string;
  email?: string;
}

/**
 * Verifies a Supabase access token locally. Projects on a legacy shared
 * secret use HS256; newer projects publish signing keys via JWKS.
 */
@Injectable()
export class TokenVerifierService {
  private readonly secret?: Uint8Array;
  private readonly jwks?: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;

  constructor(config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL', '').replace(/\/$/, '');
    const secret = config.get<string>('SUPABASE_JWT_SECRET');
    this.issuer = `${url}/auth/v1`;
    if (secret) {
      this.secret = new TextEncoder().encode(secret);
    } else {
      this.jwks = createRemoteJWKSet(new URL(`${this.issuer}/.well-known/jwks.json`));
    }
  }

  async verify(token: string): Promise<VerifiedToken> {
    try {
      const options = { issuer: this.issuer, audience: 'authenticated' };
      const { payload } = this.secret
        ? await jwtVerify(token, this.secret, { ...options, algorithms: ['HS256'] })
        : await jwtVerify(token, this.jwks!, options);

      if (!payload.sub) throw new Error('token has no subject');
      return { sub: payload.sub, email: payload.email as string | undefined };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
