'use client';

import type { Widget } from '@/types/jarvis';
import HolographicPanel from './HolographicPanel';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { X, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface WidgetProps {
  widget: Widget;
  onRemove?: (id: string) => void;
}

export default function WidgetCard({ widget, onRemove }: WidgetProps) {
  return (
    <HolographicPanel
      className="group relative"
      glowColor="rgba(0,229,255,0.15)"
      noPadding
    >
      <div className="p-3">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400/70">
            {widget.title}
          </span>
          {onRemove && (
            <button
              onClick={() => onRemove(widget.id)}
              className="rounded p-0.5 text-gray-600 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="min-h-[60px]">
          {widget.type === 'stat' && <StatWidget data={widget.data} />}
          {widget.type === 'chart' && <ChartWidget data={widget.data} />}
          {widget.type === 'info' && <InfoWidget data={widget.data} />}
          {widget.type === 'mission' && <MissionWidget data={widget.data} />}
        </div>
      </div>
    </HolographicPanel>
  );
}

function StatWidget({ data }: { data?: Record<string, unknown> }) {
  const value = (data?.value as number) || 0;
  const unit = (data?.unit as string) || '';
  const trend = (data?.trend as string) || 'stable';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500';

  return (
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold text-cyan-300">{Math.round(value)}</span>
      <span className="mb-1 text-xs text-gray-400">{unit}</span>
      <TrendIcon className={`mb-1 h-4 w-4 ${trendColor}`} />
    </div>
  );
}

function ChartWidget({ data }: { data?: Record<string, unknown> }) {
  const points = (data?.points as number[]) || [10, 20, 15, 25, 18, 30, 22];
  const chartData = points.map((value, index) => ({ name: `D${index + 1}`, value }));

  const colors = ['#00e5ff', '#7b61ff', '#00e096', '#ff3d71'];

  return (
    <ResponsiveContainer width="100%" height={70}>
      <BarChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
        <YAxis tick={false} axisLine={false} tickLine={false} />
        <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={12}>
          {chartData.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} fillOpacity={0.7} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function InfoWidget({ data }: { data?: Record<string, unknown> }) {
  const text = (data?.text as string) || 'No data available';

  return (
    <div className="flex items-start gap-2">
      <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-cyan-400/50" />
      <p className="text-xs leading-relaxed text-gray-400">{text}</p>
    </div>
  );
}

function MissionWidget({ data }: { data?: Record<string, unknown> }) {
  const progress = (data?.progress as number) || 0;
  const label = (data?.label as string) || 'Standby';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-cyan-400">{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-cyan-500/60 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
