import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { UnauthorizedException } from '@nestjs/common';
import { configureApp } from 'src/app.setup';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { TokenVerifierService } from 'src/modules/auth/services/token-verifier.service';
import { ProfilesRepository } from 'src/modules/users/repositories/profiles.repository';
import { QuizzesController } from 'src/modules/quizzes/quizzes.controller';
import { QuizzesService } from 'src/modules/quizzes/quizzes.service';

const profiles: Record<string, unknown> = {
  teacher1: { id: 'teacher1', email: 't@t', fullName: 'T', role: 'TEACHER' },
  student1: { id: 'student1', email: 's@t', fullName: 'S', role: 'STUDENT' },
};

describe('Quizzes HTTP (guards + pipeline)', () => {
  let app: NestFastifyApplication;
  const quizzes = {
    create: jest.fn().mockResolvedValue({ id: 'new-quiz' }),
    listMine: jest.fn().mockResolvedValue([]),
    getOwned: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [QuizzesController],
      providers: [
        JwtAuthGuard,
        RolesGuard,
        { provide: QuizzesService, useValue: quizzes },
        {
          provide: TokenVerifierService,
          useValue: {
            verify: async (token: string) => {
              if (!profiles[token]) throw new UnauthorizedException('bad token');
              return { sub: token };
            },
          },
        },
        {
          provide: ProfilesRepository,
          useValue: { findById: async (id: string) => profiles[id] ?? null },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(() => app.close());

  const validQuiz = {
    title: 'Algebra',
    questions: [{ prompt: '1+1?', options: ['1', '2', '3', '4'], correctIndex: 1 }],
  };

  const post = (token: string | null, payload: unknown) =>
    app.inject({
      method: 'POST',
      url: '/api/v1/quizzes',
      headers: token ? { authorization: `Bearer ${token}` } : {},
      payload: payload as object,
    });

  it('rejects a student creating a quiz with 403', async () => {
    const res = await post('student1', validQuiz);

    expect(res.statusCode).toBe(403);
    expect(res.json()).toMatchObject({ success: false, statusCode: 403 });
    expect(quizzes.create).not.toHaveBeenCalled();
  });

  it('rejects a missing token with 401', async () => {
    const res = await post(null, validQuiz);
    expect(res.statusCode).toBe(401);
  });

  it('lets a teacher create a quiz', async () => {
    const res = await post('teacher1', validQuiz);

    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({ success: true, data: { id: 'new-quiz' } });
  });

  it('returns 400 with validation messages for a bad quiz', async () => {
    const res = await post('teacher1', {
      title: '',
      questions: [{ prompt: 'x', options: ['a', 'b'], correctIndex: 7 }],
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(Array.isArray(body.error)).toBe(true);
  });

  it('rejects a student on the teacher quiz list', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/quizzes',
      headers: { authorization: 'Bearer student1' },
    });
    expect(res.statusCode).toBe(403);
  });
});
