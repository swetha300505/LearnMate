import {
  INITIAL_ADMIN,
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_CHAPTERS,
  INITIAL_QUESTIONS,
  INITIAL_BLUEPRINTS,
  INITIAL_CONTENT_ITEMS,
} from './mockData';
import {
  Student,
  Subject,
  Chapter,
  Question,
  Blueprint,
  ContentItem,
  Attempt,
  GeneratedPaper,
  GradeLevel,
  GradeStream,
  ApprovalStatus,
} from './types';
import { hashSecret, compareSecret } from './security';

// In-Memory state fallback for zero-cost, instant out-of-the-box local execution
let localStudents: Student[] = [...INITIAL_STUDENTS];
let localSubjects: Subject[] = [...INITIAL_SUBJECTS];
let localChapters: Chapter[] = [...INITIAL_CHAPTERS];
let localQuestions: Question[] = [...INITIAL_QUESTIONS];
let localBlueprints: Blueprint[] = [...INITIAL_BLUEPRINTS];
let localContentItems: ContentItem[] = [...INITIAL_CONTENT_ITEMS];
let localAttempts: Attempt[] = [];
let localGeneratedPapers: GeneratedPaper[] = [];

// Pre-store default PINs mapping for initial students:
// Aarav (g4): '1234'
// Riya (g9): '5678'
// Kabir (g12): '9999'
// Ananya (g12): '4321'
const pinStore: Record<string, string> = {
  'stud-g4-01': '1234',
  'stud-g9-01': '5678',
  'stud-g12-sci': '9999',
  'stud-g12-com': '4321',
};

const adminPasswordStore: Record<string, string> = {
  'parent@learnmate.local': 'admin123',
};

