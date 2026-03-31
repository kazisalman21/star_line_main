import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, Building2, Phone, MapPin, Eye, Pencil, AlertTriangle } from 'lucide-react';
import { useStore } from '@/data/counterStore';
import type { Counter, CounterType, CounterStatus } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { CounterStatusBadge } from './CounterStatusBadge';
import { CounterFormDialog } from './CounterFormDialog';

export default function CounterManagementSection() {
  const { counters, addCounter, updateCounter, setCounterStatus, getCounterUsageCount } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<CounterType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<CounterStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  const [viewCounter, setViewCounter] = useState<Counter | null>(null);
  const [statusChangeDialog, setStatusChangeDialog] = useState<{ counter: Counter; targetStatus: CounterStatus } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return counters.filter(c => {
      if (filterType !== 'all' && c.type !== filterType) return false;
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.district.toLowerCase().includes(q) || c.phone.includes(q);
      }
      return true;
    });
  }, [counters, search, filterType, filterStatus]);

  const stats = useMemo(() => ({
    total: counters.length,
    active: counters.filter(c => c.status === 'active').length,
    hold: counters.filter(c => c.status === 'hold').length,
    inactive: counters.filter(c => c.status === 'inactive').length,
    removed: counters.filter(c => c.status === 'removed').length,
  }), [counters]);

  const handleStatusChange = (counter: Counter, status: CounterStatus) => {
    const usage = getCounterUsageCount(counter.id);
    if (usage > 0 && (status === 'removed' || status === 'inactive')) {
      setStatusChangeDialog({ counter, targetStatus: status });
    } else {
      setCounterStatus(counter.id, status);
    }
  };

  const confirmStatusChange = () => {
    if (statusChangeDialog) {
      setCounterStatus(statusChangeDialog.counter.id, statusChangeDialog.targetStatus);
      setStatusChangeDialog(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Counter & Terminal Management</h2>
          <p className="text-sm text-muted-foreground">{stats.total} counters registered • {stats.active} active</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search name, code, district..." className="pl-9 bg-secondary/50 border-border/40 sm:w-72" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'border-primary text-primary' : ''}>
            <Filter className="w-4 h-4" />
          </Button>
          <Button onClick={() => { setEditingCounter(null); setShowForm(true); }} className="btn-primary-glow shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add Counter
          </Button>
        </div>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-4 flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Type</label>
            <select title="Filter by type" className="h-9 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
              <option value="all">All Types</option>
              {(['Main Terminal', 'Counter', 'Pickup Point', 'Drop Point', 'Break Point', 'Restaurant Point'] as CounterType[]).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <select title="Filter by status" className="h-9 rounded-md border border-input bg-secondary/50 px-3 text-sm capitalize" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
              <option value="all">All Statuses</option>
              {(['active', 'hold', 'inactive', 'removed'] as CounterStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={() => { setFilterType('all'); setFilterStatus('all'); setSearch(''); }}>Clear Filters</Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Active', value: stats.active, color: 'text-success' },
          { label: 'On Hold', value: stats.hold, color: 'text-warning' },
          { label: 'Inactive', value: stats.inactive, color: 'text-muted-foreground' },
          { label: 'Removed', value: stats.removed, color: 'text-destructive' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-3 text-center">
            <div className={`font-display text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((counter, i) => {
          const usage = getCounterUsageCount(counter.id);
          return (
            <motion.div key={counter.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`glass-card p-5 card-hover ${counter.status === 'removed' ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${counter.isMainTerminal ? 'bg-primary/15' : 'bg-secondary/60'}`}>
                    <Building2 className={`w-5 h-5 ${counter.isMainTerminal ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{counter.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{counter.code}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewCounter(counter)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingCounter(counter); setShowForm(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                {counter.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {counter.phone}</span>}
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {counter.district}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <CounterStatusBadge status={counter.status} />
                  {counter.isMainTerminal && <span className="text-[11px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">Main</span>}
                  <span className="text-[11px] bg-secondary/60 px-2 py-0.5 rounded-full text-muted-foreground">{counter.type}</span>
                </div>
                {usage > 0 && <span className="text-[11px] bg-info/10 text-info px-2 py-0.5 rounded-full font-medium">{usage} route{usage > 1 ? 's' : ''}</span>}
              </div>
              {counter.status !== 'removed' && (
                <div className="mt-3 pt-3 border-t border-border/20 flex gap-2">
                  {counter.status !== 'active' && <Button variant="ghost" size="sm" className="h-7 text-xs text-success hover:text-success" onClick={() => handleStatusChange(counter, 'active')}>Activate</Button>}
                  {counter.status !== 'hold' && <Button variant="ghost" size="sm" className="h-7 text-xs text-warning hover:text-warning" onClick={() => handleStatusChange(counter, 'hold')}>Hold</Button>}
                  {counter.status !== 'inactive' && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleStatusChange(counter, 'inactive')}>Deactivate</Button>}
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive ml-auto" onClick={() => handleStatusChange(counter, 'removed')}>Remove</Button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No counters found matching your criteria.</p>
        </div>
      )}

      <CounterFormDialog open={showForm} onOpenChange={setShowForm} initialData={editingCounter} onSubmit={(data) => { if (editingCounter) { updateCounter(editingCounter.id, data); } else { addCounter(data); } }} />

      <Dialog open={!!viewCounter} onOpenChange={() => setViewCounter(null)}>
        <DialogContent className="glass-card border-border/40 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Counter Details</DialogTitle>
            <DialogDescription>{viewCounter?.name}</DialogDescription>
          </DialogHeader>
          {viewCounter && (
            <div className="space-y-3 text-sm">
              {[
                ['Code', viewCounter.code], ['Name', viewCounter.name], ['Type', viewCounter.type],
                ['District', viewCounter.district], ['Address', viewCounter.address],
                ['Phone', viewCounter.phone || '—'], ['Map', viewCounter.mapLocation || '—'],
                ['Notes', viewCounter.notes || '—'], ['Main Terminal', viewCounter.isMainTerminal ? 'Yes' : 'No'],
                ['Status', viewCounter.status], ['Created', viewCounter.createdAt], ['Updated', viewCounter.updatedAt],
                ['Routes Using', String(getCounterUsageCount(viewCounter.id))],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-border/20 last:border-0">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-right max-w-[60%] truncate capitalize">{v}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!statusChangeDialog} onOpenChange={() => setStatusChangeDialog(null)}>
        <DialogContent className="glass-card border-border/40 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" /> Counter In Use
            </DialogTitle>
            <DialogDescription>
              <strong>{statusChangeDialog?.counter.name}</strong> is used in{' '}
              <strong>{statusChangeDialog ? getCounterUsageCount(statusChangeDialog.counter.id) : 0} route(s)</strong>.
              {statusChangeDialog?.targetStatus === 'removed'
                ? ' Removing it will hide it from route builder. Existing routes will keep the reference.'
                : ' This may affect those routes.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusChangeDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmStatusChange}>
              Confirm {statusChangeDialog?.targetStatus === 'removed' ? 'Remove' : 'Status Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
