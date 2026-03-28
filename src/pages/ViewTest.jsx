import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ViewTest() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/tests/${id}`).then(r => { setData(r.data); setLoading(false); }).catch(e => { setError(e.response?.data?.message || 'Error loading test'); setLoading(false); });
  }, [id]);

  if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner"/></div></>;
  if (error)   return <><Navbar /><div className="container" style={{paddingTop:40}}><div className="alert alert-error">{error}</div></div></>;

  const { test, questions, isOwner, submissionCount, existingSubmission } = data;
  const now = new Date();
  const ongoing = new Date(test.startTime) <= now && now <= new Date(test.endTime);
  const totalMarks = questions.reduce((s, q) => s + q.maxScore, 0);

  const fmt = (d) => new Date(d).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth:760 }}>
          <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <h2 className="page-title">{test.name}</h2>
              <p className="page-subtitle">{test.classroom?.name}</p>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {isOwner && (
                <>
                  <Link to={`/add-question/${test._id}`} className="btn btn-ghost btn-sm">+ Add Question</Link>
                  <Link to={`/students-work/${test._id}`} className="btn btn-primary btn-sm">View Submissions ({submissionCount})</Link>
                </>
              )}
              {!isOwner && ongoing && !existingSubmission && (
                <Link to={`/attend-test/${test._id}`} className="btn btn-primary" id="attend-btn">Attend Test →</Link>
              )}
              {!isOwner && existingSubmission && (
                <Link to={`/test-result/${test._id}`} className="btn btn-ghost btn-sm">View My Result</Link>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom:28 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:16 }}>
              {[
                { label:'Start', value: fmt(test.startTime) },
                { label:'End',   value: fmt(test.endTime) },
                { label:'Status', value: ongoing ? '🟢 Live' : new Date(test.startTime) > now ? '🟡 Upcoming' : '⬜ Ended' },
                { label:'Total Marks', value: totalMarks },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize:'.72rem', textTransform:'uppercase', letterSpacing:'.05em', color:'var(--text-2)', fontWeight:600, marginBottom:4 }}>{item.label}</div>
                  <div style={{ fontWeight:700 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ fontWeight:700, marginBottom:16 }}>Questions ({questions.length})</h3>
          {questions.map((q, i) => (
            <div key={q._id} className="card" style={{ marginBottom:14 }}>
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(108,99,255,0.2)', color:'var(--accent-2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'.8rem', flexShrink:0 }}>
                  {i+1}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, marginBottom:6 }}>{q.text}</div>
                  {isOwner && (
                    <div style={{ fontSize:'.8rem', color:'var(--text-2)', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 12px', marginTop:6 }}>
                      <span style={{ color:'var(--text-3)', fontSize:'.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>Reference: </span>{q.referenceAnswer}
                    </div>
                  )}
                  <div style={{ marginTop:6, fontSize:'.78rem', color:'var(--text-2)' }}>Max Score: <b style={{ color:'var(--accent-2)' }}>{q.maxScore}</b></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
