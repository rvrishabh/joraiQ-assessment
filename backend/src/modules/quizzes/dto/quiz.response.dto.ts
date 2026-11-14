import { ApiResponseProperty } from '@nestjs/swagger';
import { IQuizDetail, IQuizOption, IQuizQuestion, IQuizSummary } from 'types';

export class QuizOptionResponseDto implements IQuizOption {
  @ApiResponseProperty() id!: string;
  @ApiResponseProperty() text!: string;
  @ApiResponseProperty() isCorrect!: boolean;
}

export class QuizQuestionResponseDto implements IQuizQuestion {
  @ApiResponseProperty() id!: string;
  @ApiResponseProperty() prompt!: string;
  @ApiResponseProperty({ type: () => [QuizOptionResponseDto] })
  options!: QuizOptionResponseDto[];
}

export class QuizSummaryResponseDto implements IQuizSummary {
  @ApiResponseProperty() id!: string;
  @ApiResponseProperty() title!: string;
  @ApiResponseProperty() description!: string;
  @ApiResponseProperty() createdAt!: Date;
  @ApiResponseProperty() questionCount!: number;
  @ApiResponseProperty() assignedCount!: number;
  @ApiResponseProperty() completedCount!: number;
}

export class QuizDetailResponseDto implements IQuizDetail {
  @ApiResponseProperty() id!: string;
  @ApiResponseProperty() title!: string;
  @ApiResponseProperty() description!: string;
  @ApiResponseProperty() createdAt!: Date;
  @ApiResponseProperty() assignedCount!: number;
  @ApiResponseProperty({ type: () => [QuizQuestionResponseDto] })
  questions!: QuizQuestionResponseDto[];
}
