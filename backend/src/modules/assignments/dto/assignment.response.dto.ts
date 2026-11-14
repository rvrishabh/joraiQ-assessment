import { ApiResponseProperty } from '@nestjs/swagger';
import { AssignmentStatus, IAssignResult, IMyAssignment, IQuizAssignmentRow } from 'types';

export class AssignResultResponseDto implements IAssignResult {
  @ApiResponseProperty() assigned!: number;
  @ApiResponseProperty() alreadyAssigned!: number;
}

export class QuizAssignmentRowResponseDto implements IQuizAssignmentRow {
  @ApiResponseProperty() assignmentId!: string;
  @ApiResponseProperty() studentId!: string;
  @ApiResponseProperty() fullName!: string;
  @ApiResponseProperty() email!: string;
  @ApiResponseProperty() assignedAt!: Date;
  @ApiResponseProperty({ enum: ['PENDING', 'COMPLETED'] }) status!: AssignmentStatus;
  @ApiResponseProperty() completedAt!: Date | null;
}

export class MyAssignmentResponseDto implements IMyAssignment {
  @ApiResponseProperty() assignmentId!: string;
  @ApiResponseProperty() quizId!: string;
  @ApiResponseProperty() title!: string;
  @ApiResponseProperty() description!: string;
  @ApiResponseProperty() teacherName!: string;
  @ApiResponseProperty() questionCount!: number;
  @ApiResponseProperty() assignedAt!: Date;
  @ApiResponseProperty({ enum: ['PENDING', 'COMPLETED'] }) status!: AssignmentStatus;
  @ApiResponseProperty() completedAt!: Date | null;
  @ApiResponseProperty() correctCount!: number | null;
  @ApiResponseProperty() accuracy!: number | null;
}
