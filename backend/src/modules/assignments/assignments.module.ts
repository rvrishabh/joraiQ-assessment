import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentsRepository } from './repositories/assignments.repository';

@Module({
  imports: [AuthModule, QuizzesModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsRepository],
  exports: [AssignmentsRepository],
})
export class AssignmentsModule {}
