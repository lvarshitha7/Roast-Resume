import React, { useEffect, useState } from 'react';

const getScoreColor = (score) => {
  if (score >= 80) return { track: '#22c55e', glow: 'rgba(34,197,94,0.3)' };
  if (score >= 60) return { track: '#84cc16', glow: 'rgba(132,204,22,0.3)' };
  if (score >= 40) return { track: '#eab308', glow: 'rgba(234,179,8,0.3)' };
  return { track: '#ef4444', glow: 'rgba(239,68,68,0.3)' };
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
};

export default function ScoreRing({ score = 0, size = 180 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 1200;
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const colors = getScoreColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          filter: `drop-shadow(0 0 20px ${colors.glow})`,
        }}
        role="img"
        aria-label={`Overall score: ${score} out of 100`}
      >
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={10}
          />
          {/* Score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.track}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}>
          <span style={{
            fontSize: size > 150 ? '2.5rem' : '1.8rem',
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            color: colors.track,
            lineHeight: 1,
          }}>
            {animatedScore}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
            / 100
          </span>
        </div>
      </div>

      <div style={{
        padding: '4px 16px',
        borderRadius: 100,
        background: `${colors.glow}`,
        border: `1px solid ${colors.track}40`,
        fontSize: '0.85rem',
        fontWeight: 600,
        color: colors.track,
      }}>
        {getScoreLabel(score)}
      </div>
    </div>
  );
}
