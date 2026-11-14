import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface NewAttempt {
  assignmentId: string;
  totalQuestions: number;
  correctCount: number;
  answers: Array<{ questionId: string; selectedOptionId: string; isCorrect: boolean }>;
}

@Injectable()
export class AttemptsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Questions and options without the answer key. */
  getSheet(quizId: string) {
    return this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        title: true,
        description: true,
        questions: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            prompt: true,
            options: {
              orderBy: { position: 'asc' },
              select: { id: true, text: true },
            },
          },
        },
      },
    });
  }

  /** Server-side only: includes isCorrect. */
  getAnswerKey(quizId: string) {
    return this.prisma.question.findMany({
      where: { quizId },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        prompt: true,
        options: {
          orderBy: { position: 'asc' },
          select: { id: true, text: true, isCorrect: true },
        },
      },
    });
  }

  create(data: NewAttempt) {
    return this.prisma.attempt.create({
      data: {
        assignmentId: data.assignmentId,
        totalQuestions: data.totalQuestions,
        correctCount: data.correctCount,
        answers: { create: data.answers },
      },
      select: { id: true, submittedAt: true },
    });
  }

  findByAssignment(assignmentId: string) {
    return this.prisma.attempt.findUnique({
      where: { assignmentId },
      select: {
        submittedAt: true,
        totalQuestions: true,
        correctCount: true,
        answers: {
          select: { questionId: true, selectedOptionId: true, isCorrect: true },
        },
      },
    });
  }
}
