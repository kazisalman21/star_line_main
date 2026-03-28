import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Search, Trash2, Check, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getAllSchedules, getAllRoutes, getAllBuses, createSchedule, deleteSchedule, updateSchedule } from '@/services/adminService';
import { useConfirmDialog } from '@/components/admin/ConfirmDialog';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-success/15 text-success',
    inactive: 'bg-warning/15 text-warning',
  };
  return map[status] || 'bg-secondary text-muted-foreground';
};

export function SchedulesTab() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const { confirm, DialogComponent } = useConfirmDialog();
  
  const [form, setForm] = useState({ route_id: '', bus_id: '', departure_time: '', days: [0,1,2,3,4,5,6] as number[] });

  const load = async () => {
    const [sId, rId, bId] = await Promise.all([getAllSchedules(), getAllRoutes(), getAllBuses()]);
    setSchedules(sId); setRoutes(rId); setBuses(bId);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.route_id || !form.bus_id || !form.departure_time) return;
    setSaving(true);
    await createSchedule({
      route_id: form.route_id,
      bus_id: form.bus_id,
      departure_time: form.departure_time,
      arrival_time: form.departure_time, // simplified for now
      days_of_week: form.days
    });
    setForm({ route_id: '', bus_id: '', departure_time: '', days: [0,1,2,3,4,5,6] });
    setShowAdd(false);
    setSaving(false);
    load();
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Cancel Schedule',
      description: 'This schedule will be removed. Future bookings for this departure time will no longer be available.',
      confirmText: 'Remove Schedule',
      variant: 'warning',
      icon: 'cancel',
      onConfirm: async () => { await deleteSchedule(id); load(); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Schedule Management</h2>
          <p className="text-sm text-muted-foreground">{schedules.length} active scheduled trips</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search schedules..." className="pl-9 bg-secondary/50 border-border/40 sm:w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={() => setShowAdd(true)} className="btn-primary-glow shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add Schedule
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Route</TableHead>
              <TableHead className="text-muted-foreground">Depart Time</TableHead>
              <TableHead className="text-muted-foreground">Bus</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Days Running</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No schedules configured</TableCell></TableRow>
            ) : schedules.map((schedule, i) => {
              const route = schedule.routes || {};
              const bus = schedule.buses || {};
              const daysStr = ['Su','Mo','Tu','We','Th','Fr','Sa'].filter((_, i) => (schedule.days_of_week||[]).includes(i)).join(' ');
              
              if (searchQuery && !route.origin?.toLowerCase().includes(searchQuery.toLowerCase()) && !route.destination?.toLowerCase().includes(searchQuery.toLowerCase())) return null;

              return (
                <motion.tr key={schedule.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-border/20 hover:bg-secondary/20">
                  <TableCell>
                    <div className="font-medium text-sm">{route.origin || '?'} → {route.destination || '?'}</div>
                  </TableCell>
                  <TableCell className="font-medium">{schedule.departure_time?.slice(0, 5)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{bus.name || '?'}</div>
                    <div className="text-xs text-muted-foreground">{bus.type || '?'}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-[10px] text-muted-foreground tracking-widest">{daysStr}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(schedule.id)}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="glass-card border-border/40">
          <DialogHeader>
            <DialogTitle className="font-display">New Schedule</DialogTitle>
            <DialogDescription>Assign a bus to a route at a specific time.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Select Route</label>
              <select value={form.route_id} onChange={e => setForm(p => ({ ...p, route_id: e.target.value }))} className="w-full bg-secondary/50 h-10 px-3 rounded text-sm border-border outline-none">
                <option value="">Choose route...</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.origin} → {r.destination}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Select Bus</label>
              <select value={form.bus_id} onChange={e => setForm(p => ({ ...p, bus_id: e.target.value }))} className="w-full bg-secondary/50 h-10 px-3 rounded text-sm border-border outline-none">
                <option value="">Choose bus...</option>
                {buses.map(b => <option key={b.id} value={b.id}>{b.name} ({b.type})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Departure Time</label>
              <Input type="time" value={form.departure_time} onChange={e => setForm(p => ({ ...p, departure_time: e.target.value }))} className="bg-secondary/50 w-32" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="btn-primary-glow" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {DialogComponent}
    </div>
  );
}
