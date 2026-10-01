# LearnMate 🎓

**LearnMate** is a CBSE kids education web application designed for family use, featuring single admin (parent) management, grade-customized learning modules (Grade 4, Grade 9, Grade 12), secure PIN login, progress tracking, question paper generation, and Supabase database integration with Row-Level Security (RLS).

---

## 🌟 Project Overview & Architecture

- **Single Admin (Parent)**: Controls student accounts, content approval, PIN resets, and grade management. No public sign-up.
- **Student Access**: PIN-based authentication. Students only view content assigned to their specific grade/stream.
- **Grade Modules**:
  - **Grade 4**: Playful, vibrant UI with interactive micro-learning activities.
  - **Grade 9**: Neutral, explanatory UI focused on core concept clarity.
  - **Grade 12**: Serious, board-exam oriented interface with deep practice, marking schemes, and exam strategies.
- **Zero Ongoing Cost**: Next.js (TypeScript) deployed on Vercel paired with Supabase (Free Tier). No AI calls at runtime in v1.
- **Security**: Server-side enforced access control (Supabase RLS & server checks), hashed PINs and passwords, HTTPS enforcement, and admin approval for student submissions.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/swetha300505/LearnMate.git
cd LearnMate

# Install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local` and update the placeholder keys:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📅 Development Progress Log

- [x] **Project Initialization**: Next.js (TypeScript, App Router) initialized.
- [x] **Git Repository Setup**: Remote `origin` linked to `https://github.com/swetha300505/LearnMate.git`, `.gitignore`, `.env.example`, and baseline commit created.
- [x] **Phase 1**: Shared Shell (Supabase schema, RLS policies, bcrypt hashing, PIN tile login, admin dashboard, grade-customized student dashboard, security unit tests).
- [x] **Phase 2**: Grade 4 Module End-to-End (Subject/chapter navigation, single question quiz engine, celebratory confetti & explanations, attempt logging, student progress stats).
- [x] **Phase 3**: Content Pipeline (Student uploads with pending status, admin review/approve/reject panel, grade/stream tag filtering, central repository vs my content).
- [ ] **Phase 4**: Grade Modules Implementation (Grade 4 Playful, Grade 9 Explanatory, Grade 12 Board Exam).
- [ ] **Phase 5**: Question Paper Generator & Progress Tracking.
- [ ] **Phase 6**: Final Polish, Security Audit & Vercel Deployment.
