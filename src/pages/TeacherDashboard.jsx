import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exams').then(r => {
      setExams(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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
            <Link to="/create-exam" className="btn btn-primary" id="create-exam-btn">+ Create Exam</Link>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-label">Total Exams</span>
              <span className="stat-value">{exams.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Subjects</span>
              <span className="stat-value">{new Set(exams.map(e => e.subject)).size}</span>
            </div>
          </div>

          <h3 style={{ fontWeight:700, marginBottom:18 }}>Your Exams</h3>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner"/></div>
          ) : exams.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📄</div>
              <h3>No exams yet</h3>
              <p>Create your first exam and upload an answer key to start</p>
              <Link to="/create-exam" className="btn btn-primary" style={{ marginTop:20 }}>Create Exam</Link>
            </div>
          ) : (
            <div className="grid-2">
              {exams.map(exam => (
                <div key={exam._id} className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{exam.title}</div>
                      <div className="card-meta">
                        {exam.subject} {exam.classroom?.name && <span style={{color:'var(--primary-color)'}}> • {exam.classroom.name}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop:8, fontSize:'.85rem', color:'var(--text-2)', display:'flex', justifyContent:'space-between' }}>
                    <span>Max Marks: <b style={{color:'var(--accent-2)'}}>{exam.maxMarks}</b></span>
                    <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ marginTop:16, display:'flex', gap:10 }}>
                    <Link to={`/exam-results/${exam._id}`} className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center' }}>View Results →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
