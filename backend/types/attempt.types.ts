export interface ISheetOption {
  id: string;
  text: string;
}

export interface ISheetQuestion {
  id: string;
  prompt: string;
  options: ISheetOption[];
}

/** What a student sees before submitting. Never carries the answer key. */
export interface IAttemptSheet {
  id: string;
  title: string;
  description: string;
  questions: ISheetQuestion[];
}

export interface ISubmitAnswer {
  questionId: string;
  optionId: string;
}

export interface ISubmitAttempt {
  answers: ISubmitAnswer[];
}

export interface IReviewItem {
  questionId: string;
  prompt: string;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  isCorrect: boolean;
  options: ISheetOption[];
}

export interface IAttemptResult {
  quizId: string;
  status: 'COMPLETED';
  submittedAt: Date;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  review: IReviewItem[];
}
