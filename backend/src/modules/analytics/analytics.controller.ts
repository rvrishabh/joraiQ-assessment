import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUser } from 'types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { QuizAnalyticsResponseDto } from './dto/analytics.response.dto';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER')
@Controller('quizzes/:quizId/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOkResponse({ type: QuizAnalyticsResponseDto })
  get(@CurrentUser() user: AuthUser, @Param('quizId', ParseUUIDPipe) quizId: string) {
    return this.analyticsService.forQuiz(user, quizId);
  }
}
