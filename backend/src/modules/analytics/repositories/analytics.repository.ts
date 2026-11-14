import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async questionCount(quizId: string) {
    return this.prisma.question.count({ where: { quizId } });
  }

  /** One query: every assignment with its student and (optional) attempt. */
  assignmentsWithAttempts(quizId: string) {
    return this.prisma.quizAssignment.findMany({
      where: { quizId },
      select: {
        id: true,
        student: { select: { id: true, fullName: true, email: true } },
        attempt: {
          select: { submittedAt: true, correctCount: true, totalQuestions: true },
        },
      },
    });
  }
}
