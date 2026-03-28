import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function AddQuestion() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ text:'', referenceAnswer:'', maxScore:10 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchQuestions = () => {
    api.get(`/questions?testId=${testId}`).then(r => setQuestions(r.data)).catch(() => {});
  };
  useEffect(() => { fetchQuestions(); }, [testId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await api.post('/questions', { testId, ...form });
      setSuccess('Question added!');
      setForm({ text:'', referenceAnswer:'', maxScore:10 });
      fetchQuestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth:720 }}>
          <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <h2 className="page-title">Add Questions</h2>
              <p className="page-subtitle">{questions.length} question{questions.length!==1 ? 's' : ''} added so far</p>
            </div>
            {questions.length > 0 && (
              <button id="done-btn" className="btn btn-primary" onClick={() => navigate(`/test/${testId}`)}>Done →</button>
            )}
          </div>

          <div className="card" style={{ marginBottom:28 }}>
            <div style={{ fontWeight:700, marginBottom:16 }}>New Question</div>
            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Question Text</label>
                <textarea id="q-text" placeholder="Write the question…" value={form.text} onChange={e => setForm({...form, text: e.target.value})} required style={{ minHeight:70 }} />
              </div>
              <div className="form-group">
                <label>Reference Answer</label>
                <textarea id="q-ref" placeholder="The ideal answer (used by AI to score student responses)…" value={form.referenceAnswer} onChange={e => setForm({...form, referenceAnswer: e.target.value})} required />
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:16, flexWrap:'wrap' }}>
                <div className="form-group" style={{ flex:'0 0 140px', marginBottom:0 }}>
                  <label>Max Score</label>
                  <input id="q-max" type="number" min={1} max={100} value={form.maxScore} onChange={e => setForm({...form, maxScore: parseInt(e.target.value)})} required />
                </div>
                <button id="add-question-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ marginBottom:0 }}>
                  {loading ? 'Adding…' : '+ Add Question'}
                </button>
              </div>
            </form>
          </div>

          {questions.length > 0 && (
            <div>
              <h3 style={{ fontWeight:700, marginBottom:14 }}>Added Questions</h3>
              {questions.map((q, i) => (
                <div key={q._id} className="card" style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                    <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(108,99,255,0.2)', color:'var(--accent-2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'.8rem', flexShrink:0 }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, marginBottom:6 }}>{q.text}</div>
                      <div style={{ fontSize:'.8rem', color:'var(--text-2)', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 12px' }}>
                        <span style={{ color:'var(--text-3)', fontSize:'.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>Reference: </span>{q.referenceAnswer}
                      </div>
                      <div style={{ marginTop:6, fontSize:'.78rem', color:'var(--text-2)' }}>Max Score: <b style={{ color:'var(--accent-2)' }}>{q.maxScore}</b></div>
                    </div>
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
