import { Role } from './auth.types';

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export type IStudent = Pick<IUser, 'id' | 'fullName' | 'email'>;

export interface IListStudentsQuery {
  search?: string;
  limit?: number;
}
