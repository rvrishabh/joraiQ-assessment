import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { ISubmitAnswer, ISubmitAttempt } from 'types';

export class AnswerDto implements ISubmitAnswer {
  @ApiProperty()
  @IsUUID()
  questionId!: string;

  @ApiProperty()
  @IsUUID()
  optionId!: string;
}

export class SubmitAttemptDto implements ISubmitAttempt {
  @ApiProperty({ type: [AnswerDto], description: 'One answer per question' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];
}
