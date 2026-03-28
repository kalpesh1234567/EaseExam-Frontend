import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function CreateExam() {
  const [form, setForm] = useState({ title: '', subject: '', maxMarks: 100, description: '' });
  const [questions, setQuestions] = useState([{ questionNo: 1, text: '', modelAnswer: '', maxMarks: 10 }]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionNo: questions.length + 1, text: '', modelAnswer: '', maxMarks: 10 }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      // 1. Create Exam
      const { data: exam } = await api.post('/exams', form);

      // 2. Upload Answer Key
      const formData = new FormData();
      formData.append('questionsJson', JSON.stringify(questions));
      if (file) formData.append('answerKey', file);

      await api.post(`/answer-keys/${exam._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate(`/exam-results/${exam._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="page-header">
            <h2 className="page-title">Create New Exam</h2>
            <p className="page-subtitle">Configure the exam details and provide the solution key for AI evaluation.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            
            <div className="card" style={{ marginBottom:24 }}>
              <h3 style={{ fontWeight:700, marginBottom:16 }}>1. Basic Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Exam Title</label>
                  <input type="text" placeholder="e.g. Midterm 1" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" placeholder="e.g. Data Structures" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Total Max Marks</label>
                <input type="number" min="1" value={form.maxMarks} onChange={e => setForm({...form, maxMarks: parseInt(e.target.value)})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Optional instructions..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>

            <div className="card" style={{ marginBottom:24 }}>
              <h3 style={{ fontWeight:700, marginBottom:16 }}>2. Answer Key (Solution)</h3>
              <div className="form-group">
                <label>Upload Official Key (PDF/Image) - Optional reference</label>
                <input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files[0])} />
                <div className="form-hint">Used for reference, but AI evaluation relies on the structured questions below.</div>
              </div>
              
              <div className="divider" />
              <label>Define Questions & Model Answers</label>
              <div className="form-hint" style={{ marginBottom:16 }}>The AI evaluates student submissions against these model answers.</div>

              {questions.map((q, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:16, marginBottom:12 }}>
                  <div style={{ fontWeight:600, color:'var(--accent-2)', marginBottom:12 }}>Question {q.questionNo}</div>
                  <div className="form-group">
                    <label>Question Text (Optional)</label>
                    <input type="text" placeholder="..." value={q.text} onChange={e => handleQuestionChange(i, 'text', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Model Answer / Key Points</label>
                    <textarea placeholder="Describe what a perfect answer contains..." value={q.modelAnswer} onChange={e => handleQuestionChange(i, 'modelAnswer', e.target.value)} required style={{ minHeight:60 }} />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label>Max Marks for this question</label>
                    <input type="number" min="1" value={q.maxMarks} onChange={e => handleQuestionChange(i, 'maxMarks', parseInt(e.target.value))} required style={{ maxWidth: 120 }} />
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddQuestion}>+ Add Another Question</button>
            </div>

            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding:'12px 32px' }}>
                {loading ? 'Creating Exam...' : 'Create Exam & Key'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}
