import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { openPdf } from '../utils/openPdf';

export default function MyResult() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState({});

  useEffect(() => {
    api.get(`/results/student/${examId}`).then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(err => {
      // If 404, it means no submission. Redirect to submit sheet.
      if (err.response?.status === 404) {
        navigate(`/submit-sheet/${examId}`);
      } else {
        setError('Failed to load result');
      }
      setLoading(false);
    });
  }, [examId, navigate]);

  if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner"/></div></>;
  if (error) return <><Navbar /><div className="container" style={{paddingTop:40}}><div className="alert alert-error">{error}</div></div></>;

  const { status, errorMsg, exam, evaluation, questionScores, fileUrl, submissionId } = data;

  if (status === 'pending') {
    return (
      <><Navbar />
      <div className="page"><div className="container" style={{maxWidth:600, textAlign:'center', paddingTop:60}}>
        <div style={{ fontSize:'3rem', marginBottom:20 }}>⏳</div>
        <h2 style={{ marginBottom:10 }}>Evaluation in Progress</h2>
        <p style={{ color:'var(--text-2)' }}>The AI engine is currently analyzing your answer sheet. Please check back in a minute.</p>
        <button className="btn btn-primary" style={{ marginTop:24 }} onClick={() => window.location.reload()}>Refresh Status</button>
      </div></div></>
    );
  }

  if (status === 'failed') {
    return (
      <><Navbar />
      <div className="page"><div className="container" style={{maxWidth:600, textAlign:'center', paddingTop:60}}>
        <div style={{ fontSize:'3rem', marginBottom:20 }}>❌</div>
        <h2 style={{ marginBottom:10 }}>Failed to Evaluate</h2>
        <p style={{ color:'var(--red)' }}>{errorMsg || 'Unable to extract text from your document or AI evaluation failed.'}</p>
      </div></div></>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth:800 }}>
          <div className="page-header" style={{ textAlign:'center', position: 'relative' }}>
            <h2 className="page-title" style={{ fontSize:'2.2rem' }}>{exam.title} Output</h2>
            <p className="page-subtitle">{exam.subject}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
              {exam.questionPaperUrl && (
                <button
                  onClick={() => openPdf(`/files/question-paper/${examId}`, (v) => setPdfLoading(p => ({ ...p, qp: v })))}
                  disabled={pdfLoading.qp}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary-color)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', background: 'transparent' }}
                >
                  {pdfLoading.qp ? '⏳ Loading...' : '📄 View Question Paper'}
                </button>
              )}
              {fileUrl && (
                <button
                  onClick={() => openPdf(`/files/answer-sheet/${submissionId}`, (v) => setPdfLoading(p => ({ ...p, sheet: v })))}
                  disabled={pdfLoading.sheet || !submissionId}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--green)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', background: 'transparent' }}
                >
                  {pdfLoading.sheet ? '⏳ Loading...' : '📝 View My Answer Sheet'}
                </button>
              )}
            </div>
          </div>

          <div className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-around', padding:'32px 24px', marginBottom:32, background:'linear-gradient(145deg, rgba(20,24,36,0.8), rgba(10,13,20,0.9))' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'.85rem', color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>Total Score</div>
              <div style={{ fontSize:'2.5rem', fontWeight:700, color:'var(--accent-2)', lineHeight:1 }}>{evaluation.totalScore}<span style={{fontSize:'1.2rem', color:'var(--text-3)'}}>/{exam.maxMarks}</span></div>
            </div>
            <div style={{ width:1, height:60, background:'var(--border)' }} />
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'.85rem', color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>Percentage</div>
              <div style={{ fontSize:'2.5rem', fontWeight:700, lineHeight:1 }}>{Math.round(evaluation.percentage)}%</div>
            </div>
            <div style={{ width:1, height:60, background:'var(--border)' }} />
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'.85rem', color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>Grade</div>
              <div style={{ fontSize:'2.5rem', fontWeight:700, color: evaluation.percentage >= 40 ? 'var(--green)' : 'var(--red)', lineHeight:1 }}>{evaluation.grade}</div>
            </div>
          </div>

          <h3 style={{ fontWeight:700, marginBottom:20, fontSize:'1.3rem' }}>Question-wise Feedback ({questionScores.length})</h3>
          
          {questionScores.map(qs => (
            <div key={qs._id} className="card" style={{ marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight:700, fontSize:'1.1rem' }}>Question {qs.questionNo}</div>
                <div style={{ padding:'6px 14px', background:'rgba(16,185,129,0.1)', color:'var(--green)', borderRadius:99, fontWeight:700 }}>
                  {qs.marksObtained} / {qs.maxMarks} Marks
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:'.8rem', textTransform:'uppercase', color:'var(--text-3)', fontWeight:600, marginBottom:8 }}>Extracted Answer Snippet</div>
                <div style={{ fontSize:'.95rem', color:'var(--text-2)', background:'rgba(255,255,255,0.02)', padding:14, borderRadius:8, fontFamily:"'JetBrains Mono', monospace", whiteSpace:'pre-wrap' }}>
                  {qs.studentAnswer || '(No text extracted for this section)'}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                <div>
                  <div style={{ fontSize:'.8rem', textTransform:'uppercase', color:'var(--accent-2)', fontWeight:600, marginBottom:8 }}>Evaluation Feedback</div>
                  <div style={{ fontSize:'.95rem', lineHeight:1.6 }}>{qs.feedback}</div>
                </div>
                <div>
                  <div style={{ fontSize:'.8rem', textTransform:'uppercase', color:'var(--yellow)', fontWeight:600, marginBottom:8 }}>Suggestions for Improvement</div>
                  <div style={{ fontSize:'.95rem', lineHeight:1.6 }}>{qs.suggestion}</div>
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </>
  );
}
