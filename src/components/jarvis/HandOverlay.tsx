'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

interface HandOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
}

export default function HandOverlay({ videoRef, isCameraOn }: HandOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isCameraOn) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="pointer-events-auto fixed bottom-4 right-4 z-[100] overflow-hidden rounded-lg border border-cyan-500/30"
      style={{
        boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
        width: 200,
        height: 150,
      }}
    >
      {/* Label */}
      <div className="absolute left-0 top-0 z-10 rounded-tl-lg bg-black/60 px-2 py-0.5 text-[9px] uppercase tracking-widest text-cyan-400">
        Hand Tracking
      </div>

      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Canvas overlay for landmarks */}
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 h-full w-full"
        style={{ transform: 'scaleX(-1)' }}
      />
    </motion.div>
  );
}
