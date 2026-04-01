import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCog, Plus, Search, Phone, Pencil, Trash2, Star, Check, Loader2, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useConfirmDialog } from '@/components/admin/ConfirmDialog';
import { usePersonnelStore, PersonnelRecord, PersonnelRole } from '@/data/personnelStore';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    'on-duty': 'bg-success/15 text-success',
    'off-duty': 'bg-muted-foreground/15 text-muted-foreground',
    'on-leave': 'bg-warning/15 text-warning',
  };
  return map[status] || 'bg-secondary text-muted-foreground';
};

interface PersonnelTabProps {
  role: PersonnelRole;
  title: string;
  subtitle: string;
  showLicense?: boolean; // true for drivers only
}

export function PersonnelTab({ role, title, subtitle, showLicense = false }: PersonnelTabProps) {
  const { addPerson, updatePerson, removePerson, loadByRole, loading } = usePersonnelStore();
  const people = usePersonnelStore(state =>
    role === 'driver' ? state.drivers : role === 'staff' ? state.staff : state.supervisors
  );

  useEffect(() => { loadByRole(role); }, [role]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { confirm, DialogComponent } = useConfirmDialog();

  const emptyForm = { name: '', phone: '', license: '', experience: '', photo_url: '' };
  const [form, setForm] = useState(emptyForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const resetForm = () => {
    setForm(emptyForm);
    setPhotoPreview(null);
    setEditingId(null);
  };

  const openAdd = () => { resetForm(); setShowDialog(true); };

  const openEdit = (person: PersonnelRecord) => {
    setEditingId(person.id);
    setForm({
      name: person.name,
      phone: person.phone,
      license: person.license || '',
      experience: person.experience,
      photo_url: person.photo_url,
    });
    setPhotoPreview(person.photo_url || null);
    setShowDialog(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setForm(p => ({ ...p, photo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) return;
    setSaving(true);

    if (editingId) {
      await updatePerson(role, editingId, {
        name: form.name,
        phone: form.phone,
        license: showLicense ? form.license : undefined,
        experience: form.experience,
        photo_url: form.photo_url,
      });
    } else {
      await addPerson(role, {
        name: form.name,
        phone: form.phone,
        license: showLicense ? form.license : undefined,
        experience: form.experience,
        photo_url: form.photo_url,
        rating: 0,
        trips: 0,
        status: 'off-duty',
        assigned_bus: 'Unassigned',
      });
    }

    resetForm();
    setShowDialog(false);
    setSaving(false);
  };

  const handleDelete = (id: string, name: string) => {
    confirm({
      title: `Remove ${title.replace(' Management', '')}`,
      description: `${name} will be removed from the system. Any bus assignments will need to be updated.`,
      confirmText: 'Remove',
      variant: 'danger',
      icon: 'delete',
      onConfirm: async () => { await removePerson(role, id); },
    });
  };

  const filtered = useMemo(() =>
    people.filter(d => !searchQuery
      || d.name.toLowerCase().includes(searchQuery.toLowerCase())
      || (d.license && d.license.toLowerCase().includes(searchQuery.toLowerCase()))
      || d.phone.includes(searchQuery)
    ),
    [people, searchQuery]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{people.length} {subtitle}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={`Search ${subtitle}...`} className="pl-9 bg-secondary/50 border-border/40 sm:w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Button onClick={openAdd} className="btn-primary-glow shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <UserCog className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No {subtitle} found. Click "Add" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((person, i) => (
            <motion.div key={person.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-secondary/60 flex items-center justify-center overflow-hidden">
                    {person.photo_url ? (
                      <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserCog className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{person.name}</div>
                    <div className="text-xs text-muted-foreground">{showLicense && person.license ? person.license : person.experience}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(person.status)}`}>{person.status.replace('-', ' ')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div><span className="text-muted-foreground">Experience:</span> <span className="font-medium">{person.experience}</span></div>
                <div><span className="text-muted-foreground">Total Trips:</span> <span className="font-medium">{person.trips.toLocaleString()}</span></div>
                <div className="flex items-center gap-1"><Star className="w-3 h-3 text-accent" /> <span className="font-medium">{person.rating || 'N/A'}</span></div>
                <div><span className="text-muted-foreground">Bus:</span> <span className="font-medium">{person.assigned_bus}</span></div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/20">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {person.phone}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(person)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(person.id, person.name)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="glass-card border-border/40">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? 'Edit' : 'Add New'} {title.replace(' Management', '')}</DialogTitle>
            <DialogDescription>{editingId ? 'Update details.' : `Register a new member to the Starline team.`}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Photo Upload */}
            <div className="flex justify-center">
              <label className="cursor-pointer group relative">
                <div className="w-20 h-20 rounded-full bg-secondary/60 border-2 border-dashed border-border/60 flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-colors">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] text-muted-foreground">Photo</span>
                    </div>
                  )}
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); setPhotoPreview(null); setForm(p => ({ ...p, photo_url: '' })); }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground mb-1 block">Full Name</label><Input placeholder="e.g. Morshed Ali" className="bg-secondary/50" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Phone Number</label><Input placeholder="e.g. 01712000010" className="bg-secondary/50" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div className={`grid gap-4 ${showLicense ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {showLicense && (
                <div><label className="text-xs text-muted-foreground mb-1 block">License Number</label><Input placeholder="e.g. DM-2026-001234" className="bg-secondary/50" value={form.license} onChange={e => setForm(p => ({ ...p, license: e.target.value }))} /></div>
              )}
              <div><label className="text-xs text-muted-foreground mb-1 block">Experience</label><Input placeholder="e.g. 10 years" className="bg-secondary/50" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button className="btn-primary-glow" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
              {editingId ? 'Save Changes' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {DialogComponent}
    </div>
  );
}
