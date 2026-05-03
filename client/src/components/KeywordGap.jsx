import React from 'react';

export default function KeywordGap({ keywords = [], strengths = [] }) {
  return (
    <div style={styles.wrapper}>
      {/* Missing Keywords */}
      <div style={styles.section}>
        <h3 style={styles.heading}>
          <span style={styles.headingIcon}>🚫</span>
          Missing Keywords
          <span style={styles.count}>{keywords.length}</span>
        </h3>
        {keywords.length === 0 ? (
          <p style={styles.empty}>No missing keywords detected. Great job!</p>
        ) : (
          <div style={styles.chips}>
            {keywords.map((kw, i) => (
              <span key={i} style={styles.chipKeyword}>
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Strengths */}
      <div style={styles.section}>
        <h3 style={styles.heading}>
          <span style={styles.headingIcon}>✅</span>
          Strengths
          <span style={{ ...styles.count, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
            {strengths.length}
          </span>
        </h3>
        {strengths.length === 0 ? (
          <p style={styles.empty}>No strengths detected. Consider enriching your resume.</p>
        ) : (
          <div style={styles.chips}>
            {strengths.map((s, i) => (
              <span key={i} style={styles.chipStrength}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '20px',
  },
  section: { marginBottom: 4 },
  heading: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '1rem',
    fontWeight: 700,
    color: '#f0f0ff',
    fontFamily: "'Space Grotesk', sans-serif",
    marginBottom: 12,
  },
  headingIcon: { fontSize: '1rem' },
  count: {
    padding: '2px 8px',
    borderRadius: 100,
    fontSize: '0.75rem',
    fontWeight: 700,
    background: 'rgba(239,68,68,0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.2)',
    marginLeft: 4,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipKeyword: {
    padding: '5px 12px',
    borderRadius: 100,
    fontSize: '0.8rem',
    fontWeight: 500,
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.22)',
    color: '#fca5a5',
  },
  chipStrength: {
    padding: '5px 12px',
    borderRadius: 100,
    fontSize: '0.8rem',
    fontWeight: 500,
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.22)',
    color: '#86efac',
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    margin: '16px 0',
  },
  empty: {
    fontSize: '0.875rem',
    color: '#606080',
    fontStyle: 'italic',
  },
};
