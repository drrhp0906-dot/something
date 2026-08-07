'use client';

import { motion } from 'framer-motion';
import type { Mission } from '@/types/jarvis';
import HolographicPanel from './HolographicPanel';
import { CheckCircle2, Loader2, XCircle, Circle } from 'lucide-react';

interface MissionPanelProps {
  mission: Mission | null;
}

export default function MissionPanel({ mission }: MissionPanelProps) {
  if (!mission) {
    return (
      <HolographicPanel title="Mission Control" glowColor="rgba(0,229,255,0.2)" className="text-center">
        <div className="py-6 text-xs text-gray-500">
          <p>No active mission</p>
          <p className="mt-1 text-[10px]">Awaiting task assignment...</p>
        </div>
      </HolographicPanel>
    );
  }

  return (
    <HolographicPanel title={`Mission: ${mission.title}`} glowColor="rgba(0,229,255,0.3)">
      <div className="space-y-2">
        {mission.steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-2 text-xs"
          >
            <div className="mt-0.5 flex-shrink-0">
              {step.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
              {step.status === 'running' && <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />}
              {step.status === 'error' && <XCircle className="h-3.5 w-3.5 text-red-400" />}
              {step.status === 'pending' && <Circle className="h-3.5 w-3.5 text-gray-600" />}
            </div>
            <div>
              <span className={step.status === 'completed' ? 'text-green-400/80 line-through' : step.status === 'running' ? 'text-cyan-300' : 'text-gray-400'}>
                {step.label}
              </span>
              {step.detail && (
                <p className="mt-0.5 text-[10px] text-gray-500">{step.detail}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full bg-cyan-500/60"
          initial={{ width: '0%' }}
          animate={{
            width: `${(mission.steps.filter(s => s.status === 'completed').length / mission.steps.length) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </HolographicPanel>
  );
}
