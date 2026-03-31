import { useState, useEffect } from 'react';
import type { Counter, CounterType, CounterStatus } from '@/data/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

const counterTypes: CounterType[] = ['Main Terminal', 'Counter', 'Pickup Point', 'Drop Point', 'Break Point', 'Restaurant Point'];
const counterStatuses: CounterStatus[] = ['active', 'hold', 'inactive'];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: Omit<Counter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Counter | null;
}

export function CounterFormDialog({ open, onOpenChange, onSubmit, initialData }: Props) {
  const [form, setForm] = useState({
    code: '', name: '', type: 'Counter' as CounterType, district: '', address: '', phone: '', notes: '', mapLocation: '', status: 'active' as CounterStatus, isMainTerminal: false,
  });

  useEffect(() => {
    if (initialData) {
      setForm({ code: initialData.code, name: initialData.name, type: initialData.type, district: initialData.district, address: initialData.address, phone: initialData.phone, notes: initialData.notes, mapLocation: initialData.mapLocation, status: initialData.status, isMainTerminal: initialData.isMainTerminal });
    } else {
      setForm({ code: '', name: '', type: 'Counter', district: '', address: '', phone: '', notes: '', mapLocation: '', status: 'active', isMainTerminal: false });
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.code.trim()) return;
    onSubmit(form);
    onOpenChange(false);
  };

  const set = (key: string, val: any) => setForm(p => ({ ...p, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/40 max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{initialData ? 'Edit Counter' : 'Add New Counter'}</DialogTitle>
          <DialogDescription>{initialData ? 'Update counter details.' : 'Register a new counter, terminal, or stoppage.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Counter Code *</label>
              <Input placeholder="e.g. DHK-KMR" className="bg-secondary/50" value={form.code} onChange={e => set('code', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Counter Name *</label>
              <Input placeholder="e.g. Dhaka Main Terminal" className="bg-secondary/50" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type</label>
              <select title="Counter type" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={form.type} onChange={e => { set('type', e.target.value); set('isMainTerminal', e.target.value === 'Main Terminal'); }}>
                {counterTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <select title="Counter status" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm capitalize" value={form.status} onChange={e => set('status', e.target.value)}>
                {counterStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">District</label>
              <Input placeholder="e.g. Dhaka" className="bg-secondary/50" value={form.district} onChange={e => set('district', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
              <Input placeholder="e.g. 01973-259700" className="bg-secondary/50" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Full Address</label>
            <Input placeholder="Full address" className="bg-secondary/50" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Map / Location (optional)</label>
            <Input placeholder="e.g. 23.7325° N, 90.4253° E" className="bg-secondary/50" value={form.mapLocation} onChange={e => set('mapLocation', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</label>
            <Input placeholder="Any additional notes" className="bg-secondary/50" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isMain" checked={form.isMainTerminal} onChange={e => set('isMainTerminal', e.target.checked)} className="rounded border-border" />
            <label htmlFor="isMain" className="text-sm text-muted-foreground">Mark as Main Terminal</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="btn-primary-glow" onClick={handleSubmit} disabled={!form.name.trim() || !form.code.trim()}>
            <Check className="w-4 h-4 mr-1" /> {initialData ? 'Update' : 'Add'} Counter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
