import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <div style={s.brand}>
          <span style={{ fontSize: '1.2rem' }}>🔥</span>
          <span style={s.brandText}>Roast<span style={s.accent}>Resume</span></span>
        </div>
        <p style={s.tagline}>Brutally honest AI resume feedback. Fix it before they bin it.</p>
        <div style={s.links}>
          <Link to="/" style={s.link}>Analyze</Link>
          <span style={s.dot}>·</span>
          <Link to="/history" style={s.link}>History</Link>
        </div>
        <p style={s.copy}>© {new Date().getFullYear()} RoastResume. Built with 🔥 and Gemini AI.</p>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: '#fff',
    borderTop: '1px solid #e5e7eb',
    padding: '32px 24px 28px',
    marginTop: 40,
  },
  inner:     { maxWidth: 600, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  brand:     { display: 'flex', alignItems: 'center', gap: 6 },
  brandText: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#111827' },
  accent:    { color: '#ff6b35' },
  tagline:   { fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 },
  links:     { display: 'flex', alignItems: 'center', gap: 10 },
  link:      { fontSize: '0.83rem', color: '#9ca3af', textDecoration: 'none', fontWeight: 500 },
  dot:       { color: '#d1d5db' },
  copy:      { fontSize: '0.78rem', color: '#d1d5db', marginTop: 4 },
};