export const db = {
  // ----------------------------------------------------
  // ADMIN AUTH & STUDENTS
  // ----------------------------------------------------
  async verifyAdminPassword(email: string, passwordInput: string): Promise<boolean> {
    if (email.toLowerCase() === INITIAL_ADMIN.email.toLowerCase()) {
      const storedPass = adminPasswordStore[INITIAL_ADMIN.email.toLowerCase()];
      return passwordInput === storedPass || passwordInput === 'admin123';
    }
    return false;
  },

  async getStudents(): Promise<Student[]> {
    return [...localStudents];
  },

  async getStudentById(id: string): Promise<Student | null> {
    return localStudents.find((s) => s.id === id) || null;
  },

  async verifyStudentPin(studentId: string, pinInput: string): Promise<boolean> {
    const storedPin = pinStore[studentId];
    if (storedPin) {
      return storedPin === pinInput;
    }
    // Default PIN fallback if not explicitly updated
    return pinInput === '1234' || pinInput === '0000';
  },

  async addStudent(data: { name: string; grade: GradeLevel; stream: GradeStream; pin: string; avatarColor?: string }): Promise<Student> {
    const newId = `stud-${Date.now()}`;
    const newStudent: Student = {
      id: newId,
      name: data.name,
      grade: data.grade,
      stream: data.grade === 12 ? data.stream : null,
      avatarColor: data.avatarColor || '#3B82F6',
      createdAt: new Date().toISOString(),
    };
    pinStore[newId] = data.pin;
    localStudents.push(newStudent);
    return newStudent;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
    const index = localStudents.findIndex((s) => s.id === id);
    if (index === -1) return null;
    localStudents[index] = { ...localStudents[index], ...updates };
    return localStudents[index];
  },

  async resetStudentPin(studentId: string, newPin: string): Promise<boolean> {
    const student = localStudents.find((s) => s.id === studentId);
    if (!student) return false;
    pinStore[studentId] = newPin;
    return true;
  },

  async deleteStudent(studentId: string): Promise<boolean> {
    localStudents = localStudents.filter((s) => s.id !== studentId);
    delete pinStore[studentId];
    return true;
  },

  // ----------------------------------------------------
  // SUBJECTS & CHAPTERS
  // ----------------------------------------------------
  async getSubjects(grade?: GradeLevel | null, stream?: GradeStream): Promise<Subject[]> {
    if (!grade) return [];
    return localSubjects.filter((s) => {
      if (s.grade !== grade) return false;
      if (grade === 12 && stream) {
        return s.stream === stream || s.stream === null;
      }
      return true;
    });
  },

  async getChapters(subjectId: string): Promise<Chapter[]> {
    if (!subjectId) return [];
    return localChapters.filter((c) => c.subjectId === subjectId);
  },

  // ----------------------------------------------------
  // QUESTIONS & PRACTICE
  // ----------------------------------------------------
  async getQuestions(grade?: GradeLevel | null, stream?: GradeStream, subjectId?: string, chapterId?: string): Promise<Question[]> {
    if (!grade) return [];
    return localQuestions.filter((q) => {
      if (q.grade !== grade) return false;
      if (grade === 12 && stream && q.stream && q.stream !== stream) return false;
      if (subjectId && q.subjectId !== subjectId) return false;
      if (chapterId && q.chapterId !== chapterId) return false;
      return true;
    });
  },

  async addQuestion(questionData: Omit<Question, 'id' | 'createdAt'>): Promise<Question> {
    const newQuestion: Question = {
      ...questionData,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localQuestions.push(newQuestion);
    return newQuestion;
  },

  // ----------------------------------------------------
  // PROGRESS & ATTEMPTS
  // ----------------------------------------------------
  async logAttempt(attemptData: Omit<Attempt, 'id' | 'createdAt'>): Promise<Attempt> {
    const newAttempt: Attempt = {
      ...attemptData,
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localAttempts.push(newAttempt);
    return newAttempt;
  },

  async getStudentAttempts(studentId: string): Promise<Attempt[]> {
    return localAttempts.filter((a) => a.studentId === studentId);
  },

  // ----------------------------------------------------
  // CONTENT ITEMS & APPROVALS
  // ----------------------------------------------------
  async getContentItems(grade?: GradeLevel | null, stream?: GradeStream, studentId?: string): Promise<ContentItem[]> {
    if (!grade) return [];
    return localContentItems.filter((item) => {
      if (item.grade !== grade) return false;
      if (grade === 12 && stream && item.stream && item.stream !== stream) return false;
      // Show approved content to all matching students, plus pending submissions created by this specific student
      if (item.approvalStatus === 'approved') return true;
      if (studentId && item.createdByStudentId === studentId) return true;
      return false;
    });
  },

  async getAllContentItemsForAdmin(): Promise<ContentItem[]> {
    return [...localContentItems];
  },

  async addContentItem(itemData: Omit<ContentItem, 'id' | 'createdAt'>): Promise<ContentItem> {
    const newItem: ContentItem = {
      ...itemData,
      id: `cont-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localContentItems.push(newItem);
    return newItem;
  },

  async updateContentStatus(id: string, status: ApprovalStatus): Promise<ContentItem | null> {
    const item = localContentItems.find((i) => i.id === id);
    if (!item) return null;
    item.approvalStatus = status;
    return item;
  },

  // ----------------------------------------------------
  // BLUEPRINTS & GENERATED PAPERS
  // ----------------------------------------------------
  async getBlueprints(grade?: GradeLevel | null, stream?: GradeStream): Promise<Blueprint[]> {
    if (!grade) return [];
    return localBlueprints.filter((bp) => {
      if (bp.grade !== grade) return false;
      if (grade === 12 && stream && bp.stream && bp.stream !== stream) return false;
      return true;
    });
  },

  async getAllBlueprints(): Promise<Blueprint[]> {
    return [...localBlueprints];
  },

  async addBlueprint(blueprintData: Omit<Blueprint, 'id' | 'createdAt'>): Promise<Blueprint> {
    const newBp: Blueprint = {
      ...blueprintData,
      id: `bp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localBlueprints.push(newBp);
    return newBp;
  },

  async saveGeneratedPaper(paperData: Omit<GeneratedPaper, 'id' | 'createdAt'>): Promise<GeneratedPaper> {
    const newPaper: GeneratedPaper = {
      ...paperData,
      id: `paper-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localGeneratedPapers.push(newPaper);
    return newPaper;
  },

  async getGeneratedPapers(studentId?: string): Promise<GeneratedPaper[]> {
    if (!studentId) return [...localGeneratedPapers];
    return localGeneratedPapers.filter((p) => p.generatedById === studentId);
  },
};
