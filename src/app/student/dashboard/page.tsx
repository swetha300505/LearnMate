'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession, Subject } from '@/lib/types';
import { db } from '@/lib/db';
import { getStoredSession, clearStoredSession } from '@/lib/session';
import {
  BookOpen,
  Target,
  FileText,
  Upload,
  BarChart2,
  LogOut,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const currentSession = getStoredSession();
    if (!currentSession || currentSession.role !== 'student' || !currentSession.grade) {
      router.push('/');
      return;
    }
    setSession(currentSession);
    loadSubjects(currentSession);
  }, [router]);

  const loadSubjects = async (userSession: UserSession) => {
    if (userSession.grade) {
      const data = await db.getSubjects(userSession.grade, userSession.stream);
      setSubjects(data);
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    router.push('/');
  };

  if (!session || !session.grade) return null;

  const themeClass = `theme-grade-${session.grade}`;

  return (
    <div className={`min-h-screen ${themeClass}`} style={{ paddingBottom: '60px' }}>
      <div className="container">
        {/* Navigation & Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 32px 0', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: session.avatarColor || '#3B82F6',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: '800',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {session.studentName?.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
                {session.grade === 4 && `Awesome to see you, ${session.studentName}! 🌟`}
                {session.grade === 9 && `Welcome back, ${session.studentName}`}
                {session.grade === 12 && `CBSE Board Prep — ${session.studentName}`}
              </h1>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                <span className={`badge badge-g${session.grade}`}>Grade {session.grade}</span>
                {session.stream && (
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    • {session.stream} Stream
                  </span>
                )}
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
            <LogOut size={16} /> Switch Profile
          </button>
        </header>

        {/* Quick Action Tiles */}
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>What would you like to do?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <button
              onClick={() => router.push('/student/practice')}
              className="glass-card"
              style={{
                padding: '24px',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: '#FFFFFF',
              }}
            >
              <Target size={32} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Practice & Quizzes</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>Chapter-wise questions & auto-check</p>
            </button>

            <button
              onClick={() => router.push('/student/papers')}
              className="glass-card"
              style={{
                padding: '24px',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: '#FFFFFF',
              }}
            >
              <FileText size={32} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Question Papers</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>Generate printable test papers</p>
            </button>

            <button
              onClick={() => router.push('/student/content')}
              className="glass-card"
              style={{
                padding: '24px',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
              }}
            >
              <Upload size={32} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Upload Content</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>Share notes & practice sheets</p>
            </button>

            <button
              onClick={() => router.push('/student/progress')}
              className="glass-card"
              style={{
                padding: '24px',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
              }}
            >
              <BarChart2 size={32} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>My Progress</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>View accuracy, scores & streaks</p>
            </button>
          </div>
        </section>

        {/* Subjects List */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>My Subjects (Grade {session.grade})</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {subjects.map((subj) => (
              <div
                key={subj.id}
                onClick={() => router.push(`/student/practice?subjectId=${subj.id}`)}
                className="glass-card"
                style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: subj.color,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <BookOpen size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>{subj.name}</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    CBSE Code: {subj.code}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', color: subj.color, fontWeight: '700', fontSize: '0.9rem' }}>
                  <span>Start Practice</span>
                  <ArrowRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
