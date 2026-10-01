import bcrypt from 'bcryptjs';
import { GradeLevel, GradeStream, UserSession } from './types';

const SALT_ROUNDS = 10;

/**
 * Hashes a PIN or Password string securely using bcrypt.
 */
export async function hashSecret(secret: string): Promise<string> {
  if (!secret) throw new Error('Secret value required for hashing');
  return await bcrypt.hash(secret, SALT_ROUNDS);
}

/**
 * Compares a plain PIN/Password with a bcrypt hash.
 */
export async function compareSecret(secret: string, hash: string): Promise<boolean> {
  if (!secret || !hash) return false;
  return await bcrypt.compare(secret, hash);
}

/**
 * Server-side security check: Verifies if a student session is allowed to access
 * data for a specified target grade and stream.
 */
export function canAccessGradeContent(
  session: UserSession | null,
  targetGrade: GradeLevel,
  targetStream: GradeStream = null
): boolean {
  if (!session) return false;

  // Admin has access to all grades and streams
  if (session.role === 'admin') return true;

  // Student can only access content matching their exact assigned grade
  if (session.grade !== targetGrade) return false;

  // Grade 12 stream check
  if (targetGrade === 12 && targetStream) {
    return session.stream === targetStream;
  }

  return true;
}

/**
 * Validates PIN format: must be 4 to 6 numeric digits.
 */
export function isValidPinFormat(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}
