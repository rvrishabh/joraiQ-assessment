import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUser } from 'types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AttemptsService } from './attempts.service';
import {
  AttemptResultResponseDto,
  AttemptSheetResponseDto,
  SubmitAttemptDto,
} from './dto';

@ApiTags('attempts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
@Controller('quizzes/:quizId')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Get('attempt')
  @ApiOkResponse({ type: AttemptSheetResponseDto })
  sheet(@CurrentUser() user: AuthUser, @Param('quizId', ParseUUIDPipe) quizId: string) {
    return this.attemptsService.getSheet(user, quizId);
  }

  @Post('attempts')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiCreatedResponse({ type: AttemptResultResponseDto })
  @HttpCode(HttpStatus.CREATED)
  submit(
    @CurrentUser() user: AuthUser,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.attemptsService.submit(user, quizId, dto);
  }

  @Get('result')
  @ApiOkResponse({ type: AttemptResultResponseDto })
  result(@CurrentUser() user: AuthUser, @Param('quizId', ParseUUIDPipe) quizId: string) {
    return this.attemptsService.getResult(user, quizId);
  }
}
