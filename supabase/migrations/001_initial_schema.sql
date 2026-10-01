-- LearnMate Initial Supabase Schema & Row-Level Security (RLS) Policies
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    grade INT NOT NULL CHECK (grade IN (4, 9, 12)),
    stream TEXT CHECK (stream IN ('Science', 'Commerce', 'Arts') OR stream IS NULL),
    pin_hash TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#4F46E5',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT grade_12_stream_check CHECK (
        (grade = 12 AND stream IS NOT NULL) OR (grade != 12)
    )
);

-- 3. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade INT NOT NULL CHECK (grade IN (4, 9, 12)),
    stream TEXT CHECK (stream IN ('Science', 'Commerce', 'Arts') OR stream IS NULL),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'BookOpen',
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONTENT ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('text', 'pdf', 'image', 'link', 'text_snippet')),
    file_url TEXT,
    text_content TEXT,
    grade INT NOT NULL CHECK (grade IN (4, 9, 12)),
    stream TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    created_by_student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    approval_status TEXT NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    grade INT NOT NULL CHECK (grade IN (4, 9, 12)),
    stream TEXT,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'short_answer', 'long_answer', 'true_false')),
    options JSONB, -- Array of string options for MCQ
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    marks INT NOT NULL DEFAULT 1,
    source TEXT NOT NULL DEFAULT 'central_repo' CHECK (source IN ('central_repo', 'student_upload')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score INT NOT NULL DEFAULT 0,
    max_score INT NOT NULL DEFAULT 1,
    time_taken_seconds INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BLUEPRINTS TABLE
CREATE TABLE IF NOT EXISTS public.blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    grade INT NOT NULL CHECK (grade IN (4, 9, 12)),
    stream TEXT,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('period_test_1', 'period_test_2', 'term_1', 'term_2', 'monthly', 'unit', 'custom')),
    duration_minutes INT NOT NULL DEFAULT 60,
    total_marks INT NOT NULL DEFAULT 50,
    question_structure JSONB NOT NULL, -- Section breakdown & difficulty weights
    created_by_admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GENERATED PAPERS TABLE
CREATE TABLE IF NOT EXISTS public.generated_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    blueprint_id UUID REFERENCES public.blueprints(id) ON DELETE SET NULL,
    grade INT NOT NULL CHECK (grade IN (4, 9, 12)),
    stream TEXT,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    questions_data JSONB NOT NULL,
    answer_key_data JSONB NOT NULL,
    generated_by_role TEXT NOT NULL CHECK (generated_by_role IN ('admin', 'student')),
    generated_by_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_papers ENABLE ROW LEVEL SECURITY;

-- ADMIN FULL ACCESS POLICY
CREATE POLICY "Admins have full access to everything"
ON public.students FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- STUDENT ACCESS POLICIES (Enforce grade & approval isolation)
CREATE POLICY "Students can view approved content for their grade/stream OR their own submissions"
ON public.content_items FOR SELECT
USING (
    (approval_status = 'approved' AND grade = (auth.jwt() ->> 'grade')::int)
    OR (created_by_student_id = (auth.jwt() ->> 'student_id')::uuid)
);

CREATE POLICY "Students can only submit content tagged with their student ID"
ON public.content_items FOR INSERT
WITH CHECK (
    created_by_student_id = (auth.jwt() ->> 'student_id')::uuid
    AND approval_status = 'pending'
);

CREATE POLICY "Students can only view questions for their grade and stream"
ON public.questions FOR SELECT
USING (
    grade = (auth.jwt() ->> 'grade')::int
    AND (stream IS NULL OR stream = auth.jwt() ->> 'stream')
);

CREATE POLICY "Students can view blueprints for their grade"
ON public.blueprints FOR SELECT
USING (
    grade = (auth.jwt() ->> 'grade')::int
    AND (stream IS NULL OR stream = auth.jwt() ->> 'stream')
);

CREATE POLICY "Students can only manage their own attempts"
ON public.attempts FOR ALL
USING (student_id = (auth.jwt() ->> 'student_id')::uuid);

CREATE POLICY "Students can view and create generated papers for themselves"
ON public.generated_papers FOR ALL
USING (
    generated_by_id = (auth.jwt() ->> 'student_id')::uuid
    OR auth.jwt() ->> 'role' = 'admin'
);
