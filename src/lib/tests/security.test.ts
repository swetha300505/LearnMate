import { canAccessGradeContent } from '../security';
import { UserSession } from '../types';

function runSecurityTests() {
  console.log('🔒 RUNNING LEARNMATE SECURITY & RLS ACCESS TESTS...\n');

  const g4Student: UserSession = {
    role: 'student',
    studentId: 'stud-g4-01',
    studentName: 'Aarav',
    grade: 4,
    stream: null,
  };

  const g12ScienceStudent: UserSession = {
    role: 'student',
    studentId: 'stud-g12-sci',
    studentName: 'Kabir',
    grade: 12,
    stream: 'Science',
  };

  const adminUser: UserSession = {
    role: 'admin',
    adminId: 'admin-001',
  };

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Grade 4 student attempting to access Grade 9 content
  assert(
    canAccessGradeContent(g4Student, 9) === false,
    'Grade 4 student MUST NOT be allowed access to Grade 9 content'
  );

  // TEST 2: Grade 4 student accessing Grade 4 content
  assert(
    canAccessGradeContent(g4Student, 4) === true,
    'Grade 4 student IS allowed access to Grade 4 content'
  );

  // TEST 3: Grade 12 Science student attempting to access Commerce stream content
  assert(
    canAccessGradeContent(g12ScienceStudent, 12, 'Commerce') === false,
    'Grade 12 Science student MUST NOT be allowed access to Commerce stream content'
  );

  // TEST 4: Grade 12 Science student accessing Science stream content
  assert(
    canAccessGradeContent(g12ScienceStudent, 12, 'Science') === true,
    'Grade 12 Science student IS allowed access to Science stream content'
  );

  // TEST 5: Admin accessing any grade and stream
  assert(
    canAccessGradeContent(adminUser, 12, 'Commerce') === true,
    'Parent Admin IS allowed access to all grades and streams'
  );

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runSecurityTests();
