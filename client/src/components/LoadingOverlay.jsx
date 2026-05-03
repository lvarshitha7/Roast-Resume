import React from 'react';

const MESSAGES = [
  'Extracting resume text…',
  'Sending to AI engine…',
  'Analyzing sections…',
  'Scoring your resume…',
  'Identifying keyword gaps…',
  'Generating fix suggestions…',
  'Almost done…',
];

export default function LoadingOverlay({ message }) {
  const [msgIndex, setMsgIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.overlay} role="status" aria-live="polite" aria-label="Processing your resume">
      <div style={styles.card}>
        {/* Fire animation */}
        <div style={styles.fireContainer} aria-hidden="true">
          <span style={styles.fire}>🔥</span>
        </div>

        {/* Spinner */}
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinnerOuter} />
          <div style={styles.spinnerInner} />
        </div>

        <h2 style={styles.title}>Analyzing Your Resume</h2>
        <p style={styles.message}>{message || MESSAGES[msgIndex]}</p>

        {/* Progress dots */}
        <div style={styles.dots} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ ...styles.dot, animationDelay: `${i * 0.25}s` }} />
          ))}
        </div>

        <p style={styles.sub}>This usually takes 10–20 seconds</p>
      </div>

      <style>{`
        @keyframes fire-pulse {
          0%, 100% { transform: scale(1) rotate(-3deg); }
          50%       { transform: scale(1.2) rotate(3deg); }
        }
        @keyframes spin-cw  { to { transform: rotate(360deg); } }
        @keyframes spin-ccw { to { transform: rotate(-360deg); } }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 999,
    background: 'rgba(8, 8, 18, 0.92)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: '48px 56px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24,
    backdropFilter: 'blur(16px)',
    maxWidth: 380,
    width: '100%',
    textAlign: 'center',
  },
  fireContainer: { fontSize: '2.8rem', animation: 'fire-pulse 1.5s ease-in-out infinite' },
  fire: {},
  spinnerWrapper: { position: 'relative', width: 56, height: 56 },
  spinnerOuter: {
    position: 'absolute',
    inset: 0,
    border: '3px solid rgba(255,107,53,0.15)',
    borderTopColor: '#ff6b35',
    borderRadius: '50%',
    animation: 'spin-cw 0.9s linear infinite',
  },
  spinnerInner: {
    position: 'absolute',
    inset: 8,
    border: '2px solid rgba(247,147,30,0.15)',
    borderBottomColor: '#f7931e',
    borderRadius: '50%',
    animation: 'spin-ccw 0.7s linear infinite',
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#f0f0ff',
  },
  message: {
    fontSize: '0.9rem',
    color: '#a0a0c0',
    minHeight: 22,
    transition: 'opacity 0.3s ease',
  },
  dots: { display: 'flex', gap: 6 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#ff6b35',
    animation: 'dot-bounce 1.2s ease-in-out infinite',
  },
  sub: { fontSize: '0.78rem', color: '#404060' },
};
