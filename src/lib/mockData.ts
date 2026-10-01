import { Student, Subject, Chapter, Question, Blueprint, ContentItem, Admin } from './types';

// Hashed version of default passwords/PINs (pre-calculated with bcrypt salt 10):
// 'admin123' -> '$2a$10$wT8E7D1k2P5e3q9a8b7c6u.Y6Z7X8W9V0U1T2S3R4Q5P6O7N8M9L0' (we also compare in db fallback)
export const INITIAL_ADMIN: Admin = {
  id: 'admin-001',
  email: 'parent@learnmate.local',
  name: 'Parent Admin',
  createdAt: new Date().toISOString(),
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stud-g4-01',
    name: 'Aarav Sharma',
    grade: 4,
    stream: null,
    avatarColor: '#10B981', // Playful Emerald Green
    createdAt: new Date().toISOString(),
  },
  {
    id: 'stud-g9-01',
    name: 'Riya Patel',
    grade: 9,
    stream: null,
    avatarColor: '#8B5CF6', // Clean Purple
    createdAt: new Date().toISOString(),
  },
  {
    id: 'stud-g12-sci',
    name: 'Kabir Verma',
    grade: 12,
    stream: 'Science',
    avatarColor: '#3B82F6', // Serious Board Blue
    createdAt: new Date().toISOString(),
  },
  {
    id: 'stud-g12-com',
    name: 'Ananya Gupta',
    grade: 12,
    stream: 'Commerce',
    avatarColor: '#F59E0B', // Amber Gold
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // GRADE 4
  { id: 'subj-g4-math', grade: 4, stream: null, name: 'Mathematics Fun', code: 'MATH4', icon: 'Calculator', color: '#10B981' },
  { id: 'subj-g4-evs', grade: 4, stream: null, name: 'Environmental Studies (EVS)', code: 'EVS4', icon: 'TreePine', color: '#059669' },
  { id: 'subj-g4-eng', grade: 4, stream: null, name: 'English Grammar & Tales', code: 'ENG4', icon: 'BookOpen', color: '#3B82F6' },
  { id: 'subj-g4-hin', grade: 4, stream: null, name: 'Hindi Kahaniyan', code: 'HIN4', icon: 'Languages', color: '#F59E0B' },

  // GRADE 9
  { id: 'subj-g9-math', grade: 9, stream: null, name: 'Mathematics', code: 'MATH9', icon: 'Binary', color: '#6366F1' },
  { id: 'subj-g9-sci', grade: 9, stream: null, name: 'Science (Phy/Chem/Bio)', code: 'SCI9', icon: 'Atom', color: '#8B5CF6' },
  { id: 'subj-g9-sst', grade: 9, stream: null, name: 'Social Science', code: 'SST9', icon: 'Globe', color: '#EC4899' },
  { id: 'subj-g9-eng', grade: 9, stream: null, name: 'English Language & Lit', code: 'ENG9', icon: 'Feather', color: '#0EA5E9' },

  // GRADE 12 - SCIENCE
  { id: 'subj-g12-phy', grade: 12, stream: 'Science', name: 'Physics (CBSE Board)', code: 'PHY12', icon: 'Zap', color: '#2563EB' },
  { id: 'subj-g12-chem', grade: 12, stream: 'Science', name: 'Chemistry (CBSE Board)', code: 'CHEM12', icon: 'FlaskConical', color: '#7C3AED' },
  { id: 'subj-g12-math', grade: 12, stream: 'Science', name: 'Mathematics (Calculus & Vectors)', code: 'MATH12', icon: 'Variable', color: '#D97706' },

  // GRADE 12 - COMMERCE
  { id: 'subj-g12-acc', grade: 12, stream: 'Commerce', name: 'Accountancy', code: 'ACC12', icon: 'FileSpreadsheet', color: '#059669' },
  { id: 'subj-g12-bst', grade: 12, stream: 'Commerce', name: 'Business Studies', code: 'BST12', icon: 'Briefcase', color: '#DC2626' },
  { id: 'subj-g12-eco', grade: 12, stream: 'Commerce', name: 'Economics', code: 'ECO12', icon: 'TrendingUp', color: '#0284C7' },
];

