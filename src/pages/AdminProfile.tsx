import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Camera, Shield, Edit3, Save, X,
  Calendar, Hash, ChevronRight, Lock, Clock, Bus, Route,
  Activity, Settings, BadgeCheck, FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

export default function AdminProfile() {
  const { user, profile, refreshProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    bio: '',
  });

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Administrator';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const adminId = user?.id ? `ADM-${user.id.substring(0, 8).toUpperCase()}` : '—';

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone })
      .eq('id', user.id);

    if (error) {
      setMessage('Failed to update profile.');
    } else {
      await refreshProfile();
      setMessage('Profile updated successfully!');
      setEditing(false);
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: '',
      });
    }
    setEditing(false);
  };

  // Info row component
  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-center gap-3 py-3 border-b border-border/20 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHead title="Admin Profile — Star Line Group" description="Manage your Star Line admin account and profile." />
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container max-w-5xl">
          <motion.div {...fadeUp}>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display tracking-tight mb-6 sm:mb-8">
              Admin <span className="text-primary">Profile</span>
            </h1>
          </motion.div>

          {/* Feedback */}
          {message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`text-sm rounded-xl px-4 py-3 mb-6 ${
              message.includes('success')
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-destructive/10 border border-destructive/20 text-destructive'
            }`}>
              {message}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ═════════ LEFT: Profile Hero + Info ═════════ */}
            <div className="lg:col-span-2 space-y-6">

              {/* Profile Hero */}
              <div className="glass-card p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <button title="Change profile photo" className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-md">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Name + Meta */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold font-display">{displayName}</h2>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/20">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {adminId}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {joinedDate}</span>
                      <span className="inline-flex items-center gap-1 text-success"><BadgeCheck className="w-3 h-3" /> Active</span>
                    </div>
                  </div>

                  {/* Edit toggle */}
                  <div>
                    {editing ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleCancel}><X className="w-3.5 h-3.5 mr-1" /> Cancel</Button>
                        <Button size="sm" className="btn-primary-glow" onClick={handleSave} disabled={saving}>
                          {saving ? <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-sm font-bold flex items-center gap-2 mb-5">
                  <User className="w-4 h-4 text-primary" /> Personal Information
                </h3>
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                      <Input className="bg-secondary/50" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                      <Input className="bg-secondary/50" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Bio / Notes</label>
                      <textarea
                        className="w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Short bio or notes..."
                        value={form.bio}
                        onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <InfoRow icon={User} label="Full Name" value={displayName} />
                    <InfoRow icon={Mail} label="Email Address" value={user?.email || '—'} />
                    <InfoRow icon={Phone} label="Phone Number" value={profile?.phone || 'Not set'} />
                    <InfoRow icon={Shield} label="Role / Permission" value="System Administrator" />
                    <InfoRow icon={Hash} label="Admin ID" value={adminId} />
                    <InfoRow icon={Calendar} label="Account Created" value={joinedDate} />
                  </div>
                )}
              </motion.div>

              {/* Account Security */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}
                className="glass-card p-6"
              >
                <h3 className="text-sm font-bold flex items-center gap-2 mb-5">
                  <Lock className="w-4 h-4 text-primary" /> Account Security
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: Lock, label: 'Change Password', desc: 'Update your account password', action: 'Update' },
                    { icon: Shield, label: 'Two-Factor Auth', desc: 'Add extra security to your account', action: 'Enable' },
                    { icon: Clock, label: 'Active Sessions', desc: 'Manage your active login sessions', action: 'View' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-secondary/30 border border-border/20 hover:bg-secondary/40 transition-colors cursor-pointer group">
                      <div className="w-9 h-9 rounded-lg bg-secondary/60 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                      <span className="text-xs text-primary font-medium hidden sm:flex items-center gap-1">
                        {item.action} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ═════════ RIGHT SIDEBAR ═════════ */}
            <div className="space-y-6">

              {/* Quick Stats */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}
                className="glass-card p-5"
              >
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-primary" /> Overview
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: Bus, label: 'Fleet Managed', value: '8 buses', color: 'text-primary' },
                    { icon: Route, label: 'Routes Active', value: '5 routes', color: 'text-success' },
                    { icon: Clock, label: 'Last Active', value: 'Just now', color: 'text-accent' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center">
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] text-muted-foreground">{s.label}</div>
                        <div className="text-sm font-semibold">{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }}
                className="glass-card p-5"
              >
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4 text-primary" /> Quick Actions
                </h3>
                <div className="space-y-2">
                  {[
                    { icon: Bus, label: 'Manage Fleet', to: '/admin' },
                    { icon: FileText, label: 'View Bookings', to: '/admin' },
                    { icon: Route, label: 'Manage Routes', to: '/admin' },
                    { icon: Settings, label: 'System Settings', to: '/admin' },
                  ].map((item, i) => (
                    <a key={i} href={item.to}
                      className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20 hover:bg-secondary/40 transition-colors group"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.16 }}
                className="glass-card p-5"
              >
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-primary" /> Recent Activity
                </h3>
                <div className="space-y-3">
                  {[
                    { action: 'Added new bus to fleet', time: '2 hours ago' },
                    { action: 'Updated route schedule', time: '5 hours ago' },
                    { action: 'Assigned driver to Platinum-04', time: '1 day ago' },
                    { action: 'Updated fleet status', time: '2 days ago' },
                  ].map((a, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <div className="text-foreground font-medium">{a.action}</div>
                        <div className="text-muted-foreground">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
