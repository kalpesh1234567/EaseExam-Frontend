import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function CreateClassroom() {
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/classrooms', form);
      navigate(`/classroom/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create classroom');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="page-header">
            <h2 className="page-title">Create Classroom</h2>
            <p className="page-subtitle">Students will join using the auto-generated code</p>
          </div>
          <div className="card">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Classroom Name</label>
                <input id="classroom-name" type="text" placeholder="e.g. Database Management Systems" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description <span style={{ fontWeight:400, textTransform:'none', color:'var(--text-3)' }}>(optional)</span></label>
                <textarea id="classroom-desc" placeholder="Brief description of the classroom…" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div style={{ display:'flex', gap:12, marginTop:8 }}>
                <button id="create-classroom-submit" type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create Classroom'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
