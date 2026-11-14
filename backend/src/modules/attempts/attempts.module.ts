import { Module } from '@nestjs/common';
import { AssignmentsModule } from '../assignments/assignments.module';
import { AuthModule } from '../auth/auth.module';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { AttemptsRepository } from './repositories/attempts.repository';

@Module({
  imports: [AuthModule, AssignmentsModule],
  controllers: [AttemptsController],
  providers: [AttemptsService, AttemptsRepository],
})
export class AttemptsModule {}
