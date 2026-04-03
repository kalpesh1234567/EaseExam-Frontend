import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState({}); // examId → 'uploading' | 'done' | 'error'
  const fileInputRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, classroomsRes] = await Promise.all([
          api.get('/exams'),
          api.get('/classrooms')
        ]);
        setExams(examsRes.data);
        setClassrooms(classroomsRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuestionPaperUpload = async (examId, file) => {
    if (!file) return;
    setUploadStatus(s => ({ ...s, [examId]: 'uploading' }));
    const formData = new FormData();
    formData.append('questionPaper', file);
    try {
      const { data } = await api.post(`/exams/${examId}/question-paper`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update local exam state with new URL
      setExams(prev => prev.map(e => e._id === examId ? { ...e, questionPaperUrl: data.questionPaperUrl } : e));
      setUploadStatus(s => ({ ...s, [examId]: 'done' }));
      setTimeout(() => setUploadStatus(s => ({ ...s, [examId]: null })), 3000);
    } catch (err) {
      setUploadStatus(s => ({ ...s, [examId]: 'error' }));
      setTimeout(() => setUploadStatus(s => ({ ...s, [examId]: null })), 4000);
    }
  };


  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <h2 className="page-title">Welcome, {user?.firstName}! 👋</h2>
              <p className="page-subtitle">Manage your exams and track student evaluations</p>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <Link to="/create-classroom" className="btn btn-ghost" id="create-classroom-btn">+ Create Classroom</Link>
              <Link to="/create-exam" className="btn btn-primary" id="create-exam-btn">+ Create Exam</Link>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-label">Total Exams</span>
              <span className="stat-value">{exams.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Classrooms</span>
              <span className="stat-value">{classrooms.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Subjects</span>
              <span className="stat-value">{new Set(exams.map(e => e.subject)).size}</span>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, marginTop:32 }}>
            <section>
              <h3 style={{ fontWeight:700, marginBottom:18 }}>Your Classrooms</h3>
              {loading ? (
                <div className="spinner-wrap"><div className="spinner"/></div>
              ) : classrooms.length === 0 ? (
                <div className="card" style={{ textAlign:'center', padding:40 }}>
                  <p style={{ color:'var(--text-2)', marginBottom:16 }}>No classrooms created yet.</p>
                  <Link to="/create-classroom" className="btn btn-primary btn-sm">Create First Classroom</Link>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {classrooms.map(c => (
                    <Link key={c._id} to={`/classroom/${c._id}`} className="card" style={{ textDecoration:'none', color:'inherit' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ fontWeight:600 }}>{c.name}</div>
                          <div style={{ fontSize:'.75rem', color:'var(--text-2)' }}>Code: <span className="code-chip">{c.code}</span></div>
                        </div>
                        <div style={{ fontSize:'.85rem', color:'var(--text-2)' }}>
                          {c.studentCount} Students
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 style={{ fontWeight:700, marginBottom:18 }}>Recent Exams</h3>
              {loading ? (
                <div className="spinner-wrap"><div className="spinner"/></div>
              ) : exams.length === 0 ? (
                <div className="card" style={{ textAlign:'center', padding:40 }}>
                  <p style={{ color:'var(--text-2)', marginBottom:16 }}>No exams created yet.</p>
                  <Link to="/create-exam" className="btn btn-primary btn-sm">Create First Exam</Link>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {exams.slice(0, 5).map(exam => (
                    <div key={exam._id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{exam.title}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--text-2)' }}>{exam.subject} {exam.classroom?.name && `• ${exam.classroom.name}`}</div>
                        </div>
                        <Link to={`/exam-results/${exam._id}`} className="btn btn-ghost btn-sm">Results</Link>
                      </div>

                      {/* Question Paper upload strip */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                        {exam.questionPaperUrl ? (
                          <a
                            href={`${SERVER}${exam.questionPaperUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '.78rem', color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            📄 Question Paper ↗
                          </a>
                        ) : (
                          <span style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>📄 No question paper yet</span>
                        )}

                        <label
                          htmlFor={`qp-${exam._id}`}
                          style={{
                            marginLeft: 'auto', fontSize: '.75rem', cursor: 'pointer',
                            color: uploadStatus[exam._id] === 'done' ? 'var(--green)' : uploadStatus[exam._id] === 'error' ? 'var(--red)' : 'var(--text-2)',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          {uploadStatus[exam._id] === 'uploading' && '⏳ Uploading...'}
                          {uploadStatus[exam._id] === 'done' && '✅ Uploaded!'}
                          {uploadStatus[exam._id] === 'error' && '❌ Failed'}
                          {!uploadStatus[exam._id] && (exam.questionPaperUrl ? '🔄 Replace PDF' : '⬆ Upload PDF')}
                        </label>
                        <input
                          id={`qp-${exam._id}`}
                          type="file"
                          accept=".pdf"
                          style={{ display: 'none' }}
                          onChange={e => handleQuestionPaperUpload(exam._id, e.target.files[0])}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

        </div>
      </div>
    </>
  );
}
