'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatusBar from '@/components/jarvis/StatusBar';
import ChatPanel from '@/components/jarvis/ChatPanel';
import ArcReactor from '@/components/jarvis/ArcReactor';
import MissionPanel from '@/components/jarvis/MissionPanel';
import WidgetDashboard from '@/components/jarvis/WidgetDashboard';
import SystemMetrics from '@/components/jarvis/SystemMetrics';
import { useJarvisStore } from '@/hooks/useJarvisChat';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import VoiceWaveform from '@/components/jarvis/VoiceWaveform';
import HolographicPanel from '@/components/jarvis/HolographicPanel';

export default function Home() {
  const { activeMission, config } = useJarvisStore();
  const [isVoiceActive, setIsVoiceActive] = useState(false);

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
        {/* Subtle moving gradient */}
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

      {/* Status Bar */}
      <StatusBar />

      {/* Main Content */}
      <main className="relative z-10 pt-14 px-4 pb-4">
        <div className="mx-auto max-w-7xl">
          {/* Top Section: Arc Reactor + Chat + Mission */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:mt-4">
            {/* Left: Arc Reactor + Mission */}
            <div className="space-y-4 lg:col-span-3">
              {/* Arc Reactor display */}
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

              {/* Mission Panel */}
              <MissionPanel mission={activeMission} />

              {/* System Metrics */}
              <SystemMetrics />
            </div>

            {/* Right: Chat Panel (main area) */}
            <div className="lg:col-span-9">
              <div className="h-[calc(100vh-6rem)] min-h-[400px] lg:h-[calc(100vh-5rem)]">
                <ChatPanel />
              </div>
            </div>
          </div>

          {/* Bottom: Widget Dashboard */}
          <div className="mt-4">
            <WidgetDashboard />
          </div>
        </div>
      </main>

      {/* Voice Waveform (floating) */}
      <div className="fixed bottom-4 left-4 z-40 w-52">
        <VoiceWaveform isActive={isVoiceActive} />
      </div>

      {/* Corner decorations */}
      <div className="pointer-events-none fixed left-0 top-0 z-0 h-24 w-24 border-l-2 border-t-2 border-cyan-500/10" />
      <div className="pointer-events-none fixed right-0 top-0 z-0 h-24 w-24 border-r-2 border-t-2 border-cyan-500/10" />
      <div className="pointer-events-none fixed bottom-0 left-0 z-0 h-24 w-24 border-b-2 border-l-2 border-cyan-500/10" />
      <div className="pointer-events-none fixed bottom-0 right-0 z-0 h-24 w-24 border-b-2 border-r-2 border-cyan-500/10" />
    </div>
  );
}
