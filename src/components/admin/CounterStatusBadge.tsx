import type { CounterStatus } from '@/data/types';

const statusConfig: Record<CounterStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-success/15 text-success' },
  hold: { label: 'Hold', className: 'bg-warning/15 text-warning' },
  inactive: { label: 'Inactive', className: 'bg-muted-foreground/20 text-muted-foreground' },
  removed: { label: 'Removed', className: 'bg-destructive/15 text-destructive' },
};

export function CounterStatusBadge({ status }: { status: CounterStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export function RouteStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: 'bg-muted-foreground/20 text-muted-foreground',
    active: 'bg-success/15 text-success',
    hold: 'bg-warning/15 text-warning',
    archived: 'bg-secondary text-muted-foreground',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${map[status] || 'bg-secondary text-muted-foreground'}`}>
      {status}
    </span>
  );
}

export function PointTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    'Origin Terminal': 'bg-primary/15 text-primary',
    'Destination Terminal': 'bg-primary/15 text-primary',
    'Counter': 'bg-info/15 text-info',
    'Pickup Point': 'bg-success/15 text-success',
    'Drop Point': 'bg-accent/15 text-accent',
    'Intermediate Stop': 'bg-secondary text-muted-foreground',
    'Break Point': 'bg-warning/15 text-warning',
    'Restaurant Break': 'bg-warning/15 text-warning',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${map[type] || 'bg-secondary text-muted-foreground'}`}>
      {type}
    </span>
  );
}
