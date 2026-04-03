import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function PasswordInput({ id, value, onChange, placeholder, required = true, minLength }) {
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
        minLength={minLength}
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

export default function Signup() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') || 'student');
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', username:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { ...form, role });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const f = (field) => ({ value: form[field], onChange: e => setForm({...form, [field]: e.target.value}), required: true });

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <h1>EasyExam</h1>
          <p>Create your account</p>
        </div>
        <div className="auth-tabs">
          <button id="tab-student" className={`auth-tab ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>Student</button>
          <button id="tab-teacher" className={`auth-tab ${role === 'teacher' ? 'active' : ''}`} onClick={() => setRole('teacher')}>Teacher</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input id="first-name" type="text" placeholder="Alice" {...f('firstName')} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input id="last-name" type="text" placeholder="Smith" {...f('lastName')} />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input id="email" type="email" placeholder="alice@example.com" {...f('email')} />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input id="username" type="text" placeholder="alicesmith" {...f('username')} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <PasswordInput
              id="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="Min 6 characters"
              minLength={6}
            />
          </div>
          <button id="signup-submit" type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
            {loading ? 'Creating account…' : `Create ${role === 'teacher' ? 'Teacher' : 'Student'} Account`}
          </button>
        </form>
        <div style={{ textAlign:'center', marginTop:20, fontSize:'.85rem', color:'var(--text-2)' }}>
          Already have an account? <Link to={`/login?role=${role}`} style={{ color:'var(--accent-2)', fontWeight:600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
