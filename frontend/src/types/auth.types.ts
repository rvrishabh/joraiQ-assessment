export type Role = "TEACHER" | "STUDENT";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}
