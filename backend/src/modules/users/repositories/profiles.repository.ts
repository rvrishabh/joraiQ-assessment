import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export const PROFILE_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  createdAt: true,
} satisfies Prisma.ProfileSelect;

@Injectable()
export class ProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.profile.findUnique({
      where: { id },
      select: PROFILE_SELECT,
    });
  }

  create(data: { id: string; email: string; fullName: string; role: UserRole }) {
    return this.prisma.profile.create({ data, select: PROFILE_SELECT });
  }

  listStudents(search: string | undefined, paging: { skip: number; take: number }) {
    return this.prisma.profile.findMany({
      where: {
        role: UserRole.STUDENT,
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: { id: true, fullName: true, email: true },
      orderBy: [{ fullName: 'asc' }, { id: 'asc' }],
      ...paging,
    });
  }

  findStudentsByIds(ids: string[]) {
    return this.prisma.profile.findMany({
      where: { id: { in: ids }, role: UserRole.STUDENT },
      select: { id: true },
    });
  }
}
