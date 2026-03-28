import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function CreateTest() {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', description:'', startTime:'', endTime:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/tests', { ...form, classroomId });
      navigate(`/add-question/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create test');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth:560 }}>
          <div className="page-header">
            <h2 className="page-title">Create Test</h2>
            <p className="page-subtitle">Set the test window — students can only submit during this time</p>
          </div>
          <div className="card">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Test Name</label>
                <input id="test-name" type="text" placeholder="e.g. Unit 1 – Midterm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description <span style={{ fontWeight:400, textTransform:'none', color:'var(--text-3)' }}>(optional)</span></label>
                <textarea placeholder="Instructions or notes for students…" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input id="start-time" type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input id="end-time" type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required />
                </div>
              </div>
              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <button id="create-test-submit" type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create Test & Add Questions →'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
