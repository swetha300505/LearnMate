import { UserSession, GradeLevel, GradeStream } from './types';

const SESSION_KEY = 'learnmate_user_session';

/**
 * Returns the current active session from localStorage (or null).
 */
export function getStoredSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to parse session:', e);
    return null;
  }
}

/**
 * Saves active session state locally.
 */
export function setStoredSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Clears active session.
 */
export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Helper to log in a student.
 */
export function setStudentSession(student: { id: string; name: string; grade: GradeLevel; stream: GradeStream; avatarColor: string }): UserSession {
  const session: UserSession = {
    role: 'student',
    studentId: student.id,
    studentName: student.name,
    grade: student.grade,
    stream: student.stream,
    avatarColor: student.avatarColor,
  };
  setStoredSession(session);
  return session;
}

/**
 * Helper to log in an admin.
 */
export function setAdminSession(adminId: string = 'admin-001'): UserSession {
  const session: UserSession = {
    role: 'admin',
    adminId,
  };
  setStoredSession(session);
  return session;
}
