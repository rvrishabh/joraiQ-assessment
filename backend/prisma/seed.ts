import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const PASSWORD = 'Demo@12345';

const USERS: Array<{ email: string; fullName: string; role: UserRole }> = [
  { email: 'teacher@joraiq.test', fullName: 'Meera Iyer', role: 'TEACHER' },
  { email: 'aarav@joraiq.test', fullName: 'Aarav Mehta', role: 'STUDENT' },
  { email: 'diya@joraiq.test', fullName: 'Diya Kapoor', role: 'STUDENT' },
  { email: 'kabir@joraiq.test', fullName: 'Kabir Nair', role: 'STUDENT' },
  { email: 'sana@joraiq.test', fullName: 'Sana Qureshi', role: 'STUDENT' },
];

async function ensureAuthUser(email: string, fullName: string, role: UserRole) {
  const created = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: { full_name: fullName },
  });
  if (created.data.user) return created.data.user.id;

  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const existing = data.users.find((u) => u.email === email);
  if (!existing) throw created.error ?? new Error(`Cannot create ${email}`);
  return existing.id;
}

async function main() {
  const ids: Record<string, string> = {};
  for (const u of USERS) {
    const id = await ensureAuthUser(u.email, u.fullName, u.role);
    ids[u.email] = id;
    await prisma.profile.upsert({
      where: { id },
      update: { fullName: u.fullName, role: u.role },
      create: { id, email: u.email, fullName: u.fullName, role: u.role },
    });
  }

  const teacherId = ids['teacher@joraiq.test'];
  const existing = await prisma.quiz.findFirst({
    where: { teacherId, title: 'World Capitals - Warm up' },
  });
  if (!existing) {
    const questions = [
      ['Capital of France?', ['Paris', 'Lyon', 'Nice', 'Lille'], 0],
      ['Capital of Japan?', ['Osaka', 'Kyoto', 'Tokyo', 'Nagoya'], 2],
      ['Capital of Brazil?', ['Rio de Janeiro', 'Brasilia', 'Sao Paulo', 'Salvador'], 1],
      ['Capital of Canada?', ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'], 3],
    ] as const;
    await prisma.quiz.create({
      data: {
        teacherId,
        title: 'World Capitals - Warm up',
        description: 'Four quick questions to get started.',
        questions: {
          create: questions.map(([prompt, options, correct], qi) => ({
            prompt,
            position: qi,
            options: {
              create: options.map((text, oi) => ({
                text,
                position: oi,
                isCorrect: oi === correct,
              })),
            },
          })),
        },
      },
    });
  }

  console.log(`Seeded ${USERS.length} users. Password for all: ${PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
