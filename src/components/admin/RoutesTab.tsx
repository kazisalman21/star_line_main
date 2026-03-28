import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Route, Plus, Search, Eye, Pencil, Trash2, Check, Loader2, Link as LinkIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getAllRoutes, createRoute, deleteRoute, updateRoute } from '@/services/adminService';
import { getRoutesWithCounters } from '@/services/counterService';
import { useConfirmDialog } from '@/components/admin/ConfirmDialog';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-success/15 text-success',
    inactive: 'bg-warning/15 text-warning',
  };
  return map[status] || 'bg-secondary text-muted-foreground';
};

export function RoutesTab() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [counterMap, setCounterMap] = useState<Record<string, { total: number; active: number; hasUnverified: boolean }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [showViewRoute, setShowViewRoute] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { confirm, DialogComponent } = useConfirmDialog();

  const [routeForm, setRouteForm] = useState({ origin: '', destination: '', distance_km: '', duration_minutes: '', base_fare: '' });

  const load = async () => {
    const [routeData, rcData] = await Promise.all([getAllRoutes(), getRoutesWithCounters()]);
    setRoutes(routeData);

    // Build counter stats map by route ID
    const map: Record<string, { total: number; active: number; hasUnverified: boolean }> = {};
    rcData.forEach((rc: any) => {
      map[rc.id] = {
        total: rc.counters.length,
        active: rc.counters.filter((c: any) => c.status === 'Active').length,
        hasUnverified: rc.counters.some((c: any) => c.status === 'Unverified'),
      };
    });
    setCounterMap(map);
  };

  useEffect(() => { load(); }, []);

  const handleCreateOrUpdate = async () => {
    if (!routeForm.origin || !routeForm.destination) return;
    setSaving(true);
    
    if (editingId) {
      await updateRoute(editingId, {
        origin: routeForm.origin,
        destination: routeForm.destination,
        distance_km: parseInt(routeForm.distance_km) || 0,
        duration_minutes: parseInt(routeForm.duration_minutes) || 0,
        base_fare: parseInt(routeForm.base_fare) || 0
      });
    } else {
      await createRoute({
        origin: routeForm.origin,
        destination: routeForm.destination,
        distance_km: parseInt(routeForm.distance_km) || 0,
        duration_minutes: parseInt(routeForm.duration_minutes) || 0,
        base_fare: parseInt(routeForm.base_fare) || 0
      });
    }
    
    setRouteForm({ origin: '', destination: '', distance_km: '', duration_minutes: '', base_fare: '' });
    setEditingId(null);
    setShowAddRoute(false);
    setSaving(false);
    load();
  };

  const openForEdit = (route: any) => {
    setEditingId(route.id);
    setRouteForm({
      origin: route.origin,
      destination: route.destination,
      distance_km: route.distance_km.toString(),
      duration_minutes: route.duration_minutes.toString(),
      base_fare: route.base_fare.toString()
    });
    setShowAddRoute(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Delete Route Permanently',
      description: 'This will permanently remove this route. All schedules, bookings, and counter stops associated with it will be impacted.',
      confirmText: 'Delete Route',
      variant: 'danger',
      icon: 'warning',
      onConfirm: async () => { await deleteRoute(id); load(); },
    });
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
          <p className="text-sm text-muted-foreground">{routes.length} routes configured</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search routes by city..." className="pl-9 bg-secondary/50 border-border/40 sm:w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={() => { setEditingId(null); setRouteForm({ origin: '', destination: '', distance_km: '', duration_minutes: '', base_fare: '' }); setShowAddRoute(true); }} className="btn-primary-glow shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add Route
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-mono text-xs">Route ID</TableHead>
              <TableHead className="text-muted-foreground">From</TableHead>
              <TableHead className="text-muted-foreground">To</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Stops</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No routes configured yet. Click "Add Route".</TableCell></TableRow>
            ) : routes.filter(r => !searchQuery || r.origin.toLowerCase().includes(searchQuery.toLowerCase()) || r.destination.toLowerCase().includes(searchQuery.toLowerCase())).map((route, i) => {
              const cs = counterMap[route.id] || { total: 0, active: 0, hasUnverified: false };
              return (
                <motion.tr key={route.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-border/20 hover:bg-secondary/20">
                  <TableCell className="font-mono text-xs text-muted-foreground uppercase">{route.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium text-sm">{route.origin}</TableCell>
                  <TableCell className="font-medium text-sm">{route.destination}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs bg-secondary/60 px-2 py-1 rounded-md">{cs.total} stops</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {cs.total > 0 ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cs.hasUnverified ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'}`}>
                        {cs.hasUnverified ? 'Partially Verified' : 'Verified'}
                      </span>
                    ) : (
                      <button onClick={() => handleToggleStatus(route.id, route.status)} className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider capitalize ${statusBadge(route.status)} hover:opacity-80`}>
                        {route.status}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedRoute({ ...route, ...cs }); setShowViewRoute(true); }}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openForEdit(route)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(route.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* View Route Detail Dialog */}
      <Dialog open={showViewRoute} onOpenChange={setShowViewRoute}>
        <DialogContent className="glass-card border-border/40 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Route Details</DialogTitle>
            <DialogDescription>Full route information</DialogDescription>
          </DialogHeader>
          {selectedRoute && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-muted-foreground">Route</span>
                <span className="font-medium">{selectedRoute.origin} → {selectedRoute.destination}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-medium">{selectedRoute.distance_km} km</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{Math.floor(selectedRoute.duration_minutes / 60)}h {selectedRoute.duration_minutes % 60}m</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-muted-foreground">Base Fare</span>
                <span className="font-medium">৳{selectedRoute.base_fare}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-muted-foreground">Counter Stops</span>
                <span className="font-medium">{selectedRoute.total || 0} stops ({selectedRoute.active || 0} active)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(selectedRoute.status)}`}>{selectedRoute.status}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Route Dialog */}
      <Dialog open={showAddRoute} onOpenChange={(open) => { setShowAddRoute(open); if (!open) setEditingId(null); }}>
        <DialogContent className="glass-card border-border/40">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? 'Edit Route' : 'Add New Route'}</DialogTitle>
            <DialogDescription>{editingId ? 'Update details for this bus route.' : 'Create a new bus route for scheduling.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Origin City</label><Input placeholder="e.g. Dhaka" value={routeForm.origin} onChange={e => setRouteForm(p => ({ ...p, origin: e.target.value }))} className="bg-secondary/50" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Destination City</label><Input placeholder="e.g. Feni" value={routeForm.destination} onChange={e => setRouteForm(p => ({ ...p, destination: e.target.value }))} className="bg-secondary/50" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Distance (km)</label><Input type="number" placeholder="150" value={routeForm.distance_km} onChange={e => setRouteForm(p => ({ ...p, distance_km: e.target.value }))} className="bg-secondary/50" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Time (minutes)</label><Input type="number" placeholder="180" value={routeForm.duration_minutes} onChange={e => setRouteForm(p => ({ ...p, duration_minutes: e.target.value }))} className="bg-secondary/50" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Base Fare (৳)</label><Input type="number" placeholder="400" value={routeForm.base_fare} onChange={e => setRouteForm(p => ({ ...p, base_fare: e.target.value }))} className="bg-secondary/50" /></div>
            </div>
            {!editingId && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/80 p-3 rounded-lg text-xs leading-relaxed">
                <strong>Note:</strong> Once created, you must add "Schedules" and "Counter Stops" before passengers can book tickets on this route.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRoute(false)}>Cancel</Button>
            <Button className="btn-primary-glow" onClick={handleCreateOrUpdate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />} {editingId ? 'Save Changes' : 'Add Route'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {DialogComponent}
    </div>
  );
}
