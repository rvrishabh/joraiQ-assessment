import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'asha@school.test' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: 'Asha Rao' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  fullName!: string;

  @ApiProperty({ enum: ['TEACHER', 'STUDENT'] })
  @IsIn(['TEACHER', 'STUDENT'])
  role!: 'TEACHER' | 'STUDENT';

  @ApiPropertyOptional({ description: 'Required for teachers when the server sets TEACHER_INVITE_CODE' })
  @IsOptional()
  @IsString()
  inviteCode?: string;
}
