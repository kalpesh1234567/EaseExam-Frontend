import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { openPdf } from '../utils/openPdf';


const STATUS_CONFIG = {
  not_submitted: { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af', label: 'NOT SUBMITTED' },
  pending:       { bg: 'rgba(251,191,36,0.15)',  color: 'var(--yellow)', label: 'PENDING' },
  evaluating:    { bg: 'rgba(59,130,246,0.15)',  color: 'var(--accent)', label: 'EVALUATING' },
  evaluated:     { bg: 'rgba(16,185,129,0.15)',  color: 'var(--green)',  label: 'EVALUATED' },
  failed:        { bg: 'rgba(239,68,68,0.15)',   color: 'var(--red)',    label: 'FAILED' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_submitted;
  return (
    <span style={{
      padding: '4px 10px', borderRadius: 99, fontSize: '.72rem', fontWeight: 700,
      backgroundColor: cfg.bg, color: cfg.color, letterSpacing: '0.03em', whiteSpace: 'nowrap'
    }}>
      {cfg.label}
    </span>
  );
}

export default function ExamResults() {
  const { examId } = useParams();
  const [exam, setExam]       = useState(null);
  const [allStudents, setAllStudents] = useState([]); // enrolled + their submission status
  const [evalMap, setEvalMap] = useState({});          // studentId → evaluation details
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('all');
  const [pdfLoading, setPdfLoading] = useState({});

  useEffect(() => {
    Promise.all([
      api.get(`/exams/${examId}`),
      api.get(`/exams/${examId}/submissions-status`),   // all enrolled students + status
      api.get(`/results/teacher/${examId}`),            // evaluated students with scores
      api.get(`/analytics/${examId}`),
    ]).then(([exRes, statusRes, resRes, statRes]) => {
      setExam(exRes.data.exam);
      setAllStudents(statusRes.data.students || []);
      // Build a map of studentId → evaluation data from results endpoint
      const map = {};
      for (const r of resRes.data) {
        map[r.student._id] = { submissionId: r.submissionId, fileUrl: r.fileUrl, evaluation: r.evaluation };
      }
      setEvalMap(map);
      setStats(statRes.data);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load exam data');
      setLoading(false);
    });
  }, [examId]);

  if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner"/></div></>;
  if (error)   return <><Navbar /><div className="container" style={{paddingTop:40}}><div className="alert alert-error">{error}</div></div></>;

  const handleExport = async (format) => {
    try {
      const res = await api.get(`/export/${examId}/${format}`, { responseType: 'blob' });
      const mimeType = format === 'pdf' ? 'application/pdf' : 'text/csv';
      const ext = format === 'pdf' ? 'pdf' : 'csv';
      const url = window.URL.createObjectURL(new Blob([res.data], { type: mimeType }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exam?.title?.replace(/\s+/g, '_') || 'Results'}_Results.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleExportCSV = () => handleExport('csv');
  const handleExportPDF = () => handleExport('pdf');

  const filtered = allStudents.filter(s => {
    if (filter === 'submitted')     return s.hasSubmitted;
    if (filter === 'not_submitted') return !s.hasSubmitted;
    return true;
  });

  const submittedCount    = allStudents.filter(s => s.hasSubmitted).length;
  const notSubmittedCount = allStudents.length - submittedCount;
  const evaluatedCount    = allStudents.filter(s => s.status === 'evaluated').length;

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container">
          {/* Header */}
          <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <Link to="/teacher-dashboard" style={{ color:'var(--text-2)', textDecoration:'none', fontSize:'.9rem' }}>
                ← Back to Dashboard
              </Link>
              <h2 className="page-title" style={{ marginTop:8 }}>{exam.title} — Student Overview</h2>
              <p className="page-subtitle">{exam.subject} • Max Marks: {exam.maxMarks}</p>
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button className="btn btn-ghost" onClick={handleExportCSV}>📄 Export CSV</button>
              <button className="btn btn-primary" onClick={handleExportPDF}>📑 Export PDF</button>
            </div>
          </div>

          {/* Stats row */}
          <div className="stats-row" style={{ marginBottom:28 }}>
            <div className="stat-card">
              <span className="stat-label">Total Enrolled</span>
              <span className="stat-value">{allStudents.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Submitted</span>
              <span className="stat-value" style={{ color:'var(--green)' }}>{submittedCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Not Submitted</span>
              <span className="stat-value" style={{ color: notSubmittedCount > 0 ? 'var(--red)' : 'inherit' }}>
                {notSubmittedCount}
              </span>
            </div>
            {stats && (
              <>
                <div className="stat-card">
                  <span className="stat-label">Evaluated</span>
                  <span className="stat-value" style={{ color:'var(--accent-2)' }}>
                    {evaluatedCount}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Avg Score</span>
                  <span className="stat-value">
                    {stats.avgScore}
                    <span style={{ fontSize:'1rem', color:'var(--text-3)' }}>
                      {' '}({Math.round((stats.avgScore / exam.maxMarks) * 100)}%)
                    </span>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Table card */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            {/* Card header with filter tabs */}
            <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.02)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <h3 style={{ fontWeight:600, fontSize:'1rem', margin:0 }}>
                All Enrolled Students
                <span style={{ marginLeft:8, fontSize:'.8rem', color:'var(--text-3)', fontWeight:400 }}>
                  ({filtered.length} of {allStudents.length})
                </span>
              </h3>
              <div style={{ display:'flex', gap:8 }}>
                {['all', 'submitted', 'not_submitted'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding:'5px 12px', borderRadius:99, fontSize:'.75rem', fontWeight:600,
                      border: filter === f ? '2px solid var(--accent)' : '2px solid var(--border)',
                      background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: filter === f ? 'var(--accent)' : 'var(--text-2)',
                      cursor:'pointer'
                    }}
                  >
                    {f === 'all' ? `All (${allStudents.length})` : f === 'submitted' ? `Submitted (${submittedCount})` : `Not Submitted (${notSubmittedCount})`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX:'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding:48, textAlign:'center', color:'var(--text-3)' }}>
                  No students to display.
                </div>
              ) : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ textAlign:'left', borderBottom:'1px solid var(--border)', fontSize:'.78rem', color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.05em', background:'rgba(255,255,255,0.01)' }}>
                      <th style={{ padding:'14px 24px', fontWeight:600 }}>Student</th>
                      <th style={{ padding:'14px 24px', fontWeight:600 }}>Submission</th>
                      <th style={{ padding:'14px 24px', fontWeight:600 }}>Score</th>
                      <th style={{ padding:'14px 24px', fontWeight:600 }}>%</th>
                      <th style={{ padding:'14px 24px', fontWeight:600 }}>Grade</th>
                      <th style={{ padding:'14px 24px', fontWeight:600 }}>Sheet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, idx) => {
                      const evalData   = evalMap[s.student._id];
                      const evaluation = evalData?.evaluation;
                      const fileUrl    = s.fileUrl || evalData?.fileUrl;
                      const isLast     = idx === filtered.length - 1;

                      return (
                        <tr key={s.student._id} style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                          {/* Student info */}
                          <td style={{ padding:'14px 24px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{
                                width:32, height:32, borderRadius:'50%', flexShrink:0,
                                background: s.hasSubmitted
                                  ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                                  : 'rgba(107,114,128,0.2)',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontWeight:700, fontSize:'.8rem', color: s.hasSubmitted ? 'white' : 'var(--text-3)'
                              }}>
                                {s.student.firstName[0]}{s.student.lastName[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight:600, fontSize:'.875rem' }}>
                                  {s.student.firstName} {s.student.lastName}
                                </div>
                                <div style={{ fontSize:'.75rem', color:'var(--text-3)' }}>
                                  {s.student.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Status badge */}
                          <td style={{ padding:'14px 24px' }}>
                            <StatusBadge status={s.status} />
                          </td>

                          {/* Score */}
                          <td style={{ padding:'14px 24px', fontWeight:600, color: evaluation ? 'var(--accent-2)' : 'var(--text-3)' }}>
                            {evaluation ? `${evaluation.totalScore} / ${exam.maxMarks}` : '—'}
                          </td>

                          {/* Percentage */}
                          <td style={{ padding:'14px 24px', color: evaluation ? 'inherit' : 'var(--text-3)' }}>
                            {evaluation ? `${Math.round(evaluation.percentage)}%` : '—'}
                          </td>

                          {/* Grade */}
                          <td style={{ padding:'14px 24px', fontWeight:700, color: evaluation ? 'var(--accent)' : 'var(--text-3)' }}>
                            {evaluation ? evaluation.grade : '—'}
                          </td>

                          {/* Sheet link */}
                          <td style={{ padding:'14px 24px' }}>
                            {fileUrl ? (
                              <button
                                onClick={() => {
                                  const sid = evalData?.submissionId;
                                  if (sid) openPdf(`/files/answer-sheet/${sid}`, (v) => setPdfLoading(p => ({ ...p, [sid]: v })));
                                }}
                                disabled={!evalData?.submissionId || pdfLoading[evalData?.submissionId]}
                                style={{ color:'var(--accent)', textDecoration:'underline', fontSize:'.85rem', background:'none', border:'none', cursor:'pointer', padding:0 }}
                              >
                                {pdfLoading[evalData?.submissionId] ? '⏳...' : 'View PDF'}
                              </button>
                            ) : (
                              <span style={{ color:'var(--text-3)', fontSize:'.85rem' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
