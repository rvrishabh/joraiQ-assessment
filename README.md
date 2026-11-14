# Jora Quiz

Teachers create multiple-choice quizzes and assign them to students. Students attempt them, get a server-calculated score, and see a per-quiz leaderboard. Teachers see completion and accuracy per student.

- `backend/` NestJS (Fastify), Prisma, Supabase Postgres and Auth
- `frontend/` Next.js (App Router), TanStack Query, Tailwind, GSAP
- [`DECISIONS.md`](DECISIONS.md) design decisions and known limitations
- [`FLOWS.md`](FLOWS.md) end-to-end API flows and error codes

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

Node 20 or newer and a Supabase project.

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
| `DIRECT_URL` | Direct connection, used by migrations |
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

All under `/api/v1`, bearer token required except register and health. List endpoints take `page` and `limit` (max 100). Full flows in [`FLOWS.md`](FLOWS.md); interactive docs at `/api/docs` in development.

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

## Assumptions and limitations

See [`DECISIONS.md`](DECISIONS.md#known-limitations). The short version: no database-backed tests, no quiz editing, no in-progress attempts, no password reset, and no deployment or demo video included.
