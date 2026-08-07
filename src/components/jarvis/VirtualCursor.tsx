'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface VirtualCursorProps {
  x: number | null;
  y: number | null;
  isPinching: boolean;
}

export default function VirtualCursor({ x, y, isPinching }: VirtualCursorProps) {
  return (
    <AnimatePresence>
      {x !== null && y !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: isPinching ? 0.5 : 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="pointer-events-none fixed z-[9999] rounded-full"
          style={{
            left: x,
            top: y,
            width: 20,
            height: 20,
            transform: 'translate(-50%, -50%)',
            border: `2px solid ${isPinching ? '#ff3d71' : '#00e5ff'}`,
            backgroundColor: isPinching ? 'rgba(255, 61, 113, 0.4)' : 'transparent',
            boxShadow: isPinching
              ? '0 0 12px rgba(255, 61, 113, 0.6), 0 0 24px rgba(255, 61, 113, 0.3)'
              : '0 0 8px rgba(0, 229, 255, 0.4), 0 0 16px rgba(0, 229, 255, 0.2)',
          }}
        />
      )}
    </AnimatePresence>
  );
}
