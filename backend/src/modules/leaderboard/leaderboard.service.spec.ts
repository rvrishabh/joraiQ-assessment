import { ForbiddenException } from '@nestjs/common';
import { AuthUser } from 'types';
import { LeaderboardService } from './leaderboard.service';

const at = (m: number) => new Date(2026, 0, 1, 9, m);
const attempt = (id: string, name: string, correct: number, m: number) => ({
  correctCount: correct,
  totalQuestions: 4,
  submittedAt: at(m),
  assignment: { student: { id, fullName: name } },
});

function setup(assignment: unknown = { id: 'a', attempt: null }) {
  const repo = {
    completedAttempts: jest.fn().mockResolvedValue([
      attempt('s1', 'Asha', 3, 1),
      attempt('s2', 'Bala', 4, 2),
      attempt('s3', 'Chitra', 3, 3),
      attempt('s4', 'Dev', 0, 4),
    ]),
  };
  const quizzes = { assertOwner: jest.fn().mockResolvedValue({}) };
  const quizRepo = { findById: jest.fn().mockResolvedValue({ title: 'Quiz' }) };
  const assignments = {
    findByQuizAndStudent: jest.fn().mockResolvedValue(assignment),
  };
  const service = new LeaderboardService(
    repo as never,
    quizzes as never,
    quizRepo as never,
    assignments as never,
  );
  return { service, quizzes, assignments };
}

const student = (id: string): AuthUser => ({
  id,
  email: `${id}@t`,
  fullName: id,
  role: 'STUDENT',
});

describe('LeaderboardService', () => {
  it('shares a rank between students with equal accuracy', async () => {
    const { service } = setup();
    const board = await service.forQuiz(student('s3'), 'quiz');

    expect(board.entries.map((e) => [e.displayName, e.rank])).toEqual([
      ['Bala', 1],
      ['Asha', 2],
      ['Chitra', 2],
      ['Dev', 4],
    ]);
  });

  it('marks the current student and reports their rank', async () => {
    const { service } = setup();
    const board = await service.forQuiz(student('s3'), 'quiz');

    expect(board.me).toMatchObject({ displayName: 'Chitra', rank: 2 });
    expect(board.entries.filter((e) => e.isCurrentUser)).toHaveLength(1);
  });

  it('does not leak other students ids or emails', async () => {
    const { service } = setup();
    const board = await service.forQuiz(student('s1'), 'quiz');
    const json = JSON.stringify(board);

    expect(json).not.toContain('s2');
    expect(json).not.toContain('@');
  });

  it('returns me as null when the student has not completed the quiz', async () => {
    const { service } = setup();
    const board = await service.forQuiz(student('s9'), 'quiz');
    expect(board.me).toBeNull();
  });

  it('refuses a student who was not assigned the quiz', async () => {
    const { service } = setup(null);
    await expect(service.forQuiz(student('s9'), 'quiz')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('checks ownership for teachers', async () => {
    const { service, quizzes } = setup();
    quizzes.assertOwner.mockRejectedValue(new ForbiddenException());

    await expect(
      service.forQuiz(
        { id: 't2', email: 't', fullName: 'T', role: 'TEACHER' },
        'quiz',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
