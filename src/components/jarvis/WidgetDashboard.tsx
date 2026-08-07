'use client';

import type { Widget } from '@/types/jarvis';
import WidgetCard from './Widget';
import { useJarvisStore } from '@/hooks/useJarvisChat';
import { Plus } from 'lucide-react';

export default function WidgetDashboard() {
  const { widgets, addWidget, removeWidget } = useJarvisStore();

  const handleAddWidget = () => {
    const types: Widget['type'][] = ['stat', 'chart', 'info'];
    const type = types[Math.floor(Math.random() * types.length)];
    const newWidget: Widget = {
      id: `w-${Date.now()}`,
      title: type === 'chart' ? 'Data Chart' : type === 'stat' ? 'Statistics' : 'Info Panel',
      type,
      data: type === 'chart'
        ? { points: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10) }
        : type === 'stat'
          ? { value: Math.floor(Math.random() * 100), unit: '%', trend: 'up' }
          : { text: 'New information panel' },
    };
    addWidget(newWidget);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400/60">
          Dashboard
        </h2>
        <button
          onClick={handleAddWidget}
          className="rounded border border-white/10 p-1 text-gray-500 transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            onRemove={removeWidget}
          />
        ))}
      </div>
    </div>
  );
}
