import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Camera, LogOut, Shield, Edit3, Save,
  CreditCard, ChevronRight, Bell, Headphones, Settings, X
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

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Traveller';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

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
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
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

              {/* Saved Passengers */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}
                className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-accent" /> Saved Passengers
                  </h3>
                  <button className="text-xs text-primary font-medium hover:underline">+ Add Passenger</button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Karim Uddin', phone: '+8801798765432', relation: 'Brother' },
                    { name: 'Fatema Akter', phone: '+8801612345678', relation: 'Spouse' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border/20">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.phone} • {p.relation}</p>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-secondary/60 transition-colors">
                        <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-5">
              {/* Payment Methods */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5"
              >
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-primary" /> Payment Methods
                </h3>
                <div className="space-y-3">
                  {[
                    { type: 'bKash', number: '01712****78', primary: true },
                    { type: 'Nagad', number: '01612****56', primary: false },
                  ].map((pm, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/20">
                      <div>
                        <p className="text-sm font-medium">{pm.type}</p>
                        <p className="text-xs text-muted-foreground">{pm.number}</p>
                      </div>
                      {pm.primary && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full">Primary</span>
                      )}
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                  + Add Payment Method
                </button>
              </motion.div>

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
