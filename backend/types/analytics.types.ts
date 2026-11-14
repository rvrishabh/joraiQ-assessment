export interface IStudentProgress {
  studentId: string;
  fullName: string;
  email: string;
  status: 'PENDING' | 'COMPLETED';
  correctCount: number | null;
  totalQuestions: number;
  accuracy: number | null;
  submittedAt: Date | null;
}

export interface IQuizAnalytics {
  quizId: string;
  title: string;
  questionCount: number;
  assignedCount: number;
  completedCount: number;
  averageAccuracy: number | null;
  students: IStudentProgress[];
}
