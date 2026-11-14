import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(quizId: string, studentIds: string[]) {
    const result = await this.prisma.quizAssignment.createMany({
      data: studentIds.map((studentId) => ({ quizId, studentId })),
      skipDuplicates: true,
    });
    return result.count;
  }

  findByQuizAndStudent(quizId: string, studentId: string) {
    return this.prisma.quizAssignment.findUnique({
      where: { quizId_studentId: { quizId, studentId } },
      select: {
        id: true,
        attempt: { select: { id: true } },
      },
    });
  }

  listForQuiz(quizId: string) {
    return this.prisma.quizAssignment.findMany({
      where: { quizId },
      orderBy: { assignedAt: 'desc' },
      select: {
        id: true,
        assignedAt: true,
        student: { select: { id: true, fullName: true, email: true } },
        attempt: {
          select: { submittedAt: true, correctCount: true, totalQuestions: true },
        },
      },
    });
  }

  listForStudent(studentId: string) {
    return this.prisma.quizAssignment.findMany({
      where: { studentId },
      orderBy: { assignedAt: 'desc' },
      select: {
        id: true,
        assignedAt: true,
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            teacher: { select: { fullName: true } },
            _count: { select: { questions: true } },
          },
        },
        attempt: {
          select: { submittedAt: true, correctCount: true, totalQuestions: true },
        },
      },
    });
  }
}
