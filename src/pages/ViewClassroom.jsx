import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ViewClassroom() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/classrooms/${id}`).then(r => { setData(r.data); setLoading(false); }).catch(e => { setError(e.response?.data?.message || 'Error loading classroom'); setLoading(false); });
  }, [id]);

  if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner"/></div></>;
  if (error)   return <><Navbar /><div className="container" style={{paddingTop:40}}><div className="alert alert-error">{error}</div></div></>;

  const { classroom, students, tests, isOwner } = data;

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <h2 className="page-title">{classroom.name}</h2>
                <span className="code-chip">{classroom.code}</span>
              </div>
              {classroom.description && <p className="page-subtitle">{classroom.description}</p>}
            </div>
            {isOwner && (
              <Link to={`/create-test/${classroom._id}`} className="btn btn-primary" id="create-test-btn">+ Create Test</Link>
            )}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:28, alignItems:'start' }}>
            {/* Tests */}
            <div>
              <h3 style={{ fontWeight:700, marginBottom:16 }}>Tests ({tests.length})</h3>
              {tests.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📝</div>
                  <h3>No tests yet</h3>
                  {isOwner && <p>Create a test to get started</p>}
                </div>
              ) : tests.map(t => {
                const now = new Date();
                const start = new Date(t.startTime);
                const end   = new Date(t.endTime);
                const ongoing = start <= now && now <= end;
                const upcoming = start > now;
                const expired  = end < now;

                return (
                  <div key={t._id} className="card" style={{ marginBottom:14 }}>
                    <div className="card-header">
                      <div>
                        <div className="card-title">{t.name}</div>
                        <div className="card-meta">
                          {formatDate(t.startTime)} → {formatDate(t.endTime)}
                        </div>
                      </div>
                      <span style={{
                        fontSize:'.75rem', fontWeight:600, padding:'4px 10px', borderRadius:999,
                        background: ongoing ? 'rgba(16,185,129,.15)' : upcoming ? 'rgba(251,191,36,.12)' : 'rgba(255,255,255,.06)',
                        color: ongoing ? 'var(--green)' : upcoming ? 'var(--yellow)' : 'var(--text-2)'
                      }}>{ongoing ? '🟢 Ongoing' : upcoming ? '🟡 Upcoming' : '⬜ Ended'}</span>
                    </div>
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:6 }}>
                      <Link to={`/test/${t._id}`} className="btn btn-ghost btn-sm">View Test</Link>
                      {!isOwner && ongoing && <Link to={`/attend-test/${t._id}`} className="btn btn-primary btn-sm">Attend →</Link>}
                      {isOwner && <Link to={`/students-work/${t._id}`} className="btn btn-ghost btn-sm">Student Work</Link>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Students */}
            <div>
              <h3 style={{ fontWeight:700, marginBottom:16 }}>Students ({students.length})</h3>
              <div className="card" style={{ padding:'16px' }}>
                {students.length === 0 ? (
                  <p style={{ fontSize:'.85rem', color:'var(--text-2)', textAlign:'center', padding:'20px 0' }}>No students enrolled</p>
                ) : students.map(s => (
                  <div key={s._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent), var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'.85rem', flexShrink:0 }}>
                      {s.firstName[0]}{s.lastName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'.875rem' }}>{s.firstName} {s.lastName}</div>
                      <div style={{ fontSize:'.75rem', color:'var(--text-2)' }}>@{s.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
