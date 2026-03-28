import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function ExamResults() {
  const { examId } = useParams();
  const [results, setResults] = useState([]);
  const [exam, setExam] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/exams/${examId}`),
      api.get(`/results/teacher/${examId}`),
      api.get(`/analytics/${examId}`)
    ]).then(([exRes, resRes, statRes]) => {
      setExam(exRes.data.exam);
      setResults(resRes.data);
      setStats(statRes.data);
      setLoading(false);
    }).catch(e => {
      setError('Failed to load exam data');
      setLoading(false);
    });
  }, [examId]);

  if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner"/></div></>;
  if (error) return <><Navbar /><div className="container" style={{paddingTop:40}}><div className="alert alert-error">{error}</div></div></>;

  const handleExportCSV = () => window.open(`https://easeexam-backend.onrender.com/api/export/${examId}/csv`, '_blank');
  const handleExportPDF = () => window.open(`https://easeexam-backend.onrender.com/api/export/${examId}/pdf`, '_blank');

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <Link to="/teacher-dashboard" style={{ color:'var(--text-2)', textDecoration:'none', fontSize:'.9rem' }}>← Back to Dashboard</Link>
              <h2 className="page-title" style={{ marginTop:8 }}>{exam.title} Results</h2>
              <p className="page-subtitle">{exam.subject} • Max Marks: {exam.maxMarks}</p>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button className="btn btn-ghost" onClick={handleExportCSV}>📄 Export CSV</button>
              <button className="btn btn-primary" onClick={handleExportPDF}>📑 Export PDF</button>
            </div>
          </div>

          <div className="stats-row" style={{ marginBottom:32 }}>
            <div className="stat-card">
              <span className="stat-label">Evaluated / Enrolled</span>
              <span className="stat-value">{stats.evaluatedCount} / {stats.totalStudents}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Class Average</span>
              <span className="stat-value">{stats.avgScore} <span style={{ fontSize:'1rem', color:'var(--text-3)' }}>({Math.round((stats.avgScore/exam.maxMarks)*100)}%)</span></span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Failed (&lt;40%)</span>
              <span className="stat-value" style={{ color: stats.failCount > 0 ? 'var(--red)' : 'var(--text-1)' }}>{stats.failCount}</span>
            </div>
          </div>

          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.02)' }}>
              <h3 style={{ fontWeight:600, fontSize:'1.1rem' }}>Student Submissions</h3>
            </div>
            {results.length === 0 ? (
              <div style={{ padding:40, textAlign:'center', color:'var(--text-2)' }}>No submissions yet.</div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ textAlign:'left', borderBottom:'1px solid var(--border)', fontSize:'.85rem', color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.05em' }}>
                    <th style={{ padding:'16px 24px', fontWeight:600 }}>Student</th>
                    <th style={{ padding:'16px 24px', fontWeight:600 }}>Status</th>
                    <th style={{ padding:'16px 24px', fontWeight:600 }}>Score</th>
                    <th style={{ padding:'16px 24px', fontWeight:600 }}>%</th>
                    <th style={{ padding:'16px 24px', fontWeight:600 }}>Grade</th>
                    <th style={{ padding:'16px 24px', fontWeight:600 }}>Sheet</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.student._id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'16px 24px' }}>
                        <div style={{ fontWeight:600 }}>{r.student.firstName} {r.student.lastName}</div>
                        <div style={{ fontSize:'.8rem', color:'var(--text-2)' }}>{r.student.email}</div>
                      </td>
                      <td style={{ padding:'16px 24px' }}>
                        <span style={{
                          padding:'4px 10px', borderRadius:99, fontSize:'.75rem', fontWeight:600,
                          backgroundColor: r.status === 'evaluated' ? 'rgba(16,185,129,0.15)' : r.status === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)',
                          color: r.status === 'evaluated' ? 'var(--green)' : r.status === 'failed' ? 'var(--red)' : 'var(--yellow)'
                        }}>{r.status.toUpperCase()}</span>
                      </td>
                      <td style={{ padding:'16px 24px', fontWeight:600, color: r.evaluation ? 'var(--accent-2)' : 'inherit' }}>
                        {r.evaluation ? `${r.evaluation.totalScore} / ${exam.maxMarks}` : '-'}
                      </td>
                      <td style={{ padding:'16px 24px' }}>{r.evaluation ? `${Math.round(r.evaluation.percentage)}%` : '-'}</td>
                      <td style={{ padding:'16px 24px', fontWeight:700 }}>{r.evaluation ? r.evaluation.grade : '-'}</td>
                      <td style={{ padding:'16px 24px' }}>
                        {r.fileUrl ? <a href={`https://easeexam-backend.onrender.com${r.fileUrl}`} target="_blank" rel="noreferrer" style={{ color:'var(--accent)', textDecoration:'underline', fontSize:'.9rem' }}>View PDF</a> : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
