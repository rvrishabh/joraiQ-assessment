import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toPaging } from 'src/common/dto/pagination-query.dto';
import {
  AuthUser,
  DEFAULT_PAGE_SIZE,
  IPaginationQuery,
  IQuizDetail,
  IQuizSummary,
} from 'types';
import { CreateQuizDto } from './dto';
import { QuizzesRepository } from './repositories/quizzes.repository';

@Injectable()
export class QuizzesService {
  constructor(private readonly quizzes: QuizzesRepository) {}

  async create(teacher: AuthUser, dto: CreateQuizDto): Promise<IQuizDetail> {
    dto.questions.forEach((q, i) => {
      const unique = new Set(q.options.map((o) => o.toLowerCase()));
      if (unique.size !== q.options.length) {
        throw new BadRequestException(`Question ${i + 1} has duplicate options`);
      }
    });

    const description = dto.description ?? '';
    const created = await this.quizzes.create({
      teacherId: teacher.id,
      title: dto.title,
      description,
      questions: dto.questions,
    });
    return {
      id: created.id,
      title: dto.title,
      description,
      createdAt: created.createdAt,
      assignedCount: 0,
      questions: created.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
        })),
      })),
    };
  }

  async listMine(teacher: AuthUser, query: IPaginationQuery): Promise<IQuizSummary[]> {
    const rows = await this.quizzes.listByTeacher(teacher.id, toPaging(query, DEFAULT_PAGE_SIZE));
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      createdAt: r.createdAt,
      questionCount: r._count.questions,
      assignedCount: r.assignments.length,
      completedCount: r.assignments.filter((a) => a.attempt).length,
    }));
  }

  async getOwned(teacher: AuthUser, quizId: string): Promise<IQuizDetail> {
    await this.assertOwner(teacher, quizId);
    const quiz = await this.quizzes.findDetail(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      createdAt: quiz.createdAt,
      assignedCount: quiz._count.assignments,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
        })),
      })),
    };
  }

  /** 404 when the quiz is missing, 403 when it belongs to another teacher. */
  async assertOwner(teacher: AuthUser, quizId: string) {
    const quiz = await this.quizzes.findById(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.teacherId !== teacher.id) {
      throw new ForbiddenException('This quiz belongs to another teacher');
    }
    return quiz;
  }
}
