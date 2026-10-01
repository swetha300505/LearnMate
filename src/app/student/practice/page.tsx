'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { UserSession, Subject, Chapter, Question, Attempt } from '@/lib/types';
import { db } from '@/lib/db';
import { getStoredSession } from '@/lib/session';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Clock,
  Award,
  ChevronRight,
} from 'lucide-react';

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId');

  const [session, setSession] = useState<UserSession | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Selection states
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Quiz execution states
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [attemptHistory, setAttemptHistory] = useState<{ question: Question; answer: string; correct: boolean }[]>([]);

  useEffect(() => {
    const curSession = getStoredSession();
    if (!curSession || curSession.role !== 'student' || !curSession.grade) {
      router.push('/');
      return;
    }
    setSession(curSession);
    loadSubjects(curSession);
  }, [router]);

  const loadSubjects = async (userSession: UserSession) => {
    if (userSession.grade) {
      const subjs = await db.getSubjects(userSession.grade, userSession.stream);
      setSubjects(subjs);

      if (initialSubjectId) {
        const found = subjs.find((s) => s.id === initialSubjectId);
        if (found) handleSelectSubject(found, userSession);
      }
    }
  };

  const handleSelectSubject = async (subject: Subject, explicitSession?: UserSession) => {
    const curSession = explicitSession || session || getStoredSession();
    if (!curSession || !curSession.grade) return;

    setSelectedSubject(subject);
    setSelectedChapter(null);
    setQuizStarted(false);

    const chaps = await db.getChapters(subject.id);
    setChapters(chaps);

    const qList = await db.getQuestions(curSession.grade, curSession.stream, subject.id);
    setQuestions(qList);
  };

  const handleSelectChapter = async (chapter: Chapter | null) => {
    const curSession = session || getStoredSession();
    if (!curSession || !curSession.grade || !selectedSubject) return;

    setSelectedChapter(chapter);
    const qList = await db.getQuestions(
      curSession.grade,
      curSession.stream,
      selectedSubject.id,
      chapter ? chapter.id : undefined
    );
    setQuestions(qList);
  };

  const startQuiz = () => {
    if (questions.length === 0) return;
    setCurrentIndex(0);
    setScore(0);
    setQuizStarted(true);
    setQuizFinished(false);
    setIsSubmitted(false);
    setUserAnswer('');
    setAttemptHistory([]);
    setStartTime(Date.now());
  };

  const currentQuestion = questions[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || isSubmitted) return;

    const timeTaken = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const correct = userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    setIsSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + currentQuestion.marks);
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }

    await db.logAttempt({
      studentId: session!.studentId!,
      questionId: currentQuestion.id,
      subjectId: currentQuestion.subjectId,
      chapterId: currentQuestion.chapterId,
      selectedAnswer: userAnswer,
      isCorrect: correct,
      score: correct ? currentQuestion.marks : 0,
      maxScore: currentQuestion.marks,
      timeTakenSeconds: timeTaken,
    });

    setAttemptHistory((prev) => [...prev, { question: currentQuestion, answer: userAnswer, correct }]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsSubmitted(false);
      setUserAnswer('');
      setStartTime(Date.now());
    } else {
      setQuizFinished(true);
    }
  };

  if (!session) return null;

  return (
    <div className={`min-h-screen theme-grade-${session.grade}`} style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Navigation Top Bar */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', marginBottom: '20px' }}>
          <button
            onClick={() => {
              if (quizStarted && !quizFinished) {
                if (confirm('Leave this practice session? Your progress will be saved.')) {
                  setQuizStarted(false);
                }
              } else if (selectedSubject) {
                setSelectedSubject(null);
              } else {
                router.push('/student/dashboard');
              }
            }}
            className="btn btn-secondary"
            style={{ fontSize: '0.875rem' }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge badge-g${session.grade}`}>Grade {session.grade} Practice</span>
          </div>
        </header>

        {/* STEP 1: SUBJECT SELECTION */}
        {!selectedSubject && (
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>
              {session.grade === 4 ? 'Pick a Subject to Practice! 🎯' : 'Select Subject for Practice'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Choose any subject to start chapter-wise interactive questions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {subjects.map((subj) => (
                <div
                  key={subj.id}
                  onClick={() => handleSelectSubject(subj)}
                  className="glass-card"
                  style={{ padding: '24px', cursor: 'pointer', borderLeft: `6px solid ${subj.color}` }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: subj.color,
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <BookOpen size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{subj.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    CBSE Code: {subj.code}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: CHAPTER SELECTION & QUIZ LAUNCH */}
        {selectedSubject && !quizStarted && (
          <div>
            <div style={{ background: selectedSubject.color, color: '#FFF', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{selectedSubject.name}</h1>
              <p style={{ opacity: 0.9, marginTop: '4px' }}>Select a chapter or practice all topics</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <button
                onClick={() => handleSelectChapter(null)}
                className="glass-card"
                style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: selectedChapter === null ? `2px solid ${selectedSubject.color}` : '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>🌟 All Chapters Combined</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full subject question bank ({questions.length} questions)</p>
                </div>
                <ChevronRight size={20} style={{ color: selectedSubject.color }} />
              </button>

              {chapters.map((chap) => (
                <button
                  key={chap.id}
                  onClick={() => handleSelectChapter(chap)}
                  className="glass-card"
                  style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: selectedChapter?.id === chap.id ? `2px solid ${selectedSubject.color}` : '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>
                      Chapter {chap.chapterNumber}: {chap.title}
                    </h3>
                    {chap.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{chap.description}</p>}
                  </div>
                  <ChevronRight size={20} style={{ color: selectedSubject.color }} />
                </button>
              ))}
            </div>

            <button
              onClick={startQuiz}
              disabled={questions.length === 0}
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem', backgroundColor: selectedSubject.color }}
            >
              {questions.length > 0 ? `🚀 Start Practice (${questions.length} Questions)` : 'No Questions Available Yet'}
            </button>
          </div>
        )}

        {/* STEP 3: INTERACTIVE QUIZ ENGINE */}
        {quizStarted && !quizFinished && currentQuestion && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={18} /> Score: {score} pts
              </span>
            </div>

            <div style={{ height: '8px', width: '100%', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  background: selectedSubject?.color || '#3B82F6',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                  {currentQuestion.difficulty.toUpperCase()}
                </span>
                <span className="badge" style={{ background: '#F3F4F6', color: '#374151' }}>
                  {currentQuestion.marks} {currentQuestion.marks === 1 ? 'Mark' : 'Marks'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', lineHeight: 1.4, marginBottom: '20px' }}>
                {currentQuestion.questionText}
              </h2>

              {currentQuestion.questionType === 'mcq' && currentQuestion.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentQuestion.options.map((option, idx) => {
                    let optionStyle = {
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: '2px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      cursor: isSubmitted ? 'default' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      textAlign: 'left' as const,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    };

                    if (userAnswer === option) {
                      optionStyle.border = `2px solid ${selectedSubject?.color || '#3B82F6'}`;
                      optionStyle.background = '#EFF6FF';
                    }

                    if (isSubmitted) {
                      if (option === currentQuestion.correctAnswer) {
                        optionStyle.border = '2px solid #10B981';
                        optionStyle.background = '#D1FAE5';
                      } else if (userAnswer === option && !isCorrect) {
                        optionStyle.border = '2px solid #EF4444';
                        optionStyle.background = '#FEE2E2';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isSubmitted}
                        onClick={() => setUserAnswer(option)}
                        style={optionStyle}
                      >
                        <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700' }}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.questionType !== 'mcq' && (
                <div>
                  <textarea
                    rows={3}
                    placeholder="Type your answer here..."
                    value={userAnswer}
                    disabled={isSubmitted}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '2px solid var(--border-color)',
                      fontSize: '1rem',
                    }}
                  />
                </div>
              )}
            </div>

            {isSubmitted && (
              <div
                className="glass-card"
                style={{
                  padding: '20px',
                  marginBottom: '24px',
                  backgroundColor: isCorrect ? '#F0FDF4' : '#FFF7ED',
                  borderColor: isCorrect ? '#86EFAC' : '#FDBA74',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {isCorrect ? (
                    <>
                      <CheckCircle2 size={24} style={{ color: '#16A34A' }} />
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#15803D' }}>
                        {session.grade === 4 ? 'Spot On, Super Star! ⭐' : 'Correct Answer!'}
                      </h3>
                    </>
                  ) : (
                    <>
                      <XCircle size={24} style={{ color: '#EA580C' }} />
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#C2410C' }}>
                        {session.grade === 4 ? 'Good Try! Here is the trick 💡' : 'Incorrect'}
                      </h3>
                    </>
                  )}
                </div>

                {!isCorrect && (
                  <p style={{ fontWeight: '700', fontSize: '0.95rem', color: '#9A3412', marginBottom: '6px' }}>
                    Correct Answer: {currentQuestion.correctAnswer}
                  </p>
                )}

                {currentQuestion.explanation && (
                  <p style={{ fontSize: '0.9rem', color: '#431407', background: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '8px' }}>
                    💡 <strong>Explanation</strong>: {currentQuestion.explanation}
                  </p>
                )}
              </div>
            )}

            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem', backgroundColor: selectedSubject?.color }}
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
              >
                {currentIndex + 1 < questions.length ? 'Next Question ➔' : 'Finish Practice & View Results 🏆'}
              </button>
            )}
          </div>
        )}

        {/* STEP 4: QUIZ RESULTS SUMMARY */}
        {quizFinished && (
          <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#D1FAE5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Award size={40} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
              {session.grade === 4 ? 'Practice Completed! 🎉' : 'Quiz Completed'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Great job practicing {selectedSubject?.name}!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '480px', margin: '0 auto 32px auto' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-600)' }}>
                  {attemptHistory.filter((a) => a.correct).length} / {questions.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10B981' }}>
                  {Math.round((attemptHistory.filter((a) => a.correct).length / questions.length) * 100)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accuracy</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#F59E0B' }}>
                  +{score}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Points</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={startQuiz} className="btn btn-secondary">
                <RotateCcw size={16} /> Practice Again
              </button>
              <button onClick={() => router.push('/student/dashboard')} className="btn btn-primary">
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentPracticePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Practice Module...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
