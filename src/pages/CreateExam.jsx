import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function CreateExam() {
  const [form, setForm] = useState({ title: '', subject: '', maxMarks: 100, description: '', classroomId: '' });
  const [questions, setQuestions] = useState([{ questionNo: 1, text: '', modelAnswer: '', maxMarks: 10 }]);
  const [answerKeyFile, setAnswerKeyFile] = useState(null);
  const [questionPaperFile, setQuestionPaperFile] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/classrooms')
      .then(res => setClassrooms(res.data))
      .catch(() => setError('Failed to load classrooms. Please create one first.'));
  }, []);

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionNo: questions.length + 1, text: '', modelAnswer: '', maxMarks: 10 }]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) return;
    const updated = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, questionNo: i + 1 }));
    setQuestions(updated);
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
      // Step 1: Create exam
      const { data: exam } = await api.post('/exams', { ...form, classroomId: form.classroomId });

      // Step 2: Upload question paper PDF if provided
      if (questionPaperFile) {
        const paperFormData = new FormData();
        paperFormData.append('questionPaper', questionPaperFile);
        await api.post(`/exams/${exam._id}/question-paper`, paperFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Step 3: Upload answer key
      const keyFormData = new FormData();
      keyFormData.append('questionsJson', JSON.stringify(questions));
      if (answerKeyFile) keyFormData.append('answerKey', answerKeyFile);
      await api.post(`/answer-keys/${exam._id}`, keyFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate(`/exam-results/${exam._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = { marginBottom: 24 };
  const stepHeaderStyle = { fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 };
  const stepBadgeStyle = { background: 'var(--primary-color)', color: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', fontWeight: 700, flexShrink: 0 };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="page-header">
            <h2 className="page-title">Create New Exam</h2>
            <p className="page-subtitle">Set up exam details, upload the question paper, and define the answer key for AI evaluation.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            {/* ─── STEP 1: Basic Details ─── */}
            <div className="card" style={cardStyle}>
              <h3 style={stepHeaderStyle}>
                <span style={stepBadgeStyle}>1</span> Basic Details
              </h3>
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
                <label>Select Classroom</label>
                <select value={form.classroomId} onChange={e => setForm({...form, classroomId: e.target.value})} required>
                  <option value="">-- Select a Classroom --</option>
                  {classrooms.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Total Max Marks</label>
                <input type="number" min="1" value={form.maxMarks} onChange={e => setForm({...form, maxMarks: parseInt(e.target.value)})} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Description / Instructions</label>
                <textarea placeholder="Optional exam instructions for students..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>

            {/* ─── STEP 2: Question Paper Upload ─── */}
            <div className="card" style={cardStyle}>
              <h3 style={stepHeaderStyle}>
                <span style={stepBadgeStyle}>2</span> Question Paper PDF
                <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--text-3)', marginLeft: 4 }}>(Optional — students can download & read)</span>
              </h3>
              <div
                style={{
                  border: questionPaperFile ? '2px solid var(--primary-color)' : '2px dashed var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  background: questionPaperFile ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.01)',
                  transition: 'all .2s',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>📄</div>
                {questionPaperFile ? (
                  <>
                    <div style={{ fontWeight: 600, color: 'var(--primary-color)', marginBottom: 6 }}>
                      ✅ {questionPaperFile.name}
                    </div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-3)', marginBottom: 12 }}>
                      {(questionPaperFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQuestionPaperFile(null)}>
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Upload Question Paper PDF</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--text-2)', marginBottom: 16 }}>
                      Students will be able to download this before submitting their answer sheets.
                    </div>
                    <label
                      htmlFor="qp-upload"
                      className="btn btn-ghost btn-sm"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      📂 Choose PDF File
                    </label>
                    <input
                      id="qp-upload"
                      type="file"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      onChange={e => setQuestionPaperFile(e.target.files[0] || null)}
                    />
                  </>
                )}
              </div>
            </div>

            {/* ─── STEP 3: Answer Key ─── */}
            <div className="card" style={cardStyle}>
              <h3 style={stepHeaderStyle}>
                <span style={stepBadgeStyle}>3</span> Answer Key (Solution)
              </h3>
              <div className="form-group">
                <label>Upload Official Key PDF/Image <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(Optional reference)</span></label>
                <input type="file" accept=".pdf,image/*" onChange={e => setAnswerKeyFile(e.target.files[0])} />
                <div className="form-hint">AI evaluation uses the structured answers below, not this file.</div>
              </div>

              <div className="divider" />
              <label style={{ fontWeight: 600 }}>Define Questions & Model Answers</label>
              <div className="form-hint" style={{ marginBottom: 16 }}>The AI evaluates student answer sheets against these.</div>

              {questions.map((q, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, color: 'var(--accent-2)' }}>Question {q.questionNo}</div>
                    {questions.length > 1 && (
                      <button type="button" onClick={() => handleRemoveQuestion(i)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '.8rem' }}>
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Question Text (Optional)</label>
                    <input type="text" placeholder="..." value={q.text} onChange={e => handleQuestionChange(i, 'text', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Model Answer / Key Points <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(Optional if PDF uploaded)</span></label>
                    <textarea placeholder="Describe what a perfect answer contains..." value={q.modelAnswer} onChange={e => handleQuestionChange(i, 'modelAnswer', e.target.value)} style={{ minHeight: 70 }} />
                    <div className="form-hint" style={{ fontSize: '.7rem', marginTop: 4 }}>Required for AI evaluation. If left blank, we'll try extracting from the PDF above.</div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Max Marks</label>
                    <input type="number" min="1" value={q.maxMarks} onChange={e => handleQuestionChange(i, 'maxMarks', parseInt(e.target.value))} required style={{ maxWidth: 120 }} />
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddQuestion}>+ Add Another Question</button>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px 32px' }}>
                {loading ? 'Creating Exam...' : '🚀 Create Exam & Key'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}
