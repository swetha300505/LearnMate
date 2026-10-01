'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Student, ContentItem, GradeLevel, GradeStream } from '@/lib/types';
import { db } from '@/lib/db';
import { getStoredSession, clearStoredSession } from '@/lib/session';
import {
  Users,
  FileCheck,
  BarChart2,
  Plus,
  KeyRound,
  Trash2,
  LogOut,
  CheckCircle,
  XCircle,
  BookOpen,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'students' | 'approvals' | 'progress'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  // Add/Edit Student Form state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentGrade, setNewStudentGrade] = useState<GradeLevel>(4);
  const [newStudentStream, setNewStudentStream] = useState<GradeStream>('Science');
  const [newStudentPin, setNewStudentPin] = useState<string>('1234');
  const [newStudentColor, setNewStudentColor] = useState<string>('#3B82F6');

  // Reset PIN modal
  const [resetPinStudent, setResetPinStudent] = useState<Student | null>(null);
  const [freshPin, setFreshPin] = useState<string>('');

  useEffect(() => {
    const session = getStoredSession();
    if (!session || session.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadAdminData();
  }, [router]);

  const loadAdminData = async () => {
    const stds = await db.getStudents();
    setStudents(stds);
    const items = await db.getAllContentItemsForAdmin();
    setContentItems(items);
  };

  const handleLogout = () => {
    clearStoredSession();
    router.push('/');
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentPin.trim()) return;

    await db.addStudent({
      name: newStudentName.trim(),
      grade: newStudentGrade,
      stream: newStudentGrade === 12 ? newStudentStream : null,
      pin: newStudentPin,
      avatarColor: newStudentColor,
    });

    setShowAddModal(false);
    setNewStudentName('');
    setNewStudentPin('1234');
    loadAdminData();
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('Are you sure you want to delete this student account?')) {
      await db.deleteStudent(id);
      loadAdminData();
    }
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPinStudent || !freshPin) return;

    await db.resetStudentPin(resetPinStudent.id, freshPin);
    alert(`PIN for ${resetPinStudent.name} updated successfully to ${freshPin}!`);
    setResetPinStudent(null);
    setFreshPin('');
  };

  const handleApproveContent = async (itemId: string) => {
    await db.updateContentStatus(itemId, 'approved');
    loadAdminData();
  };

  const handleRejectContent = async (itemId: string) => {
    await db.updateContentStatus(itemId, 'rejected');
    loadAdminData();
  };

  const pendingApprovals = contentItems.filter((i) => i.approvalStatus === 'pending');

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 32px 0', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Parent Admin Dashboard</h1>
            <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px' }}>
              LearnMate Control Center
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage your kids' profiles, PINs, approve learning content, and monitor progress.
          </p>
        </div>

        <button onClick={handleLogout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid var(--border-color)', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('students')}
          style={{
            padding: '12px 20px',
            fontWeight: '700',
            fontSize: '0.95rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'students' ? 'var(--primary-600)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'students' ? '3px solid var(--primary-600)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Users size={18} /> Manage Students ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          style={{
            padding: '12px 20px',
            fontWeight: '700',
            fontSize: '0.95rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'approvals' ? 'var(--primary-600)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'approvals' ? '3px solid var(--primary-600)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileCheck size={18} /> Content Approvals
          {pendingApprovals.length > 0 && (
            <span style={{ backgroundColor: '#EF4444', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: '800', padding: '2px 8px', borderRadius: '9999px' }}>
              {pendingApprovals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          style={{
            padding: '12px 20px',
            fontWeight: '700',
            fontSize: '0.95rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'progress' ? 'var(--primary-600)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'progress' ? '3px solid var(--primary-600)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <BarChart2 size={18} /> Progress Overview
        </button>
      </div>

      {/* TAB 1: STUDENTS MANAGEMENT */}
      {activeTab === 'students' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Student Accounts</h2>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              <Plus size={18} /> Add New Student
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {students.map((std) => (
              <div key={std.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        backgroundColor: std.avatarColor,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '800',
                      }}
                    >
                      {std.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{std.name}</h3>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <span className={`badge badge-g${std.grade}`}>Grade {std.grade}</span>
                        {std.stream && (
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', background: '#F3F4F6', padding: '2px 8px', borderRadius: '12px' }}>
                            {std.stream}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '14px' }}>
                  <button
                    onClick={() => {
                      setResetPinStudent(std);
                      setFreshPin('');
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    <KeyRound size={14} /> Reset PIN
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(std.id)}
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT APPROVALS */}
      {activeTab === 'approvals' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>Student Submitted Content Approvals</h2>
          {pendingApprovals.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <CheckCircle size={48} style={{ color: '#10B981', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>No Pending Approvals!</h3>
              <p style={{ fontSize: '0.9rem' }}>All student uploads have been reviewed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingApprovals.map((item) => (
                <div key={item.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className={`badge badge-g${item.grade}`}>Grade {item.grade}</span>
                      {item.stream && <span style={{ fontSize: '0.75rem', fontWeight: '600', background: '#F3F4F6', padding: '2px 8px', borderRadius: '12px' }}>{item.stream}</span>}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type: {item.contentType}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{item.title}</h3>
                    {item.textContent && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '6px' }}>
                        "{item.textContent}"
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleApproveContent(item.id)} className="btn btn-primary" style={{ backgroundColor: '#10B981' }}>
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button onClick={() => handleRejectContent(item.id)} className="btn btn-danger">
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROGRESS OVERVIEW */}
      {activeTab === 'progress' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>Overall Student Activity & Progress</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {students.map((s) => (
              <div key={s.id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: s.avatarColor, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{s.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Grade {s.grade} {s.stream ? `(${s.stream})` : ''}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-600)' }}>12</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Questions Practiced</div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10B981' }}>85%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accuracy Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>Add New Student Profile</h3>
            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Grade Level</label>
                <select
                  value={newStudentGrade}
                  onChange={(e) => setNewStudentGrade(Number(e.target.value) as GradeLevel)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                >
                  <option value={4}>Grade 4 (Playful & Foundational)</option>
                  <option value={9}>Grade 9 (Neutral & Explanatory)</option>
                  <option value={12}>Grade 12 (Board Exam Focused)</option>
                </select>
              </div>

              {newStudentGrade === 12 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Stream (Grade 12 Only)</label>
                  <select
                    value={newStudentStream || 'Science'}
                    onChange={(e) => setNewStudentStream(e.target.value as GradeStream)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>4-Digit Login PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  value={newStudentPin}
                  onChange={(e) => setNewStudentPin(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PIN MODAL */}
      {resetPinStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '380px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Reset PIN for {resetPinStudent.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>Enter a new 4 to 6 digit PIN for this student.</p>
            <form onSubmit={handleResetPinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Enter new PIN (e.g. 1234)"
                value={freshPin}
                onChange={(e) => setFreshPin(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setResetPinStudent(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Update PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
