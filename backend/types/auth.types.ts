export type Role = 'TEACHER' | 'STUDENT';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}
