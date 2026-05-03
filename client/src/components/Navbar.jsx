import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: 'Analyze' },
    { to: '/history', label: 'History' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🔥</span>
          <span style={styles.logoText}>
            Roast<span style={styles.logoAccent}>Resume</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={styles.links}>
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                ...styles.link,
                ...(location.pathname === to ? styles.linkActive : {}),
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          style={styles.mobileBtn}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={styles.mobileMenu}>
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={styles.mobileLink}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(8, 8, 18, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  logoIcon: { fontSize: '1.5rem' },
  logoText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#f0f0ff',
  },
  logoAccent: { color: '#ff6b35' },
  links: { display: 'flex', gap: 8, alignItems: 'center' },
  link: {
    padding: '6px 16px',
    borderRadius: 8,
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#a0a0c0',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  linkActive: {
    color: '#ff6b35',
    background: 'rgba(255,107,53,0.1)',
  },
  mobileBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '#f0f0ff',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '8px',
  },
  mobileMenu: {
    padding: '12px 24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  mobileLink: {
    padding: '10px 12px',
    borderRadius: 8,
    color: '#a0a0c0',
    textDecoration: 'none',
    fontWeight: 500,
  },
};
