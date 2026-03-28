import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function AttendTest() {
  const { testId } = useParams();
  const navigate   = useNavigate();
  const [data, setData]     = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/tests/${testId}`).then(r => {
      setData(r.data);
      const init = {};
      r.data.questions.forEach(q => { init[q._id] = ''; });
      setAnswers(init);
      setLoading(false);
      // Timer
      const end = new Date(r.data.test.endTime);
      const update = () => {
        const diff = end - new Date();
        if (diff <= 0) { clearInterval(timerRef.current); setTimeLeft('Time up!'); return; }
        const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
        setTimeLeft(`${h>0?h+'h ':'}${m}m ${s}s`);
      };
      update();
      timerRef.current = setInterval(update, 1000);
    }).catch(e => { setError(e.response?.data?.message || 'Failed to load test'); setLoading(false); });
    return () => clearInterval(timerRef.current);
  }, [testId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Submit your answers? You cannot change them after submission.')) return;
    setSubmitting(true);
    try {
      await api.post(`/submissions/submit/${testId}`, { answers });
      navigate(`/test-result/${testId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner"/></div></>;
  if (error)   return <><Navbar /><div className="container" style={{paddingTop:40}}><div className="alert alert-error">{error}</div></div></>;

  const { test, questions } = data;

  return (
    <>
      <Navbar />
      {/* Floating timer */}
      <div style={{ position:'fixed', top:72, right:24, zIndex:50, background:'rgba(10,13,20,0.9)', border:'1px solid var(--border-glow)', borderRadius:10, padding:'10px 18px', backdropFilter:'blur(12px)' }}>
        <div style={{ fontSize:'.7rem', color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.06em' }}>Time Left</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'1.1rem', color: timeLeft === 'Time up!' ? 'var(--red)' : 'var(--accent-2)' }}>{timeLeft}</div>
      </div>

      <div className="page">
        <div className="container" style={{ maxWidth:760 }}>
          <div className="page-header">
            <h2 className="page-title">{test.name}</h2>
            <p className="page-subtitle">Answer all questions. Your answers are auto-saved in this form.</p>
          </div>
          <form onSubmit={handleSubmit}>
            {questions.map((q, i) => (
              <div key={q._id} className="card" style={{ marginBottom:20 }}>
                <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent), var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'.85rem', flexShrink:0 }}>
                    {i+1}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'1rem', lineHeight:1.5 }}>{q.text}</div>
                    <div style={{ marginTop:4, fontSize:'.78rem', color:'var(--text-2)' }}>Max Score: <b style={{ color:'var(--accent-2)' }}>{q.maxScore}</b></div>
                  </div>
                </div>
                <textarea
                  id={`answer-${q._id}`}
                  placeholder="Type your answer here…"
                  value={answers[q._id] || ''}
                  onChange={e => setAnswers({...answers, [q._id]: e.target.value})}
                  style={{ minHeight:120 }}
                />
                <div className="form-hint">{answers[q._id]?.split(/\s+/).filter(Boolean).length || 0} words</div>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
              <button id="submit-test-btn" type="submit" className="btn btn-primary" disabled={submitting} style={{ padding:'14px 36px', fontSize:'1rem' }}>
                {submitting ? 'Submitting…' : '✅ Submit Test'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
