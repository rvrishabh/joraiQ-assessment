import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { AuthUser } from 'types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateQuizDto, QuizDetailResponseDto, QuizSummaryResponseDto } from './dto';
import { QuizzesService } from './quizzes.service';

@ApiTags('quizzes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: QuizDetailResponseDto })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateQuizDto) {
    return this.quizzesService.create(user, dto);
  }

  @Get()
  @ApiOkResponse({ type: [QuizSummaryResponseDto] })
  list(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return this.quizzesService.listMine(user, query);
  }

  @Get(':quizId')
  @ApiOkResponse({ type: QuizDetailResponseDto })
  detail(@CurrentUser() user: AuthUser, @Param('quizId', ParseUUIDPipe) quizId: string) {
    return this.quizzesService.getOwned(user, quizId);
  }
}
