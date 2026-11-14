import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ICreateQuestion, ICreateQuiz } from 'types';

const trimValue = (value: unknown) =>
  typeof value === 'string' ? value.trim() : value;
const trim = ({ value }: { value: unknown }) => trimValue(value);

export class QuestionDto implements ICreateQuestion {
  @ApiProperty({ example: 'What is the capital of France?' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  prompt!: string;

  @ApiProperty({ type: [String], description: 'Exactly four options' })
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @Transform(({ value }) => (Array.isArray(value) ? value.map(trimValue) : value))
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(250, { each: true })
  options!: string[];

  @ApiProperty({ minimum: 0, maximum: 3, description: 'Index of the correct option' })
  @IsInt()
  @Min(0)
  @Max(3)
  correctIndex!: number;
}

export class CreateQuizDto implements ICreateQuiz {
  @ApiProperty({ example: 'Fractions - Week 3' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ type: [QuestionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions!: QuestionDto[];
}
