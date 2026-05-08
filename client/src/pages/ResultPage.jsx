import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getScoreColor = (s) => {
  if (s >= 8) return '#16a34a';
  if (s >= 6) return '#65a30d';
  if (s >= 4) return '#d97706';
  return '#dc2626';
};

const getRating = (s) => {
  if (s >= 8) return { label: 'Excellent', emoji: '🏆' };
  if (s >= 6) return { label: 'Good',      emoji: '👍' };
  if (s >= 4) return { label: 'Average',   emoji: '⚠️' };
  return           { label: 'Needs Work',  emoji: '🔥' };
};

export default function ResultPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const result    = state?.result;

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `🔥 Roast Resume Results\n📄 ${fileName}\n🎯 Role: ${targetRole}\n⭐ Score: ${overallScore}/10 (${getRating(overallScore).label})\n\nAnalyzed at resumeflame.app`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch { toast.error('Could not copy.'); }
  };

  const handlePrint = () => window.print();

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔥</div>
          <p style={{ color: '#6b7280', marginBottom: 20 }}>No results to show. Upload a resume first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>← Go Back</button>
        </div>
      </div>
    );
  }

  const { fileName, targetRole, aiFeedback } = result;
  const { overallScore = 0, sections = [], missingKeywords = [], strengths = [] } = aiFeedback || {};
  const rating = getRating(overallScore);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('fileName',      result.fileName);
      formData.append('targetRole',    result.targetRole);
      formData.append('extractedText', result.extractedText || '');
      formData.append('aiFeedback',    JSON.stringify(result.aiFeedback));
      formData.append('fileSize',      String(result.fileSize || 0));
      formData.append('mimeType',      result.mimeType || '');

      await axios.post(`${API}/api/resume/save`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      setSaved(true);
      toast.success('✅ Saved to history!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.bgAccent} />

      {/* ── Action Bar ── */}
      <div style={s.actionBar} className="no-print">
        <button onClick={() => navigate('/')} style={s.backBtn}>← Back</button>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleShare} style={s.ghostBtn}>{copied ? '✓ Copied!' : '🔗 Share'}</button>
          <button onClick={handlePrint} style={s.ghostBtn}>🖨️ Print</button>
          <button onClick={handleSave} disabled={saving || saved} style={saved ? s.savedBtn : s.primaryBtn}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : '💾 Save'}
          </button>
        </div>
      </div>

      <div className="container">

        {/* ══════════════════════════════════════════════════
            REPORT HEADER
        ══════════════════════════════════════════════════ */}
        <div style={s.reportHeader} className="card fade-in">
          <div style={s.brandRow}>
            <span style={s.brandLogo}>🔥</span>
            <div>
              <h1 style={s.brandTitle}>Roast Resume</h1>
              <p style={s.brandSub}>AI Resume Analysis Report</p>
            </div>
          </div>

          <div style={s.headerDivider} />

          <div style={s.metaRow}>
            <div style={s.metaItem}>
              <span style={s.metaLabel}>RESUME</span>
              <span style={s.metaValue}>📄 {fileName}</span>
            </div>
            <div style={s.metaItem}>
              <span style={s.metaLabel}>TARGET ROLE</span>
              <span style={s.metaValue}>🎯 {targetRole}</span>
            </div>
            <div style={s.metaItem}>
              <span style={s.metaLabel}>DATE</span>
              <span style={s.metaValue}>🗓 {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            OVERALL SCORE CARD
        ══════════════════════════════════════════════════ */}
        <div style={s.scoreCard} className="card fade-in-delay-1">
          <div style={s.scoreLeft}>
            <div style={{ ...s.scoreBadge, borderColor: getScoreColor(overallScore), color: getScoreColor(overallScore) }}>
              <span style={s.scoreNum}>{overallScore.toFixed(1)}</span>
              <span style={s.scoreDenom}>/10</span>
            </div>
            <div style={s.ratingLabel}>
              <span style={{ fontSize: '1.3rem' }}>{rating.emoji}</span>
              <span style={{ ...s.ratingText, color: getScoreColor(overallScore) }}>{rating.label}</span>
            </div>
          </div>

          <div style={s.scoreRight}>
            <h2 style={s.scoreTitle}>Overall Assessment</h2>
            <p style={s.scoreDesc}>
              Your resume scored <strong style={{ color: getScoreColor(overallScore) }}>{overallScore.toFixed(1)} out of 10</strong> for the{' '}
              <strong>{targetRole}</strong> role. Here's your detailed breakdown:
            </p>

            {/* Mini section bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {sections.map((sec, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                    <span>{sec.name}</span>
                    <span style={{ color: getScoreColor(sec.score) }}>{sec.score.toFixed(1)}/10</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${(sec.score / 10) * 100}%`, background: getScoreColor(sec.score) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION-BY-SECTION ROAST
        ══════════════════════════════════════════════════ */}
        <div style={s.roastSection} className="fade-in-delay-2">
          <h2 className="section-heading">Section-by-Section Roast</h2>

          {sections.map((sec, i) => (
            <div key={i} style={s.sectionCard} className="card">
              {/* Section header */}
              <div style={s.sectionHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={s.sectionNum}>{String(i + 1).padStart(2, '0')}</span>
                  <h3 style={s.sectionName}>{sec.name}</h3>
                </div>
                <div style={{ ...s.sectionScore, color: getScoreColor(sec.score), borderColor: getScoreColor(sec.score) + '40', background: getScoreColor(sec.score) + '10' }}>
                  {sec.score.toFixed(1)}/10
                </div>
              </div>

              <div style={s.sectionBody}>
                {/* RED — Issue */}
                {sec.issue && (
                  <div className="roast-issue">
                    <div style={s.roastLabel}>❌ Issue</div>
                    <p style={s.roastText}>{sec.issue}</p>
                  </div>
                )}
                {/* BLUE — Reason */}
                {sec.reason && (
                  <div className="roast-reason">
                    <div style={s.roastLabelBlue}>💡 Why it matters</div>
                    <p style={s.roastText}>{sec.reason}</p>
                  </div>
                )}
                {/* GREEN — Fix */}
                {sec.fix && (
                  <div className="roast-fix">
                    <div style={s.roastLabelGreen}>✅ How to fix</div>
                    <p style={s.roastText}>{sec.fix}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════
            KEYWORDS & STRENGTHS
        ══════════════════════════════════════════════════ */}
        <div style={s.kwGrid} className="result-grid fade-in-delay-3">

          {/* Missing Keywords */}
          <div style={s.kwCard} className="card">
            <h2 className="section-heading">Missing Keywords</h2>
            <p style={s.kwDesc}>Add these to get past ATS filters for <strong>{targetRole}</strong>:</p>
            <div style={s.chipRow}>
              {missingKeywords.map((kw, i) => (
                <span key={i} className="chip chip-keyword">❌ {kw}</span>
              ))}
              {missingKeywords.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Great — no major keyword gaps!</p>}
            </div>
          </div>

          {/* Strengths */}
          <div style={s.kwCard} className="card">
            <h2 className="section-heading">Your Strengths</h2>
            <p style={s.kwDesc}>Things you're doing well:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {strengths.map((st, i) => (
                <div key={i} style={s.strengthRow}>
                  <span style={s.strengthDot}>✅</span>
                  <span style={{ fontSize: '0.88rem', color: '#374151' }}>{st}</span>
                </div>
              ))}
              {strengths.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Keep working — strengths will show with revisions!</p>}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            FOOTER CALL TO ACTION
        ══════════════════════════════════════════════════ */}
        <div style={s.ctaCard} className="card fade-in-delay-4 no-print">
          <p style={s.ctaText}>Ready to improve? Apply the fixes above and re-roast your resume!</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => navigate('/')} className="btn btn-primary">🔥 Re-Roast</button>
            <button onClick={() => navigate('/history')} className="btn btn-ghost">📋 View History</button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const s = {
  page:       { minHeight: '100vh', background: '#f7f8fa', paddingBottom: 60 },
  bgAccent:   { position: 'fixed', inset: 0, zIndex: -1, background: 'radial-gradient(ellipse 60% 40% at 80% 0%, rgba(255,107,53,0.06) 0%, transparent 60%)' },

  actionBar: {
    position: 'sticky', top: 0, zIndex: 50,
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 24px', gap: 12, flexWrap: 'wrap',
  },
  backBtn: {
    background: 'none', border: 'none',
    color: '#6b7280', fontWeight: 600, fontSize: '0.9rem',
    cursor: 'pointer', padding: '6px 0',
  },
  primaryBtn: {
    padding: '8px 18px',
    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
    border: 'none', borderRadius: 8, color: '#fff',
    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
  },
  savedBtn: {
    padding: '8px 18px',
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 8, color: '#16a34a',
    fontWeight: 700, fontSize: '0.85rem', cursor: 'default',
  },
  ghostBtn: {
    padding: '8px 16px',
    background: '#fff', border: '1px solid #e5e7eb',
    borderRadius: 8, color: '#374151',
    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
  },

  /* Report Header */
  reportHeader: { padding: '28px 32px', marginTop: 24, marginBottom: 16 },
  brandRow:  { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  brandLogo: { fontSize: '2rem' },
  brandTitle:{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#111827', lineHeight: 1.2 },
  brandSub:  { fontSize: '0.8rem', color: '#6b7280', marginTop: 2 },
  headerDivider: { height: 1, background: '#e5e7eb', marginBottom: 20 },
  metaRow:   { display: 'flex', gap: 32, flexWrap: 'wrap' },
  metaItem:  { display: 'flex', flexDirection: 'column', gap: 3 },
  metaLabel: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af', textTransform: 'uppercase' },
  metaValue: { fontSize: '0.9rem', fontWeight: 600, color: '#111827' },

  /* Score Card */
  scoreCard: {
    display: 'flex', gap: 32, padding: '28px 32px',
    marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-start',
  },
  scoreLeft:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 },
  scoreBadge: {
    width: 120, height: 120, borderRadius: '50%',
    border: '4px solid', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  scoreNum:  { fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 },
  scoreDenom:{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.7 },
  ratingLabel:{ display: 'flex', alignItems: 'center', gap: 6 },
  ratingText: { fontWeight: 700, fontSize: '0.95rem' },
  scoreRight: { flex: 1, minWidth: 240 },
  scoreTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#111827', marginBottom: 8 },
  scoreDesc:  { fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6, marginBottom: 0 },

  /* Section Cards */
  roastSection: { marginBottom: 16 },
  sectionCard:  { marginBottom: 12, overflow: 'hidden' },
  sectionHeader:{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 20px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 8,
  },
  sectionNum:  { fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', fontFamily: 'monospace' },
  sectionName: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#111827' },
  sectionScore:{
    padding: '3px 12px', borderRadius: 100,
    fontSize: '0.82rem', fontWeight: 700,
    border: '1px solid',
  },
  sectionBody:  { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  roastLabel:   { fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, color: '#dc2626' },
  roastLabelBlue:{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, color: '#1d4ed8' },
  roastLabelGreen:{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4, color: '#16a34a' },
  roastText:    { fontSize: '0.88rem', lineHeight: 1.65, margin: 0 },

  /* Keywords Grid */
  kwGrid:  { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, marginBottom: 16 },
  kwCard:  { padding: '22px 24px' },
  kwDesc:  { fontSize: '0.83rem', color: '#6b7280', marginBottom: 14, marginTop: -6 },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  strengthRow:{ display: 'flex', alignItems: 'flex-start', gap: 10 },
  strengthDot:{ fontSize: '0.9rem', flexShrink: 0, marginTop: 1 },

  /* CTA */
  ctaCard: { padding: '24px', textAlign: 'center', marginTop: 8 },
  ctaText: { color: '#374151', marginBottom: 16, fontSize: '0.95rem' },
};
