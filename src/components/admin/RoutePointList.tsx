import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Pencil, Trash2, Coffee, MapPin, AlertTriangle } from 'lucide-react';
import type { RoutePoint } from '@/data/types';
import { useStore } from '@/data/counterStore';
import { Button } from '@/components/ui/button';
import { PointTypeBadge } from './CounterStatusBadge';

interface Props {
  points: RoutePoint[];
  onReorder: (fromIndex: number, direction: 'up' | 'down') => void;
  onEdit: (point: RoutePoint) => void;
  onDelete: (pointId: string) => void;
}

export default function RoutePointList({ points, onReorder, onEdit, onDelete }: Props) {
  const { getCounterById } = useStore();

  const getPointName = (p: RoutePoint) => {
    if (p.counterId) {
      const counter = getCounterById(p.counterId);
      return counter?.name || `Counter ${p.counterId}`;
    }
    return p.customPointName || 'Unnamed Point';
  };

  const getPointWarning = (p: RoutePoint) => {
    if (p.counterId) {
      const counter = getCounterById(p.counterId);
      if (!counter) return 'Counter not found';
      if (counter.status === 'hold') return 'Counter is on hold';
      if (counter.status === 'removed') return 'Counter has been removed';
      if (counter.status === 'inactive') return 'Counter is inactive';
    }
    return null;
  };

  const isBreakPoint = (type: string) => type === 'Break Point' || type === 'Restaurant Break';

  if (points.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-muted-foreground">
        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No route points yet. Add points to build your route.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {points.sort((a, b) => a.orderIndex - b.orderIndex).map((point, idx) => {
        const warning = getPointWarning(point);
        return (
          <motion.div
            key={point.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={`glass-card p-4 ${isBreakPoint(point.pointType) ? 'border-l-2 border-l-warning' : ''} ${point.status === 'hold' ? 'opacity-70' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-success/15 text-success' :
                  idx === points.length - 1 ? 'bg-primary/15 text-primary' :
                  isBreakPoint(point.pointType) ? 'bg-warning/15 text-warning' :
                  'bg-secondary/60 text-muted-foreground'
                }`}>
                  {isBreakPoint(point.pointType) ? <Coffee className="w-3.5 h-3.5" /> : point.orderIndex}
                </div>
                {idx < points.length - 1 && <div className="w-px h-4 bg-border/40" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">{getPointName(point)}</span>
                  <PointTypeBadge type={point.pointType} />
                  {point.status === 'hold' && <span className="text-[11px] bg-warning/15 text-warning px-1.5 py-0.5 rounded-full">Hold</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  {point.haltMinutes > 0 && <span>Halt: {point.haltMinutes}m</span>}
                  {point.breakMinutes > 0 && <span className="text-warning">Break: {point.breakMinutes}m</span>}
                  {point.isBoardingAllowed && <span className="text-success">↑ Board</span>}
                  {point.isDroppingAllowed && <span className="text-info">↓ Drop</span>}
                  {!point.isVisibleToCustomer && <span className="text-muted-foreground italic">Hidden</span>}
                  {point.notes && <span className="italic truncate max-w-[120px]">{point.notes}</span>}
                </div>
                {warning && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-warning">
                    <AlertTriangle className="w-3 h-3" /> {warning}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => onReorder(idx, 'up')}>
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === points.length - 1} onClick={() => onReorder(idx, 'down')}>
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(point)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(point.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
