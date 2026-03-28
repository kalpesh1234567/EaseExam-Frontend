import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
      // Log the user in with the newly returned token
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
            <input 
              type="password" 
              className="input" 
              required 
              minLength="6"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              className="input" 
              required 
              minLength="6"
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop:8 }} disabled={loading}>
            {loading ? 'Saving...' : 'Set Password Component'}
          </button>
        </form>
      </div>
    </div>
  );
}
