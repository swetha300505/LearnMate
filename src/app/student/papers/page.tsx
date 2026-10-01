'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserSession, Subject, Chapter, Blueprint, Question, GeneratedPaper } from '@/lib/types';
import { db } from '@/lib/db';
import { getStoredSession } from '@/lib/session';
import {
  ArrowLeft,
  FileText,
  Printer,
  Key,
  Play,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Plus,
  Clock,
  Award,
} from 'lucide-react';

function PapersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [session, setSession] = useState<UserSession | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [papers, setPapers] = useState<GeneratedPaper[]>([]);

  // Generator form
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [paperTitle, setPaperTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Print / View modal state
  const [activePaper, setActivePaper] = useState<GeneratedPaper | null>(null);
  const [viewMode, setViewMode] = useState<'paper' | 'answer_key' | 'interactive' | null>(null);

  // Interactive Test State
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [testScore, setTestScore] = useState<number>(0);

  useEffect(() => {
    const curSession = getStoredSession();
    if (!curSession || curSession.role !== 'student' || !curSession.grade) {
      router.push('/');
      return;
    }
    setSession(curSession);
    loadData(curSession);
  }, [router]);

  const loadData = async (userSession: UserSession) => {
    if (userSession.grade) {
      const subjs = await db.getSubjects(userSession.grade, userSession.stream);
      setSubjects(subjs);
      if (subjs.length > 0) setSelectedSubjectId(subjs[0].id);

      const bps = await db.getBlueprints(userSession.grade, userSession.stream);
      setBlueprints(bps);
      if (bps.length > 0) setSelectedBlueprintId(bps[0].id);

      const generated = await db.getGeneratedPapers(userSession.studentId);
      setPapers(generated);
    }
  };

  const handleGeneratePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    setIsGenerating(true);
    try {
      const questions = await db.getQuestions(session!.grade!, session!.stream, selectedSubjectId);

      const chosenBlueprint = blueprints.find((b) => b.id === selectedBlueprintId);
      const subject = subjects.find((s) => s.id === selectedSubjectId);

      const title = paperTitle.trim() || `${subject?.name || 'Subject'} - ${chosenBlueprint?.title || 'Practice Test'}`;

      const answerKeyData = questions.map((q) => ({
        questionId: q.id,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));

      const newPaper = await db.saveGeneratedPaper({
        title,
        blueprintId: selectedBlueprintId || undefined,
        grade: session!.grade!,
        stream: session!.stream || null,
        subjectId: selectedSubjectId,
        questionsData: questions,
        answerKeyData,
        generatedByRole: 'student',
        generatedById: session!.studentId!,
      });

      setPaperTitle('');
      loadData(session!);
      setActivePaper(newPaper);
      setViewMode('paper');
    } catch (err) {
      alert('Failed to generate paper. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStartInteractiveTest = (paper: GeneratedPaper) => {
    setActivePaper(paper);
    setViewMode('interactive');
    setUserAnswers({});
    setTestSubmitted(false);
    setTestScore(0);
  };

  const handleInteractiveSubmit = async () => {
    if (!activePaper) return;
    let score = 0;
    let maxTotal = 0;

    activePaper.questionsData.forEach((q) => {
      maxTotal += q.marks;
      const given = (userAnswers[q.id] || '').trim().toLowerCase();
      const expected = q.correctAnswer.trim().toLowerCase();
      if (given === expected) {
        score += q.marks;
      }

      // Log attempt for progress
      db.logAttempt({
        studentId: session!.studentId!,
        questionId: q.id,
        subjectId: q.subjectId,
        chapterId: q.chapterId,
        selectedAnswer: userAnswers[q.id] || '(No Answer)',
        isCorrect: given === expected,
        score: given === expected ? q.marks : 0,
        maxScore: q.marks,
        timeTakenSeconds: 30,
      });
    });

    setTestScore(score);
    setTestSubmitted(true);
  };

  if (!session) return null;

  return (
    <div className={`min-h-screen theme-grade-${session.grade}`} style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', marginBottom: '20px' }}>
          <button onClick={() => router.push('/student/dashboard')} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <span className={`badge badge-g${session.grade}`}>Question Paper Generator</span>
        </header>

        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>
          Generate CBSE Question Papers 📄
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Create printable exam papers or take interactive practice tests using CBSE blueprints.
        </p>

        {/* Generator Card */}
        <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>Create New Paper</h2>
          <form onSubmit={handleGeneratePaper} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Exam Pattern Blueprint</label>
              <select
                value={selectedBlueprintId}
                onChange={(e) => setSelectedBlueprintId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              >
                {blueprints.map((bp) => (
                  <option key={bp.id} value={bp.id}>{bp.title} ({bp.totalMarks} Marks)</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Paper Custom Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Unit Test 1 Practice"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" disabled={isGenerating} className="btn btn-primary" style={{ width: '100%', height: '42px' }}>
                <Plus size={18} /> {isGenerating ? 'Generating...' : 'Generate Paper'}
              </button>
            </div>
          </form>
        </div>

        {/* Papers History */}
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>Generated Papers History</h2>
          {papers.length === 0 ? (
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No question papers generated yet. Select a subject above and tap Generate Paper!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {papers.map((p) => (
                <div key={p.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{p.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {p.questionsData.length} Questions • Grade {p.grade} {p.stream ? `(${p.stream})` : ''} • {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setActivePaper(p);
                        setViewMode('paper');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      <Printer size={14} /> View / Print Paper
                    </button>

                    <button
                      onClick={() => {
                        setActivePaper(p);
                        setViewMode('answer_key');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      <Key size={14} /> Answer Key
                    </button>

                    <button
                      onClick={() => handleStartInteractiveTest(p)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      <Play size={14} /> Interactive Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* VIEW / PRINT MODAL */}
        {activePaper && viewMode && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000 }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', background: '#FFFFFF', color: '#000000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #E2E8F0', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
                  {viewMode === 'paper' && `📄 ${activePaper.title}`}
                  {viewMode === 'answer_key' && `🔑 Answer Key - ${activePaper.title}`}
                  {viewMode === 'interactive' && `✏️ Interactive Test - ${activePaper.title}`}
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {viewMode !== 'interactive' && (
                    <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                      <Printer size={14} /> Print
                    </button>
                  )}
                  <button onClick={() => { setActivePaper(null); setViewMode(null); }} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                    Close
                  </button>
                </div>
              </div>

              {/* PRINTABLE QUESTION PAPER VIEW */}
              {viewMode === 'paper' && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px dashed #CBD5E1', paddingBottom: '16px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>LEARNMATE CBSE QUESTION PAPER</h1>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.9rem', fontWeight: '700' }}>
                      <span>Student: {session.studentName}</span>
                      <span>Grade: {activePaper.grade} {activePaper.stream ? `(${activePaper.stream})` : ''}</span>
                      <span>Max Marks: {activePaper.questionsData.reduce((acc, q) => acc + q.marks, 0)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {activePaper.questionsData.map((q, idx) => (
                      <div key={q.id} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                        <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '6px' }}>
                          Q{idx + 1}. {q.questionText} <span style={{ float: 'right', fontSize: '0.85rem', color: '#64748B' }}>[{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]</span>
                        </div>
                        {q.options && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', paddingLeft: '16px' }}>
                            {q.options.map((opt, i) => (
                              <div key={i} style={{ fontSize: '0.9rem' }}>
                                ({String.fromCharCode(65 + i)}) {opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ANSWER KEY VIEW */}
              {viewMode === 'answer_key' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activePaper.answerKeyData.map((ak, idx) => {
                      const q = activePaper.questionsData.find((item) => item.id === ak.questionId);
                      return (
                        <div key={ak.questionId} style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
                          <div style={{ fontWeight: '700' }}>Q{idx + 1}: {q?.questionText}</div>
                          <div style={{ color: '#059669', fontWeight: '800', marginTop: '4px' }}>
                            Correct Answer: {ak.correctAnswer}
                          </div>
                          {ak.explanation && (
                            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                              Explanation: {ak.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* INTERACTIVE TEST VIEW */}
              {viewMode === 'interactive' && (
                <div>
                  {!testSubmitted ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {activePaper.questionsData.map((q, idx) => (
                        <div key={q.id} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                          <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '10px' }}>
                            Q{idx + 1}. {q.questionText} ({q.marks} {q.marks === 1 ? 'Mark' : 'Marks'})
                          </div>

                          {q.options ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {q.options.map((opt, oIdx) => (
                                <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                                  <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    value={opt}
                                    checked={userAnswers[q.id] === opt}
                                    onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          ) : (
                            <input
                              type="text"
                              placeholder="Type your answer..."
                              value={userAnswers[q.id] || ''}
                              onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                            />
                          )}
                        </div>
                      ))}

                      <button onClick={handleInteractiveSubmit} className="btn btn-primary" style={{ padding: '14px', fontSize: '1.05rem', marginTop: '12px' }}>
                        Submit Test & Auto-Grade 🏆
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                      <Award size={48} style={{ color: '#10B981', margin: '0 auto 12px auto' }} />
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Test Submitted!</h2>
                      <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10B981', margin: '8px 0 20px 0' }}>
                        Your Score: {testScore} / {activePaper.questionsData.reduce((acc, q) => acc + q.marks, 0)}
                      </p>
                      <button onClick={() => { setActivePaper(null); setViewMode(null); }} className="btn btn-primary">
                        Return to Papers List
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentPapersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Question Paper Engine...</div>}>
      <PapersContent />
    </Suspense>
  );
}
