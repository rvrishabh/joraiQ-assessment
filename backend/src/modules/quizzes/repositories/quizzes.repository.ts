import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

export interface NewQuiz {
  teacherId: string;
  title: string;
  description: string;
  questions: Array<{ prompt: string; options: string[]; correctIndex: number }>;
}

@Injectable()
export class QuizzesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Three batched inserts in one transaction instead of one nested create
   * per row. Ids are generated here so the rows can be linked up front.
   */
  async create(data: NewQuiz) {
    const quizId = randomUUID();
    const questions = data.questions.map((q, qi) => ({
      id: randomUUID(),
      prompt: q.prompt,
      position: qi,
      options: q.options.map((text, oi) => ({
        id: randomUUID(),
        text,
        position: oi,
        isCorrect: oi === q.correctIndex,
      })),
    }));

    const [quiz] = await this.prisma.$transaction([
      this.prisma.quiz.create({
        data: {
          id: quizId,
          teacherId: data.teacherId,
          title: data.title,
          description: data.description,
        },
        select: { id: true, createdAt: true },
      }),
      this.prisma.question.createMany({
        data: questions.map((q) => ({
          id: q.id,
          quizId,
          prompt: q.prompt,
          position: q.position,
        })),
      }),
      this.prisma.answerOption.createMany({
        data: questions.flatMap((q) =>
          q.options.map((o) => ({ ...o, questionId: q.id })),
        ),
      }),
    ]);

    return { id: quizId, createdAt: quiz.createdAt, questions };
  }

  findById(id: string) {
    return this.prisma.quiz.findUnique({
      where: { id },
      select: { id: true, teacherId: true, title: true },
    });
  }

  findDetail(id: string) {
    return this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { position: 'asc' },
          include: { options: { orderBy: { position: 'asc' } } },
        },
        _count: { select: { assignments: true } },
      },
    });
  }

  listByTeacher(teacherId: string, paging: { skip: number; take: number }) {
    return this.prisma.quiz.findMany({
      where: { teacherId },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      ...paging,
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        _count: { select: { questions: true } },
        // Ids only: enough to count assigned and completed in one query.
        assignments: { select: { attempt: { select: { id: true } } } },
      },
    });
  }
}
