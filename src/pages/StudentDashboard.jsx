import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://easeexam-backend.onrender.com';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState('');

  const fetchDashboard = async () => {
    try {
      const [examsRes, classroomsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/classrooms')
      ]);
      setExams(examsRes.data);
      setClassrooms(classroomsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode) return;
    setJoining(true); setMessage('');
    try {
      await api.post('/classrooms/join', { code: joinCode });
      setMessage('Successfully joined classroom!');
      setJoinCode('');
      fetchDashboard();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to join');
    }
  };

  return (

    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="page-header">
            <h2 className="page-title">Welcome, {user?.firstName}! 🎓</h2>
            <p className="page-subtitle">View your pending exams and past results.</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:32 }}>
            <aside>
              <div className="card" style={{ marginBottom:24 }}>
                <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:12 }}>Join Classroom</h3>
                <form onSubmit={handleJoin}>
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Enter Class Code" 
                      value={joinCode} 
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      style={{ textTransform:'uppercase' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={joining}>
                    {joining ? 'Joining...' : 'Join Class'}
                  </button>
                  {message && <div style={{ marginTop:10, fontSize:'.8rem', color: message.includes('Success') ? 'var(--green)' : 'var(--red)' }}>{message}</div>}
                </form>
              </div>

              <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:12 }}>My Classrooms</h3>
              {classrooms.length === 0 ? (
                <p style={{ fontSize:'.85rem', color:'var(--text-2)' }}>No classrooms joined yet.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {classrooms.map(c => (
                    <Link key={c._id} to={`/classroom/${c._id}`} className="card" style={{ padding:12, textDecoration:'none', color:'inherit' }}>
                      <div style={{ fontWeight:600, fontSize:'.9rem' }}>{c.name}</div>
                      <div style={{ fontSize:'.75rem', color:'var(--text-2)' }}>Prof. {c.owner?.lastName}</div>
                    </Link>
                  ))}
                </div>
              )}
            </aside>

            <main>
              <h3 style={{ fontWeight:700, marginBottom:18 }}>Available Exams</h3>
              {loading ? (
                <div className="spinner-wrap"><div className="spinner"/></div>
              ) : exams.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📚</div>
                  <h3>No exams available</h3>
                  <p>Join a classroom or wait for your teachers to post exams.</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {exams.map(exam => (
                    <div key={exam._id} className="card">
                      <div className="card-header">
                        <div>
                          <div className="card-title">{exam.title}</div>
                          <div className="card-meta">
                            {exam.subject} • {exam.classroom?.name && <span style={{color:'var(--primary-color)'}}>{exam.classroom.name} • </span>} Prof. {exam.teacher?.lastName}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, fontSize: '.85rem', color: 'var(--text-2)' }}>
                        Max Marks: <b style={{ color: 'var(--accent-2)' }}>{exam.maxMarks}</b>
                      </div>
                      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {exam.questionPaperUrl && (
                          <a
                            href={`${SERVER}${exam.questionPaperUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'var(--primary-color)', border: '1px solid rgba(99,102,241,0.4)' }}
                          >
                            📄 Question Paper
                          </a>
                        )}
                        <Link to={`/my-result/${exam._id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                          Upload Answer Sheet / View Result →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>

        </div>
      </div>
    </>
  );
}
