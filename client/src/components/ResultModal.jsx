import React, { useEffect } from 'react';
import ScoreRing from './ScoreRing';
import KeywordGap from './KeywordGap';
import FeedbackCard from './FeedbackCard';

const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  return '#ef4444';
};

export default function ResultModal({ resume, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!resume) return null;
  const { fileName, targetRole, aiFeedback, createdAt } = resume;
  const { overallScore, sections = [], missingKeywords = [], strengths = [] } = aiFeedback || {};

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="Full analysis result">
      <div style={styles.panel} className="fade-in">
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Resume Analysis</h2>
            <div style={styles.meta}>
              <span style={styles.metaItem}>📄 {fileName}</span>
              <span style={styles.metaDivider}>·</span>
              <span style={styles.metaItem}>🎯 {targetRole}</span>
              <span style={styles.metaDivider}>·</span>
              <span style={styles.metaItem}>🗓 {formatDate(createdAt)}</span>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close modal">✕</button>
        </div>

        <div style={styles.body}>
          {/* Score Hero */}
          <div style={styles.scoreHero} className="glass-card">
            <div style={styles.scoreLeft}>
              <ScoreRing score={overallScore} size={160} />
            </div>
            <div style={styles.scoreRight}>
              <h3 style={styles.scoreTitle}>Overall Score</h3>
              <p style={styles.scoreSub}>
                Scored <strong style={{ color: '#ff6b35' }}>{overallScore}/100</strong> for{' '}
                <strong style={{ color: '#f7931e' }}>{targetRole}</strong>
              </p>
              <div style={styles.miniScores}>
                {sections.slice(0, 4).map((s, i) => (
                  <div key={i} style={styles.miniScore}>
                    <div style={styles.miniLabel}>
                      <span>{s.name}</span>
                      <span style={{ color: getScoreColor(s.score) }}>{s.score}</span>
                    </div>
                    <div style={styles.miniTrack}>
                      <div style={{ height: '100%', width: `${s.score}%`, background: getScoreColor(s.score), borderRadius: 3, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div style={styles.grid} className="result-modal-grid">
            <div>
              <h3 style={styles.sectionHeading}><span style={styles.bar} />Section Analysis</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sections.map((s, i) => <FeedbackCard key={i} section={s} index={i} />)}
              </div>
            </div>
            <div>
              <h3 style={styles.sectionHeading}><span style={styles.bar} />Keywords & Strengths</h3>
              <KeywordGap keywords={missingKeywords} strengths={strengths} />

              <div style={styles.tipsCard} className="glass-card">
                <h4 style={styles.tipsTitle}>💡 Pro Tips</h4>
                <ul style={styles.tipsList}>
                  <li>Add missing keywords naturally in Skills & Experience sections.</li>
                  <li>Quantify achievements with numbers and outcomes.</li>
                  <li>Keep bullet points to 1–2 lines; cut filler words.</li>
                  <li>Tailor your summary to the exact job description language.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    background: 'rgba(8,8,18,0.85)',
    backdropFilter: 'blur(12px)',
    overflowY: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 16px',
  },
  panel: {
    width: '100%',
    maxWidth: 1100,
    background: '#0f0f1e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    gap: 16,
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#f0f0ff',
    marginBottom: 8,
  },
  meta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  metaItem: { fontSize: '0.82rem', color: '#808098' },
  metaDivider: { color: '#333350' },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#a0a0c0',
    borderRadius: 8,
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1rem',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  body: { padding: '28px 32px 40px' },
  scoreHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    padding: '28px 32px',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  scoreLeft: { flexShrink: 0 },
  scoreRight: { flex: 1, minWidth: 240 },
  scoreTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#f0f0ff',
    marginBottom: 6,
  },
  scoreSub: { fontSize: '0.9rem', color: '#808098', lineHeight: 1.6, marginBottom: 16 },
  miniScores: { display: 'flex', flexDirection: 'column', gap: 8 },
  miniScore: {},
  miniLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#a0a0c0',
    marginBottom: 4,
  },
  miniTrack: {
    height: 4,
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)',
    gap: 28,
    alignItems: 'start',
  },
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#f0f0ff',
    marginBottom: 14,
  },
  bar: {
    display: 'block',
    width: 4,
    height: 20,
    background: 'linear-gradient(to bottom, #ff6b35, #f7931e)',
    borderRadius: 2,
    flexShrink: 0,
  },
  tipsCard: { padding: '18px', marginTop: 20 },
  tipsTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '0.95rem',
    color: '#f0f0ff',
    marginBottom: 10,
  },
  tipsList: {
    paddingLeft: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    color: '#808098',
    fontSize: '0.84rem',
    lineHeight: 1.6,
  },
};
