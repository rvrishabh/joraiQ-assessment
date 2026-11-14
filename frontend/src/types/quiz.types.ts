export type AssignmentStatus = "PENDING" | "COMPLETED";

export interface QuizSummary {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  questionCount: number;
  assignedCount: number;
  completedCount: number;
}

export interface QuizOptionFull {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizDetail {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  assignedCount: number;
  questions: Array<{ id: string; prompt: string; options: QuizOptionFull[] }>;
}

export interface Student {
  id: string;
  fullName: string;
  email: string;
}

export interface QuizAssignmentRow {
  assignmentId: string;
  studentId: string;
  fullName: string;
  email: string;
  assignedAt: string;
  status: AssignmentStatus;
  completedAt: string | null;
}

export interface AssignResult {
  assigned: number;
  alreadyAssigned: number;
}

export interface MyAssignment {
  assignmentId: string;
  quizId: string;
  title: string;
  description: string;
  teacherName: string;
  questionCount: number;
  assignedAt: string;
  status: AssignmentStatus;
  completedAt: string | null;
  correctCount: number | null;
  accuracy: number | null;
}

export interface AttemptSheet {
  id: string;
  title: string;
  description: string;
  questions: Array<{
    id: string;
    prompt: string;
    options: Array<{ id: string; text: string }>;
  }>;
}

export interface QuizResult {
  quizId: string;
  status: "COMPLETED";
  submittedAt: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  review: Array<{
    questionId: string;
    prompt: string;
    selectedOptionId: string | null;
    correctOptionId: string | null;
    isCorrect: boolean;
    options: Array<{ id: string; text: string }>;
  }>;
}

export interface QuizAnalytics {
  quizId: string;
  title: string;
  questionCount: number;
  assignedCount: number;
  completedCount: number;
  averageAccuracy: number | null;
  students: Array<{
    studentId: string;
    fullName: string;
    email: string;
    status: AssignmentStatus;
    correctCount: number | null;
    totalQuestions: number;
    accuracy: number | null;
    submittedAt: string | null;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  accuracy: number;
  correctCount: number;
  totalQuestions: number;
  isCurrentUser: boolean;
}

export interface Leaderboard {
  quizId: string;
  title: string;
  participants: number;
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
}
