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
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUser } from 'types';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AssignmentsService } from './assignments.service';
import {
  AssignQuizDto,
  AssignResultResponseDto,
  MyAssignmentResponseDto,
  QuizAssignmentRowResponseDto,
} from './dto';

@ApiTags('assignments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post('quizzes/:quizId/assignments')
  @Roles('TEACHER')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: AssignResultResponseDto })
  assign(
    @CurrentUser() user: AuthUser,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: AssignQuizDto,
  ) {
    return this.assignmentsService.assign(user, quizId, dto.studentIds);
  }

  @Get('quizzes/:quizId/assignments')
  @Roles('TEACHER')
  @ApiOkResponse({ type: [QuizAssignmentRowResponseDto] })
  listForQuiz(
    @CurrentUser() user: AuthUser,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.assignmentsService.listForQuiz(user, quizId);
  }

  @Get('assignments/mine')
  @Roles('STUDENT')
  @ApiOkResponse({ type: [MyAssignmentResponseDto] })
  mine(@CurrentUser() user: AuthUser) {
    return this.assignmentsService.listMine(user);
  }
}
