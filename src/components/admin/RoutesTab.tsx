import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Route, Plus, Search, Eye, Pencil, Trash2, Check, Loader2, Link as LinkIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getAllRoutes, createRoute, deleteRoute, updateRoute } from '@/services/adminService';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-success/15 text-success',
    inactive: 'bg-warning/15 text-warning',
  };
  return map[status] || 'bg-secondary text-muted-foreground';
};

export function RoutesTab() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [routeForm, setRouteForm] = useState({ origin: '', destination: '', distance_km: '', duration_minutes: '', base_fare: '' });

  const load = async () => {
    const data = await getAllRoutes();
    setRoutes(data);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!routeForm.origin || !routeForm.destination) return;
    setSaving(true);
    await createRoute({
      origin: routeForm.origin,
      destination: routeForm.destination,
      distance_km: parseInt(routeForm.distance_km) || 0,
      duration_minutes: parseInt(routeForm.duration_minutes) || 0,
      base_fare: parseInt(routeForm.base_fare) || 0
    });
    setRouteForm({ origin: '', destination: '', distance_km: '', duration_minutes: '', base_fare: '' });
    setShowAddRoute(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route? ALL schedules and bookings for this route will be impacted!')) return;
    await deleteRoute(id);
    load();
  };

  const handleToggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'active' ? 'inactive' : 'active';
    await updateRoute(id, { status: newStatus });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Route Management</h2>
          <p className="text-sm text-muted-foreground">{routes.length} configured bus routes</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search routes by city..." className="pl-9 bg-secondary/50 border-border/40 sm:w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={() => setShowAddRoute(true)} className="btn-primary-glow shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add Route
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-muted-foreground w-12"><Route className="w-4 h-4" /></TableHead>
              <TableHead className="text-muted-foreground">Origin → Destination</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Distance / Time</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Base Fare</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No routes configured yet. Click "Add Route".</TableCell></TableRow>
            ) : routes.filter(r => !searchQuery || r.origin.toLowerCase().includes(searchQuery.toLowerCase()) || r.destination.toLowerCase().includes(searchQuery.toLowerCase())).map((route, i) => (
              <motion.tr key={route.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-border/20 hover:bg-secondary/20">
                <TableCell>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 text-primary" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{route.origin} <span className="text-muted-foreground mx-1">→</span> {route.destination}</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-1 uppercase tracking-wider">ID: {route.id.slice(0, 8)}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-sm font-medium">{route.distance_km} km</div>
                  <div className="text-xs text-muted-foreground">{Math.floor(route.duration_minutes / 60)}h {route.duration_minutes % 60}m</div>
                </TableCell>
                <TableCell className="hidden lg:table-cell font-medium text-sm">৳{route.base_fare}</TableCell>
                <TableCell>
                  <button onClick={() => handleToggleStatus(route.id, route.status)} className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider capitalize ${statusBadge(route.status)} hover:opacity-80`}>
                    {route.status}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(route.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showAddRoute} onOpenChange={setShowAddRoute}>
        <DialogContent className="glass-card border-border/40">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Route</DialogTitle>
            <DialogDescription>Create a new bus route for scheduling.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Origin City</label><Input placeholder="e.g. Dhaka" value={routeForm.origin} onChange={e => setRouteForm(p => ({ ...p, origin: e.target.value }))} className="bg-secondary/50" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Destination City</label><Input placeholder="e.g. Feni" value={routeForm.destination} onChange={e => setRouteForm(p => ({ ...p, destination: e.target.value }))} className="bg-secondary/50" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Distance (km)</label><Input type="number" placeholder="150" value={routeForm.distance_km} onChange={e => setRouteForm(p => ({ ...p, distance_km: e.target.value }))} className="bg-secondary/50" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Time (minutes)</label><Input type="number" placeholder="180" value={routeForm.duration_minutes} onChange={e => setRouteForm(p => ({ ...p, duration_minutes: e.target.value }))} className="bg-secondary/50" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Base Fare (৳)</label><Input type="number" placeholder="400" value={routeForm.base_fare} onChange={e => setRouteForm(p => ({ ...p, base_fare: e.target.value }))} className="bg-secondary/50 flex-1 border-primary/20 bg-primary/5 text-primary focus-visible:ring-primary/40" /></div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/80 p-3 rounded-lg text-xs leading-relaxed">
              <strong>Note:</strong> Once created, you must add "Schedules" and "Counter Stops" before passengers can book tickets on this route.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRoute(false)}>Cancel</Button>
            <Button className="btn-primary-glow" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />} Add Route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
