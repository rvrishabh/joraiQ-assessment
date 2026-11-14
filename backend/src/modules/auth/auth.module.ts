import { Module } from '@nestjs/common';
import { ProfilesRepository } from '../users/repositories/profiles.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SupabaseAdminService } from './services/supabase-admin.service';
import { TokenVerifierService } from './services/token-verifier.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    SupabaseAdminService,
    TokenVerifierService,
    ProfilesRepository,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [JwtAuthGuard, RolesGuard, TokenVerifierService, ProfilesRepository],
})
export class AuthModule {}
