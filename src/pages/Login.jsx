import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function PasswordInput({ id, value, onChange, placeholder, required = true }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{ paddingRight: 44, width: '100%', boxSizing: 'border-box' }}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: 'var(--text-3)', fontSize: '1.1rem', display: 'flex', alignItems: 'center',
          lineHeight: 1
        }}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') || 'student');
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.user.role !== role) {
        setError(`This account is registered as a ${data.user.role}. Please select the correct role.`);
        setLoading(false); return;
      }
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>EasyExam</h1>
          <p>Sign in to continue</p>
        </div>
        <div className="auth-tabs">
          <button id="tab-student" className={`auth-tab ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>Student</button>
          <button id="tab-teacher" className={`auth-tab ${role === 'teacher' ? 'active' : ''}`} onClick={() => setRole('teacher')}>Teacher</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username or Email</label>
            <input id="login-username" type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Enter username or email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <PasswordInput
              id="login-password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="Enter password"
            />
          </div>
          <div style={{ textAlign:'right', marginTop:-8, marginBottom:16 }}>
            <Link to="/forgot-password" style={{ fontSize:'.85rem', color:'var(--text-3)' }}>Forgot Password?</Link>
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
            {loading ? 'Signing in…' : `Sign in as ${role === 'teacher' ? 'Teacher' : 'Student'}`}
          </button>
        </form>
        <div style={{ textAlign:'center', marginTop:20, fontSize:'.85rem', color:'var(--text-2)' }}>
          Don't have an account? <Link to={`/signup?role=${role}`} style={{ color:'var(--accent-2)', fontWeight:600 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
