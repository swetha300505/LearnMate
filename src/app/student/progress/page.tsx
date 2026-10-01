'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession, Attempt } from '@/lib/types';
import { db } from '@/lib/db';
import { calculateStudentProgress, ProgressSummary } from '@/lib/progress';
import { getStoredSession } from '@/lib/session';
import { ArrowLeft, Award, Flame, Target, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function StudentProgressPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    const curSession = getStoredSession();
    if (!curSession || curSession.role !== 'student' || !curSession.studentId) {
      router.push('/');
      return;
    }
    setSession(curSession);
    loadProgress(curSession.studentId);
  }, [router]);

  const loadProgress = async (studentId: string) => {
    const data = await calculateStudentProgress(studentId);
    setSummary(data);
    const attempts = await db.getStudentAttempts(studentId);
    setRecentAttempts(attempts.slice(-10).reverse());
  };

  if (!session || !summary) return null;

  return (
    <div className={`min-h-screen theme-grade-${session.grade}`} style={{ paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', marginBottom: '20px' }}>
          <button onClick={() => router.push('/student/dashboard')} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <span className={`badge badge-g${session.grade}`}>My Learning Stats</span>
        </header>

        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>
          {session.grade === 4 ? `Awesome Progress, ${session.studentName}! 🌟` : 'My Learning Progress & Accuracy'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Track your practice streaks, total questions answered, and subject accuracy.
        </p>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <Target size={32} style={{ color: 'var(--primary-600)', margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{summary.totalAttempts}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Questions Answered</div>
          </div>

          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <Award size={32} style={{ color: '#10B981', margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10B981' }}>{summary.accuracyPercentage}%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Accuracy Rate</div>
          </div>

          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <Flame size={32} style={{ color: '#F59E0B', margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#F59E0B' }}>{summary.streakDays} Days</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Practice Streak</div>
          </div>

          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <Clock size={32} style={{ color: '#8B5CF6', margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#8B5CF6' }}>
              {Math.round(summary.totalTimeSeconds / 60)} mins
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Time Spent</div>
          </div>
        </div>

        {/* Recent Attempts History */}
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>Recent Practice Activity</h2>
          {recentAttempts.length === 0 ? (
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No practice attempts yet! Start a quiz to see your progress here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentAttempts.map((att) => (
                <div key={att.id} className="glass-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {att.isCorrect ? <CheckCircle2 size={20} style={{ color: '#10B981' }} /> : <XCircle size={20} style={{ color: '#EF4444' }} />}
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>Answer: "{att.selectedAnswer}"</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(att.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: att.isCorrect ? '#10B981' : '#EF4444' }}>
                    {att.isCorrect ? `+${att.score} pts` : '0 pts'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
