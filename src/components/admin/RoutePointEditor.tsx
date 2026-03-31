import { useState, useEffect } from 'react';
import type { RoutePoint, RoutePointType, RoutePointStatus } from '@/data/types';
import { useStore, generatePointId } from '@/data/counterStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, AlertTriangle } from 'lucide-react';
import { CounterStatusBadge } from './CounterStatusBadge';

const pointTypes: RoutePointType[] = ['Origin Terminal', 'Counter', 'Pickup Point', 'Drop Point', 'Intermediate Stop', 'Break Point', 'Restaurant Break', 'Destination Terminal'];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (point: RoutePoint) => void;
  initialData?: RoutePoint | null;
  routeId: string;
  nextOrderIndex: number;
}

export default function RoutePointEditor({ open, onOpenChange, onSubmit, initialData, routeId, nextOrderIndex }: Props) {
  const { counters } = useStore();
  const [pointType, setPointType] = useState<RoutePointType>('Counter');
  const [source, setSource] = useState<'counter' | 'custom'>('counter');
  const [counterId, setCounterId] = useState('');
  const [customName, setCustomName] = useState('');
  const [haltMinutes, setHaltMinutes] = useState(0);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [isBoardingAllowed, setIsBoardingAllowed] = useState(true);
  const [isDroppingAllowed, setIsDroppingAllowed] = useState(true);
  const [isVisibleToCustomer, setIsVisibleToCustomer] = useState(true);
  const [status, setStatus] = useState<RoutePointStatus>('active');
  const [notes, setNotes] = useState('');

  const isBreak = pointType === 'Break Point' || pointType === 'Restaurant Break';
  const selectableCounters = counters.filter(c => c.status !== 'removed');

  useEffect(() => {
    if (initialData) {
      setPointType(initialData.pointType);
      setSource(initialData.counterId ? 'counter' : 'custom');
      setCounterId(initialData.counterId || '');
      setCustomName(initialData.customPointName || '');
      setHaltMinutes(initialData.haltMinutes);
      setBreakMinutes(initialData.breakMinutes);
      setIsBoardingAllowed(initialData.isBoardingAllowed);
      setIsDroppingAllowed(initialData.isDroppingAllowed);
      setIsVisibleToCustomer(initialData.isVisibleToCustomer);
      setStatus(initialData.status);
      setNotes(initialData.notes);
    } else {
      setPointType('Counter');
      setSource('counter');
      setCounterId('');
      setCustomName('');
      setHaltMinutes(5);
      setBreakMinutes(0);
      setIsBoardingAllowed(true);
      setIsDroppingAllowed(true);
      setIsVisibleToCustomer(true);
      setStatus('active');
      setNotes('');
    }
  }, [initialData, open]);

  useEffect(() => {
    if (isBreak) {
      setIsBoardingAllowed(false);
      setIsDroppingAllowed(false);
      if (breakMinutes === 0) setBreakMinutes(15);
    }
  }, [pointType]);

  const selectedCounter = counterId ? counters.find(c => c.id === counterId) : null;
  const canSubmit = source === 'counter' ? !!counterId : !!customName.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    const point: RoutePoint = {
      id: initialData?.id || generatePointId(),
      routeId,
      orderIndex: initialData?.orderIndex || nextOrderIndex,
      pointType,
      counterId: source === 'counter' ? counterId : null,
      customPointName: source === 'custom' ? customName : null,
      haltMinutes: Math.max(0, haltMinutes),
      breakMinutes: Math.max(0, breakMinutes),
      isBoardingAllowed,
      isDroppingAllowed,
      isVisibleToCustomer,
      status,
      notes,
    };
    onSubmit(point);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/40 max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{initialData ? 'Edit Route Point' : 'Add Route Point'}</DialogTitle>
          <DialogDescription>Configure this stop on the route.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Point Type</label>
            <select title="Point type" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={pointType} onChange={e => setPointType(e.target.value as RoutePointType)}>
              {pointTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Point Source</label>
            <div className="flex gap-2">
              <Button variant={source === 'counter' ? 'default' : 'outline'} size="sm" onClick={() => setSource('counter')}>Select Existing Counter</Button>
              <Button variant={source === 'custom' ? 'default' : 'outline'} size="sm" onClick={() => setSource('custom')}>Custom Point</Button>
            </div>
          </div>

          {source === 'counter' ? (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Select Counter</label>
              <select title="Select counter" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={counterId} onChange={e => setCounterId(e.target.value)}>
                <option value="">— Select a counter —</option>
                {selectableCounters.map(c => (
                  <option key={c.id} value={c.id} disabled={c.status === 'inactive'}>
                    {c.name} ({c.code}) {c.status === 'hold' ? '⚠ Hold' : ''} {c.status === 'inactive' ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
              {selectedCounter && selectedCounter.status === 'hold' && (
                <div className="flex items-center gap-1 mt-1 text-xs text-warning">
                  <AlertTriangle className="w-3 h-3" /> This counter is currently on hold
                </div>
              )}
              {selectedCounter && (
                <div className="mt-2 flex items-center gap-2">
                  <CounterStatusBadge status={selectedCounter.status} />
                  <span className="text-xs text-muted-foreground">{selectedCounter.district} • {selectedCounter.type}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Custom Point Name</label>
              <Input placeholder="e.g. Comilla Break Point, Toll Plaza Stop" className="bg-secondary/50" value={customName} onChange={e => setCustomName(e.target.value)} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Halt Duration (min)</label>
              <Input type="number" min={0} className="bg-secondary/50" value={haltMinutes} onChange={e => setHaltMinutes(parseInt(e.target.value) || 0)} />
            </div>
            {isBreak && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Break Duration (min)</label>
                <Input type="number" min={0} className="bg-secondary/50" value={breakMinutes} onChange={e => setBreakMinutes(parseInt(e.target.value) || 0)} />
              </div>
            )}
          </div>

          {isBreak && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Break Note</label>
              <Input placeholder="e.g. Lunch break, Prayer break" className="bg-secondary/50" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isBoardingAllowed} onChange={e => setIsBoardingAllowed(e.target.checked)} className="rounded border-border" />
              <span className="text-xs text-muted-foreground">Boarding</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isDroppingAllowed} onChange={e => setIsDroppingAllowed(e.target.checked)} className="rounded border-border" />
              <span className="text-xs text-muted-foreground">Dropping</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isVisibleToCustomer} onChange={e => setIsVisibleToCustomer(e.target.checked)} className="rounded border-border" />
              <span className="text-xs text-muted-foreground">Visible</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Point Status</label>
              <select title="Point status" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm capitalize" value={status} onChange={e => setStatus(e.target.value as RoutePointStatus)}>
                <option value="active">Active</option>
                <option value="hold">Hold</option>
              </select>
            </div>
            {!isBreak && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</label>
                <Input placeholder="Optional note" className="bg-secondary/50" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="btn-primary-glow" onClick={handleSubmit} disabled={!canSubmit}>
            <Check className="w-4 h-4 mr-1" /> {initialData ? 'Update' : 'Add'} Point
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
