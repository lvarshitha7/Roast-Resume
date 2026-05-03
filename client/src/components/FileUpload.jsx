import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
};

export default function FileUpload({ file, onFileChange }) {
  const [dragError, setDragError] = useState('');

  const onDrop = useCallback(
    (accepted, rejected) => {
      setDragError('');
      if (rejected.length > 0) {
        const reason = rejected[0].errors[0]?.message || 'Invalid file.';
        setDragError(reason);
        return;
      }
      if (accepted.length > 0) {
        onFileChange(accepted[0]);
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5 MB
  });

  const clearFile = (e) => {
    e.stopPropagation();
    onFileChange(null);
    setDragError('');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          ...styles.zone,
          ...(isDragActive ? styles.zoneActive : {}),
          ...(file ? styles.zoneSuccess : {}),
          ...(dragError ? styles.zoneError : {}),
        }}
        id="file-drop-zone"
        role="button"
        aria-label="Resume upload drop zone"
        tabIndex={0}
      >
        <input {...getInputProps()} id="resume-file-input" aria-label="Select resume file" />

        {file ? (
          <div style={styles.fileInfo}>
            <span style={styles.fileIcon}>📄</span>
            <div style={styles.fileMeta}>
              <p style={styles.fileName}>{file.name}</p>
              <p style={styles.fileSize}>{formatSize(file.size)}</p>
            </div>
            <button
              onClick={clearFile}
              style={styles.clearBtn}
              aria-label="Remove file"
              type="button"
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={styles.placeholder}>
            <div style={styles.uploadIcon} aria-hidden="true">
              {isDragActive ? '⬇️' : '☁️'}
            </div>
            <p style={styles.uploadTitle}>
              {isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}
            </p>
            <p style={styles.uploadSub}>PDF or DOCX up to 5 MB</p>
            <div style={styles.browseBtn}>
              Browse files
            </div>
          </div>
        )}
      </div>

      {dragError && (
        <p style={styles.errorText} role="alert">{dragError}</p>
      )}
    </div>
  );
}

const styles = {
  zone: {
    border: '2px dashed rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: '40px 24px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    background: 'rgba(255,255,255,0.02)',
    textAlign: 'center',
    outline: 'none',
  },
  zoneActive: {
    borderColor: '#ff6b35',
    background: 'rgba(255, 107, 53, 0.06)',
    boxShadow: '0 0 30px rgba(255, 107, 53, 0.1)',
    transform: 'scale(1.01)',
  },
  zoneSuccess: {
    borderColor: 'rgba(34, 197, 94, 0.5)',
    background: 'rgba(34, 197, 94, 0.05)',
    borderStyle: 'solid',
  },
  zoneError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    background: 'rgba(239, 68, 68, 0.04)',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  uploadIcon: { fontSize: '2.5rem', marginBottom: 4 },
  uploadTitle: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#f0f0ff',
  },
  uploadSub: {
    fontSize: '0.85rem',
    color: '#606080',
  },
  browseBtn: {
    marginTop: 8,
    padding: '8px 22px',
    borderRadius: 8,
    background: 'rgba(255,107,53,0.15)',
    border: '1px solid rgba(255,107,53,0.3)',
    color: '#ff6b35',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textAlign: 'left',
  },
  fileIcon: { fontSize: '2rem', flexShrink: 0 },
  fileMeta: { flex: 1, minWidth: 0 },
  fileName: {
    fontWeight: 600,
    color: '#f0f0ff',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileSize: { fontSize: '0.8rem', color: '#606080', marginTop: 2 },
  clearBtn: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444',
    borderRadius: 6,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    fontSize: '0.8rem',
  },
  errorText: {
    marginTop: 8,
    color: '#fca5a5',
    fontSize: '0.82rem',
  },
};
