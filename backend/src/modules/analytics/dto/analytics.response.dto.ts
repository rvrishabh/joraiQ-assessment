import { ApiResponseProperty } from '@nestjs/swagger';
import { IQuizAnalytics, IStudentProgress } from 'types';

export class StudentProgressResponseDto implements IStudentProgress {
  @ApiResponseProperty() studentId!: string;
  @ApiResponseProperty() fullName!: string;
  @ApiResponseProperty() email!: string;
  @ApiResponseProperty({ enum: ['PENDING', 'COMPLETED'] }) status!: 'PENDING' | 'COMPLETED';
  @ApiResponseProperty() correctCount!: number | null;
  @ApiResponseProperty() totalQuestions!: number;
  @ApiResponseProperty() accuracy!: number | null;
  @ApiResponseProperty() submittedAt!: Date | null;
}

export class QuizAnalyticsResponseDto implements IQuizAnalytics {
  @ApiResponseProperty() quizId!: string;
  @ApiResponseProperty() title!: string;
  @ApiResponseProperty() questionCount!: number;
  @ApiResponseProperty() assignedCount!: number;
  @ApiResponseProperty() completedCount!: number;
  @ApiResponseProperty() averageAccuracy!: number | null;
  @ApiResponseProperty({ type: () => [StudentProgressResponseDto] })
  students!: StudentProgressResponseDto[];
}
