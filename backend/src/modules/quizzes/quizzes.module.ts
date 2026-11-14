import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuizzesRepository } from './repositories/quizzes.repository';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

@Module({
  imports: [AuthModule],
  controllers: [QuizzesController],
  providers: [QuizzesService, QuizzesRepository],
  exports: [QuizzesService, QuizzesRepository],
})
export class QuizzesModule {}
