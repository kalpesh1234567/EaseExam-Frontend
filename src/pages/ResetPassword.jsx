import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function PasswordInput({ id, value, onChange, placeholder, required = true, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className="input"
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

export default function ResetPassword() {
  const { token } = useParams();
  const { login } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    
    setError('');
    setLoading(true);

    try {
      const { data } = await api.put(`/auth/resetpassword/${token}`, { password });
      login(data.user, data.token);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:20 }}>
        <div className="card" style={{ maxWidth: 440, width: '100%', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>✅</div>
          <h2 className="card-title" style={{ fontSize:'1.8rem', marginBottom:12 }}>Password Reset Successful!</h2>
          <p className="card-meta" style={{ marginBottom:24 }}>
            Your account has been securely recovered and you are now logged in.
          </p>
          <Link to="/" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:20 }}>
      <div className="card" style={{ maxWidth: 440, width: '100%' }}>
        <h2 className="card-title" style={{ textAlign:'center', fontSize:'1.8rem' }}>Set New Password</h2>
        <p className="card-meta" style={{ textAlign:'center', marginBottom:24 }}>
          Enter a strong new password for your account.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="form-group">
            <label>New Password</label>
            <PasswordInput
              id="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              minLength="6"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop:8 }} disabled={loading}>
            {loading ? 'Saving...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
