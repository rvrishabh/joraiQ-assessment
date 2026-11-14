export interface ILeaderboardEntry {
  rank: number;
  displayName: string;
  accuracy: number;
  correctCount: number;
  totalQuestions: number;
  isCurrentUser: boolean;
}

export interface ILeaderboard {
  quizId: string;
  title: string;
  participants: number;
  entries: ILeaderboardEntry[];
  me: ILeaderboardEntry | null;
}
