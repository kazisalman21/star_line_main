import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, Plus, Search, Pencil, Trash2, Eye, Power, Wrench, AlertTriangle, Check, Loader2, UserCog, UserCheck, ClipboardList } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getAllBuses, getFleetStatus, createBus, deleteBus, updateBus, FleetStatus } from '@/services/adminService';
import { useConfirmDialog } from '@/components/admin/ConfirmDialog';
import { usePersonnelStore } from '@/data/personnelStore';

const busTypeOptions = ['AC', 'Non-AC'];
const seatCapacityOptions = [36, 40, 41];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-success/15 text-success',
    maintenance: 'bg-warning/15 text-warning',
    retired: 'bg-destructive/15 text-destructive',
    inactive: 'bg-destructive/15 text-destructive',
  };
  return map[status] || 'bg-secondary text-muted-foreground';
};

export function FleetTab() {
  const [buses, setBuses] = useState<any[]>([]);
  const [fleetStats, setFleetStats] = useState<FleetStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBus, setShowAddBus] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const { confirm, DialogComponent } = useConfirmDialog();

  // Personnel store — dynamic dropdowns
  const { drivers, staff, supervisors, loadAll: loadPersonnel } = usePersonnelStore();

  const [busForm, setBusForm] = useState({
    name: '', regNo: '', type: 'AC', seats: '36',
    fuelType: 'Diesel', driverId: '', staffId: '', supervisorId: '',
  });

  const resetForm = () => setBusForm({
    name: '', regNo: '', type: 'AC', seats: '36',
    fuelType: 'Diesel', driverId: '', staffId: '', supervisorId: '',
  });

  const load = async () => {
    const [b, f] = await Promise.all([getAllBuses(), getFleetStatus()]);
    setBuses(b);
    setFleetStats(f);
  };

  useEffect(() => { load(); loadPersonnel(); }, []);

  // Helper to get person name by id from a list
  const getPersonName = (list: { id: string; name: string }[], id: string | undefined) => {
    if (!id) return '—';
    const p = list.find(x => x.id === id);
    return p ? p.name : '—';
  };

  const handleCreate = async () => {
    if (!busForm.name || !busForm.regNo) return;
    setSaving(true);
    await createBus({
      name: busForm.name,
      registration_number: busForm.regNo,
      type: busForm.type as 'AC' | 'Non-AC',
      total_seats: parseInt(busForm.seats) || 36,
      fuel_type: busForm.fuelType,
      assigned_driver_id: busForm.driverId || null,
      assigned_staff_id: busForm.staffId || null,
      assigned_supervisor_id: busForm.supervisorId || null,
    } as any);
    resetForm();
    setShowAddBus(false);
    setSaving(false);
    load();
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Remove Bus from Fleet',
      description: 'This bus will be permanently removed from your fleet. Any active schedules assigned to this bus will also be affected.',
      confirmText: 'Delete Bus',
      variant: 'danger',
      icon: 'delete',
      onConfirm: async () => { await deleteBus(id); load(); },
    });
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
          <Button onClick={() => { resetForm(); setShowAddBus(true); }} className="btn-primary-glow shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add Bus
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <div className="glass-card overflow-hidden min-w-[640px] sm:min-w-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Type</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Reg. No</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Driver</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Staff</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Supervisor</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buses.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No buses created yet. Click "Add Bus" to start.</TableCell></TableRow>
            ) : buses.filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.registration_number.toLowerCase().includes(searchQuery.toLowerCase())).map((bus, i) => (
              <motion.tr key={bus.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-border/20 hover:bg-secondary/20">
                <TableCell>
                  <div className="font-medium text-sm">{bus.name}</div>
                  <div className="text-xs text-muted-foreground">{bus.total_seats} seats</div>
                </TableCell>
                <TableCell className="hidden md:table-cell"><span className="text-xs bg-secondary/60 px-2 py-1 rounded-md">{bus.type}</span></TableCell>
                <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">{bus.registration_number}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{getPersonName(drivers, bus.assigned_driver_id)}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{getPersonName(staff, bus.assigned_staff_id)}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{getPersonName(supervisors, bus.assigned_supervisor_id)}</TableCell>
                <TableCell>
                  <button onClick={() => handleToggleStatus(bus.id, bus.status)} className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(bus.status)} hover:opacity-80`}>
                    {bus.status}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedBus(bus); setShowViewDialog(true); }}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(bus.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
        </div>
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

      {/* Add Bus Dialog */}
      <Dialog open={showAddBus} onOpenChange={setShowAddBus}>
        <DialogContent className="glass-card border-border/40 max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Bus</DialogTitle>
            <DialogDescription>Register a new bus to the Starline fleet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Bus Name</label><Input placeholder="e.g. Starline Gold-07" className="bg-secondary/50" value={busForm.name} onChange={e => setBusForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Registration No</label><Input placeholder="e.g. Dhaka Metro-Ga-21-1234" className="bg-secondary/50" value={busForm.regNo} onChange={e => setBusForm(p => ({ ...p, regNo: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Coach Type</label>
                <select title="Select coach type" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={busForm.type} onChange={e => setBusForm(p => ({ ...p, type: e.target.value }))}>
                  {busTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Seat Plan</label>
                <select title="Select seat configuration" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={busForm.seats} onChange={e => setBusForm(p => ({ ...p, seats: e.target.value }))}>
                  {seatCapacityOptions.map(s => <option key={s} value={String(s)}>{s} Seats</option>)}
                </select>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Fuel Type</label>
                <select title="Select fuel type" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={busForm.fuelType} onChange={e => setBusForm(p => ({ ...p, fuelType: e.target.value }))}>
                  <option>Diesel</option><option>CNG</option><option>Electric</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><UserCog className="w-3 h-3" /> Assign Driver</label>
                <select title="Select driver" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={busForm.driverId} onChange={e => setBusForm(p => ({ ...p, driverId: e.target.value }))}>
                  <option value="">— None —</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Assign Staff</label>
                <select title="Select staff" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={busForm.staffId} onChange={e => setBusForm(p => ({ ...p, staffId: e.target.value }))}>
                  <option value="">— None —</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><ClipboardList className="w-3 h-3" /> Assign Supervisor</label>
                <select title="Select supervisor" className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm" value={busForm.supervisorId} onChange={e => setBusForm(p => ({ ...p, supervisorId: e.target.value }))}>
                  <option value="">— None —</option>
                  {supervisors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
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

      {/* View Detail Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="glass-card border-border/40 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Bus Details</DialogTitle>
            <DialogDescription>Full information view</DialogDescription>
          </DialogHeader>
          {selectedBus && (
            <div className="space-y-3 text-sm">
              {[
                ['Name', selectedBus.name],
                ['Registration', selectedBus.registration_number],
                ['Type', selectedBus.type],
                ['Total Seats', selectedBus.total_seats],
                ['Status', selectedBus.status],
                ['Fuel Type', selectedBus.fuel_type || 'Diesel'],
                ['Driver', getPersonName(drivers, selectedBus.assigned_driver_id)],
                ['Staff', getPersonName(staff, selectedBus.assigned_staff_id)],
                ['Supervisor', getPersonName(supervisors, selectedBus.assigned_supervisor_id)],
              ].map(([key, value]) => (
                <div key={key as string} className="flex justify-between items-center py-2 border-b border-border/20 last:border-0">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium capitalize">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {DialogComponent}
    </div>
  );
}
