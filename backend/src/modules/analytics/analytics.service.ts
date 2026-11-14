import { Injectable } from '@nestjs/common';
import { toAccuracy } from 'src/common/utils/score.util';
import { AuthUser, IQuizAnalytics } from 'types';
import { QuizzesService } from '../quizzes/quizzes.service';
import { AnalyticsRepository } from './repositories/analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analytics: AnalyticsRepository,
    private readonly quizzes: QuizzesService,
  ) {}

  async forQuiz(teacher: AuthUser, quizId: string): Promise<IQuizAnalytics> {
    const quiz = await this.quizzes.assertOwner(teacher, quizId);
    const [questionCount, rows] = await Promise.all([
      this.analytics.questionCount(quizId),
      this.analytics.assignmentsWithAttempts(quizId),
    ]);

    const students = rows
      .map((r) => ({
        studentId: r.student.id,
        fullName: r.student.fullName,
        email: r.student.email,
        status: r.attempt ? ('COMPLETED' as const) : ('PENDING' as const),
        correctCount: r.attempt?.correctCount ?? null,
        totalQuestions: questionCount,
        accuracy: r.attempt
          ? toAccuracy(r.attempt.correctCount, r.attempt.totalQuestions)
          : null,
        submittedAt: r.attempt?.submittedAt ?? null,
      }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    const done = students.filter((s) => s.status === 'COMPLETED');
    const averageAccuracy = done.length
      ? Math.round((done.reduce((sum, s) => sum + (s.accuracy ?? 0), 0) / done.length) * 100) / 100
      : null;

    return {
      quizId,
      title: quiz.title,
      questionCount,
      assignedCount: students.length,
      completedCount: done.length,
      averageAccuracy,
      students,
    };
  }
}
