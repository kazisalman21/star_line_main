import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// ═══════════════════════════════════════════════════
// Personnel Store — Supabase-backed state for drivers, staff, supervisors
// Used by Fleet tab for assignment dropdowns
// ═══════════════════════════════════════════════════

export interface PersonnelRecord {
  id: string;
  name: string;
  phone: string;
  photo_url: string;
  experience: string;
  license?: string; // drivers only
  rating: number;
  trips: number;
  status: 'on-duty' | 'off-duty' | 'on-leave';
  assigned_bus: string;
}

export type PersonnelRole = 'driver' | 'staff' | 'supervisor';

function tableForRole(role: PersonnelRole): 'drivers' | 'staff' | 'supervisors' {
  if (role === 'driver') return 'drivers';
  if (role === 'staff') return 'staff';
  return 'supervisors';
}

interface PersonnelState {
  drivers: PersonnelRecord[];
  staff: PersonnelRecord[];
  supervisors: PersonnelRecord[];
  loading: boolean;

  // Actions
  loadAll: () => Promise<void>;
  loadByRole: (role: PersonnelRole) => Promise<void>;
  addPerson: (role: PersonnelRole, person: Omit<PersonnelRecord, 'id'>) => Promise<void>;
  updatePerson: (role: PersonnelRole, id: string, updates: Partial<PersonnelRecord>) => Promise<void>;
  removePerson: (role: PersonnelRole, id: string) => Promise<void>;
}

function mapRow(row: any): PersonnelRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    photo_url: row.photo_url || '',
    experience: row.experience || '',
    license: row.license || undefined,
    rating: Number(row.rating) || 0,
    trips: row.trips || 0,
    status: row.status || 'off-duty',
    assigned_bus: row.assigned_bus || 'Unassigned',
  };
}

export const usePersonnelStore = create<PersonnelState>((set) => ({
  drivers: [],
  staff: [],
  supervisors: [],
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    const [d, s, v] = await Promise.all([
      supabase.from('drivers').select('*').order('name'),
      supabase.from('staff').select('*').order('name'),
      supabase.from('supervisors').select('*').order('name'),
    ]);
    set({
      drivers: (d.data || []).map(mapRow),
      staff: (s.data || []).map(mapRow),
      supervisors: (v.data || []).map(mapRow),
      loading: false,
    });
  },

  loadByRole: async (role) => {
    const table = tableForRole(role);
    const { data } = await supabase.from(table).select('*').order('name');
    const mapped = (data || []).map(mapRow);
    if (role === 'driver') set({ drivers: mapped });
    else if (role === 'staff') set({ staff: mapped });
    else set({ supervisors: mapped });
  },

  addPerson: async (role, person) => {
    const table = tableForRole(role);
    const row: any = {
      name: person.name,
      phone: person.phone,
      photo_url: person.photo_url || '',
      experience: person.experience,
      rating: person.rating || 0,
      trips: person.trips || 0,
      status: person.status || 'off-duty',
      assigned_bus: person.assigned_bus || 'Unassigned',
    };
    if (role === 'driver') row.license = person.license || '';
    const { error } = await supabase.from(table).insert(row);
    if (error) { console.error(`Error adding ${role}:`, error); return; }
    // Reload
    const store = usePersonnelStore.getState();
    await store.loadByRole(role);
  },

  updatePerson: async (role, id, updates) => {
    const table = tableForRole(role);
    const row: any = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.phone !== undefined) row.phone = updates.phone;
    if (updates.photo_url !== undefined) row.photo_url = updates.photo_url;
    if (updates.experience !== undefined) row.experience = updates.experience;
    if (updates.license !== undefined && role === 'driver') row.license = updates.license;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.assigned_bus !== undefined) row.assigned_bus = updates.assigned_bus;
    if (updates.rating !== undefined) row.rating = updates.rating;
    if (updates.trips !== undefined) row.trips = updates.trips;

    const { error } = await (supabase.from(table) as any).update(row).eq('id', id);
    if (error) { console.error(`Error updating ${role}:`, error); return; }
    const store = usePersonnelStore.getState();
    await store.loadByRole(role);
  },

  removePerson: async (role, id) => {
    const table = tableForRole(role);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { console.error(`Error deleting ${role}:`, error); return; }
    const store = usePersonnelStore.getState();
    await store.loadByRole(role);
  },
}));
