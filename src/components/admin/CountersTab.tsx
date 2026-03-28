import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, Plus, MapPin, Phone, Pencil, Trash2, ChevronRight, Route, Check, Loader2 } from 'lucide-react';
import { useConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export function CountersTab() {
  const [terminals, setTerminals] = useState<any[]>([]);
  const [routesWithCounters, setRoutesWithCounters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTerminal, setShowAddTerminal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { confirm, DialogComponent } = useConfirmDialog();
  const [terminalForm, setTerminalForm] = useState({ name: '', shortName: '', location: '', district: '', phone: '', isMain: false });

  const load = async () => {
    try {
      const mod = await import('@/services/counterService');
      const [tData, rcData] = await Promise.all([
        mod.getAllTerminals(),
        mod.getRoutesWithCounters(),
      ]);
      setTerminals(tData || []);
      setRoutesWithCounters(rcData || []);
    } catch (e) {
      console.warn("Could not load terminals:", e);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreateOrUpdate = async () => {
    if (!terminalForm.name || !terminalForm.shortName) return;
    setSaving(true);
    const mod = await import('@/services/counterService');
    
    if (editingId) {
      await mod.updateTerminal(editingId, {
        name: terminalForm.name,
        short_name: terminalForm.shortName,
        location: terminalForm.location,
        district: terminalForm.district,
        phone: terminalForm.phone,
        is_main_terminal: terminalForm.isMain,
      });
    } else {
      await mod.createTerminal({
        name: terminalForm.name,
        short_name: terminalForm.shortName,
        location: terminalForm.location,
        district: terminalForm.district,
        phone: terminalForm.phone,
        is_main_terminal: terminalForm.isMain,
      });
    }
    
    setTerminalForm({ name: '', shortName: '', location: '', district: '', phone: '', isMain: false });
    setEditingId(null);
    setShowAddTerminal(false);
    setSaving(false);
    load();
  };

  const openForEdit = (terminal: any) => {
    setEditingId(terminal.id);
    setTerminalForm({
      name: terminal.name,
      shortName: terminal.short_name || terminal.shortName || '',
      location: terminal.location,
      district: terminal.district,
      phone: terminal.phone,
      isMain: terminal.is_main_terminal || terminal.isMainTerminal || false,
    });
    setShowAddTerminal(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Remove Terminal',
      description: 'This terminal will be permanently removed from the system. Routes referencing this terminal may need to be updated.',
      confirmText: 'Delete Terminal',
      variant: 'danger',
      icon: 'delete',
      onConfirm: async () => {
        const mod = await import('@/services/counterService');
        await mod.deleteTerminal(id);
        load();
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Counter & Terminal Management</h2>
          <p className="text-sm text-muted-foreground">{terminals.length} terminals registered</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search terminals..." className="pl-9 bg-secondary/50 border-border/40 sm:w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={() => { setEditingId(null); setTerminalForm({ name: '', shortName: '', location: '', district: '', phone: '', isMain: false }); setShowAddTerminal(true); }} className="btn-primary-glow shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add Terminal
          </Button>
        </div>
      </div>

      {/* Terminal Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {terminals.filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.district.toLowerCase().includes(searchQuery.toLowerCase())).map((terminal, i) => (
          <motion.div key={terminal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card p-5 card-hover">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${terminal.is_main_terminal ? 'bg-primary/15' : 'bg-secondary/60'}`}>
                  <Building2 className={`w-5 h-5 ${terminal.is_main_terminal ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <div className="font-medium text-sm">{terminal.name}</div>
                  <div className="text-xs text-muted-foreground">{terminal.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openForEdit(terminal)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(terminal.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {terminal.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {terminal.district}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {terminal.is_main_terminal && <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">Main Terminal</span>}
              <span className="text-xs bg-success/15 text-success px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
          </motion.div>
        ))}
        {terminals.length === 0 && <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground glass-card">No terminals found. Click "Add Terminal".</div>}
      </div>

      {/* ============= Route-Counter Associations (from reference) ============= */}
      {routesWithCounters.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Route-Counter Associations</h3>
          <div className="space-y-3">
            {routesWithCounters.map((route) => (
              <div key={route.id} className="flex items-center justify-between bg-secondary/30 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Route className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-medium text-sm">{route.from} → {route.to}</div>
                    <div className="text-xs text-muted-foreground">{route.counters.length} stops</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground hidden sm:block">{route.counters.filter((c: any) => c.status === 'Active').length} active</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Terminal Dialog */}
      <Dialog open={showAddTerminal} onOpenChange={(open) => { setShowAddTerminal(open); if (!open) setEditingId(null); }}>
        <DialogContent className="glass-card border-border/40">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? 'Edit Terminal' : 'Add New Terminal'}</DialogTitle>
            <DialogDescription>{editingId ? 'Update details for this terminal/counter.' : 'Register a new counter or terminal location.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><label className="text-xs text-muted-foreground mb-1 block">Terminal Name</label><Input placeholder="e.g. Tongi Star Line Counter" className="bg-secondary/50" value={terminalForm.name} onChange={e => setTerminalForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Short Name (Code)</label><Input placeholder="e.g. TGI" className="bg-secondary/50" value={terminalForm.shortName} onChange={e => setTerminalForm(p => ({ ...p, shortName: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">District</label><Input placeholder="e.g. Gazipur" className="bg-secondary/50" value={terminalForm.district} onChange={e => setTerminalForm(p => ({ ...p, district: e.target.value }))} /></div>
            </div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Detailed Location</label><Input placeholder="e.g. Tongi Station Road Bus Stand" className="bg-secondary/50" value={terminalForm.location} onChange={e => setTerminalForm(p => ({ ...p, location: e.target.value }))} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Phone</label><Input placeholder="e.g. 01973-259700" className="bg-secondary/50" value={terminalForm.phone} onChange={e => setTerminalForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <label className="flex items-center gap-2 text-sm cursor-pointer mt-2 w-fit">
              <input type="checkbox" checked={terminalForm.isMain} onChange={e => setTerminalForm(p => ({ ...p, isMain: e.target.checked }))} className="rounded border-border bg-secondary" />
              This is a main terminal hub
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTerminal(false)}>Cancel</Button>
            <Button className="btn-primary-glow" onClick={handleCreateOrUpdate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />} {editingId ? 'Save Changes' : 'Add Terminal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {DialogComponent}
    </div>
  );
}
