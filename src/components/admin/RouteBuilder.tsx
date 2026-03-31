import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Save, Send, Pause, Archive, Copy, RefreshCcw, AlertTriangle } from 'lucide-react';
import type { RouteData, RoutePoint, RouteStatus } from '@/data/types';
import { useStore, generatePointId } from '@/data/counterStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RoutePointList from './RoutePointList';
import RoutePointEditor from './RoutePointEditor';
import RouteTimelinePreview from './RouteTimelinePreview';

interface Props {
  route?: RouteData | null;
  onBack: () => void;
}

const emptyRoute: Omit<RouteData, 'id' | 'createdAt' | 'updatedAt'> = {
  code: '', name: '', from: '', to: '', direction: 'Outbound', estimatedDuration: '', baseFare: 0, status: 'draft', notes: '', points: [],
};

export default function RouteBuilder({ route, onBack }: Props) {
  const { addRoute, updateRoute, setRouteStatus, duplicateRoute } = useStore();
  const [form, setForm] = useState(() => route ? { code: route.code, name: route.name, from: route.from, to: route.to, direction: route.direction, estimatedDuration: route.estimatedDuration, baseFare: route.baseFare, notes: route.notes } : { ...emptyRoute });
  const [points, setPoints] = useState<RoutePoint[]>(() => route?.points || []);
  const [status, setStatus] = useState<RouteStatus>(() => route?.status || 'draft');
  const [showPointEditor, setShowPointEditor] = useState(false);
  const [editingPoint, setEditingPoint] = useState<RoutePoint | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const routeId = route?.id || 'NEW';
  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  const validate = useCallback((): string[] => {
    const errors: string[] = [];
    if (!form.name.trim()) errors.push('Route name is required');
    if (!form.code.trim()) errors.push('Route code is required');
    if (points.length < 2) errors.push('A route must have at least 2 points');
    if (points.length > 0) {
      const sorted = [...points].sort((a, b) => a.orderIndex - b.orderIndex);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      if (first.pointType !== 'Origin Terminal') errors.push('First point should be an Origin Terminal');
      if (last.pointType !== 'Destination Terminal') errors.push('Last point should be a Destination Terminal');
    }
    if (points.some(p => p.breakMinutes < 0)) errors.push('Break duration cannot be negative');
    if (points.some(p => p.status === 'hold')) errors.push('Warning: Some points are on hold');
    return errors;
  }, [form, points]);

  const handleSave = (targetStatus?: RouteStatus) => {
    const errors = validate();
    const blockingErrors = errors.filter(e => !e.startsWith('Warning'));
    if (targetStatus === 'active' && blockingErrors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    const routeData = {
      ...form,
      status: targetStatus || status,
      points: points.map((p, i) => ({ ...p, orderIndex: i + 1 })),
    };

    if (route) {
      updateRoute(route.id, routeData);
    } else {
      addRoute(routeData as any);
    }
    onBack();
  };

  const handlePointSubmit = (point: RoutePoint) => {
    setPoints(prev => {
      const existing = prev.find(p => p.id === point.id);
      if (existing) return prev.map(p => p.id === point.id ? point : p);
      return [...prev, { ...point, orderIndex: prev.length + 1 }];
    });
    setEditingPoint(null);
  };

  const handleReorder = (fromIndex: number, direction: 'up' | 'down') => {
    const sorted = [...points].sort((a, b) => a.orderIndex - b.orderIndex);
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= sorted.length) return;
    [sorted[fromIndex], sorted[toIndex]] = [sorted[toIndex], sorted[fromIndex]];
    setPoints(sorted.map((p, i) => ({ ...p, orderIndex: i + 1 })));
  };

  const handleDeletePoint = (pointId: string) => {
    setPoints(prev => prev.filter(p => p.id !== pointId).map((p, i) => ({ ...p, orderIndex: i + 1 })));
  };

  const handleDuplicate = () => {
    if (route) {
      duplicateRoute(route.id);
      onBack();
    }
  };

  const handleCreateReverse = () => {
    if (!route) return;
    const reversed = [...points].sort((a, b) => a.orderIndex - b.orderIndex).reverse();
    const newPoints: RoutePoint[] = reversed.map((p, i) => ({
      ...p,
      id: generatePointId(),
      routeId: 'NEW',
      orderIndex: i + 1,
      pointType: i === 0 ? 'Origin Terminal' as const : i === reversed.length - 1 ? 'Destination Terminal' as const : p.pointType,
    }));
    setForm(prev => ({ ...prev, code: `${prev.code}-REV`, name: `${prev.name} (Reverse)`, from: prev.to, to: prev.from }));
    setPoints(newPoints);
    setStatus('draft');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h2 className="font-display text-xl font-bold">{route ? 'Edit Route' : 'Create New Route'}</h2>
            <p className="text-sm text-muted-foreground">{route ? route.code : 'New route draft'}</p>
          </div>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="glass-card p-4 border-l-2 border-l-destructive">
          <div className="flex items-center gap-2 text-destructive font-medium text-sm mb-2">
            <AlertTriangle className="w-4 h-4" /> Validation Issues
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            {validationErrors.map((e, i) => <li key={i}>• {e}</li>)}
          </ul>
        </div>
      )}

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display font-semibold text-sm">Route Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Route Code *</label>
            <Input className="bg-secondary/50" placeholder="e.g. DHK-CTG-01" value={form.code} onChange={e => set('code', e.target.value)} />
          </div>
          <div className="col-span-2 md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Route Name *</label>
            <Input className="bg-secondary/50" placeholder="e.g. Dhaka – Chattogram Express" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">From</label>
            <Input className="bg-secondary/50" placeholder="Origin city" value={form.from} onChange={e => set('from', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">To</label>
            <Input className="bg-secondary/50" placeholder="Destination city" value={form.to} onChange={e => set('to', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Direction</label>
            <select title="Route direction" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={form.direction} onChange={e => set('direction', e.target.value)}>
              <option>Outbound</option><option>Inbound</option><option>Both</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Est. Duration</label>
            <Input className="bg-secondary/50" placeholder="e.g. 5h 30m" value={form.estimatedDuration} onChange={e => set('estimatedDuration', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Base Fare (৳)</label>
            <Input type="number" min={0} className="bg-secondary/50" value={form.baseFare} onChange={e => set('baseFare', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <Input className="bg-secondary/50" placeholder="Optional notes" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm">Route Points ({points.length})</h3>
            <Button size="sm" onClick={() => { setEditingPoint(null); setShowPointEditor(true); }} className="btn-primary-glow">
              <Plus className="w-4 h-4 mr-1" /> Add Point
            </Button>
          </div>
          <RoutePointList points={points} onReorder={handleReorder} onEdit={(p) => { setEditingPoint(p); setShowPointEditor(true); }} onDelete={handleDeletePoint} />
        </div>
        <div className="space-y-4">
          <RouteTimelinePreview points={points} />
          <div className="glass-card p-5 space-y-3">
            <h4 className="font-display font-semibold text-sm">Summary</h4>
            <div className="text-xs space-y-2 text-muted-foreground">
              <div className="flex justify-between"><span>Total Points</span><span className="font-medium text-foreground">{points.length}</span></div>
              <div className="flex justify-between"><span>Boarding Points</span><span className="font-medium text-foreground">{points.filter(p => p.isBoardingAllowed).length}</span></div>
              <div className="flex justify-between"><span>Drop Points</span><span className="font-medium text-foreground">{points.filter(p => p.isDroppingAllowed).length}</span></div>
              <div className="flex justify-between"><span>Break Stops</span><span className="font-medium text-foreground">{points.filter(p => p.pointType === 'Break Point' || p.pointType === 'Restaurant Break').length}</span></div>
              <div className="flex justify-between"><span>Total Halt</span><span className="font-medium text-foreground">{points.reduce((s, p) => s + p.haltMinutes, 0)}m</span></div>
              <div className="flex justify-between"><span>Total Break</span><span className="font-medium text-foreground">{points.reduce((s, p) => s + p.breakMinutes, 0)}m</span></div>
              <div className="flex justify-between"><span>Points on Hold</span><span className={`font-medium ${points.some(p => p.status === 'hold') ? 'text-warning' : 'text-foreground'}`}>{points.filter(p => p.status === 'hold').length}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => handleSave('draft')}><Save className="w-4 h-4 mr-1" /> Save Draft</Button>
          <Button onClick={() => handleSave()} className="btn-primary-glow"><Save className="w-4 h-4 mr-1" /> {route ? 'Update Route' : 'Save Route'}</Button>
          <Button variant="outline" onClick={() => handleSave('active')} className="text-success border-success/30 hover:bg-success/10 hover:text-success"><Send className="w-4 h-4 mr-1" /> Publish</Button>
          {route && (
            <>
              <Button variant="outline" onClick={() => { setRouteStatus(route.id, 'hold'); onBack(); }} className="text-warning border-warning/30 hover:bg-warning/10 hover:text-warning"><Pause className="w-4 h-4 mr-1" /> Hold</Button>
              <Button variant="outline" onClick={() => { setRouteStatus(route.id, 'archived'); onBack(); }}><Archive className="w-4 h-4 mr-1" /> Archive</Button>
              <Button variant="outline" onClick={handleDuplicate}><Copy className="w-4 h-4 mr-1" /> Duplicate</Button>
              <Button variant="outline" onClick={handleCreateReverse}><RefreshCcw className="w-4 h-4 mr-1" /> Create Reverse</Button>
            </>
          )}
        </div>
      </div>

      <RoutePointEditor open={showPointEditor} onOpenChange={setShowPointEditor} onSubmit={handlePointSubmit} initialData={editingPoint} routeId={routeId} nextOrderIndex={points.length + 1} />
    </motion.div>
  );
}