export const INITIAL_CHAPTERS: Chapter[] = [
  // Grade 4 Math Chapters
  { id: 'chap-g4-m1', subjectId: 'subj-g4-math', chapterNumber: 1, title: 'Building with Bricks (Shapes & Patterns)', description: 'Fun with 3D shapes, bricks, and brick patterns' },
  { id: 'chap-g4-m2', subjectId: 'subj-g4-math', chapterNumber: 2, title: 'Long and Short (Measurement)', description: 'Centimeters, meters, kilometers and fun measuring' },
  { id: 'chap-g4-m3', subjectId: 'subj-g4-math', chapterNumber: 3, title: 'A Trip to Bhopal (Numbers & Addition)', description: 'Word problems on total count, money, and time' },

  // Grade 4 EVS Chapters
  { id: 'chap-g4-e1', subjectId: 'subj-g4-evs', chapterNumber: 1, title: 'Going to School (Transport & Bridges)', description: 'How children cross rivers, mountains, and bridges to reach school' },
  { id: 'chap-g4-e2', subjectId: 'subj-g4-evs', chapterNumber: 2, title: 'Ear to Ear (Animals & Birds)', description: 'Animal ears, skin patterns, and external features' },

  // Grade 9 Math Chapters
  { id: 'chap-g9-m1', subjectId: 'subj-g9-math', chapterNumber: 1, title: 'Number Systems', description: 'Irrational numbers, real numbers, and laws of exponents' },
  { id: 'chap-g9-m2', subjectId: 'subj-g9-math', chapterNumber: 2, title: 'Polynomials', description: 'Degree of polynomials, zeroes, factor theorem and algebraic identities' },
  { id: 'chap-g9-m3', subjectId: 'subj-g9-math', chapterNumber: 3, title: 'Coordinate Geometry', description: 'Cartesian plane, abscissa, ordinate, and plotting points' },

  // Grade 9 Science Chapters
  { id: 'chap-g9-s1', subjectId: 'subj-g9-sci', chapterNumber: 1, title: 'Matter in Our Surroundings', description: 'States of matter, evaporation, and particle characteristics' },
  { id: 'chap-g9-s2', subjectId: 'subj-g9-sci', chapterNumber: 2, title: 'The Fundamental Unit of Life (Cell)', description: 'Cell membrane, nucleus, organelles, and plant vs animal cells' },

  // Grade 12 Physics Chapters
  { id: 'chap-g12-p1', subjectId: 'subj-g12-phy', chapterNumber: 1, title: 'Electric Charges and Fields', description: "Coulomb's Law, Electric Field lines, Electric Dipole, and Gauss's Law" },
  { id: 'chap-g12-p2', subjectId: 'subj-g12-phy', chapterNumber: 2, title: 'Electrostatic Potential and Capacitance', description: 'Potential due to point charge, equipotential surfaces, capacitors and energy stored' },

  // Grade 12 Accountancy Chapters
  { id: 'chap-g12-a1', subjectId: 'subj-g12-acc', chapterNumber: 1, title: 'Accounting for Partnership Firms - Fundamentals', description: 'Profit & Loss Appropriation, Interest on Capital, Partner Drawings' },
];

