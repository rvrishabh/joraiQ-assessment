import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';
import { IAssignQuiz } from 'types';

export class AssignQuizDto implements IAssignQuiz {
  @ApiProperty({ type: [String], description: 'Student profile ids' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  studentIds!: string[];
}
