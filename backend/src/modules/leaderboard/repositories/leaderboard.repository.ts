import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeaderboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Completed attempts only: an attempt row exists only after submission. */
  completedAttempts(quizId: string) {
    return this.prisma.attempt.findMany({
      where: { assignment: { quizId } },
      select: {
        correctCount: true,
        totalQuestions: true,
        submittedAt: true,
        assignment: {
          select: { student: { select: { id: true, fullName: true } } },
        },
      },
    });
  }
}
