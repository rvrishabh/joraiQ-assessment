import { Injectable } from '@nestjs/common';
import { toPaging } from 'src/common/dto/pagination-query.dto';
import { AuthUser, IListStudentsQuery, IStudent, IUser } from 'types';
import { ProfilesRepository } from './repositories/profiles.repository';

@Injectable()
export class UsersService {
  constructor(private readonly profiles: ProfilesRepository) {}

  me(user: AuthUser): IUser {
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
  }

  listStudents(query: IListStudentsQuery): Promise<IStudent[]> {
    return this.profiles.listStudents(query.search?.trim() || undefined, toPaging(query, 100));
  }
}
