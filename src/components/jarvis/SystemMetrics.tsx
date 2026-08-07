'use client';

import { useEffect, useRef, useState } from 'react';
import HolographicPanel from './HolographicPanel';
import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react';

export default function SystemMetrics() {
  const [metrics, setMetrics] = useState({
    cpu: 32,
    memory: 48,
    network: 15,
    disk: 67,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMetrics((prev) => ({
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 8)),
        memory: Math.max(20, Math.min(90, prev.memory + (Math.random() - 0.5) * 4)),
        network: Math.max(1, Math.min(100, prev.network + (Math.random() - 0.5) * 15)),
        disk: Math.max(30, Math.min(95, prev.disk + (Math.random() - 0.5) * 2)),
      }));
    }, 2000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const items = [
    { icon: Cpu, label: 'CPU', value: metrics.cpu, color: '#00e5ff' },
    { icon: HardDrive, label: 'MEM', value: metrics.memory, color: '#7b61ff' },
    { icon: Wifi, label: 'NET', value: metrics.network, color: '#00e096' },
    { icon: Activity, label: 'DISK', value: metrics.disk, color: '#ff3d71' },
  ];

  return (
    <HolographicPanel title="System Metrics" glowColor="rgba(0,229,255,0.2)" className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-gray-400">
              <item.icon className="h-3 w-3" style={{ color: item.color }} />
              <span>{item.label}</span>
            </div>
            <span className="font-mono" style={{ color: item.color }}>
              {Math.round(item.value)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${item.value}%`,
                backgroundColor: item.color,
                boxShadow: `0 0 6px ${item.color}40`,
              }}
            />
          </div>
        </div>
      ))}
    </HolographicPanel>
  );
}
