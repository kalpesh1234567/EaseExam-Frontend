import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For MVP, student sees all available exams. 
    // Wait, let's fetch exams, then check submission status for each.
    const fetchDashboard = async () => {
      try {
        const { data: allExams } = await api.get('/exams');
        setExams(allExams);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="page-header">
            <h2 className="page-title">Welcome, {user?.firstName}! 🎓</h2>
            <p className="page-subtitle">View your pending exams and past results.</p>
          </div>

          <h3 style={{ fontWeight:700, marginBottom:18 }}>Available Exams</h3>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner"/></div>
          ) : exams.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📚</div>
              <h3>No exams available</h3>
              <p>Your teachers haven't posted any exams yet.</p>
            </div>
          ) : (
            <div className="grid-2">
              {exams.map(exam => (
                <div key={exam._id} className="card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{exam.title}</div>
                      <div className="card-meta">{exam.subject} • Prof. {exam.teacher?.lastName}</div>
                    </div>
                  </div>
                  <div style={{ marginTop:12, fontSize:'.85rem', color:'var(--text-2)' }}>
                    Max Marks: <b style={{color:'var(--accent-2)'}}>{exam.maxMarks}</b>
                  </div>
                  <div style={{ marginTop:16, display:'flex', gap:10 }}>
                    {/* A student can either submit a sheet, or view their result if already submitted. We'll direct them to the result page, which redirects to submit if no result exists. */}
                    <Link to={`/my-result/${exam._id}`} className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center' }}>
                      Upload Answer Sheet / View Result →
                    </Link>
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
