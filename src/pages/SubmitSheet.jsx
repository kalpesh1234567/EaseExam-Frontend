import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function SubmitSheet() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/exams/${examId}`).then(r => {
      setExam(r.data.exam);
      // Ensure student hasn't already submitted
      if (r.data.submission) {
        navigate(`/my-result/${examId}`);
      }
      setLoading(false);
    }).catch(e => {
      setError('Exam not found');
      setLoading(false);
    });
  }, [examId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a file to upload');
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('sheetUrl', file);

    try {
      await api.post(`/submissions/${examId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/my-result/${examId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
      setUploading(false);
    }
  };

  if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner"/></div></>;
  if (error && !exam) return <><Navbar /><div className="container" style={{paddingTop:40}}><div className="alert alert-error">{error}</div></div></>;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="page-header" style={{ textAlign:'center' }}>
            <h2 className="page-title">{exam.title}</h2>
            <p className="page-subtitle">Upload your written answer sheet for evaluation</p>
          </div>

          <div className="card">
            {error && <div className="alert alert-error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div style={{ textAlign:'center', padding:'40px 20px', border:'2px dashed var(--border)', borderRadius:'var(--radius)', marginBottom:24, background:'rgba(255,255,255,0.01)' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📑</div>
                <h3 style={{ marginBottom:8, fontWeight:600 }}>Select PDF or Image file</h3>
                <p style={{ fontSize:'.85rem', color:'var(--text-2)', marginBottom:20 }}>Must contain all answers clearly written. Max 10MB.</p>
                <input 
                  type="file" 
                  accept=".pdf,image/png,image/jpeg,image/jpg" 
                  onChange={e => setFile(e.target.files[0])} 
                  style={{ maxWidth:'100%', margin:'0 auto' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'14px', fontSize:'1rem' }} disabled={uploading}>
                {uploading ? 'Uploading to Evaluation Engine...' : 'Upload & Evaluate'}
              </button>
            </form>

            <div style={{ marginTop:24, fontSize:'.8rem', color:'var(--text-3)', lineHeight:1.6, background:'rgba(0,0,0,0.2)', padding:'12px 16px', borderRadius:8 }}>
              <strong style={{ color:'var(--text-1)' }}>How it works:</strong>
              <ul style={{ margin:'8px 0 0 16px', padding:0 }}>
                <li>Your file is processed by an OCR engine to extract handwritten or typed text.</li>
                <li>An AI model analyzes your answers against the professor's solution key.</li>
                <li>Meaning and concepts are evaluated, not just exact word matching.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
