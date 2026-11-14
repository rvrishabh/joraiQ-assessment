import { ApiResponseProperty } from '@nestjs/swagger';
import { IAttemptResult, IAttemptSheet, IReviewItem, ISheetOption, ISheetQuestion } from 'types';

export class SheetOptionResponseDto implements ISheetOption {
  @ApiResponseProperty() id!: string;
  @ApiResponseProperty() text!: string;
}

export class SheetQuestionResponseDto implements ISheetQuestion {
  @ApiResponseProperty() id!: string;
  @ApiResponseProperty() prompt!: string;
  @ApiResponseProperty({ type: () => [SheetOptionResponseDto] })
  options!: SheetOptionResponseDto[];
}

export class AttemptSheetResponseDto implements IAttemptSheet {
  @ApiResponseProperty() id!: string;
  @ApiResponseProperty() title!: string;
  @ApiResponseProperty() description!: string;
  @ApiResponseProperty({ type: () => [SheetQuestionResponseDto] })
  questions!: SheetQuestionResponseDto[];
}

export class ReviewItemResponseDto implements IReviewItem {
  @ApiResponseProperty() questionId!: string;
  @ApiResponseProperty() prompt!: string;
  @ApiResponseProperty() selectedOptionId!: string | null;
  @ApiResponseProperty() correctOptionId!: string | null;
  @ApiResponseProperty() isCorrect!: boolean;
  @ApiResponseProperty({ type: () => [SheetOptionResponseDto] })
  options!: SheetOptionResponseDto[];
}

export class AttemptResultResponseDto implements IAttemptResult {
  @ApiResponseProperty() quizId!: string;
  @ApiResponseProperty({ enum: ['COMPLETED'] }) status!: 'COMPLETED';
  @ApiResponseProperty() submittedAt!: Date;
  @ApiResponseProperty() totalQuestions!: number;
  @ApiResponseProperty() correctCount!: number;
  @ApiResponseProperty() incorrectCount!: number;
  @ApiResponseProperty() accuracy!: number;
  @ApiResponseProperty({ type: () => [ReviewItemResponseDto] })
  review!: ReviewItemResponseDto[];
}
