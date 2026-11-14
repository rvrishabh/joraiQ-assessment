export interface IApiSuccess<T> {
  success: true;
  data: T;
}

export interface IApiError {
  success: false;
  error: string | string[];
  statusCode: number;
}

export type AssignmentStatus = 'PENDING' | 'COMPLETED';
