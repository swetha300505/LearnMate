// LearnMate TypeScript Domain Types

export type GradeLevel = 4 | 9 | 12;
export type GradeStream = 'Science' | 'Commerce' | 'Arts' | null;

export type UserRole = 'admin' | 'student';

export interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  grade: GradeLevel;
  stream: GradeStream;
  pinHash?: string;
  avatarColor: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  grade: GradeLevel;
  stream: GradeStream;
  name: string;
  code: string;
  icon: string; // Lucide icon identifier
  color: string;
  chaptersCount?: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  chapterNumber: number;
  title: string;
  description: string;
}

export type ContentType = 'text' | 'pdf' | 'image' | 'link' | 'text_snippet';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ContentItem {
  id: string;
  title: string;
  contentType: ContentType;
  fileUrl?: string;
  textContent?: string;
  grade: GradeLevel;
  stream: GradeStream;
  subjectId?: string;
  chapterId?: string;
  createdByStudentId?: string;
  approvalStatus: ApprovalStatus;
  createdAt: string;
}

export type QuestionType = 'mcq' | 'short_answer' | 'long_answer' | 'true_false';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionSource = 'central_repo' | 'student_upload';

export interface Question {
  id: string;
  subjectId: string;
  chapterId?: string;
  grade: GradeLevel;
  stream: GradeStream;
  questionText: string;
  questionType: QuestionType;
  options?: string[]; // For MCQ
  correctAnswer: string;
  explanation?: string;
  difficulty: Difficulty;
  marks: number;
  source: QuestionSource;
  createdAt: string;
}

export interface Attempt {
  id: string;
  studentId: string;
  questionId: string;
  subjectId: string;
  chapterId?: string;
  selectedAnswer: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  timeTakenSeconds: number;
  createdAt: string;
}

export type ExamType = 'period_test_1' | 'period_test_2' | 'term_1' | 'term_2' | 'monthly' | 'unit' | 'custom';

export interface Blueprint {
  id: string;
  title: string;
  grade: GradeLevel;
  stream: GradeStream;
  subjectId: string;
  examType: ExamType;
  durationMinutes: number;
  totalMarks: number;
  questionStructure: {
    mcqCount: number;
    shortCount: number;
    longCount: number;
    easyPercent: number;
    mediumPercent: number;
    hardPercent: number;
  };
  createdByAdminId?: string;
  createdAt: string;
}

export interface GeneratedPaper {
  id: string;
  title: string;
  blueprintId?: string;
  grade: GradeLevel;
  stream: GradeStream;
  subjectId: string;
  questionsData: Question[];
  answerKeyData: { questionId: string; correctAnswer: string; explanation?: string }[];
  generatedByRole: UserRole;
  generatedById: string;
  createdAt: string;
}

export interface UserSession {
  role: UserRole;
  adminId?: string;
  studentId?: string;
  studentName?: string;
  grade?: GradeLevel;
  stream?: GradeStream;
  avatarColor?: string;
}
