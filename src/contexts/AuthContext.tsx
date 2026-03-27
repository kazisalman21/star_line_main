import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data only (fast, no side-effects)
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data as unknown as Profile);
      }
    } catch {
      // Profile fetch failed — continue without profile
    }
  };

  // Background sync: pull Google/Facebook name+avatar into profile (non-blocking, fire-and-forget)
  const syncOAuthMeta = async (userId: string) => {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      const meta = currentUser?.user_metadata;
      if (!meta) return;

      const { data: existing } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();
      if (!existing) return;

      const row = existing as unknown as { full_name: string | null; avatar_url: string | null };
      const updates: Record<string, string> = {};
      if (!row.full_name && (meta.full_name || meta.name)) updates.full_name = meta.full_name || meta.name;
      if (!row.avatar_url && (meta.avatar_url || meta.picture)) updates.avatar_url = meta.avatar_url || meta.picture;

      if (Object.keys(updates).length > 0) {
        const { data: updated } = await supabase
          .from('profiles')
          // @ts-ignore – untyped table
          .update(updates as any)
          .eq('id', userId)
          .select('*')
          .single();
        if (updated) setProfile(updated as unknown as Profile);
      }
    } catch {
      // Silent — sync is optional
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id).then(() => setLoading(false));
        // Fire-and-forget: sync OAuth metadata in background
        syncOAuthMeta(s.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          fetchProfile(s.user.id);
          syncOAuthMeta(s.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
