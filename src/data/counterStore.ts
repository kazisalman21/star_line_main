import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Counter, CounterStatus, RouteData, RouteStatus, RoutePoint } from '@/data/types';

let _pointIdCounter = 0;
export const generatePointId = () => `pt-${Date.now()}-${++_pointIdCounter}`;
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const now = () => new Date().toISOString();

interface StoreState {
  counters: Counter[];
  routes: RouteData[];

  // Counter actions
  addCounter: (data: Omit<Counter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCounter: (id: string, data: Partial<Counter>) => void;
  setCounterStatus: (id: string, status: CounterStatus) => void;
  getCounterById: (id: string) => Counter | undefined;
  getCounterUsageCount: (counterId: string) => number;

  // Route actions
  addRoute: (data: Omit<RouteData, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoute: (id: string, data: Partial<RouteData>) => void;
  deleteRoute: (id: string) => void;
  setRouteStatus: (id: string, status: RouteStatus) => void;
  duplicateRoute: (id: string) => void;
}

// Seed data for demo
const seedCounters: Counter[] = [
  { id: 'c1', code: 'DHK-KMR', name: 'Dhaka Kamalapur Terminal', type: 'Main Terminal', district: 'Dhaka', address: 'Kamalapur Railway Station Area', phone: '01973-259700', notes: '', mapLocation: '', status: 'active', isMainTerminal: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'c2', code: 'DHK-GBR', name: 'Gabtoli Bus Terminal', type: 'Main Terminal', district: 'Dhaka', address: 'Gabtoli Bus Stand', phone: '01973-259701', notes: '', mapLocation: '', status: 'active', isMainTerminal: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'c3', code: 'CTG-MN', name: 'Chattogram Main Counter', type: 'Main Terminal', district: 'Chattogram', address: 'New Market, Chattogram', phone: '01973-259702', notes: '', mapLocation: '', status: 'active', isMainTerminal: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'c4', code: 'FNI-MN', name: 'Feni Star Line Counter', type: 'Counter', district: 'Feni', address: 'Feni Trunk Road', phone: '01973-259703', notes: '', mapLocation: '', status: 'active', isMainTerminal: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'c5', code: 'CML-STP', name: 'Comilla Stoppage', type: 'Pickup Point', district: 'Comilla', address: 'Comilla Highway', phone: '', notes: 'Highway pickup only', mapLocation: '', status: 'active', isMainTerminal: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'c6', code: 'CXB-MN', name: "Cox's Bazar Terminal", type: 'Main Terminal', district: "Cox's Bazar", address: 'Main Bus Stand', phone: '01973-259704', notes: '', mapLocation: '', status: 'active', isMainTerminal: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'c7', code: 'SYL-MN', name: 'Sylhet Main Counter', type: 'Counter', district: 'Sylhet', address: 'Kumargaon Bus Stand', phone: '01973-259705', notes: '', mapLocation: '', status: 'active', isMainTerminal: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'c8', code: 'BRK-REST', name: 'Meghna Rest Area', type: 'Restaurant Point', district: 'Comilla', address: 'Meghna Highway', phone: '', notes: 'Lunch break stop', mapLocation: '', status: 'active', isMainTerminal: false, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
];

const seedRoutes: RouteData[] = [
  {
    id: 'r1', code: 'DHK-CTG-01', name: 'Dhaka – Chattogram Express', from: 'Dhaka', to: 'Chattogram', direction: 'Outbound', estimatedDuration: '5h 30m', baseFare: 800, status: 'active', notes: 'Main route', createdAt: '2026-01-01', updatedAt: '2026-01-01',
    points: [
      { id: 'p1', routeId: 'r1', orderIndex: 1, pointType: 'Origin Terminal', counterId: 'c1', customPointName: null, haltMinutes: 15, breakMinutes: 0, isBoardingAllowed: true, isDroppingAllowed: false, isVisibleToCustomer: true, status: 'active', notes: '' },
      { id: 'p2', routeId: 'r1', orderIndex: 2, pointType: 'Pickup Point', counterId: 'c5', customPointName: null, haltMinutes: 5, breakMinutes: 0, isBoardingAllowed: true, isDroppingAllowed: true, isVisibleToCustomer: true, status: 'active', notes: '' },
      { id: 'p3', routeId: 'r1', orderIndex: 3, pointType: 'Restaurant Break', counterId: 'c8', customPointName: null, haltMinutes: 0, breakMinutes: 20, isBoardingAllowed: false, isDroppingAllowed: false, isVisibleToCustomer: true, status: 'active', notes: 'Lunch' },
      { id: 'p4', routeId: 'r1', orderIndex: 4, pointType: 'Counter', counterId: 'c4', customPointName: null, haltMinutes: 5, breakMinutes: 0, isBoardingAllowed: true, isDroppingAllowed: true, isVisibleToCustomer: true, status: 'active', notes: '' },
      { id: 'p5', routeId: 'r1', orderIndex: 5, pointType: 'Destination Terminal', counterId: 'c3', customPointName: null, haltMinutes: 10, breakMinutes: 0, isBoardingAllowed: false, isDroppingAllowed: true, isVisibleToCustomer: true, status: 'active', notes: '' },
    ],
  },
  {
    id: 'r2', code: 'DHK-CXB-01', name: "Dhaka – Cox's Bazar Premium", from: 'Dhaka', to: "Cox's Bazar", direction: 'Outbound', estimatedDuration: '8h', baseFare: 1400, status: 'active', notes: '', createdAt: '2026-01-01', updatedAt: '2026-01-01',
    points: [
      { id: 'p6', routeId: 'r2', orderIndex: 1, pointType: 'Origin Terminal', counterId: 'c1', customPointName: null, haltMinutes: 15, breakMinutes: 0, isBoardingAllowed: true, isDroppingAllowed: false, isVisibleToCustomer: true, status: 'active', notes: '' },
      { id: 'p7', routeId: 'r2', orderIndex: 2, pointType: 'Counter', counterId: 'c3', customPointName: null, haltMinutes: 10, breakMinutes: 0, isBoardingAllowed: true, isDroppingAllowed: true, isVisibleToCustomer: true, status: 'active', notes: '' },
      { id: 'p8', routeId: 'r2', orderIndex: 3, pointType: 'Destination Terminal', counterId: 'c6', customPointName: null, haltMinutes: 10, breakMinutes: 0, isBoardingAllowed: false, isDroppingAllowed: true, isVisibleToCustomer: true, status: 'active', notes: '' },
    ],
  },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      counters: seedCounters,
      routes: seedRoutes,

      addCounter: (data) => set((s) => ({
        counters: [...s.counters, { ...data, id: generateId(), createdAt: now(), updatedAt: now() } as Counter],
      })),

      updateCounter: (id, data) => set((s) => ({
        counters: s.counters.map(c => c.id === id ? { ...c, ...data, updatedAt: now() } : c),
      })),

      setCounterStatus: (id, status) => set((s) => ({
        counters: s.counters.map(c => c.id === id ? { ...c, status, updatedAt: now() } : c),
      })),

      getCounterById: (id) => get().counters.find(c => c.id === id),

      getCounterUsageCount: (counterId) => {
        return get().routes.reduce((count, route) => {
          return count + route.points.filter(p => p.counterId === counterId).length;
        }, 0);
      },

      addRoute: (data) => set((s) => ({
        routes: [...s.routes, { ...data, id: generateId(), createdAt: now(), updatedAt: now() } as RouteData],
      })),

      updateRoute: (id, data) => set((s) => ({
        routes: s.routes.map(r => r.id === id ? { ...r, ...data, updatedAt: now() } : r),
      })),

      deleteRoute: (id) => set((s) => ({
        routes: s.routes.filter(r => r.id !== id),
      })),

      setRouteStatus: (id, status) => set((s) => ({
        routes: s.routes.map(r => r.id === id ? { ...r, status, updatedAt: now() } : r),
      })),

      duplicateRoute: (id) => {
        const route = get().routes.find(r => r.id === id);
        if (!route) return;
        const newId = generateId();
        const newPoints = route.points.map(p => ({ ...p, id: generatePointId(), routeId: newId }));
        set((s) => ({
          routes: [...s.routes, { ...route, id: newId, code: `${route.code}-COPY`, name: `${route.name} (Copy)`, status: 'draft' as RouteStatus, points: newPoints, createdAt: now(), updatedAt: now() }],
        }));
      },
    }),
    { name: 'starline-counter-store' }
  )
);
