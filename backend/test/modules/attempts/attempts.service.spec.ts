import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { AuthUser } from 'types';
import { AttemptsService } from 'src/modules/attempts/attempts.service';

const student: AuthUser = {
  id: 's1',
  email: 's1@test',
  fullName: 'Student One',
  role: 'STUDENT',
};

const key = [
  {
    id: 'q1',
    prompt: 'one',
    options: [
      { id: 'q1a', text: 'a', isCorrect: true },
      { id: 'q1b', text: 'b', isCorrect: false },
      { id: 'q1c', text: 'c', isCorrect: false },
      { id: 'q1d', text: 'd', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    prompt: 'two',
    options: [
      { id: 'q2a', text: 'a', isCorrect: false },
      { id: 'q2b', text: 'b', isCorrect: true },
      { id: 'q2c', text: 'c', isCorrect: false },
      { id: 'q2d', text: 'd', isCorrect: false },
    ],
  },
];

function setup(assignment: unknown = { id: 'as1', attempt: null }) {
  const attempts = {
    getAnswerKey: jest.fn().mockResolvedValue(key),
    getSheet: jest.fn(),
    create: jest.fn().mockResolvedValue({ id: 'at1', submittedAt: new Date() }),
    findByAssignment: jest.fn().mockResolvedValue({
      submittedAt: new Date(),
      totalQuestions: 2,
      correctCount: 1,
      answers: [
        { questionId: 'q1', selectedOptionId: 'q1a', isCorrect: true },
        { questionId: 'q2', selectedOptionId: 'q2a', isCorrect: false },
      ],
    }),
  };
  const assignments = {
    findByQuizAndStudent: jest.fn().mockResolvedValue(assignment),
  };
  const service = new AttemptsService(attempts as never, assignments as never);
  return { service, attempts, assignments };
}

const answers = (q1: string, q2: string) => ({
  answers: [
    { questionId: 'q1', optionId: q1 },
    { questionId: 'q2', optionId: q2 },
  ],
});

describe('AttemptsService.submit', () => {
  it('scores on the server and stores graded answers', async () => {
    const { service, attempts } = setup();

    const result = await service.submit(student, 'quiz', answers('q1a', 'q2a'));

    expect(attempts.create).toHaveBeenCalledWith({
      assignmentId: 'as1',
      totalQuestions: 2,
      correctCount: 1,
      answers: [
        { questionId: 'q1', selectedOptionId: 'q1a', isCorrect: true },
        { questionId: 'q2', selectedOptionId: 'q2a', isCorrect: false },
      ],
    });
    expect(result).toMatchObject({
      totalQuestions: 2,
      correctCount: 1,
      incorrectCount: 1,
      accuracy: 50,
      status: 'COMPLETED',
    });
  });

  it('rejects a second submission for the same assignment', async () => {
    const { service, attempts } = setup({ id: 'as1', attempt: { id: 'at0' } });

    await expect(
      service.submit(student, 'quiz', answers('q1a', 'q2b')),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(attempts.create).not.toHaveBeenCalled();
  });

  it('rejects a racing duplicate caught by the unique constraint', async () => {
    const { service, attempts } = setup();
    attempts.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.submit(student, 'quiz', answers('q1a', 'q2b')),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects an unassigned quiz', async () => {
    const { service, attempts } = setup(null);

    await expect(
      service.submit(student, 'quiz', answers('q1a', 'q2b')),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(attempts.create).not.toHaveBeenCalled();
  });

  it('rejects an unassigned quiz when loading the question sheet', async () => {
    const { service } = setup(null);
    await expect(service.getSheet(student, 'quiz')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects unanswered questions', async () => {
    const { service } = setup();
    await expect(
      service.submit(student, 'quiz', {
        answers: [{ questionId: 'q1', optionId: 'q1a' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an option from a different question', async () => {
    const { service } = setup();
    await expect(
      service.submit(student, 'quiz', answers('q2b', 'q2b')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects the same question answered twice', async () => {
    const { service } = setup();
    await expect(
      service.submit(student, 'quiz', {
        answers: [
          { questionId: 'q1', optionId: 'q1a' },
          { questionId: 'q1', optionId: 'q1b' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('AttemptsService.getSheet', () => {
  it('never includes isCorrect in what the student receives', async () => {
    const { service, attempts } = setup();
    attempts.getSheet.mockResolvedValue({
      id: 'quiz',
      title: 't',
      description: '',
      questions: [
        { id: 'q1', prompt: 'one', options: [{ id: 'q1a', text: 'a' }] },
      ],
    });

    const sheet = await service.getSheet(student, 'quiz');

    expect(JSON.stringify(sheet)).not.toContain('isCorrect');
    expect(attempts.getAnswerKey).not.toHaveBeenCalled();
  });

  it('refuses once the quiz was submitted', async () => {
    const { service } = setup({ id: 'as1', attempt: { id: 'at1' } });
    await expect(service.getSheet(student, 'quiz')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
