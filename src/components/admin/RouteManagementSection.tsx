import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, Pencil, Trash2, Route, Copy, Filter } from 'lucide-react';
import { useStore } from '@/data/counterStore';
import type { RouteData, RouteStatus } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RouteStatusBadge } from './CounterStatusBadge';
import RouteBuilder from './RouteBuilder';
import RouteTimelinePreview from './RouteTimelinePreview';

export default function RouteManagementSection() {
  const { routes, deleteRoute, duplicateRoute, loadAll } = useStore();

  useEffect(() => { loadAll(); }, []);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<RouteStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [builderRoute, setBuilderRoute] = useState<RouteData | null | undefined>(undefined);
  const [viewRoute, setViewRoute] = useState<RouteData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return routes.filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.from.toLowerCase().includes(q) || r.to.toLowerCase().includes(q);
      }
      return true;
    });
  }, [routes, search, filterStatus]);

  const stats = useMemo(() => ({
    total: routes.length,
    active: routes.filter(r => r.status === 'active').length,
    draft: routes.filter(r => r.status === 'draft').length,
    hold: routes.filter(r => r.status === 'hold').length,
  }), [routes]);

  if (builderRoute !== undefined) {
    return <RouteBuilder route={builderRoute} onBack={() => setBuilderRoute(undefined)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Route Management</h2>
          <p className="text-sm text-muted-foreground">{stats.total} routes • {stats.active} active</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search routes..." className="pl-9 bg-secondary/50 border-border/40 sm:w-64" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'border-primary text-primary' : ''}>
            <Filter className="w-4 h-4" />
          </Button>
          <Button onClick={() => setBuilderRoute(null)} className="btn-primary-glow shrink-0">
            <Plus className="w-4 h-4 mr-1" /> New Route
          </Button>
        </div>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-4 flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <select title="Filter by status" className="h-9 rounded-md border border-input bg-secondary/50 px-3 text-sm capitalize" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="hold">Hold</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={() => { setFilterStatus('all'); setSearch(''); }}>Clear</Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Routes', value: stats.total, color: 'text-foreground' },
          { label: 'Active', value: stats.active, color: 'text-success' },
          { label: 'Drafts', value: stats.draft, color: 'text-muted-foreground' },
          { label: 'On Hold', value: stats.hold, color: 'text-warning' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-3 text-center">
            <div className={`font-display text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Code</TableHead>
              <TableHead className="text-muted-foreground">Route</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">From → To</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Points</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Duration</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Fare</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((route, i) => (
              <motion.tr key={route.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-border/20 hover:bg-secondary/20">
                <TableCell className="font-mono text-xs text-muted-foreground">{route.code}</TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{route.name}</div>
                  <div className="text-xs text-muted-foreground md:hidden">{route.from} → {route.to}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">{route.from} → {route.to}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-xs bg-secondary/60 px-2 py-1 rounded-md">{route.points.length} stops</span>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{route.estimatedDuration}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm font-medium">৳{route.baseFare.toLocaleString()}</TableCell>
                <TableCell><RouteStatusBadge status={route.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRoute(route)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setBuilderRoute(route)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { duplicateRoute(route.id); }}><Copy className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(route.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center text-muted-foreground">
          <Route className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No routes found.</p>
        </div>
      )}

      <Dialog open={!!viewRoute} onOpenChange={() => setViewRoute(null)}>
        <DialogContent className="glass-card border-border/40 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Route Details — {viewRoute?.code}</DialogTitle>
            <DialogDescription>{viewRoute?.name}</DialogDescription>
          </DialogHeader>
          {viewRoute && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                {[
                  ['From → To', `${viewRoute.from} → ${viewRoute.to}`],
                  ['Direction', viewRoute.direction],
                  ['Duration', viewRoute.estimatedDuration],
                  ['Base Fare', `৳${viewRoute.baseFare.toLocaleString()}`],
                  ['Status', viewRoute.status],
                  ['Points', String(viewRoute.points.length)],
                  ['Notes', viewRoute.notes || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2 border-b border-border/20 last:border-0">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium capitalize">{v}</span>
                  </div>
                ))}
              </div>
              <RouteTimelinePreview points={viewRoute.points} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="glass-card border-border/40 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">Delete Route</DialogTitle>
            <DialogDescription>Are you sure you want to delete this route? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) deleteRoute(deleteConfirm); setDeleteConfirm(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
