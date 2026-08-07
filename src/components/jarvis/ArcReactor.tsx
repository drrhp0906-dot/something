'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ArcReactorProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 48, md: 80, lg: 120 } as const;

// Pre-compute sector line coordinates to avoid hydration mismatch
// (Math.cos/sin produce slightly different float precision on server vs client)
const SECTOR_ANGLES = [0, 60, 120, 180, 240, 300] as const;
const SECTOR_LINES: Record<number, { x1: number; y1: number; x2: number; y2: number }[]> = {};

for (const size of [48, 80, 120] as const) {
  const c = size / 2;
  SECTOR_LINES[size] = SECTOR_ANGLES.map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x1: parseFloat((c + Math.cos(rad) * size * 0.2).toFixed(2)),
      y1: parseFloat((c + Math.sin(rad) * size * 0.2).toFixed(2)),
      x2: parseFloat((c + Math.cos(rad) * size * 0.37).toFixed(2)),
      y2: parseFloat((c + Math.sin(rad) * size * 0.37).toFixed(2)),
    };
  });
}

export default function ArcReactor({ size = 'md', className = '' }: ArcReactorProps) {
  const s = sizes[size];
  const center = s / 2;
  const sectorLines = SECTOR_LINES[s];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {/* Outer ring */}
        <motion.circle
          cx={center} cy={center} r={s * 0.45}
          fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth={1.5}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Second ring */}
        <motion.circle
          cx={center} cy={center} r={s * 0.37}
          fill="none" stroke="rgba(0,229,255,0.25)" strokeWidth={1}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Third ring with dashes */}
        <motion.circle
          cx={center} cy={center} r={s * 0.29}
          fill="none" stroke="rgba(0,229,255,0.4)" strokeWidth={1.5}
          strokeDasharray={`${s * 0.08} ${s * 0.05}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Inner ring */}
        <motion.circle
          cx={center} cy={center} r={s * 0.2}
          fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth={2}
          strokeDasharray={`${s * 0.06} ${s * 0.04}`}
          animate={{ rotate: -360 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Core glow */}
        <motion.circle
          cx={center} cy={center} r={s * 0.12}
          fill="rgba(0,229,255,0.15)"
          stroke="rgba(0,229,255,0.8)"
          strokeWidth={1.5}
          animate={{
            r: [s * 0.12, s * 0.14, s * 0.12],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Center dot */}
        <motion.circle
          cx={center} cy={center} r={s * 0.04}
          fill="#00e5ff"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Sector lines — using pre-computed coordinates */}
        {sectorLines.map((line, i) => (
          <motion.line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(0,229,255,0.2)"
            strokeWidth={0.5}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
          />
        ))}
      </svg>

      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)',
          filter: `blur(${s * 0.1}px)`,
        }}
      />
    </div>
  );
}
