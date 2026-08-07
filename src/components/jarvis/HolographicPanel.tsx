'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface HolographicPanelProps {
  title?: string;
  glowColor?: string;
  className?: string;
  children: ReactNode;
  noPadding?: boolean;
}

export default function HolographicPanel({
  title,
  glowColor = 'rgba(0,229,255,0.3)',
  className = '',
  children,
  noPadding = false,
}: HolographicPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-lg border backdrop-blur-md ${noPadding ? '' : 'p-4'} ${className}`}
      style={{
        backgroundColor: 'rgba(10, 15, 30, 0.85)',
        borderColor: glowColor.replace(/[\d.]+\)$/, '0.4)'),
        boxShadow: `0 0 15px ${glowColor.replace(/[\d.]+\)$/, '0.15)')}, inset 0 0 30px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Scan line effect */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.5) 2px, rgba(0,229,255,0.5) 4px)',
          }}
        />
      </div>

      {/* Header */}
      {title && (
        <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: glowColor.replace(/[\d.]+\)$/, '1)'),
              boxShadow: `0 0 6px ${glowColor}`,
            }}
          />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: glowColor.replace(/[\d.]+\)$/, '1)') }}>
            {title}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-20">{children}</div>
    </motion.div>
  );
}
