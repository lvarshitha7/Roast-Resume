import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import ScoreRing from '../components/ScoreRing';
import FeedbackCard from '../components/FeedbackCard';
import KeywordGap from '../components/KeywordGap';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ResultPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const result    = location.state?.result;
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  if (!result) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyIcon}>🔥</p>
        <h2 style={styles.emptyTitle}>No results yet</h2>
        <p style={styles.emptySub}>Upload your resume on the home page to get started.</p>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Go Home</button>
      </div>
    );
  }

  const { fileName, targetRole, aiFeedback } = result;
  const { overallScore, sections, missingKeywords, strengths } = aiFeedback;

  const handleSave = async () => {
    if (saved) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('fileName',      fileName);
      formData.append('targetRole',    targetRole);
      formData.append('extractedText', result.extractedText || 'N/A');
      formData.append('aiFeedback',    JSON.stringify(aiFeedback));
      formData.append('fileSize',      String(result.fileSize || 0));
      formData.append('mimeType',      result.mimeType || '');

      await axios.post(`${API}/api/resume/save`, formData);
      setSaved(true);
      toast.success('Result saved to history! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save result.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div className="container">

        {/* ─── Top Bar ───────────────────────────────────────── */}
        <div style={styles.topBar}>
          <button onClick={() => navigate('/')} style={styles.backLink}>
            ← Analyze Another
          </button>
          <div style={styles.topActions}>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              style={{
                ...styles.saveBtn,
                opacity: saved ? 0.7 : 1,
              }}
            >
              {saved ? '✓ Saved' : saving ? 'Saving…' : '💾 Save Result'}
            </button>
            <button onClick={() => navigate('/history')} style={styles.historyBtn}>
              View History
            </button>
          </div>
        </div>

        {/* ─── Header ────────────────────────────────────────── */}
        <div style={styles.header} className="fade-in">
          <h1 style={styles.title}>Resume Analysis</h1>
          <div style={styles.meta}>
            <span style={styles.metaItem}>📄 {fileName}</span>
            <span style={styles.metaDivider}>·</span>
            <span style={styles.metaItem}>🎯 {targetRole}</span>
          </div>
        </div>

        {/* ─── Score Hero ─────────────────────────────────────── */}
        <div style={styles.scoreHero} className="glass-card fade-in-delay-1">
          <div style={styles.scoreLeft}>
            <ScoreRing score={overallScore} size={200} />
          </div>
          <div style={styles.scoreRight}>
            <h2 style={styles.scoreTitle}>Overall Score</h2>
            <p style={styles.scoreSub}>
              Your resume scored <strong style={{ color: '#ff6b35' }}>{overallScore}/100</strong>{' '}
              for the role of <strong style={{ color: '#f7931e' }}>{targetRole}</strong>.
            </p>

            {/* Section mini-scores */}
            <div style={styles.miniScores}>
              {sections.slice(0, 4).map((s, i) => (
                <div key={i} style={styles.miniScore}>
                  <div style={styles.miniScoreLabel}>
                    <span>{s.name}</span>
                    <span style={{ color: getScoreColor(s.score) }}>{s.score}</span>
                  </div>
                  <div style={styles.miniBarTrack}>
                    <div style={{
                      ...styles.miniBarFill,
                      width: `${s.score}%`,
                      background: getScoreColor(s.score),
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Two Column Layout ──────────────────────────────── */}
        <div style={styles.grid}>
          {/* Left — Section Cards */}
          <div style={styles.leftCol}>
            <h2 style={styles.sectionHeading}>
              <span style={styles.headingBar} />
              Section Analysis
            </h2>
            <div style={styles.sectionList}>
              {sections.map((s, i) => (
                <FeedbackCard key={i} section={s} index={i} />
              ))}
            </div>
          </div>

          {/* Right — Keywords & Strengths */}
          <div style={styles.rightCol}>
            <h2 style={styles.sectionHeading}>
              <span style={styles.headingBar} />
              Keywords & Strengths
            </h2>
            <KeywordGap keywords={missingKeywords} strengths={strengths} />

            {/* Quick tips */}
            <div style={styles.tipsCard} className="glass-card">
              <h3 style={styles.tipsTitle}>💡 Pro Tips</h3>
              <ul style={styles.tipsList}>
                <li>Add missing keywords naturally in your Skills & Experience sections.</li>
                <li>Quantify achievements: "Led team of 5" → "Led team of 5, shipping 3 features/mo".</li>
                <li>Keep bullet points to 1–2 lines; remove filler words.</li>
                <li>Tailor your summary to match the exact job description language.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  return '#ef4444';
};

const styles = {
  page: { padding: '32px 0 80px', minHeight: '100vh' },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    flexWrap: 'wrap',
    gap: 12,
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#a0a0c0',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '6px 0',
    transition: 'color 0.2s',
  },
  topActions: { display: 'flex', gap: 10 },
  saveBtn: {
    padding: '8px 20px',
    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  historyBtn: {
    padding: '8px 20px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#a0a0c0',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  header: { marginBottom: 28 },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '2rem',
    fontWeight: 800,
    color: '#f0f0ff',
    marginBottom: 8,
  },
  meta: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  metaItem: { fontSize: '0.88rem', color: '#808098' },
  metaDivider: { color: '#404060' },
  scoreHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 40,
    padding: '36px 40px',
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  scoreLeft: { flexShrink: 0, display: 'flex', justifyContent: 'center' },
  scoreRight: { flex: 1, minWidth: 260 },
  scoreTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#f0f0ff',
    marginBottom: 8,
  },
  scoreSub: {
    fontSize: '0.95rem',
    color: '#808098',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  miniScores: { display: 'flex', flexDirection: 'column', gap: 10 },
  miniScore: {},
  miniScoreLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#a0a0c0',
    marginBottom: 4,
  },
  miniBarTrack: {
    height: 5,
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
    gap: 28,
    alignItems: 'start',
  },
  leftCol: {},
  rightCol: { display: 'flex', flexDirection: 'column', gap: 24 },
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#f0f0ff',
    marginBottom: 16,
  },
  headingBar: {
    display: 'block',
    width: 4,
    height: 22,
    background: 'linear-gradient(to bottom, #ff6b35, #f7931e)',
    borderRadius: 2,
    flexShrink: 0,
  },
  sectionList: { display: 'flex', flexDirection: 'column', gap: 12 },
  tipsCard: { padding: '20px' },
  tipsTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '1rem',
    color: '#f0f0ff',
    marginBottom: 12,
  },
  tipsList: {
    paddingLeft: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    color: '#808098',
    fontSize: '0.855rem',
    lineHeight: 1.6,
  },
  empty: {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    textAlign: 'center',
    padding: 24,
  },
  emptyIcon: { fontSize: '3rem' },
  emptyTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#f0f0ff',
  },
  emptySub: { color: '#606080', fontSize: '0.95rem' },
  backBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginTop: 8,
  },
};
