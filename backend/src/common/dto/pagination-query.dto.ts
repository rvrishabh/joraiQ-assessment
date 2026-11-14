import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { IPaginationQuery, MAX_PAGE_SIZE } from 'types';

export class PaginationQueryDto implements IPaginationQuery {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: MAX_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;
}

/** Turns optional page/limit into skip/take with safe defaults. */
export function toPaging(query: IPaginationQuery, defaultLimit: number) {
  const limit = query.limit ?? defaultLimit;
  const page = query.page ?? 1;
  return { take: limit, skip: (page - 1) * limit };
}
