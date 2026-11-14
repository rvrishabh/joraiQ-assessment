export interface IQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuizQuestion {
  id: string;
  prompt: string;
  options: IQuizOption[];
}

export interface IQuizSummary {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  questionCount: number;
  assignedCount: number;
  completedCount: number;
}

export interface IQuizDetail {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  assignedCount: number;
  questions: IQuizQuestion[];
}

export interface ICreateQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface ICreateQuiz {
  title: string;
  description?: string;
  questions: ICreateQuestion[];
}
