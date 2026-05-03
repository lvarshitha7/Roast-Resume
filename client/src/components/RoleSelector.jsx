import React from 'react';

const ROLES = [
  { value: '', label: '— Select a target role —' },
  { value: 'Software Engineer', label: '💻  Software Engineer' },
  { value: 'Frontend Developer', label: '🎨  Frontend Developer' },
  { value: 'Backend Developer', label: '⚙️  Backend Developer' },
  { value: 'Full Stack Developer', label: '🔧  Full Stack Developer' },
  { value: 'Data Scientist', label: '📊  Data Scientist' },
  { value: 'Data Analyst', label: '📈  Data Analyst' },
  { value: 'Machine Learning Engineer', label: '🤖  Machine Learning Engineer' },
  { value: 'DevOps Engineer', label: '🚀  DevOps Engineer' },
  { value: 'Cloud Engineer', label: '☁️  Cloud Engineer' },
  { value: 'Mobile Developer (iOS/Android)', label: '📱  Mobile Developer (iOS/Android)' },
  { value: 'Product Manager', label: '📋  Product Manager' },
  { value: 'UX/UI Designer', label: '✏️  UX/UI Designer' },
  { value: 'Cybersecurity Analyst', label: '🔒  Cybersecurity Analyst' },
  { value: 'QA Engineer', label: '🧪  QA Engineer' },
  { value: 'Business Analyst', label: '💼  Business Analyst' },
  { value: 'Marketing Manager', label: '📣  Marketing Manager' },
  { value: 'Financial Analyst', label: '💹  Financial Analyst' },
  { value: 'HR Manager', label: '🤝  HR Manager' },
  { value: 'Project Manager', label: '🗂️  Project Manager' },
];

export default function RoleSelector({ value, onChange }) {
  return (
    <div style={styles.wrapper}>
      <select
        id="role-selector"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.select}
        aria-label="Select target job role"
      >
        {ROLES.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
      <span style={styles.chevron} aria-hidden="true">▾</span>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    width: '100%',
  },
  select: {
    width: '100%',
    padding: '13px 44px 13px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#f0f0ff',
    fontSize: '0.95rem',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  chevron: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#606080',
    pointerEvents: 'none',
    fontSize: '1.1rem',
  },
};
