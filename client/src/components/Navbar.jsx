import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { to: '/',        label: 'Analyze' },
    { to: '/history', label: 'History' },
  ];

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.logo}>
          <span style={s.logoIcon}>🔥</span>
          <span style={s.logoText}>Roast<span style={s.logoAccent}>Resume</span></span>
        </Link>

        {/* Desktop Links */}
        <div style={s.desktopLinks}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{ ...s.navLink, ...(pathname === l.to ? s.navLinkActive : {}) }}>
              {l.label}
            </Link>
          ))}
          <Link to="/" style={s.ctaBtn}>Get Roasted 🔥</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          style={s.hamburger}
          aria-label="Toggle menu"
        >
          <span style={{ ...s.bar, transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <span style={{ ...s.bar, opacity: open ? 0 : 1 }} />
          <span style={{ ...s.bar, transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={s.mobileMenu}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={s.mobileLink} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <Link to="/" style={s.mobileCta} onClick={() => setOpen(false)}>Get Roasted 🔥</Link>
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  inner: {
    maxWidth: 1100, margin: '0 auto', padding: '0 24px',
    height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo:      { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  logoIcon:  { fontSize: '1.4rem' },
  logoText:  { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#111827' },
  logoAccent:{ color: '#ff6b35' },

  desktopLinks: { display: 'flex', alignItems: 'center', gap: 4 },
  navLink: {
    padding: '6px 14px', borderRadius: 8,
    fontWeight: 600, fontSize: '0.88rem', color: '#374151',
    transition: 'all 0.15s', textDecoration: 'none',
  },
  navLinkActive: { background: '#fff8f5', color: '#ff6b35' },
  ctaBtn: {
    marginLeft: 8, padding: '7px 16px',
    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
    borderRadius: 8, color: '#fff',
    fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
    boxShadow: '0 2px 8px rgba(255,107,53,0.3)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },

  hamburger: {
    display: 'none', flexDirection: 'column', gap: 4,
    background: 'none', border: 'none', padding: 4, cursor: 'pointer',
    '@media(max-width:640px)': { display: 'flex' },
  },
  bar: {
    display: 'block', width: 22, height: 2,
    background: '#374151', borderRadius: 2,
    transition: 'all 0.25s ease',
  },
  mobileMenu: {
    display: 'flex', flexDirection: 'column',
    padding: '12px 24px 16px',
    borderTop: '1px solid #e5e7eb',
    gap: 4, background: '#fff',
  },
  mobileLink: {
    padding: '10px 14px', borderRadius: 8, fontWeight: 600,
    color: '#374151', textDecoration: 'none', fontSize: '0.9rem',
  },
  mobileCta: {
    marginTop: 6, padding: '10px 14px',
    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
    borderRadius: 8, color: '#fff',
    fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
    textAlign: 'center',
  },
};
