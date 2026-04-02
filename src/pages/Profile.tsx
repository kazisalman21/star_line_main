import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Camera, LogOut, Shield, Edit3, Save,
  CreditCard, ChevronRight, Bell, Headphones, Settings, X,
  Plus, Trash2, UserPlus, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

interface SavedPassenger {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // BUG-17 FIX: Real saved passengers from Supabase profiles.saved_passengers JSON field
  const [savedPassengers, setSavedPassengers] = useState<SavedPassenger[]>([]);
  const [showAddPassenger, setShowAddPassenger] = useState(false);
  const [newPassenger, setNewPassenger] = useState({ name: '', phone: '', relation: '' });
  const [savingPassenger, setSavingPassenger] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Traveller';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setPhone(profile.phone || '');
      // Load saved passengers from profile metadata
      loadSavedPassengers();
    }
  }, [profile]);

  const loadSavedPassengers = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    const raw = (data as any)?.saved_passengers;
    if (raw) {
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) setSavedPassengers(parsed);
      } catch { /* ignore parse errors */ }
    }
  };

  const persistPassengers = async (passengers: SavedPassenger[]) => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ saved_passengers: JSON.stringify(passengers) } as any)
      .eq('id', user.id);
  };

  const addPassenger = async () => {
    if (!newPassenger.name.trim() || !newPassenger.phone.trim()) return;
    setSavingPassenger(true);
    const passenger: SavedPassenger = {
      id: crypto.randomUUID(),
      name: newPassenger.name.trim(),
      phone: newPassenger.phone.trim(),
      relation: newPassenger.relation.trim() || 'Other',
    };
    const updated = [...savedPassengers, passenger];
    await persistPassengers(updated);
    setSavedPassengers(updated);
    setNewPassenger({ name: '', phone: '', relation: '' });
    setShowAddPassenger(false);
    setSavingPassenger(false);
  };

  const removePassenger = async (id: string) => {
    const updated = savedPassengers.filter(p => p.id !== id);
    await persistPassengers(updated);
    setSavedPassengers(updated);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name, phone })
      .eq('id', user.id);

    if (error) {
      setMessage('Failed to update profile.');
    } else {
      await refreshProfile();
      setMessage('Profile updated!');
      setEditing(false);
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHead title="My Profile — Star Line Group" description="Manage your Star Line account and profile settings." />
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container max-w-4xl">
          <motion.div {...fadeUp}>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight mb-8">
              My <span className="text-primary">Profile</span>
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Profile Header Card */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }}
                className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <button title="Change profile photo" className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold font-display">{displayName}</h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider mt-2 px-2 py-0.5 rounded-full ${
                      profile?.role === 'admin'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {profile?.role === 'admin' ? 'Admin' : 'Passenger'}
                    </span>
                  </div>
                </div>

                {/* Feedback */}
                {message && (
                  <div className={`text-sm rounded-xl px-4 py-3 mb-4 ${
                    message.includes('updated')
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-destructive/10 border border-destructive/20 text-destructive'
                  }`}>
                    {message}
                  </div>
                )}
              </motion.div>

              {/* Personal Information */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Personal Information
                  </h3>
                  <button
                    onClick={() => editing ? handleSave() : setEditing(true)}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 border border-border/40 text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <><div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Saving...</>
                    ) : editing ? (
                      <><Save className="w-3 h-3" /> Save</>
                    ) : (
                      <><Edit3 className="w-3 h-3" /> Edit</>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Full Name</span>
                    </div>
                    {editing ? (
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full text-sm font-medium bg-transparent focus:outline-none focus:border-b focus:border-primary"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className="text-sm font-medium">{displayName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone</span>
                    </div>
                    {editing ? (
                      <input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+8801XXXXXXXXX"
                        className="w-full text-sm font-medium bg-transparent focus:outline-none focus:border-b focus:border-primary"
                      />
                    ) : (
                      <p className="text-sm font-medium">{profile?.phone || '—'}</p>
                    )}
                  </div>

                  {/* Email (read-only) */}
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</span>
                    </div>
                    <p className="text-sm font-medium">{user?.email || '—'}</p>
                  </div>

                  {/* Role (read-only) */}
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Shield className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Role</span>
                    </div>
                    <p className="text-sm font-medium">{profile?.role === 'admin' ? 'Admin' : 'Passenger'}</p>
                  </div>
                </div>

                {editing && (
                  <button
                    onClick={() => { setEditing(false); setName(profile?.full_name || ''); setPhone(profile?.phone || ''); }}
                    className="mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Cancel editing
                  </button>
                )}
              </motion.div>

              {/* BUG-17 FIX: Real Saved Passengers — stored in profiles.saved_passengers */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}
                className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-accent" /> Saved Passengers
                  </h3>
                  <button
                    onClick={() => setShowAddPassenger(!showAddPassenger)}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    {showAddPassenger ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add Passenger</>}
                  </button>
                </div>

                {/* Add Passenger Form */}
                {showAddPassenger && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 rounded-xl bg-secondary/30 border border-border/30"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <input
                        value={newPassenger.name}
                        onChange={e => setNewPassenger(p => ({ ...p, name: e.target.value }))}
                        placeholder="Full Name *"
                        className="bg-secondary/60 text-foreground rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <input
                        value={newPassenger.phone}
                        onChange={e => setNewPassenger(p => ({ ...p, phone: e.target.value }))}
                        placeholder="Phone *"
                        className="bg-secondary/60 text-foreground rounded-lg px-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <select
                        title="Select relation"
                        value={newPassenger.relation}
                        onChange={e => setNewPassenger(p => ({ ...p, relation: e.target.value }))}
                        className="bg-secondary/60 text-foreground rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Relation</option>
                        <option>Spouse</option>
                        <option>Parent</option>
                        <option>Child</option>
                        <option>Sibling</option>
                        <option>Friend</option>
                        <option>Colleague</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <button
                      onClick={addPassenger}
                      disabled={savingPassenger || !newPassenger.name.trim() || !newPassenger.phone.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
                    >
                      {savingPassenger ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      Save Passenger
                    </button>
                  </motion.div>
                )}

                {/* Passenger List */}
                <div className="space-y-3">
                  {savedPassengers.length === 0 ? (
                    <div className="text-center py-6">
                      <UserPlus className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No saved passengers yet.</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Save frequent co-travellers for quicker booking.</p>
                    </div>
                  ) : (
                    savedPassengers.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border/20 group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.phone} • {p.relation}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removePassenger(p.id)}
                          title="Remove passenger"
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* Quick Actions */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}
                className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5"
              >
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4 text-primary" /> Quick Actions
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Notification Preferences', icon: Bell, link: '#' },
                    { label: 'Support & Help', icon: Headphones, link: '/support' },
                    { label: 'My Bookings', icon: CreditCard, link: '/dashboard' },
                  ].map((action, i) => (
                    <Link
                      key={i}
                      to={action.link}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/40 transition-colors group"
                    >
                      <span className="flex items-center gap-2.5 text-sm text-muted-foreground group-hover:text-foreground">
                        <action.icon className="w-4 h-4" />
                        {action.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Sign Out */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
