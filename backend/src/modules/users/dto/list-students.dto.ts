import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { IListStudentsQuery } from 'types';

export class ListStudentsDto extends PaginationQueryDto implements IListStudentsQuery {
  @ApiPropertyOptional({ description: 'Match on name or email' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;
}
