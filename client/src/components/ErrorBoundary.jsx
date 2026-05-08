import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.page}>
          <div style={styles.card}>
            <div style={styles.icon}>🔥</div>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.sub}>
              An unexpected error occurred. Please refresh the page or go back to home.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <pre style={styles.detail}>
                {this.state.error?.message}
              </pre>
            )}
            <div style={styles.actions}>
              <button
                style={styles.primaryBtn}
                onClick={() => window.location.replace('/')}
              >
                ← Go Home
              </button>
              <button
                style={styles.ghostBtn}
                onClick={() => window.location.reload()}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#080812',
    padding: 24,
  },
  card: {
    maxWidth: 480,
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: '48px 40px',
    textAlign: 'center',
    backdropFilter: 'blur(16px)',
  },
  icon: { fontSize: '3rem', marginBottom: 16 },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#f0f0ff',
    marginBottom: 12,
  },
  sub: {
    fontSize: '0.95rem',
    color: '#808098',
    lineHeight: 1.7,
    marginBottom: 24,
  },
  detail: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 10,
    padding: '12px 16px',
    color: '#fca5a5',
    fontSize: '0.8rem',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    marginBottom: 24,
  },
  actions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  ghostBtn: {
    padding: '10px 24px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#a0a0c0',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
};
