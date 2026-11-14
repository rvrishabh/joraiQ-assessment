import { BadRequestException, Injectable } from '@nestjs/common';
import { toAccuracy } from 'src/common/utils/score.util';
import { AuthUser, IAssignResult, IMyAssignment, IQuizAssignmentRow } from 'types';
import { ProfilesRepository } from '../users/repositories/profiles.repository';
import { QuizzesService } from '../quizzes/quizzes.service';
import { AssignmentsRepository } from './repositories/assignments.repository';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly assignments: AssignmentsRepository,
    private readonly profiles: ProfilesRepository,
    private readonly quizzes: QuizzesService,
  ) {}

  async assign(teacher: AuthUser, quizId: string, studentIds: string[]): Promise<IAssignResult> {
    await this.quizzes.assertOwner(teacher, quizId);

    const valid = await this.profiles.findStudentsByIds(studentIds);
    if (valid.length !== studentIds.length) {
      throw new BadRequestException('One or more selected users are not students');
    }

    const created = await this.assignments.createMany(quizId, studentIds);
    return { assigned: created, alreadyAssigned: studentIds.length - created };
  }

  async listForQuiz(teacher: AuthUser, quizId: string): Promise<IQuizAssignmentRow[]> {
    await this.quizzes.assertOwner(teacher, quizId);
    const rows = await this.assignments.listForQuiz(quizId);
    return rows.map((r) => ({
      assignmentId: r.id,
      studentId: r.student.id,
      fullName: r.student.fullName,
      email: r.student.email,
      assignedAt: r.assignedAt,
      status: r.attempt ? 'COMPLETED' : 'PENDING',
      completedAt: r.attempt?.submittedAt ?? null,
    }));
  }

  async listMine(student: AuthUser): Promise<IMyAssignment[]> {
    const rows = await this.assignments.listForStudent(student.id);
    return rows.map((r) => ({
      assignmentId: r.id,
      quizId: r.quiz.id,
      title: r.quiz.title,
      description: r.quiz.description,
      teacherName: r.quiz.teacher.fullName,
      questionCount: r.quiz._count.questions,
      assignedAt: r.assignedAt,
      status: r.attempt ? 'COMPLETED' : 'PENDING',
      completedAt: r.attempt?.submittedAt ?? null,
      correctCount: r.attempt?.correctCount ?? null,
      accuracy: r.attempt
        ? toAccuracy(r.attempt.correctCount, r.attempt.totalQuestions)
        : null,
    }));
  }
}
