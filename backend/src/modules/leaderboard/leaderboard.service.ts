import { ForbiddenException, Injectable } from '@nestjs/common';
import { rankEntries } from 'src/common/utils/score.util';
import { AuthUser, ILeaderboard } from 'types';
import { AssignmentsRepository } from '../assignments/repositories/assignments.repository';
import { QuizzesRepository } from '../quizzes/repositories/quizzes.repository';
import { QuizzesService } from '../quizzes/quizzes.service';
import { LeaderboardRepository } from './repositories/leaderboard.repository';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly leaderboard: LeaderboardRepository,
    private readonly quizzes: QuizzesService,
    private readonly quizRepo: QuizzesRepository,
    private readonly assignments: AssignmentsRepository,
  ) {}

  async forQuiz(user: AuthUser, quizId: string): Promise<ILeaderboard> {
    if (user.role === 'TEACHER') {
      await this.quizzes.assertOwner(user, quizId);
    } else {
      const assignment = await this.assignments.findByQuizAndStudent(quizId, user.id);
      if (!assignment) {
        throw new ForbiddenException('This quiz is not assigned to you');
      }
    }

    const [quiz, attempts] = await Promise.all([
      this.quizRepo.findById(quizId),
      this.leaderboard.completedAttempts(quizId),
    ]);

    const entries = rankEntries(
      attempts.map((a) => ({
        studentId: a.assignment.student.id,
        displayName: a.assignment.student.fullName,
        correctCount: a.correctCount,
        totalQuestions: a.totalQuestions,
        submittedAt: a.submittedAt,
      })),
    ).map(({ studentId, displayName, rank, accuracy, correctCount, totalQuestions }) => ({
      rank,
      displayName,
      accuracy,
      correctCount,
      totalQuestions,
      isCurrentUser: studentId === user.id,
    }));

    return {
      quizId,
      title: quiz?.title ?? '',
      participants: entries.length,
      entries,
      me: entries.find((e) => e.isCurrentUser) ?? null,
    };
  }
}
