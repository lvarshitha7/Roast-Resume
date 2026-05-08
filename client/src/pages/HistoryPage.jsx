import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import ResultModal from '../components/ResultModal';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  return '#ef4444';
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const ROLES = [
  '', 'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'Product Manager',
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const [resumes,     setResumes]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [deleting,    setDeleting]    = useState(null);
  const [pagination,  setPagination]  = useState({ page: 1, pages: 1, total: 0 });
  const [roleFilter,  setRoleFilter]  = useState('');
  const [dbDown,      setDbDown]      = useState(false);
  const [viewResume,  setViewResume]  = useState(null);

  const fetchHistory = useCallback(async (page = 1, role = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (role) params.role = role;
      const { data } = await axios.get(`${API}/api/resume/history`, { params });
      setResumes(data.data.resumes);
      setPagination(data.data.pagination);
      setDbDown(false);
    } catch (err) {
      if (err.response?.status === 503) {
        setDbDown(true);
      } else {
        toast.error('Failed to load history.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1, roleFilter);
  }, [fetchHistory, roleFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume analysis?')) return;
    setDeleting(id);
    try {
      await axios.delete(`${API}/api/resume/history/${id}`);
      toast.success('Deleted successfully.');
      fetchHistory(pagination.page, roleFilter);
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={styles.page}>
      {viewResume && <ResultModal resume={viewResume} onClose={() => setViewResume(null)} />}
      <div className="container">

        {/* DB unavailable banner */}
        {dbDown && (
          <div style={styles.dbBanner}>
            <strong>⚠️ Database Unavailable</strong>
            <p style={{ marginTop: 6, fontSize: '0.85rem', opacity: 0.85 }}>
              The history feature requires a database connection which is currently unreachable.
              You can still <button onClick={() => navigate('/')} style={styles.dbBannerLink}>analyze resumes</button> — results just won't be saved.
            </p>
          </div>
        )}

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Analysis History</h1>
            <p style={styles.subtitle}>
              {pagination.total} scan{pagination.total !== 1 ? 's' : ''} saved
            </p>
          </div>
          <button onClick={() => navigate('/')} style={styles.analyzeNewBtn}>
            + Analyze New
          </button>
        </div>

        {/* Filter */}
        <div style={styles.filterRow}>
          <label htmlFor="role-filter" style={styles.filterLabel}>Filter by role:</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All roles</option>
            {ROLES.filter(Boolean).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div style={styles.loadingGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={styles.skeleton} className="skeleton" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyIcon}>📭</p>
            <h3 style={styles.emptyTitle}>No analyses found</h3>
            <p style={styles.emptySub}>Save a result after analyzing your resume to see it here.</p>
            <button onClick={() => navigate('/')} style={styles.goHomeBtn}>Go Analyze →</button>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {resumes.map((r, i) => (
                <div
                  key={r._id}
                  style={{ ...styles.card, animationDelay: `${i * 0.06}s` }}
                  className="glass-card fade-in"
                >
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <div style={{
                      ...styles.scoreBubble,
                      background: `${getScoreColor(r.aiFeedback?.overallScore)}18`,
                      border: `1px solid ${getScoreColor(r.aiFeedback?.overallScore)}40`,
                      color: getScoreColor(r.aiFeedback?.overallScore),
                    }}>
                      {r.aiFeedback?.overallScore ?? '–'}
                    </div>
                    <div style={styles.cardMeta}>
                      <p style={styles.cardFileName}>{r.fileName}</p>
                      <p style={styles.cardRole}>{r.targetRole}</p>
                    </div>
                  </div>

                  {/* Mini bar */}
                  <div style={styles.miniBarTrack}>
                    <div style={{
                      height: '100%',
                      width: `${r.aiFeedback?.overallScore || 0}%`,
                      background: getScoreColor(r.aiFeedback?.overallScore),
                      borderRadius: 2,
                      transition: 'width 1s ease',
                    }} />
                  </div>

                  {/* Section scores */}
                  {r.aiFeedback?.sections?.length > 0 && (
                    <div style={styles.sectionPills}>
                      {r.aiFeedback.sections.slice(0, 3).map((s, si) => (
                        <span key={si} style={{
                          ...styles.pill,
                          background: `${getScoreColor(s.score)}12`,
                          color: getScoreColor(s.score),
                          border: `1px solid ${getScoreColor(s.score)}30`,
                        }}>
                          {s.name.split(/\s/)[0]}: {s.score}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={styles.cardFooter}>
                    <span style={styles.cardDate}>{formatDate(r.createdAt)}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setViewResume(r)}
                        style={styles.viewBtn}
                        aria-label={`View full analysis for ${r.fileName}`}
                      >
                        👁 View
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        disabled={deleting === r._id}
                        style={styles.deleteBtn}
                        aria-label={`Delete ${r.fileName}`}
                      >
                        {deleting === r._id ? '…' : '🗑'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => fetchHistory(pagination.page - 1, roleFilter)}
                  disabled={pagination.page <= 1}
                  style={styles.pageBtn}
                >
                  ← Prev
                </button>
                <span style={styles.pageInfo}>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => fetchHistory(pagination.page + 1, roleFilter)}
                  disabled={pagination.page >= pagination.pages}
                  style={styles.pageBtn}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  dbBanner: {
    marginBottom: 24,
    padding: '16px 20px',
    background: 'rgba(251,191,36,0.07)',
    border: '1px solid rgba(251,191,36,0.25)',
    borderRadius: 12,
    color: '#fbbf24',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
  dbBannerLink: {
    background: 'none',
    border: 'none',
    color: '#ff6b35',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
    fontSize: 'inherit',
    textDecoration: 'underline',
  },
  page: { padding: '40px 0 80px', minHeight: '100vh' },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 32,
    flexWrap: 'wrap',
    gap: 16,
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '2rem',
    fontWeight: 800,
    color: '#f0f0ff',
  },
  subtitle: { fontSize: '0.9rem', color: '#606080', marginTop: 4 },
  analyzeNewBtn: {
    padding: '10px 22px',
    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  filterLabel: { fontSize: '0.88rem', color: '#808098', fontWeight: 500 },
  filterSelect: {
    padding: '8px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f0f0ff',
    fontSize: '0.875rem',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  card: { padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 14 },
  scoreBubble: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 800,
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  cardMeta: { flex: 1, minWidth: 0 },
  cardFileName: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#f0f0ff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: 3,
  },
  cardRole: { fontSize: '0.8rem', color: '#606080' },
  miniBarTrack: {
    height: 4,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sectionPills: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  pill: {
    padding: '3px 10px',
    borderRadius: 100,
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardDate: { fontSize: '0.75rem', color: '#404060' },
  viewBtn: {
    padding: '4px 12px',
    background: 'rgba(255,107,53,0.08)',
    border: '1px solid rgba(255,107,53,0.2)',
    borderRadius: 6,
    color: '#ff6b35',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deleteBtn: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 6,
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#ef4444',
    transition: 'all 0.2s ease',
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  skeleton: { height: 180, borderRadius: 16 },
  empty: {
    textAlign: 'center',
    padding: '80px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  },
  emptyIcon: { fontSize: '3rem' },
  emptyTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#f0f0ff',
  },
  emptySub: { fontSize: '0.9rem', color: '#606080' },
  goHomeBtn: {
    padding: '10px 22px',
    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 40,
  },
  pageBtn: {
    padding: '8px 20px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#a0a0c0',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  pageInfo: { fontSize: '0.88rem', color: '#606080' },
};
