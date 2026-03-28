import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/forgotpassword', { email });
      setMessage(data.message || 'Email sent successfully. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:20 }}>
      <div className="card" style={{ maxWidth: 440, width: '100%' }}>
        <h2 className="card-title" style={{ textAlign:'center', fontSize:'1.8rem' }}>Reset Password</h2>
        <p className="card-meta" style={{ textAlign:'center', marginBottom:24 }}>
          Enter the email address you used to register, and we will send you a secure link to reset your password.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success" style={{ background:'rgba(16,185,129,0.1)', color:'var(--green)', padding:16, borderRadius:8, marginBottom:20 }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="form-group">
            <label>Registered Email</label>
            <input 
              type="email" 
              className="input" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="e.g., student@university.edu"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop:8 }} disabled={loading}>
            {loading ? 'Sending Email...' : 'Send Rest Link'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:24, fontSize:'.9rem' }}>
          Remember your password? <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}
