import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toAccuracy } from 'src/common/utils/score.util';
import { AuthUser, IAttemptResult, IAttemptSheet } from 'types';
import { AssignmentsRepository } from '../assignments/repositories/assignments.repository';
import { SubmitAttemptDto } from './dto';
import { AttemptsRepository } from './repositories/attempts.repository';

type AnswerKey = Awaited<ReturnType<AttemptsRepository['getAnswerKey']>>;

@Injectable()
export class AttemptsService {
  constructor(
    private readonly attempts: AttemptsRepository,
    private readonly assignments: AssignmentsRepository,
  ) {}

  /** Questions to answer. Never carries the answer key. */
  async getSheet(student: AuthUser, quizId: string): Promise<IAttemptSheet> {
    const assignment = await this.requireAssignment(student, quizId);
    if (assignment.attempt) {
      throw new ConflictException('You have already submitted this quiz');
    }
    const sheet = await this.attempts.getSheet(quizId);
    if (!sheet) throw new NotFoundException('Quiz not found');
    return sheet;
  }

  async submit(student: AuthUser, quizId: string, dto: SubmitAttemptDto): Promise<IAttemptResult> {
    const assignment = await this.requireAssignment(student, quizId);
    if (assignment.attempt) {
      throw new ConflictException('You have already submitted this quiz');
    }

    const key = await this.attempts.getAnswerKey(quizId);
    if (!key.length) throw new NotFoundException('Quiz not found');

    const byQuestion = new Map(key.map((q) => [q.id, q]));
    const seen = new Set<string>();
    for (const a of dto.answers) {
      const question = byQuestion.get(a.questionId);
      if (!question) {
        throw new BadRequestException('Answer references a question outside this quiz');
      }
      if (seen.has(a.questionId)) {
        throw new BadRequestException('Each question can be answered only once');
      }
      if (!question.options.some((o) => o.id === a.optionId)) {
        throw new BadRequestException('Selected option does not belong to the question');
      }
      seen.add(a.questionId);
    }
    if (seen.size !== key.length) {
      throw new BadRequestException('All questions must be answered');
    }

    const graded = dto.answers.map((a) => {
      const correct = byQuestion.get(a.questionId)!.options.find((o) => o.isCorrect);
      return {
        questionId: a.questionId,
        selectedOptionId: a.optionId,
        isCorrect: correct?.id === a.optionId,
      };
    });
    const correctCount = graded.filter((g) => g.isCorrect).length;

    let submittedAt: Date;
    try {
      ({ submittedAt } = await this.attempts.create({
        assignmentId: assignment.id,
        totalQuestions: key.length,
        correctCount,
        answers: graded,
      }));
    } catch (err) {
      // Two submits racing past the check above: the unique constraint wins.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('You have already submitted this quiz');
      }
      throw err;
    }

    return this.buildResult(quizId, key, {
      submittedAt,
      totalQuestions: key.length,
      correctCount,
      answers: graded,
    });
  }

  async getResult(student: AuthUser, quizId: string): Promise<IAttemptResult> {
    const assignment = await this.requireAssignment(student, quizId);
    const attempt = await this.attempts.findByAssignment(assignment.id);
    if (!attempt) throw new NotFoundException('You have not submitted this quiz yet');

    const key = await this.attempts.getAnswerKey(quizId);
    return this.buildResult(quizId, key, attempt);
  }

  private buildResult(
    quizId: string,
    key: AnswerKey,
    attempt: {
      submittedAt: Date;
      totalQuestions: number;
      correctCount: number;
      answers: Array<{ questionId: string; selectedOptionId: string; isCorrect: boolean }>;
    },
  ): IAttemptResult {
    const picked = new Map(attempt.answers.map((a) => [a.questionId, a]));

    return {
      quizId,
      status: 'COMPLETED' as const,
      submittedAt: attempt.submittedAt,
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.totalQuestions - attempt.correctCount,
      accuracy: toAccuracy(attempt.correctCount, attempt.totalQuestions),
      review: key.map((q) => ({
        questionId: q.id,
        prompt: q.prompt,
        selectedOptionId: picked.get(q.id)?.selectedOptionId ?? null,
        correctOptionId: q.options.find((o) => o.isCorrect)?.id ?? null,
        isCorrect: picked.get(q.id)?.isCorrect ?? false,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
      })),
    };
  }

  private async requireAssignment(student: AuthUser, quizId: string) {
    const assignment = await this.assignments.findByQuizAndStudent(quizId, student.id);
    if (!assignment) {
      throw new ForbiddenException('This quiz is not assigned to you');
    }
    return assignment;
  }
}
