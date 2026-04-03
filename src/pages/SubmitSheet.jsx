import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://easeexam-backend.onrender.com';

// Convert dataURL → File object
function dataURLtoFile(dataUrl, filename) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

export default function SubmitSheet() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Upload mode: 'pdf' | 'image' | 'camera'
  const [mode, setMode] = useState('pdf');

  // For pdf / image file picker
  const [selectedFile, setSelectedFile] = useState(null);

  // For camera mode
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]); // array of dataURL strings
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'user' | 'environment'

  useEffect(() => {
    api.get(`/exams/${examId}`).then(r => {
      setExam(r.data.exam);
      if (r.data.submission) navigate(`/my-result/${examId}`);
      setLoading(false);
    }).catch(() => {
      setError('Exam not found');
      setLoading(false);
    });
  }, [examId, navigate]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // ── Camera helpers ────────────────────────────────────────────────
  const startCamera = async (facing = facingMode) => {
    setCameraError('');
    try {
      if (streamRef.current) stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError('Camera access denied or not available. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const flipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhotos(prev => [...prev, dataUrl]);
  };

  const removePhoto = (index) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const retakeAll = () => {
    setCapturedPhotos([]);
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let fileToUpload = null;

    if (mode === 'pdf' || mode === 'image') {
      if (!selectedFile) return setError('Please select a file to upload.');
      fileToUpload = selectedFile;
    } else if (mode === 'camera') {
      if (capturedPhotos.length === 0) return setError('Please capture at least one photo.');
      // If single photo, upload as-is. If multiple, upload the first one with a note.
      // For now, we upload each photo as separate files using index 0 for evaluation
      fileToUpload = dataURLtoFile(capturedPhotos[0], `captured_sheet_${Date.now()}.jpg`);
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('sheetUrl', fileToUpload);

    // If camera mode with multiple pages, append extras as additional files
    if (mode === 'camera' && capturedPhotos.length > 1) {
      capturedPhotos.slice(1).forEach((photo, i) => {
        formData.append('extraPages', dataURLtoFile(photo, `page_${i + 2}_${Date.now()}.jpg`));
      });
    }

    try {
      await api.post(`/submissions/${examId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      stopCamera();
      navigate(`/my-result/${examId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
      setUploading(false);
    }
  };

  if (loading) return <><Navbar /><div className="spinner-wrap"><div className="spinner"/></div></>;
  if (error && !exam) return <><Navbar /><div className="container" style={{ paddingTop: 40 }}><div className="alert alert-error">{error}</div></div></>;

  const tabStyle = (active) => ({
    flex: 1,
    padding: '12px 8px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '.9rem',
    transition: 'all .2s',
    background: active ? 'var(--primary-color)' : 'transparent',
    color: active ? '#fff' : 'var(--text-2)',
  });

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="container" style={{ maxWidth: 680 }}>

          {/* Header */}
          <div className="page-header" style={{ textAlign: 'center' }}>
            <h2 className="page-title">{exam.title}</h2>
            <p className="page-subtitle">{exam.subject} — Upload your written answer sheet</p>
          </div>

          {/* Question paper download banner */}
          {exam.questionPaperUrl && (
            <a
              href={`${SERVER}${exam.questionPaperUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 'var(--radius)', padding: '14px 20px', marginBottom: 24,
                textDecoration: 'none', color: 'inherit',
                transition: 'background .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
            >
              <span style={{ fontSize: '1.6rem' }}>📄</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>View / Download Question Paper</div>
                <div style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>Click to open the PDF provided by your teacher</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--primary-color)', fontSize: '1.2rem' }}>↗</span>
            </a>
          )}

          <div className="card">
            {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

            {/* Mode Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 4, marginBottom: 24 }}>
              <button type="button" id="tab-pdf" style={tabStyle(mode === 'pdf')} onClick={() => { setMode('pdf'); stopCamera(); }}>
                📎 Upload PDF
              </button>
              <button type="button" id="tab-image" style={tabStyle(mode === 'image')} onClick={() => { setMode('image'); stopCamera(); }}>
                🖼️ Upload Image
              </button>
              <button type="button" id="tab-camera" style={tabStyle(mode === 'camera')} onClick={() => { setMode('camera'); }}>
                📷 Use Camera
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* ── PDF MODE ── */}
              {mode === 'pdf' && (
                <div style={{ textAlign: 'center', padding: '32px 20px', border: `2px dashed ${selectedFile ? 'var(--primary-color)' : 'var(--border)'}`, borderRadius: 'var(--radius)', marginBottom: 24, background: selectedFile ? 'rgba(99,102,241,0.04)' : 'rgba(255,255,255,0.01)', transition: 'all .2s' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📑</div>
                  {selectedFile ? (
                    <>
                      <div style={{ fontWeight: 700, color: 'var(--primary-color)', marginBottom: 6 }}>✅ {selectedFile.name}</div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-3)', marginBottom: 14 }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedFile(null)}>Change File</button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>Select your Answer Sheet PDF</div>
                      <div style={{ fontSize: '.83rem', color: 'var(--text-2)', marginBottom: 18 }}>Max 10 MB. Must contain all your answers clearly.</div>
                      <label htmlFor="pdf-pick" className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        📂 Browse PDF
                      </label>
                      <input id="pdf-pick" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setSelectedFile(e.target.files[0] || null)} />
                    </>
                  )}
                </div>
              )}

              {/* ── IMAGE MODE ── */}
              {mode === 'image' && (
                <div style={{ textAlign: 'center', padding: '32px 20px', border: `2px dashed ${selectedFile ? 'var(--primary-color)' : 'var(--border)'}`, borderRadius: 'var(--radius)', marginBottom: 24, background: selectedFile ? 'rgba(99,102,241,0.04)' : 'rgba(255,255,255,0.01)', transition: 'all .2s' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🖼️</div>
                  {selectedFile ? (
                    <>
                      <img src={URL.createObjectURL(selectedFile)} alt="preview" style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 8, marginBottom: 10, objectFit: 'contain' }} />
                      <div style={{ fontWeight: 700, color: 'var(--primary-color)', marginBottom: 6 }}>✅ {selectedFile.name}</div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-3)', marginBottom: 14 }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedFile(null)}>Change Image</button>
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>Select a Photo of your Answer Sheet</div>
                      <div style={{ fontSize: '.83rem', color: 'var(--text-2)', marginBottom: 18 }}>JPG or PNG. Ensure good lighting and readable handwriting.</div>
                      <label htmlFor="img-pick" className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        🖼️ Browse Image
                      </label>
                      <input id="img-pick" type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: 'none' }} onChange={e => setSelectedFile(e.target.files[0] || null)} />
                    </>
                  )}
                </div>
              )}

              {/* ── CAMERA MODE ── */}
              {mode === 'camera' && (
                <div style={{ marginBottom: 24 }}>
                  {cameraError && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: '.9rem' }}>
                      {cameraError}
                    </div>
                  )}

                  {/* Camera Viewfinder */}
                  {!cameraActive ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', background: 'rgba(0,0,0,0.2)', marginBottom: 16 }}>
                      <div style={{ fontSize: '3rem', marginBottom: 12 }}>📷</div>
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>Camera Answer Capture</div>
                      <div style={{ fontSize: '.83rem', color: 'var(--text-2)', marginBottom: 20 }}>
                        Use your device camera to photograph each page of your handwritten answer sheet.
                      </div>
                      <button type="button" id="btn-start-camera" className="btn btn-primary" onClick={() => startCamera()}>
                        📷 Start Camera
                      </button>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', background: '#000', marginBottom: 12 }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', maxHeight: 360, objectFit: 'cover', display: 'block' }}
                      />
                      {/* Camera overlay controls */}
                      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button
                          type="button"
                          title="Flip Camera"
                          onClick={flipCamera}
                          style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          🔄
                        </button>
                        <button
                          type="button"
                          title="Stop Camera"
                          onClick={stopCamera}
                          style={{ background: 'rgba(239,68,68,0.8)', border: 'none', color: '#fff', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ✕
                        </button>
                      </div>
                      {/* Shutter button */}
                      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)' }}>
                        <button
                          type="button"
                          id="btn-capture"
                          onClick={capturePhoto}
                          style={{
                            width: 64, height: 64, borderRadius: '50%',
                            border: '4px solid #fff',
                            background: 'rgba(255,255,255,0.9)',
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', border: '2px solid #ccc' }} />
                        </button>
                      </div>
                      {/* Page count badge */}
                      {capturedPhotos.length > 0 && (
                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'var(--primary-color)', color: '#fff', borderRadius: 99, padding: '4px 12px', fontSize: '.8rem', fontWeight: 700 }}>
                          {capturedPhotos.length} page{capturedPhotos.length > 1 ? 's' : ''} captured
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hidden canvas for capture */}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {/* Captured photo thumbnails */}
                  {capturedPhotos.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: '.9rem' }}>Captured Pages ({capturedPhotos.length})</div>
                        <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', fontSize: '.8rem' }} onClick={retakeAll}>
                          🗑 Clear All
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                        {capturedPhotos.map((photo, i) => (
                          <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '3/4', border: '2px solid var(--border)' }}>
                            <img src={photo} alt={`Page ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '.65rem', textAlign: 'center', padding: '2px 0', fontWeight: 700 }}>
                              Pg {i + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => removePhoto(i)}
                              style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: '.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 10, fontSize: '.78rem', color: 'var(--text-3)' }}>
                        💡 Tip: Capture each page separately. The AI will evaluate the first page. Ensure handwriting is clear.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-submit-sheet"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                disabled={uploading}
              >
                {uploading
                  ? '⏳ Uploading to Evaluation Engine...'
                  : mode === 'camera' && capturedPhotos.length > 0
                    ? `🚀 Submit ${capturedPhotos.length} Page${capturedPhotos.length > 1 ? 's' : ''} for Evaluation`
                    : '🚀 Upload & Evaluate'}
              </button>
            </form>

            {/* How it works */}
            <div style={{ marginTop: 24, fontSize: '.8rem', color: 'var(--text-3)', lineHeight: 1.7, background: 'rgba(0,0,0,0.2)', padding: '14px 16px', borderRadius: 8 }}>
              <strong style={{ color: 'var(--text-1)' }}>How it works:</strong>
              <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                <li>Your file is processed by an OCR engine to extract handwritten or typed text.</li>
                <li>An AI model analyzes your answers against the professor's solution key.</li>
                <li>Meanings and concepts are evaluated, not just exact word matching.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
