import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Plus, Search, Pencil, Trash2, Eye, Power, Wrench, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getAllBuses, getFleetStatus, createBus, deleteBus, updateBus, FleetStatus } from '@/services/adminService';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-success/15 text-success',
    maintenance: 'bg-warning/15 text-warning',
    retired: 'bg-destructive/15 text-destructive',
  };
  return map[status] || 'bg-secondary text-muted-foreground';
};

export function FleetTab() {
  const [buses, setBuses] = useState<any[]>([]);
  const [fleetStats, setFleetStats] = useState<FleetStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBus, setShowAddBus] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [busForm, setBusForm] = useState({ name: '', regNo: '', type: 'AC Business', seats: '36' });

  const load = async () => {
    const [b, f] = await Promise.all([getAllBuses(), getFleetStatus()]);
    setBuses(b);
    setFleetStats(f);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!busForm.name || !busForm.regNo) return;
    setSaving(true);
    await createBus({
      name: busForm.name,
      registration_number: busForm.regNo,
      type: busForm.type as any,
      total_seats: parseInt(busForm.seats) || 36
    });
    setBusForm({ name: '', regNo: '', type: 'AC Business', seats: '36' });
    setShowAddBus(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) return;
    await deleteBus(id);
    load();
  };

  const handleToggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'active' ? 'maintenance' : current === 'maintenance' ? 'retired' : 'active';
    await updateBus(id, { status: newStatus });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Fleet Management</h2>
          <p className="text-sm text-muted-foreground">{buses.length} buses in your fleet</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search buses..." className="pl-9 bg-secondary/50 border-border/40 sm:w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={() => setShowAddBus(true)} className="btn-primary-glow shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add Bus
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Type / Seats</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Reg. No</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buses.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No buses created yet. Click "Add Bus" to start.</TableCell></TableRow>
            ) : buses.filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.registration_number.toLowerCase().includes(searchQuery.toLowerCase())).map((bus, i) => (
              <motion.tr key={bus.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-border/20 hover:bg-secondary/20">
                <TableCell>
                  <div className="font-medium text-sm">{bus.name}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-xs bg-secondary/60 px-2 py-1 rounded-md inline-block">{bus.type}</div>
                  <div className="text-xs text-muted-foreground mt-1">{bus.total_seats} seats</div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs font-mono">{bus.registration_number}</TableCell>
                <TableCell>
                  <button onClick={() => handleToggleStatus(bus.id, bus.status)} className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(bus.status)} hover:opacity-80`}>
                    {bus.status}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(bus.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {fleetStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Buses', value: fleetStats.active, icon: Power, color: 'text-success' },
            { label: 'In Maintenance', value: fleetStats.maintenance, icon: Wrench, color: 'text-warning' },
            { label: 'Retired', value: fleetStats.retired, icon: AlertTriangle, color: 'text-destructive' },
            { label: 'Total Fleet', value: fleetStats.total, icon: Bus, color: 'text-primary' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-4">
              <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
              <div className="font-display text-xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAddBus} onOpenChange={setShowAddBus}>
        <DialogContent className="glass-card border-border/40">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Bus</DialogTitle>
            <DialogDescription>Register a new bus to the Starline fleet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Bus Name</label><Input placeholder="e.g. Starline Gold-07" value={busForm.name} onChange={e => setBusForm(p => ({ ...p, name: e.target.value }))} className="bg-secondary/50" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Registration No</label><Input placeholder="e.g. DM-Ga-21-1234" value={busForm.regNo} onChange={e => setBusForm(p => ({ ...p, regNo: e.target.value }))} className="bg-secondary/50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Coach Type</label>
                <select className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={busForm.type} onChange={e => setBusForm(p => ({ ...p, type: e.target.value }))}>
                  <option>AC Sleeper</option><option>AC Business</option><option>AC Economy</option><option>Non-AC</option>
                </select>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Seats</label><Input type="number" value={busForm.seats} onChange={e => setBusForm(p => ({ ...p, seats: e.target.value }))} className="bg-secondary/50" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBus(false)}>Cancel</Button>
            <Button className="btn-primary-glow" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />} Add Bus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
