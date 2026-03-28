import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.2), transparent), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(34,211,238,0.1), transparent), var(--bg-base)' }}>
      <nav className="navbar">
        <span className="navbar-brand">EasyExam</span>
        <div className="navbar-actions">
          <Link to="/login"  className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '100px 24px 60px', textAlign: 'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:999, background:'rgba(108,99,255,0.12)', border:'1px solid rgba(108,99,255,0.25)', color:'var(--accent-2)', fontSize:'.8rem', fontWeight:600, marginBottom:24 }}>
          🧠 AI-Powered Subjective Answer Evaluation
        </div>
        <h1 style={{ fontSize:'clamp(2.2rem,6vw,3.8rem)', fontWeight:800, lineHeight:1.1, marginBottom:20 }}>
          Grade Smarter,<br />
          <span style={{ background:'linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Not Harder</span>
        </h1>
        <p style={{ fontSize:'1.1rem', color:'var(--text-2)', maxWidth:560, margin:'0 auto 40px' }}>
          EasyExam automatically evaluates subjective answers using TF-IDF, cosine similarity, and keyword matching. Built for teachers who value their time.
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/signup?role=teacher" className="btn btn-primary">Start as Teacher →</Link>
          <Link to="/signup?role=student" className="btn btn-ghost">Join as Student</Link>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16, marginTop:72, textAlign:'left' }}>
          {[
            { icon:'⚡', title:'Instant Scoring', desc:'Answers auto-evaluated with NLP in milliseconds' },
            { icon:'🔑', title:'6-Digit Classroom Code', desc:'Students join with a simple shareable code' },
            { icon:'✏️', title:'Teacher Override', desc:'Always adjust AI scores with manual review' },
            { icon:'📊', title:'Detailed Feedback', desc:'Matched keywords, similarity score, grade' },
          ].map(f => (
            <div key={f.title} className="card" style={{ gap:8 }}>
              <div style={{ fontSize:'1.6rem', marginBottom:8 }}>{f.icon}</div>
              <div style={{ fontWeight:700, fontSize:'.95rem' }}>{f.title}</div>
              <div style={{ fontSize:'.82rem', color:'var(--text-2)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
