import type { RoutePoint } from '@/data/types';
import { useStore } from '@/data/counterStore';
import { Coffee, MapPin } from 'lucide-react';

interface Props {
  points: RoutePoint[];
}

export default function RouteTimelinePreview({ points }: Props) {
  const { getCounterById } = useStore();

  if (points.length === 0) return null;

  const sorted = [...points].sort((a, b) => a.orderIndex - b.orderIndex);

  const getName = (p: RoutePoint) => {
    if (p.counterId) return getCounterById(p.counterId)?.name || p.counterId;
    return p.customPointName || 'Unnamed';
  };

  const isBreak = (type: string) => type === 'Break Point' || type === 'Restaurant Break';

  return (
    <div className="glass-card p-5">
      <h4 className="font-display font-semibold text-sm mb-4">Route Timeline</h4>
      <div className="relative">
        {sorted.map((point, idx) => (
          <div key={point.id} className="flex items-start gap-3 relative">
            {idx < sorted.length - 1 && (
              <div className="absolute left-[15px] top-8 w-px bg-border/40 h-[calc(100%-8px)]" />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
              idx === 0 ? 'bg-success/20 text-success' :
              idx === sorted.length - 1 ? 'bg-primary/20 text-primary' :
              isBreak(point.pointType) ? 'bg-warning/20 text-warning' :
              'bg-secondary/60 text-muted-foreground'
            }`}>
              {isBreak(point.pointType) ? <Coffee className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
            </div>
            <div className="pb-5 min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{getName(point)}</div>
              <div className="text-xs text-muted-foreground flex gap-2 flex-wrap mt-0.5">
                <span className="capitalize">{point.pointType}</span>
                {point.haltMinutes > 0 && <span>• {point.haltMinutes}m halt</span>}
                {point.breakMinutes > 0 && <span className="text-warning">• {point.breakMinutes}m break</span>}
                {point.isBoardingAllowed && <span className="text-success">↑</span>}
                {point.isDroppingAllowed && <span className="text-info">↓</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
