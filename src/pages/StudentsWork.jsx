import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://easeexam-backend.onrender.com';

export default function StudentsWork() {
  const { examId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/exams/${examId}/submissions-status`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load submission data');
        setLoading(false);
      });
  }, [examId]);

  if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner"/></div></>;
  if (error) return <><Navbar /><div className="container" style={{paddingTop:40}}><div className="alert alert-error">{error}</div></div></>;

  const { exam, students } = data;

  const getStatusBadge = (status) => {
    const styles = {
      not_submitted: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', label: 'NOT SUBMITTED' },
      pending: { bg: 'rgba(251, 191, 36, 0.15)', color: 'var(--yellow)', label: 'PENDING' },
      evaluating: { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent)', label: 'EVALUATING' },
      evaluated: { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--green)', label: 'EVALUATED' },
      failed: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--red)', label: 'FAILED' }
    };
    const s = styles[status] || styles.not_submitted;
    return (
      <span style={{
        padding: '4px 10px', borderRadius: 99, fontSize: '.7rem', fontWeight: 700,
        backgroundColor: s.bg, color: s.color, letterSpacing: '0.02em'
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="page-header">
            <div style={{ marginBottom: 12 }}>
              <Link to={`/teacher-dashboard`} style={{ color: 'var(--text-2)', textDecoration: 'none', fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                ← Back to Dashboard
              </Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 className="page-title">{exam.title}</h2>
                <p className="page-subtitle">{exam.subject} • Student Submission Tracking</p>
              </div>
              <div className="stats-row" style={{ marginTop: 0, gap: 16 }}>
                <div className="stat-card" style={{ padding: '12px 20px', minWidth: 120 }}>
                  <span className="stat-label" style={{ fontSize: '.7rem' }}>Enrolled</span>
                  <span className="stat-value" style={{ fontSize: '1.25rem' }}>{students.length}</span>
                </div>
                <div className="stat-card" style={{ padding: '12px 20px', minWidth: 120 }}>
                  <span className="stat-label" style={{ fontSize: '.7rem' }}>Uploaded</span>
                  <span className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--green)' }}>
                    {students.filter(s => s.hasSubmitted).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 24 }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Enrolled Students</h3>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: '.75rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    <th style={{ padding: '14px 24px', fontWeight: 600 }}>Student Details</th>
                    <th style={{ padding: '14px 24px', fontWeight: 600 }}>Username</th>
                    <th style={{ padding: '14px 24px', fontWeight: 600 }}>Submission Status</th>
                    <th style={{ padding: '14px 24px', fontWeight: 600 }}>Last Updated</th>
                    <th style={{ padding: '14px 24px', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((item, idx) => (
                    <tr key={item.student._id} style={{ borderBottom: idx === students.length - 1 ? 'none' : '1px solid var(--border)', background: item.hasSubmitted ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem', color: 'white' }}>
                            {item.student.firstName[0]}{item.student.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{item.student.firstName} {item.student.lastName}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{item.student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span className="code-chip" style={{ fontSize: '.75rem' }}>@{item.student.username}</span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {getStatusBadge(item.status)}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '.85rem', color: 'var(--text-2)' }}>
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '-'}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {item.hasSubmitted ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <a href={`${SERVER}${item.fileUrl}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '.75rem' }}>
                              View Sheet
                            </a>
                            {item.status === 'evaluated' && (
                              <Link to={`/exam-results/${examId}`} className="btn btn-primary btn-sm" style={{ padding: '4px 8px', fontSize: '.75rem' }}>
                                View Result
                              </Link>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontStyle: 'italic' }}>Pending upload</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {students.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-3)', fontSize: '.9rem' }}>No students are enrolled in this classroom yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
