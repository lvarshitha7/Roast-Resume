import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import FileUpload from '../components/FileUpload';
import RoleSelector from '../components/RoleSelector';
import LoadingOverlay from '../components/LoadingOverlay';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FEATURE_CARDS = [
  { icon: '🎯', title: 'Precision Scoring', desc: 'Section-by-section scores (0–100) powered by GPT-3.5' },
  { icon: '🔍', title: 'Keyword Gap Analysis', desc: 'See exactly which keywords hiring managers look for' },
  { icon: '🔧', title: 'Fix Suggestions', desc: 'Concrete, actionable improvements for each section' },
  { icon: '📊', title: 'Instant Results', desc: 'Full analysis in under 20 seconds' },
];

export default function LandingPage() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please upload your resume first.');
    if (!role) return toast.error('Please select a target role.');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', role);

      const { data } = await axios.post(`${API}/api/resume/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      if (!data.success) throw new Error(data.error || 'Analysis failed.');

      // Navigate to result page with state
      navigate('/result', { state: { result: data.data } });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />}

      <div style={styles.page}>
        {/* ─── Hero ────────────────────────────────────── */}
        <section style={styles.hero}>
          <div style={styles.heroInner}>
            <div style={styles.badge}>
              <span>🔥</span> Roast Resume
            </div>

            <h1 style={styles.heroTitle}>
              Land the Interview.
              <br />
              <span style={styles.gradientText}>
                Not The Rejection.
              </span>
            </h1>

            <p style={styles.heroSub}>
              Upload your resume and get feedback, ruthless resume roasting,
              weak-point detection, and recruiter-style criticism before the real recruiters see it.
            </p>

            {/* Upload Form */}
            <div style={styles.formCard} className="glass-card">
              <div style={styles.formStep}>
                <span style={styles.stepBadge}>01</span>
                <p style={styles.stepLabel}>Upload Your Resume</p>
              </div>
              <FileUpload file={file} onFileChange={setFile} />

              <div style={{ ...styles.formStep, marginTop: 24 }}>
                <span style={styles.stepBadge}>02</span>
                <p style={styles.stepLabel}>Select Target Role</p>
              </div>
              <RoleSelector value={role} onChange={setRole} />

              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={loading || !file || !role}
                style={{
                  ...styles.analyzeBtn,
                  opacity: (!file || !role) ? 0.55 : 1,
                  cursor: (!file || !role) ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Analyzing…' : '🔥 Roast My Resume'}
              </button>

              <p style={styles.formNote}>
                ✅ PDF or DOCX · Max 5 MB · Free to use · No account needed
              </p>
            </div>
          </div>
        </section>

        {/* ─── Feature Cards ────────────────────────────── */}
        <section style={styles.features}>
          <div className="container">
            <h2 style={styles.featuresTitle}>What you'll get</h2>
            <div style={styles.featureGrid}>
              {FEATURE_CARDS.map((f, i) => (
                <div key={i} style={styles.featureCard} className="glass-card fade-in">
                  <span style={styles.featureIcon}>{f.icon}</span>
                  <h3 style={styles.featureCardTitle}>{f.title}</h3>
                  <p style={styles.featureCardDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works ─────────────────────────────── */}
        <section style={styles.howItWorks}>
          <div className="container">
            <h2 style={styles.featuresTitle}>How it works</h2>
            <div style={styles.stepsRow}>
              {[
                { num: '1', title: 'Upload', desc: 'Drop in your PDF or DOCX resume' },
                { num: '2', title: 'Select Role', desc: 'Tell us what job you\'re targeting' },
                { num: '3', title: 'AI Analyzes', desc: 'GPT-3.5 scores each section in seconds' },
                { num: '4', title: 'Improve', desc: 'Use fix suggestions to land the interview' },
              ].map((step, i) => (
                <div key={i} style={styles.step}>
                  <div style={styles.stepNum}>{step.num}</div>
                  <h4 style={styles.stepTitle}>{step.title}</h4>
                  <p style={styles.stepDesc}>{step.desc}</p>
                  {i < 3 && <div style={styles.stepArrow} aria-hidden="true">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const styles = {
  page: { minHeight: '100vh' },
  hero: {
    padding: '80px 24px 60px',
    display: 'flex',
    justifyContent: 'center',
  },
  heroInner: {
    maxWidth: 640,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    textAlign: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 18px',
    background: 'rgba(255,107,53,0.12)',
    border: '1px solid rgba(255,107,53,0.25)',
    borderRadius: 100,
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#ff6b35',
  },
  heroTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
    fontWeight: 800,
    lineHeight: 1.12,
    letterSpacing: '-0.02em',
    color: '#f0f0ff',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd700 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    fontSize: '1.05rem',
    color: '#808098',
    lineHeight: 1.7,
    maxWidth: 520,
  },
  formCard: {
    width: '100%',
    padding: '32px',
    marginTop: 8,
    textAlign: 'left',
  },
  formStep: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 800,
    color: '#fff',
    flexShrink: 0,
  },
  stepLabel: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#c0c0e0',
  },
  analyzeBtn: {
    width: '100%',
    marginTop: 24,
    padding: '15px',
    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: '1.05rem',
    fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.01em',
    boxShadow: '0 4px 24px rgba(255,107,53,0.35)',
    transition: 'all 0.2s ease',
  },
  formNote: {
    marginTop: 12,
    fontSize: '0.78rem',
    color: '#404060',
    textAlign: 'center',
  },
  features: { padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.05)' },
  featuresTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#f0f0ff',
    textAlign: 'center',
    marginBottom: 32,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 20,
  },
  featureCard: { padding: '28px 24px', textAlign: 'center' },
  featureIcon: { fontSize: '2rem', display: 'block', marginBottom: 14 },
  featureCardTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '1.05rem',
    color: '#f0f0ff',
    marginBottom: 8,
  },
  featureCardDesc: { fontSize: '0.88rem', color: '#808098', lineHeight: 1.6 },
  howItWorks: {
    padding: '40px 0 80px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  stepsRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 0,
    position: 'relative',
  },
  step: {
    flex: '1 1 180px',
    maxWidth: 220,
    textAlign: 'center',
    padding: '0 12px',
    position: 'relative',
  },
  stepNum: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(247,147,30,0.2))',
    border: '2px solid rgba(255,107,53,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 800,
    fontSize: '1.1rem',
    color: '#ff6b35',
    margin: '0 auto 14px',
  },
  stepTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '1rem',
    color: '#f0f0ff',
    marginBottom: 6,
  },
  stepDesc: { fontSize: '0.85rem', color: '#606080', lineHeight: 1.55 },
  stepArrow: {
    position: 'absolute',
    right: -16,
    top: 12,
    fontSize: '1.5rem',
    color: 'rgba(255,107,53,0.4)',
  },
};
