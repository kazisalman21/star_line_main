import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCog, Plus, Search, Phone, Pencil, Trash2, Star, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useConfirmDialog } from '@/components/admin/ConfirmDialog';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    'on-duty': 'bg-success/15 text-success',
    'off-duty': 'bg-muted-foreground/15 text-muted-foreground',
    'on-leave': 'bg-warning/15 text-warning',
  };
  return map[status] || 'bg-secondary text-muted-foreground';
};

// Mock data — replace with Supabase when drivers table is created
const initialDrivers = [
  { id: 'D001', name: 'Karim Uddin', phone: '01712000001', license: 'DM-2024-001234', experience: '12 years', rating: 4.8, trips: 2340, status: 'on-duty', assignedBus: 'Platinum-01' },
  { id: 'D002', name: 'Rafiq Hossain', phone: '01712000002', license: 'DM-2023-005678', experience: '8 years', rating: 4.6, trips: 1560, status: 'on-duty', assignedBus: 'Gold-03' },
  { id: 'D003', name: 'Alam Sheikh', phone: '01712000003', license: 'DM-2022-009012', experience: '15 years', rating: 4.9, trips: 3100, status: 'off-duty', assignedBus: 'Silver-05' },
  { id: 'D004', name: 'Hasan Ali', phone: '01712000004', license: 'DM-2025-003456', experience: '5 years', rating: 4.5, trips: 890, status: 'on-duty', assignedBus: 'Gold-02' },
  { id: 'D005', name: 'Jamal Mia', phone: '01712000005', license: 'DM-2021-007890', experience: '18 years', rating: 4.7, trips: 4200, status: 'on-leave', assignedBus: 'Platinum-04' },
  { id: 'D006', name: 'Belal Hossain', phone: '01712000006', license: 'DM-2024-002345', experience: '6 years', rating: 4.4, trips: 720, status: 'on-duty', assignedBus: 'Silver-11' },
];

export function DriversTab() {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const { confirm, DialogComponent } = useConfirmDialog();

  const [form, setForm] = useState({ name: '', phone: '', license: '', experience: '' });

  const handleCreate = () => {
    if (!form.name || !form.phone) return;
    setSaving(true);
    const newDriver = {
      id: `D${String(drivers.length + 1).padStart(3, '0')}`,
      name: form.name,
      phone: form.phone,
      license: form.license,
      experience: form.experience,
      rating: 0,
      trips: 0,
      status: 'off-duty',
      assignedBus: 'Unassigned',
    };
    setDrivers(prev => [...prev, newDriver]);
    setForm({ name: '', phone: '', license: '', experience: '' });
    setShowAdd(false);
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Remove Driver',
      description: 'This driver will be removed from the system. Any bus assignments will need to be updated.',
      confirmText: 'Remove Driver',
      variant: 'danger',
      icon: 'delete',
      onConfirm: async () => { setDrivers(prev => prev.filter(d => d.id !== id)); },
    });
  };

  const filtered = drivers.filter(d => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.license.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Driver Management</h2>
          <p className="text-sm text-muted-foreground">{drivers.length} registered drivers</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search drivers..." className="pl-9 bg-secondary/50 border-border/40 sm:w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={() => setShowAdd(true)} className="btn-primary-glow shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add Driver
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((driver, i) => (
          <motion.div key={driver.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-secondary/60 flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">{driver.name}</div>
                  <div className="text-xs text-muted-foreground">{driver.license}</div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(driver.status)}`}>{driver.status.replace('-', ' ')}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div><span className="text-muted-foreground">Experience:</span> <span className="font-medium">{driver.experience}</span></div>
              <div><span className="text-muted-foreground">Total Trips:</span> <span className="font-medium">{driver.trips.toLocaleString()}</span></div>
              <div className="flex items-center gap-1"><Star className="w-3 h-3 text-accent" /> <span className="font-medium">{driver.rating || 'N/A'}</span></div>
              <div><span className="text-muted-foreground">Bus:</span> <span className="font-medium">{driver.assignedBus}</span></div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/20">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {driver.phone}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(driver.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="glass-card border-border/40">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Driver</DialogTitle>
            <DialogDescription>Register a driver to the Starline team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Full Name</label><Input placeholder="e.g. Morshed Ali" className="bg-secondary/50" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Phone</label><Input placeholder="e.g. 01712000010" className="bg-secondary/50" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">License No</label><Input placeholder="e.g. DM-2026-001234" className="bg-secondary/50" value={form.license} onChange={e => setForm(p => ({ ...p, license: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Experience</label><Input placeholder="e.g. 10 years" className="bg-secondary/50" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="btn-primary-glow" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />} Add Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {DialogComponent}
    </div>
  );
}
