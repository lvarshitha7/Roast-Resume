import React, { useState } from 'react';

const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  return '#ef4444';
};

const getSectionIcon = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('summ') || lower.includes('object')) return '👤';
  if (lower.includes('skill'))   return '⚡';
  if (lower.includes('experi'))  return '🏢';
  if (lower.includes('project')) return '🚀';
  if (lower.includes('educat'))  return '🎓';
  if (lower.includes('cert'))    return '🏅';
  if (lower.includes('achieve')) return '🏆';
  return '📌';
};

export default function FeedbackCard({ section, index }) {
  const [expanded, setExpanded] = useState(true);
  const color = getScoreColor(section.score);
  const icon  = getSectionIcon(section.name);

  return (
    <div
      style={{
        ...styles.card,
        animationDelay: `${index * 0.08}s`,
      }}
      className="fade-in"
    >
      {/* Header */}
      <div style={styles.header} onClick={() => setExpanded(!expanded)} role="button" tabIndex={0}>
        <div style={styles.titleRow}>
          <span style={styles.icon}>{icon}</span>
          <span style={styles.name}>{section.name}</span>
        </div>
        <div style={styles.right}>
          <span style={{ ...styles.scoreBadge, color, borderColor: `${color}40`, background: `${color}15` }}>
            {section.score}/100
          </span>
          <span style={{ color: '#606080', fontSize: '0.85rem', marginLeft: 8 }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Score Bar */}
      <div style={styles.barTrack}>
        <div
          style={{
            ...styles.barFill,
            width: `${section.score}%`,
            background: color,
          }}
        />
      </div>

      {/* Body */}
      {expanded && (
        <div style={styles.body}>
          <div style={styles.feedbackBlock}>
            <p style={styles.label}>📋 Feedback</p>
            <p style={styles.text}>{section.feedback}</p>
          </div>
          <div style={styles.fixBlock}>
            <p style={styles.label}>🔧 How to fix</p>
            <p style={styles.text}>{section.fix}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    overflow: 'hidden',
    transition: 'border-color 0.2s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: 10 },
  icon: { fontSize: '1.2rem' },
  name: {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#f0f0ff',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  right: { display: 'flex', alignItems: 'center' },
  scoreBadge: {
    padding: '3px 10px',
    borderRadius: 100,
    fontSize: '0.8rem',
    fontWeight: 700,
    border: '1px solid',
  },
  barTrack: {
    height: 3,
    background: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
  },
  body: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  feedbackBlock: {},
  fixBlock: {
    background: 'rgba(255,107,53,0.04)',
    border: '1px solid rgba(255,107,53,0.12)',
    borderRadius: 10,
    padding: '12px 14px',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#606080',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  text: {
    fontSize: '0.9rem',
    color: '#c0c0e0',
    lineHeight: 1.65,
  },
};
