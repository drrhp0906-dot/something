'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ArcReactor from './ArcReactor';
import { useJarvisStore } from '@/hooks/useJarvisChat';
import { Camera, CameraOff, Settings } from 'lucide-react';

interface StatusBarProps {
  isCameraOn?: boolean;
  isCameraLoading?: boolean;
  onStartCamera?: () => void;
  onStopCamera?: () => void;
}

export default function StatusBar({ isCameraOn = false, isCameraLoading = false, onStartCamera, onStopCamera }: StatusBarProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { config, setConfig, setAIProvider } = useJarvisStore();

  useEffect(() => {
    const update = () => setTime(new Date());
    update(); // initial set
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isJarvis = config.personality === 'jarvis';

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-cyan-500/10 bg-[#0a0a1a]/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        {/* Left: Arc Reactor + Name */}
        <div className="flex items-center gap-3">
          <ArcReactor size="sm" />
          <div>
            <h1 className={`text-sm font-bold tracking-widest ${isJarvis ? 'text-cyan-400' : 'text-purple-400'}`}>
              {isJarvis ? 'J.A.R.V.I.S' : 'F.R.I.D.A.Y'}
            </h1>
            <p className="text-[10px] text-gray-500">AI ASSISTANT SYSTEM v2.0</p>
          </div>
        </div>

        {/* Center: Status indicators */}
        <div className="hidden items-center gap-4 md:flex">
          <StatusIndicator
            label="AI CORE"
            active
            color="cyan"
          />
          <StatusIndicator
            label="VOICE"
            active={config.voiceEnabled}
            color={config.voiceEnabled ? 'cyan' : 'gray'}
          />
          <div className="flex items-center gap-1.5">
            <StatusIndicator
              label="CAM"
              active={isCameraOn}
              color={isCameraOn ? 'cyan' : isCameraLoading ? 'yellow' : 'gray'}
            />
            <button
              onClick={isCameraOn ? onStopCamera : onStartCamera}
              className="rounded p-0.5 text-gray-500 transition-colors hover:text-cyan-400"
              title={isCameraOn ? 'Stop Camera' : isCameraLoading ? 'Loading...' : 'Start Camera'}
            >
              {isCameraOn ? <Camera className="h-3 w-3 text-cyan-400" /> : <CameraOff className="h-3 w-3" />}
            </button>
          </div>
          <StatusIndicator
            label="NET"
            active
            color="cyan"
          />
          <StatusIndicator
            label={config.aiProvider.type.toUpperCase()}
            active
            color={config.aiProvider.type === 'builtin' ? 'green' : 'yellow'}
          />
        </div>

        {/* Right: Time + Settings */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-mono text-cyan-400/80">
              {time ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
            </div>
            <div className="text-[10px] text-gray-500">
              {time ? time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--- --, ----'}
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded p-1.5 text-gray-500 transition-colors hover:text-cyan-400"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Settings dropdown */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-4 top-full mt-1 w-64 rounded-lg border border-white/10 bg-[#0d0d1f]/95 p-3 backdrop-blur-md"
        >
          <h3 className="mb-2 text-xs font-semibold text-cyan-400">AI Provider</h3>
          <div className="space-y-1">
            {[
              { type: 'builtin' as const, name: 'Built-in (Free)', desc: 'No API needed' },
              { type: 'huggingface' as const, name: 'HuggingFace (Free)', desc: 'Free tier with token' },
              { type: 'ollama' as const, name: 'Ollama (Local)', desc: 'Runs on your machine' },
            ].map((provider) => (
              <button
                key={provider.type}
                onClick={() => setAIProvider({
                  type: provider.type,
                  name: provider.name,
                  isConfigured: provider.type === 'builtin',
                })}
                className={`w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                  config.aiProvider.type === provider.type
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <div className="font-medium">{provider.name}</div>
                <div className="text-[10px] text-gray-500">{provider.desc}</div>
              </button>
            ))}
          </div>

          {config.aiProvider.type === 'huggingface' && (
            <div className="mt-2">
              <label className="text-[10px] text-gray-500">HF Token:</label>
              <input
                type="password"
                placeholder="hf_xxxxxxxxxxxx"
                onChange={(e) => setAIProvider({ token: e.target.value, isConfigured: !!e.target.value })}
                className="mt-1 w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-300 outline-none"
              />
            </div>
          )}

          {config.aiProvider.type === 'ollama' && (
            <div className="mt-2 space-y-1">
              <div>
                <label className="text-[10px] text-gray-500">Endpoint:</label>
                <input
                  type="text"
                  defaultValue="http://localhost:11434"
                  onChange={(e) => setAIProvider({ endpoint: e.target.value })}
                  className="mt-0.5 w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-300 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Model:</label>
                <input
                  type="text"
                  defaultValue="llama3.2"
                  onChange={(e) => setAIProvider({ model: e.target.value })}
                  className="mt-0.5 w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-300 outline-none"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function StatusIndicator({ label, active, color }: { label: string; active: boolean; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-400 shadow-cyan-400',
    green: 'bg-green-400 shadow-green-400',
    yellow: 'bg-yellow-400 shadow-yellow-400',
    gray: 'bg-gray-600',
    red: 'bg-red-400 shadow-red-400',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`h-1.5 w-1.5 rounded-full ${colorMap[color] || colorMap.gray} ${active ? 'shadow-[0_0_4px]' : ''}`}
      />
      <span className="text-[10px] font-medium tracking-wider text-gray-400">{label}</span>
    </div>
  );
}