export const INITIAL_QUESTIONS: Question[] = [
  // Grade 4 Math Questions
  {
    id: 'q-g4-m1',
    subjectId: 'subj-g4-math',
    chapterId: 'chap-g4-m1',
    grade: 4,
    stream: null,
    questionText: 'How many faces does a standard rectangular brick have?',
    questionType: 'mcq',
    options: ['4 faces', '6 faces', '8 faces', '12 faces'],
    correctAnswer: '6 faces',
    explanation: 'A 3D brick is a cuboid. It has 6 flat rectangular faces (top, bottom, front, back, left, right)!',
    difficulty: 'easy',
    marks: 1,
    source: 'central_repo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-g4-m2',
    subjectId: 'subj-g4-math',
    chapterId: 'chap-g4-m2',
    grade: 4,
    stream: null,
    questionText: 'If 1 meter = 100 centimeters, how many centimeters are there in 5 meters?',
    questionType: 'mcq',
    options: ['50 cm', '500 cm', '5000 cm', '5 cm'],
    correctAnswer: '500 cm',
    explanation: 'To convert meters to centimeters, multiply by 100: 5 × 100 = 500 cm!',
    difficulty: 'easy',
    marks: 1,
    source: 'central_repo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-g4-m3',
    subjectId: 'subj-g4-math',
    chapterId: 'chap-g4-m3',
    grade: 4,
    stream: null,
    questionText: 'A school bus carries 50 students. How many students can 3 buses carry in total?',
    questionType: 'short_answer',
    correctAnswer: '150',
    explanation: 'Multiply the number of students per bus by the number of buses: 50 × 3 = 150 students!',
    difficulty: 'medium',
    marks: 2,
    source: 'central_repo',
    createdAt: new Date().toISOString(),
  },

  // Grade 9 Math Questions
  {
    id: 'q-g9-m1',
    subjectId: 'subj-g9-math',
    chapterId: 'chap-g9-m1',
    grade: 9,
    stream: null,
    questionText: 'Which of the following numbers is an irrational number?',
    questionType: 'mcq',
    options: ['√4', '3/5', '√2', '0.333...'],
    correctAnswer: '√2',
    explanation: '√2 cannot be expressed as p/q where p, q are integers. Its decimal expansion is non-terminating and non-recurring.',
    difficulty: 'easy',
    marks: 1,
    source: 'central_repo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-g9-m2',
    subjectId: 'subj-g9-math',
    chapterId: 'chap-g9-m2',
    grade: 9,
    stream: null,
    questionText: 'Find the degree of the polynomial P(x) = 5x^3 - 4x^2 + 7x + 9.',
    questionType: 'mcq',
    options: ['1', '2', '3', '4'],
    correctAnswer: '3',
    explanation: 'The degree of a polynomial is the highest power of the variable x, which is 3.',
    difficulty: 'easy',
    marks: 1,
    source: 'central_repo',
    createdAt: new Date().toISOString(),
  },

  // Grade 12 Physics Questions
  {
    id: 'q-g12-p1',
    subjectId: 'subj-g12-phy',
    chapterId: 'chap-g12-p1',
    grade: 12,
    stream: 'Science',
    questionText: 'What is the SI unit of Electric Flux (Φ)?',
    questionType: 'mcq',
    options: ['N/C', 'N·m²/C', 'C/m²', 'Volt/m²'],
    correctAnswer: 'N·m²/C',
    explanation: 'Electric Flux Φ = E · A = (Newton/Coulomb) × (meter²) = N·m²/C (or Volt·meter).',
    difficulty: 'medium',
    marks: 1,
    source: 'central_repo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-g12-p2',
    subjectId: 'subj-g12-phy',
    chapterId: 'chap-g12-p1',
    grade: 12,
    stream: 'Science',
    questionText: "State Gauss's Law in electrostatics and write its mathematical formula for a closed surface.",
    questionType: 'short_answer',
    correctAnswer: 'Total electric flux through a closed surface equals 1/ε₀ times the total charge enclosed Q_enclosed.',
    explanation: "Gauss's Law formula: ∮ E · dA = Q_enclosed / ε₀. It relates the net electric flux to net enclosed charge.",
    difficulty: 'hard',
    marks: 3,
    source: 'central_repo',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_BLUEPRINTS: Blueprint[] = [
  {
    id: 'bp-g4-m1',
    title: 'Grade 4 Math - Monthly Unit Test 1',
    grade: 4,
    stream: null,
    subjectId: 'subj-g4-math',
    examType: 'unit',
    durationMinutes: 45,
    totalMarks: 20,
    questionStructure: {
      mcqCount: 5,
      shortCount: 5,
      longCount: 1,
      easyPercent: 60,
      mediumPercent: 30,
      hardPercent: 10,
    },
    createdByAdminId: 'admin-001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bp-g9-m1',
    title: 'Grade 9 Mathematics - Term 1 Practice Exam',
    grade: 9,
    stream: null,
    subjectId: 'subj-g9-math',
    examType: 'term_1',
    durationMinutes: 90,
    totalMarks: 50,
    questionStructure: {
      mcqCount: 10,
      shortCount: 8,
      longCount: 4,
      easyPercent: 40,
      mediumPercent: 40,
      hardPercent: 20,
    },
    createdByAdminId: 'admin-001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bp-g12-p1',
    title: 'Grade 12 Physics CBSE Board Mock Test',
    grade: 12,
    stream: 'Science',
    subjectId: 'subj-g12-phy',
    examType: 'term_2',
    durationMinutes: 180,
    totalMarks: 70,
    questionStructure: {
      mcqCount: 16,
      shortCount: 10,
      longCount: 5,
      easyPercent: 30,
      mediumPercent: 50,
      hardPercent: 20,
    },
    createdByAdminId: 'admin-001',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'cont-01',
    title: 'Fun Shapes & Symmetry Worksheet',
    contentType: 'text_snippet',
    textContent: 'Draw lines of symmetry for a square, rectangle, triangle, and circle. Note that a circle has infinitely many lines of symmetry!',
    grade: 4,
    stream: null,
    subjectId: 'subj-g4-math',
    chapterId: 'chap-g4-m1',
    approvalStatus: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cont-02',
    title: 'Handwritten Formulae Sheet - Electric Charges',
    contentType: 'text_snippet',
    textContent: "Coulomb's Law: F = k*q1*q2/r^2. Electric Field E = F/q. Dipole Moment p = q * 2a.",
    grade: 12,
    stream: 'Science',
    subjectId: 'subj-g12-phy',
    chapterId: 'chap-g12-p1',
    createdByStudentId: 'stud-g12-sci',
    approvalStatus: 'pending', // Pending admin approval
    createdAt: new Date().toISOString(),
  },
];
