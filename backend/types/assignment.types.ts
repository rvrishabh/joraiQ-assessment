import { AssignmentStatus } from './base.types';

export interface IAssignQuiz {
  studentIds: string[];
}

export interface IAssignResult {
  assigned: number;
  alreadyAssigned: number;
}

export interface IQuizAssignmentRow {
  assignmentId: string;
  studentId: string;
  fullName: string;
  email: string;
  assignedAt: Date;
  status: AssignmentStatus;
  completedAt: Date | null;
}

export interface IMyAssignment {
  assignmentId: string;
  quizId: string;
  title: string;
  description: string;
  teacherName: string;
  questionCount: number;
  assignedAt: Date;
  status: AssignmentStatus;
  completedAt: Date | null;
  correctCount: number | null;
  accuracy: number | null;
}
