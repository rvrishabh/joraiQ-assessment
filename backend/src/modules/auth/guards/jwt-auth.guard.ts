import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfilesRepository } from 'src/modules/users/repositories/profiles.repository';
import { AuthUser } from 'types';
import { TokenVerifierService } from '../services/token-verifier.service';

const PROFILE_TTL_MS = 30_000;
const PROFILE_CACHE_MAX = 1000;

@Injectable()
export class JwtAuthGuard implements CanActivate {
  // Saves one database round trip per request. Roles never change in this
  // app, so a 30 second window is safe.
  private readonly cache = new Map<string, { user: AuthUser; expires: number }>();

  constructor(
    private readonly verifier: TokenVerifierService,
    private readonly profiles: ProfilesRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined>; user?: AuthUser }>();

    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const { sub } = await this.verifier.verify(token);
    request.user = await this.resolveUser(sub);
    return true;
  }

  private async resolveUser(id: string): Promise<AuthUser> {
    const hit = this.cache.get(id);
    if (hit && hit.expires > Date.now()) return hit.user;

    const profile = await this.profiles.findById(id);
    if (!profile) {
      this.cache.delete(id);
      throw new UnauthorizedException('No profile for this account');
    }

    const user: AuthUser = {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role,
    };
    if (this.cache.size >= PROFILE_CACHE_MAX) this.cache.clear();
    this.cache.set(id, { user, expires: Date.now() + PROFILE_TTL_MS });
    return user;
  }
}
