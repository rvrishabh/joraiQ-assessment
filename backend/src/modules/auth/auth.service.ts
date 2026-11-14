import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { ProfilesRepository } from '../users/repositories/profiles.repository';
import { RegisterDto } from './dto';
import { SupabaseAdminService } from './services/supabase-admin.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabase: SupabaseAdminService,
    private readonly profiles: ProfilesRepository,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.role === 'TEACHER') this.assertInviteCode(dto.inviteCode);

    const { data, error } = await this.supabase.client.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      app_metadata: { role: dto.role },
      user_metadata: { full_name: dto.fullName },
    });

    if (error || !data.user) {
      if (error && /already|registered|exists/i.test(error.message)) {
        throw new ConflictException('An account with this email already exists');
      }
      this.logger.error(`Supabase createUser failed: ${error?.message}`);
      throw new InternalServerErrorException('Could not create the account');
    }

    try {
      const profile = await this.profiles.create({
        id: data.user.id,
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
      });
      return { id: profile.id, email: profile.email, fullName: profile.fullName, role: profile.role };
    } catch (err) {
      // Keep auth.users and profiles in step: drop the auth row we just made.
      await this.supabase.client.auth.admin.deleteUser(data.user.id);
      throw err;
    }
  }

  private assertInviteCode(provided?: string) {
    const expected = this.config.get<string>('TEACHER_INVITE_CODE');
    if (!expected) return;
    const a = Buffer.from(provided ?? '');
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ForbiddenException('Invalid teacher invite code');
    }
  }
}
