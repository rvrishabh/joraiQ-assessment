# Jora Quiz

Teachers create multiple-choice quizzes and assign them to students. Students attempt them, get a server-calculated score, and see a per-quiz leaderboard. Teachers see completion and accuracy per student.

- `backend/` NestJS (Fastify), Prisma, Supabase Postgres and Auth
- `frontend/` Next.js (App Router), TanStack Query, Tailwind, GSAP

## Live demo

| | URL |
| --- | --- |
| App (Vercel) | `[https://<your-app>.vercel.app](https://jorai-q-assessment.vercel.app/login)` |
| API (Render) | `[https://joraiq-assessment.onrender.com/api/v1](https://joraiq-assessment.onrender.com/api/v1)` |
| Health check | [`https://joraiq-assessment.onrender.com/api/v1/health`](https://joraiq-assessment.onrender.com/api/v1/health) |
| Demo video | `[https://drive.google.com/file/d/1cZAEp_EftMH3bDvi5t6xuq3FmJgSWSIT/view?usp=drive_link](https://drive.google.com/file/d/1cZAEp_EftMH3bDvi5t6xuq3FmJgSWSIT/view?usp=drive_link)` |

Sign in with the [demo accounts](#demo-accounts) or register a new one. The API runs on Render's free tier and sleeps when idle, so the first request after a pause can take up to a minute; opening the health check first wakes it.

## Architecture

```
Next.js --Supabase JS--> Supabase Auth      (sign in, session only)
     |
     | Bearer access token
     v
NestJS API --verifies JWT locally--> role + ownership checks
     |
     v
Prisma --> Supabase Postgres  (RLS on, no policies: API is the only door)
```

Backend modules (`backend/src/modules`): `auth`, `users`, `quizzes`, `assignments`, `attempts`, `analytics`, `leaderboard`. Each has a controller, a service (business rules), a module, DTOs, and a `repositories/` folder (all database access).

## Prerequisites

Node 22.12 or newer (the backend's `engines` field) and a Supabase project.

## Setup

### 1. Supabase

1. Create a project.
2. From **Project Settings**, collect the project URL, the anon key, the service-role key, and the **pooled** (port 6543) and **direct** (port 5432) Postgres connection strings.
3. Auth settings: nothing special is required. Accounts are created pre-confirmed by the API.

### 2. Backend

```bash
cd backend
cp .env.example .env      # fill in the values below
npm install
npx prisma migrate deploy # applies prisma/migrations to your Supabase database
npm run db:seed           # optional demo data
npm run start:dev         # http://localhost:3000, Swagger at /api/docs
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Supabase connection (add `?pgbouncer=true`) |
| `DIRECT_URL` | Direct or session-pooler connection. Read by `prisma.config.ts` for migrations |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Creates users. Never put this in the frontend |
| `SUPABASE_JWT_SECRET` | Optional. Set for projects on the legacy HS256 secret; leave empty to use the JWKS endpoint |
| `TEACHER_INVITE_CODE` | Optional. When set, teacher registration requires it; empty means open teacher sign-up |
| `FRONTEND_URL` | Allowed CORS origin(s), comma separated. Required when `NODE_ENV=production`; local dev origins are added outside production |
| `NODE_ENV` | `development`, `test` or `production`. Production turns on the CSP and hides Swagger |
| `TRUST_PROXY` | `true` behind a load balancer so rate limits see the real client IP |
| `LOG_LEVEL` | `debug`, `info`, `warn` or `error` |
| `PORT` | Defaults to 3000 |

Prefer to apply SQL by hand? Run `backend/prisma/migrations/20261114000000_init/migration.sql` in the Supabase SQL editor.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:3000/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key only |

## Demo accounts

`npm run db:seed` (in `backend/`) creates these through the Supabase admin API and is safe to re-run. Password for all: `Demo@12345`.

| Role | Email |
| --- | --- |
| Teacher | `teacher@joraiq.test` |
| Students | `aarav@joraiq.test`, `diya@joraiq.test`, `kabir@joraiq.test`, `sana@joraiq.test` |

It also creates one quiz, "World Capitals - Warm up". You can also register new accounts at `/register`.

## Tests

```bash
cd backend
npm test            # unit + HTTP tests, no database or network needed
npm run test:e2e    # security headers, CORS, body limit, health (mocked database)
npm run test:cov    # with coverage
npm run lint
```

```bash
cd frontend
npm test            # helper unit tests
npm run typecheck
```

The assessment's five required cases and where they live:

| Case | Test |
| --- | --- |
| Successful submission and score | `attempts.service.spec.ts`: "scores on the server and stores graded answers" |
| Second submission rejected | `attempts.service.spec.ts`: "rejects a second submission..." and the racing-duplicate case |
| Unassigned quiz rejected | `attempts.service.spec.ts`: "rejects an unassigned quiz" (submit and sheet) |
| Student on a teacher-only operation | `roles.guard.spec.ts` and `quizzes.http.spec.ts` (403 through the real guards) |
| Equal scores share a rank | `score.util.spec.ts` and `leaderboard.service.spec.ts` |

## API

All under `/api/v1`, bearer token required except register and health. `GET /quizzes` and `GET /users/students` take `page` and `limit` (max 100). The per-quiz and per-student assignment lists are small and returned whole. Interactive docs at `/api/docs` in development.

Every success is `{ success: true, data }`; every failure is `{ success: false, error, statusCode }`.

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | public | Liveness and database check |
| POST | `/auth/register` | public | Create an account |
| GET | `/users/me` | any | Current profile |
| GET | `/users/students` | T | Students for the assignment picker |
| POST | `/quizzes` | T | Create a quiz |
| GET | `/quizzes` | T | List my quizzes |
| GET | `/quizzes/:quizId` | T (owner) | Quiz with answer key |
| POST | `/quizzes/:quizId/assignments` | T (owner) | Assign to students |
| GET | `/quizzes/:quizId/assignments` | T (owner) | Assignment status per student |
| GET | `/assignments/mine` | S | My assigned quizzes |
| GET | `/quizzes/:quizId/attempt` | S (assigned) | Questions without the key |
| POST | `/quizzes/:quizId/attempts` | S (assigned) | Submit and score |
| GET | `/quizzes/:quizId/result` | S (assigned) | My result and review |
| GET | `/quizzes/:quizId/analytics` | T (owner) | Completion and accuracy |
| GET | `/quizzes/:quizId/leaderboard` | T (owner) or S (assigned) | Ranked entries |

| Status | When |
| --- | --- |
| 400 | Validation failure, bad answer set, non-student id in an assignment |
| 401 | Missing, invalid or expired token; no profile |
| 403 | Wrong role; quiz not yours; quiz not assigned to you; bad invite code |
| 404 | Quiz not found (owner routes); result not submitted yet |
| 409 | Second submission; duplicate email on register |
| 413 | Request body over 256 KB |
| 429 | Rate limit (100 per minute globally; register 5, quiz creation 30, submit 20) |
| 503 | `/health` cannot reach the database |

## Design decisions and trade-offs

**Auth and access**
- Supabase issues sessions; NestJS decides access. The browser signs in with the anon key and sends the access token as a bearer token. `JwtAuthGuard` verifies it locally with `jose` (HS256 secret if set, otherwise the project JWKS), so there is no call to Supabase per request.
- The role comes from the `profiles` table, never from the token. Users can edit their own `user_metadata`, so trusting it would let anyone become a teacher.
- Registration goes through `POST /auth/register`. The backend creates the auth user with the service-role key (which never leaves the server), writes the profile, and deletes the auth user if the profile insert fails, so the two never drift apart. Accounts are pre-confirmed so the demo needs no email setup.
- Teacher sign-up is open by default so a reviewer can try both roles. Set `TEACHER_INVITE_CODE` to require a code.
- An unassigned student gets 403 whether or not the quiz exists, so quiz ids cannot be probed.

**Data model**
- Seven tables: `profiles`, `quizzes`, `questions`, `answer_options`, `quiz_assignments`, `attempts`, `attempt_answers`.
- An attempt row exists only after submission. "Only completed attempts on the leaderboard" holds by construction, and status is derived (attempt present means completed). The trade-off: a half-finished quiz is not saved.
- Duplicate submissions are blocked by the database: `attempts.assignment_id` is unique. The service checks first for a clean 409 and also maps the unique violation to 409, so two simultaneous submits cannot both win.
- One correct option per question is enforced by a partial unique index (`WHERE is_correct`), and `correct_count <= total_questions` by a check constraint.
- Accuracy is computed when read, never stored, so there is no stale value.
- Row-level security is on for every table with no policies. The API is the only way in, even if someone calls Supabase's Data API directly.

**API**
- Students never receive the answer key before submitting: the attempt-sheet query selects only `id` and `text`, and a test asserts `isCorrect` is absent. Scoring happens on the server against the key.
- Submissions are checked for questions outside the quiz, options from another question, repeated questions, and missing answers.
- Queries stay flat (`select`, `_count`, batched inserts), with no N+1. Quiz creation is one transaction with three batched inserts.
- Assigning is idempotent (`createMany` with `skipDuplicates`) and reports `assigned` and `alreadyAssigned`.
- Leaderboard uses competition ranking: equal accuracy shares a rank and the next rank skips (100, 90, 90, 80 gives 1, 2, 2, 4). Entries carry only display name, accuracy and correct/total; other students' ids and emails are not sent.

**Pagination**
- Student picker: server-side pages of 30 with "Load more", and debounced server-side search over all students by name or email. Selections are kept across pages and searches, so a teacher can pick from several pages and assign in one request.
- Students sort by name then id and quizzes by creation time then id, so offset pages never shift or repeat.
- Questions are not paginated: a quiz has at most 50, loaded in one request because grading needs every answer at once.

**Frontend**
- Next.js is a client-rendered shell: the session lives in supabase-js in the browser and all business logic is in NestJS, so pages are client components and route guards run in layouts once the profile has loaded.
- If `/users/me` returns 401 the session is signed out; if the API is unreachable (for example a cold start) the session is kept and the load retries, so an outage does not log everyone out.
- A 409 on submit (already submitted from another tab) sends the student to their result.
- Every data screen has loading, empty and error states, with the server's message and a retry.

**Security**
- Helmet headers on every response; the CSP is enforced in production, where Swagger is not served.
- CORS allows only the origins in `FRONTEND_URL`; a missing value never opens it to every origin.
- Rate limits, a 256 KB body cap, validated UUIDs in every path, and request ids on every log line with auth headers redacted.
- No secrets in the frontend: it holds only the API URL, the Supabase URL and the anon key.

**Deployment**
- Frontend on Vercel, API on Render, database and auth on one Supabase project. Migrations are applied with `npx prisma migrate deploy` using `DIRECT_URL`; the running API uses the pooled `DATABASE_URL`.
- Render runs with `NODE_ENV=production`, `FRONTEND_URL` set to the Vercel origin, and `TRUST_PROXY=true` so rate limits see the real client IP.

## Known limitations

- Tests use mocked repositories and an HTTP test through the real guards, not a real database. The unique-constraint and partial-index behaviour comes from the SQL and is not exercised by a test.
- No in-progress attempts, timers, quiz editing, quiz deletion or un-assigning.
- No password reset or email confirmation flow.
- The teacher dashboard shows the 50 newest quizzes only; adding "Load more" like the student picker is the next step.
- Quizzes are capped at 50 questions. Longer quizzes would need a one-question-per-screen view with a numbered jump grid and answers auto-saved locally.
- The answer-sheet rail on the attempt screen is hidden on small screens; phones scroll instead.
- Student search is a case-insensitive substring match, not fuzzy.
- The session is kept in `localStorage` (the supabase-js default), not httpOnly cookies.
- A removed user's access token stays valid until it expires (Supabase default one hour).
- The frontend has unit tests for helpers only; screens were checked by hand.
- The free Render instance sleeps when idle, so the first request after a pause is slow.
