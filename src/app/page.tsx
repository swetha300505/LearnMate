'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Student } from '@/lib/types';
import { db } from '@/lib/db';
import { setStudentSession } from '@/lib/session';
import { Lock, Delete, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

export default function StudentLoginPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadStudents() {
      const data = await db.getStudents();
      setStudents(data);
    }
    loadStudents();
  }, []);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setPin('');
    setErrorMessage('');
  };

  const handleKeyClick = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMessage('');

      // Auto-submit when 4 digits are entered
      if (newPin.length === 4) {
        verifyPinAndLogin(selectedStudent!, newPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMessage('');
    }
  };

  const verifyPinAndLogin = async (student: Student, pinToVerify: string) => {
    setLoading(true);
    try {
      const isValid = await db.verifyStudentPin(student.id, pinToVerify);
      if (isValid) {
        setStudentSession(student);
        router.push('/student/dashboard');
      } else {
        setErrorMessage('Oops, try that PIN again! 🌟');
        setPin('');
      }
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 16px' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#DBEAFE', color: '#1E40AF', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '700', marginBottom: '12px' }}>
          <Sparkles size={16} /> CBSE Smart Learning
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Welcome to LearnMate 🎓
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
          Tap your name tile to enter your learning world!
        </p>
      </header>

      {/* Student Cards Grid */}
      <main style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => handleSelectStudent(student)}
              className="glass-card"
              style={{
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                border: '3px solid transparent',
                background: 'var(--bg-surface)',
                outline: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: student.avatarColor,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: '800',
                  margin: '0 auto 16px auto',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }}
              >
                {student.name.charAt(0)}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {student.name}
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                <span className={`badge badge-g${student.grade}`}>
                  Grade {student.grade}
                </span>
                {student.stream && (
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#4B5563', background: '#F3F4F6', padding: '2px 8px', borderRadius: '12px' }}>
                    {student.stream}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Footer / Admin Link */}
      <footer style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={() => router.push('/admin/login')}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', padding: '8px 16px' }}
        >
          <ShieldCheck size={16} /> Parent / Admin Login
        </button>
      </footer>

      {/* PIN Entry Keypad Modal */}
      {selectedStudent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000,
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '380px',
              padding: '32px 24px',
              textAlign: 'center',
              position: 'relative',
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            <button
              onClick={() => setSelectedStudent(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              ✕
            </button>

            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: selectedStudent.avatarColor,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: '800',
                margin: '0 auto 12px auto',
              }}
            >
              {selectedStudent.name.charAt(0)}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>
              Hi, {selectedStudent.name}! 👋
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Enter your secret 4-digit PIN
            </p>

            {/* PIN Dots */}
            <div className="pin-dots">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className={`pin-dot ${pin.length > idx ? 'filled' : ''}`} />
              ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <p style={{ color: '#EF4444', fontWeight: '600', fontSize: '0.875rem', marginBottom: '12px' }}>
                {errorMessage}
              </p>
            )}

            {/* Keypad */}
            <div className="keypad-grid">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button key={num} onClick={() => handleKeyClick(num)} className="keypad-btn">
                  {num}
                </button>
              ))}
              <div />
              <button onClick={() => handleKeyClick('0')} className="keypad-btn">
                0
              </button>
              <button onClick={handleDelete} className="keypad-btn" style={{ color: '#EF4444' }}>
                <Delete size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
