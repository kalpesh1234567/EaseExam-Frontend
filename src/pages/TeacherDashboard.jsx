import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

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
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
                        <div>
                          <div style={{ fontWeight:600 }}>{exam.title}</div>
                          <div style={{ fontSize:'.75rem', color:'var(--text-2)' }}>{exam.subject} {exam.classroom?.name && `• ${exam.classroom.name}`}</div>
                        </div>
                        <Link to={`/exam-results/${exam._id}`} className="btn btn-ghost btn-sm">Results</Link>
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
