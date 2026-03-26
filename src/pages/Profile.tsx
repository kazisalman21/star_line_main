import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Camera, LogOut, Ticket, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
      setMessage('Failed to update profile. Please try again.');
    } else {
      await refreshProfile();
      setMessage('Profile updated successfully!');
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
    <div className="min-h-screen bg-background">
      <PageHead title="My Profile — Star Line Group" description="Manage your Star Line account, view booking history, and update your profile." />
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">My Profile</h1>

          {/* Profile Card */}
          <div className="premium-card p-8 mb-6">
            {/* Avatar + Basic Info */}
            <div className="flex items-start gap-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {profile?.full_name || 'Star Line User'}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    profile?.role === 'admin'
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {profile?.role === 'admin' ? 'Admin' : 'Passenger'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                className="text-xs bg-secondary border border-border rounded-lg px-4 py-2 font-medium text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Save' : 'Edit Profile'}
              </button>
            </div>

            {/* Feedback */}
            {message && (
              <div className={`text-sm rounded-lg px-4 py-3 mb-6 ${
                message.includes('success')
                  ? 'bg-success/10 border border-success/20 text-success'
                  : 'bg-destructive/10 border border-destructive/20 text-destructive'
              }`}>
                {message}
              </div>
            )}

            {/* Info Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                {editing ? (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-foreground bg-secondary/50 rounded-lg px-4 py-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {profile?.full_name || '—'}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <div className="flex items-center gap-3 text-sm text-foreground bg-secondary/50 rounded-lg px-4 py-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {user?.email || '—'}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
                {editing ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+8801XXXXXXXXX"
                      className="w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-foreground bg-secondary/50 rounded-lg px-4 py-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {profile?.phone || '—'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking History Placeholder */}
          <div className="premium-card p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Ticket className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg font-semibold">Booking History</h3>
            </div>
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No bookings yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Your trip history will appear here</p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg py-3 text-sm font-medium hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
