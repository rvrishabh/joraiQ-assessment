import { ApiResponseProperty } from '@nestjs/swagger';
import { ILeaderboard, ILeaderboardEntry } from 'types';

export class LeaderboardEntryResponseDto implements ILeaderboardEntry {
  @ApiResponseProperty() rank!: number;
  @ApiResponseProperty() displayName!: string;
  @ApiResponseProperty() accuracy!: number;
  @ApiResponseProperty() correctCount!: number;
  @ApiResponseProperty() totalQuestions!: number;
  @ApiResponseProperty() isCurrentUser!: boolean;
}

export class LeaderboardResponseDto implements ILeaderboard {
  @ApiResponseProperty() quizId!: string;
  @ApiResponseProperty() title!: string;
  @ApiResponseProperty() participants!: number;
  @ApiResponseProperty({ type: () => [LeaderboardEntryResponseDto] })
  entries!: LeaderboardEntryResponseDto[];
  @ApiResponseProperty({ type: () => LeaderboardEntryResponseDto })
  me!: LeaderboardEntryResponseDto | null;
}
