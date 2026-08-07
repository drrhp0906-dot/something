'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VoiceWaveformProps {
  isActive: boolean;
  isSpeaking?: boolean;
}

export default function VoiceWaveform({ isActive, isSpeaking = false }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const barsRef = useRef<number[]>(Array.from({ length: 32 }, () => 0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bars = barsRef.current;
    const barCount = bars.length;
    const barWidth = width / barCount - 1;

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < barCount; i++) {
        if (isActive) {
          // Generate smooth random waveform
          const target = isSpeaking
            ? Math.random() * 0.8 + 0.2
            : Math.random() * 0.6 + 0.1;
          bars[i] += (target - bars[i]) * 0.3;
        } else {
          bars[i] *= 0.9;
        }

        const barHeight = bars[i] * height;
        const x = i * (barWidth + 1);
        const y = (height - barHeight) / 2;

        const color = isSpeaking
          ? `rgba(123, 97, 255, ${0.4 + bars[i] * 0.6})`
          : `rgba(0, 229, 255, ${0.3 + bars[i] * 0.7})`;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, isSpeaking]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 32 }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden rounded-md border border-white/5 bg-white/[0.02]"
    >
      <canvas
        ref={canvasRef}
        width={200}
        height={32}
        className="w-full"
      />
    </motion.div>
  );
}
