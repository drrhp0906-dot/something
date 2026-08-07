'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import StatusBar from '@/components/jarvis/StatusBar';
import ChatPanel from '@/components/jarvis/ChatPanel';
import ArcReactor from '@/components/jarvis/ArcReactor';
import MissionPanel from '@/components/jarvis/MissionPanel';
import WidgetDashboard from '@/components/jarvis/WidgetDashboard';
import SystemMetrics from '@/components/jarvis/SystemMetrics';
import HandOverlay from '@/components/jarvis/HandOverlay';
import VirtualCursor from '@/components/jarvis/VirtualCursor';
import VoiceWaveform from '@/components/jarvis/VoiceWaveform';
import HolographicPanel from '@/components/jarvis/HolographicPanel';
import { useJarvisStore } from '@/hooks/useJarvisChat';
import { useHandTracking } from '@/hooks/useHandTracking';

export default function Home() {
  const { activeMission, config } = useJarvisStore();
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Hand tracking state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });
  const [isPinching, setIsPinching] = useState(false);

  const handleHandMove = useCallback((x: number, y: number) => {
    setCursorPos({ x, y });
    // Dispatch native mouse move so existing UI elements respond
    const el = document.elementFromPoint(x, y);
    if (el) {
      el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
    }
  }, []);

  const handlePinch = useCallback((pinching: boolean, x: number, y: number) => {
    setIsPinching(pinching);
    const el = document.elementFromPoint(x, y);
    if (el) {
      const eventType = pinching ? 'mousedown' : 'mouseup';
      el.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true, clientX: x, clientY: y }));
    }
  }, []);

  const { isCameraOn, isLoading: isCameraLoading, startCamera, stopCamera } = useHandTracking(
    videoRef,
    handleHandMove,
    handlePinch
  );

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] text-gray-200 overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(0,229,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(123,97,255,0.02) 0%, transparent 50%)',
          }}
        />
        <motion.div
          className="absolute -inset-1/2 opacity-20"
          animate={{
            background: [
              'radial-gradient(ellipse at 30% 30%, rgba(0,229,255,0.05) 0%, transparent 50%)',
              'radial-gradient(ellipse at 70% 60%, rgba(0,229,255,0.05) 0%, transparent 50%)',
              'radial-gradient(ellipse at 30% 30%, rgba(0,229,255,0.05) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Scan line overlay */}
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.015]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,229,255,0.3) 1px, rgba(0,229,255,0.3) 2px)',
          }}
        />
      </div>

      {/* Status Bar — pass camera controls */}
      <StatusBar
        isCameraOn={isCameraOn}
        isCameraLoading={isCameraLoading}
        onStartCamera={startCamera}
        onStopCamera={stopCamera}
      />

      {/* Main Content */}
      <main className="relative z-10 pt-14 px-4 pb-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:mt-4">
            {/* Left: Arc Reactor + Mission */}
            <div className="space-y-4 lg:col-span-3">
              <HolographicPanel glowColor="rgba(0,229,255,0.2)" className="flex flex-col items-center justify-center py-6">
                <ArcReactor size="lg" />
                <motion.p
                  className="mt-3 text-[10px] uppercase tracking-[0.3em] text-cyan-400/60"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Arc Reactor Online
                </motion.p>
                <p className="mt-1 text-[10px] text-gray-600">
                  Power Output: 100%
                </p>
              </HolographicPanel>

              <MissionPanel mission={activeMission} />
              <SystemMetrics />
            </div>

            {/* Right: Chat Panel */}
            <div className="lg:col-span-9">
              <div className="h-[calc(100vh-6rem)] min-h-[400px] lg:h-[calc(100vh-5rem)]">
                <ChatPanel />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <WidgetDashboard />
          </div>
        </div>
      </main>

      {/* Voice Waveform */}
      <div className="fixed bottom-4 left-4 z-40 w-52">
        <VoiceWaveform isActive={isVoiceActive} />
      </div>

      {/* Hand Tracking Camera Feed */}
      <HandOverlay videoRef={videoRef} isCameraOn={isCameraOn} />

      {/* Virtual Cursor from hand tracking */}
      <VirtualCursor x={cursorPos.x} y={cursorPos.y} isPinching={isPinching} />

      {/* Corner decorations */}
      <div className="pointer-events-none fixed left-0 top-0 z-0 h-24 w-24 border-l-2 border-t-2 border-cyan-500/10" />
      <div className="pointer-events-none fixed right-0 top-0 z-0 h-24 w-24 border-r-2 border-t-2 border-cyan-500/10" />
      <div className="pointer-events-none fixed bottom-0 left-0 z-0 h-24 w-24 border-b-2 border-l-2 border-cyan-500/10" />
      <div className="pointer-events-none fixed bottom-0 right-0 z-0 h-24 w-24 border-b-2 border-r-2 border-cyan-500/10" />
    </div>
  );
}
