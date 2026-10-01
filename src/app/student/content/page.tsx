'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession, ContentItem, Subject, ContentType } from '@/lib/types';
import { db } from '@/lib/db';
import { getStoredSession } from '@/lib/session';
import {
  ArrowLeft,
  Upload,
  FileText,
  Link,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Plus,
  BookOpen,
} from 'lucide-react';

export default function StudentContentPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'my_uploads' | 'approved'>('all');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>('text_snippet');
  const [subjectId, setSubjectId] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const curSession = getStoredSession();
    if (!curSession || curSession.role !== 'student' || !curSession.grade) {
      router.push('/');
      return;
    }
    setSession(curSession);
    loadContentData(curSession);
  }, [router]);

  const loadContentData = async (userSession: UserSession) => {
    if (userSession.grade) {
      const items = await db.getContentItems(userSession.grade, userSession.stream, userSession.studentId);
      setContentItems(items);
      const subjs = await db.getSubjects(userSession.grade, userSession.stream);
      setSubjects(subjs);
      if (subjs.length > 0) setSubjectId(subjs[0].id);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await db.addContentItem({
        title: title.trim(),
        contentType,
        fileUrl: fileUrl.trim() || undefined,
        textContent: textContent.trim() || undefined,
        grade: session!.grade!,
        stream: session!.stream || null,
        subjectId: subjectId || undefined,
        createdByStudentId: session!.studentId,
        approvalStatus: 'pending', // Student uploads default to pending review
      });

      alert('Content submitted! It is now pending parent admin approval. 🌟');
      setShowUploadModal(false);
      setTitle('');
      setTextContent('');
      setFileUrl('');
      loadContentData(session!);
    } catch (err) {
      alert('Failed to upload content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return null;

  const filteredItems = contentItems.filter((item) => {
    if (activeFilter === 'my_uploads') return item.createdByStudentId === session.studentId;
    if (activeFilter === 'approved') return item.approvalStatus === 'approved';
    return true;
  });

  return (
    <div className={`min-h-screen theme-grade-${session.grade}`} style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', paddingBottom: '60px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', marginBottom: '20px' }}>
          <button onClick={() => router.push('/student/dashboard')} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
            <Plus size={18} /> Upload My Content
          </button>
        </header>

        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '8px' }}>
          Study Resources & My Uploads 📚
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          View approved learning sheets and share your notes with parent approval.
        </p>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveFilter('all')}
            className={`btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 16px' }}
          >
            All Resources ({contentItems.length})
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`btn ${activeFilter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 16px' }}
          >
            Approved Central Repo
          </button>
          <button
            onClick={() => setActiveFilter('my_uploads')}
            className={`btn ${activeFilter === 'my_uploads' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 16px' }}
          >
            My Submissions
          </button>
        </div>

        {/* Content Items List */}
        {filteredItems.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No study items found under this filter. Tap "Upload My Content" to add notes!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {filteredItems.map((item) => (
              <div key={item.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="badge" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
                      {item.contentType.replace('_', ' ').toUpperCase()}
                    </span>

                    {item.approvalStatus === 'approved' ? (
                      <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> Approved
                      </span>
                    ) : (
                      <span style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> Pending Review
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>{item.title}</h3>

                  {item.textContent && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: '#F8FAFC', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                      "{item.textContent}"
                    </p>
                  )}

                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.85rem', color: 'var(--primary-600)', textDecoration: 'underline', fontWeight: '600' }}
                    >
                      View Attached Resource Link ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* UPLOAD MODAL */}
        {showUploadModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000 }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '14px' }}>Upload Learning Resource</h3>
              <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Resource Title</label>
                  <input
                    type="text"
                    placeholder="e.g. My Science Formula Summary"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Resource Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as ContentType)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="text_snippet">Text Snippet / Short Note</option>
                    <option value="pdf">PDF Document Link</option>
                    <option value="link">Web Page Link</option>
                    <option value="image">Scanned Image Link</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Note Text / Content</label>
                  <textarea
                    rows={3}
                    placeholder="Paste formula, study summary, or note text..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>File / URL Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 1 }}>
                    {isSubmitting ? 'Submitting...' : 'Submit Content'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
