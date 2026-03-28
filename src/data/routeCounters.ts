// ============================================================
// Route Counters Data — Star Line Group terminal & route network
// ============================================================

export interface Counter {
  name: string;
  location: string;
  district: string;
  phone: string;
  type: 'Starting Point' | 'Counter' | 'Break (20 min)' | 'Last Stop';
  status: 'Active' | 'Unverified' | 'Unconfirmed';
}

export interface Terminal {
  id: string;
  name: string;
  shortName: string;
  location: string;
  district: string;
  phone: string;
  isMainTerminal: boolean;
}

export interface RouteData {
  id: string;
  from: string;
  to: string;
  counters: Counter[];
}

export interface RouteConnection {
  from: string;
  to: string;
  routeId: string | null;
}

// ─── Terminals ─────────────────────────────────
export const terminals: Terminal[] = [
  {
    id: 't1',
    name: 'Dhaka (Fakirapul) Terminal',
    shortName: 'Dhaka',
    location: 'Fakirapul, Motijheel',
    district: 'Dhaka',
    phone: '01700-000001',
    isMainTerminal: true,
  },
  {
    id: 't2',
    name: 'Chattogram Terminal',
    shortName: 'Chattogram',
    location: 'Dampara, Chattogram',
    district: 'Chattogram',
    phone: '01700-000002',
    isMainTerminal: true,
  },
  {
    id: 't3',
    name: "Cox's Bazar Terminal",
    shortName: "Cox's Bazar",
    location: 'Bus Stand, Kolatoli',
    district: "Cox's Bazar",
    phone: '01700-000003',
    isMainTerminal: true,
  },
  {
    id: 't4',
    name: 'Sylhet Terminal',
    shortName: 'Sylhet',
    location: 'Kadamtali Bus Stand',
    district: 'Sylhet',
    phone: '01700-000004',
    isMainTerminal: true,
  },
  {
    id: 't5',
    name: 'Comilla Counter',
    shortName: 'Comilla',
    location: 'Kandirpar Bus Stand',
    district: 'Comilla',
    phone: '01700-000005',
    isMainTerminal: false,
  },
  {
    id: 't6',
    name: 'Feni Counter',
    shortName: 'Feni',
    location: 'Feni Bus Terminal',
    district: 'Feni',
    phone: '01700-000006',
    isMainTerminal: false,
  },
  {
    id: 't7',
    name: 'Noakhali Counter',
    shortName: 'Noakhali',
    location: 'Maijdee Bus Stand',
    district: 'Noakhali',
    phone: '01700-000007',
    isMainTerminal: false,
  },
  {
    id: 't8',
    name: 'Lakshmipur Counter',
    shortName: 'Lakshmipur',
    location: 'Lakshmipur Bus Stand',
    district: 'Lakshmipur',
    phone: '01700-000008',
    isMainTerminal: false,
  },
  {
    id: 't9',
    name: 'Brahmanbaria Counter',
    shortName: 'B.Baria',
    location: 'Brahmanbaria Bus Terminal',
    district: 'Brahmanbaria',
    phone: '01700-000009',
    isMainTerminal: false,
  },
  {
    id: 't10',
    name: 'Chandpur Counter',
    shortName: 'Chandpur',
    location: 'Chandpur Bus Stand',
    district: 'Chandpur',
    phone: '01700-000010',
    isMainTerminal: false,
  },
];

// ─── Routes ────────────────────────────────────
export const routes: RouteData[] = [
  {
    id: 'r1',
    from: 'Dhaka',
    to: 'Chattogram',
    counters: [
      { name: 'Dhaka (Fakirapul)', location: 'Fakirapul, Motijheel', district: 'Dhaka', phone: '01700-000001', type: 'Starting Point', status: 'Active' },
      { name: 'Dhaka (Sayedabad Bypass)', location: 'Sayedabad', district: 'Dhaka', phone: '—', type: 'Counter', status: 'Active' },
      { name: 'Daudkandi Counter', location: 'Daudkandi Highway', district: 'Comilla', phone: '01700-100001', type: 'Counter', status: 'Active' },
      { name: 'Comilla Counter', location: 'Kandirpar', district: 'Comilla', phone: '01700-000005', type: 'Counter', status: 'Active' },
      { name: 'Comilla Rest Stop', location: 'Comilla Highway', district: 'Comilla', phone: '—', type: 'Break (20 min)', status: 'Active' },
      { name: 'Feni Counter', location: 'Feni Bus Terminal', district: 'Feni', phone: '01700-000006', type: 'Counter', status: 'Active' },
      { name: 'Sitakunda Counter', location: 'Sitakunda Bazar', district: 'Chattogram', phone: '01700-100002', type: 'Counter', status: 'Unverified' },
      { name: 'Chattogram Terminal', location: 'Dampara', district: 'Chattogram', phone: '01700-000002', type: 'Last Stop', status: 'Active' },
    ],
  },
  {
    id: 'r2',
    from: 'Dhaka',
    to: "Cox's Bazar",
    counters: [
      { name: 'Dhaka (Fakirapul)', location: 'Fakirapul, Motijheel', district: 'Dhaka', phone: '01700-000001', type: 'Starting Point', status: 'Active' },
      { name: 'Comilla Counter', location: 'Kandirpar', district: 'Comilla', phone: '01700-000005', type: 'Counter', status: 'Active' },
      { name: 'Feni Counter', location: 'Feni Bus Terminal', district: 'Feni', phone: '01700-000006', type: 'Counter', status: 'Active' },
      { name: 'Feni Rest Stop', location: 'Feni Highway', district: 'Feni', phone: '—', type: 'Break (20 min)', status: 'Active' },
      { name: 'Chattogram (Bypass)', location: 'Kaptai Road Bypass', district: 'Chattogram', phone: '—', type: 'Counter', status: 'Active' },
      { name: 'Dohazari Counter', location: 'Dohazari Bazar', district: 'Chattogram', phone: '01700-100003', type: 'Counter', status: 'Unverified' },
      { name: 'Chakaria Counter', location: 'Chakaria Bus Stand', district: "Cox's Bazar", phone: '01700-100004', type: 'Counter', status: 'Active' },
      { name: "Cox's Bazar Terminal", location: 'Kolatoli Bus Stand', district: "Cox's Bazar", phone: '01700-000003', type: 'Last Stop', status: 'Active' },
    ],
  },
  {
    id: 'r3',
    from: 'Dhaka',
    to: 'Sylhet',
    counters: [
      { name: 'Dhaka (Fakirapul)', location: 'Fakirapul, Motijheel', district: 'Dhaka', phone: '01700-000001', type: 'Starting Point', status: 'Active' },
      { name: 'Kanchpur Toll', location: 'Kanchpur Bridge', district: 'Narayanganj', phone: '—', type: 'Counter', status: 'Active' },
      { name: 'Brahmanbaria Counter', location: 'B.Baria Bus Terminal', district: 'Brahmanbaria', phone: '01700-000009', type: 'Counter', status: 'Active' },
      { name: 'Habiganj Rest Stop', location: 'Habiganj Highway', district: 'Habiganj', phone: '—', type: 'Break (20 min)', status: 'Active' },
      { name: 'Habiganj Counter', location: 'Habiganj Bus Stand', district: 'Habiganj', phone: '01700-100005', type: 'Counter', status: 'Unverified' },
      { name: 'Sylhet Terminal', location: 'Kadamtali', district: 'Sylhet', phone: '01700-000004', type: 'Last Stop', status: 'Active' },
    ],
  },
  {
    id: 'r4',
    from: 'Chattogram',
    to: "Cox's Bazar",
    counters: [
      { name: 'Chattogram Terminal', location: 'Dampara', district: 'Chattogram', phone: '01700-000002', type: 'Starting Point', status: 'Active' },
      { name: 'Patiya Counter', location: 'Patiya Bazar', district: 'Chattogram', phone: '01700-100006', type: 'Counter', status: 'Unconfirmed' },
      { name: 'Dohazari Counter', location: 'Dohazari Bazar', district: 'Chattogram', phone: '01700-100003', type: 'Counter', status: 'Active' },
      { name: 'Chakaria Counter', location: 'Chakaria Bus Stand', district: "Cox's Bazar", phone: '01700-100004', type: 'Counter', status: 'Active' },
      { name: "Cox's Bazar Terminal", location: 'Kolatoli Bus Stand', district: "Cox's Bazar", phone: '01700-000003', type: 'Last Stop', status: 'Active' },
    ],
  },
  {
    id: 'r5',
    from: 'Dhaka',
    to: 'Noakhali',
    counters: [
      { name: 'Dhaka (Fakirapul)', location: 'Fakirapul, Motijheel', district: 'Dhaka', phone: '01700-000001', type: 'Starting Point', status: 'Active' },
      { name: 'Comilla Counter', location: 'Kandirpar', district: 'Comilla', phone: '01700-000005', type: 'Counter', status: 'Active' },
      { name: 'Laksham Counter', location: 'Laksham Bazar', district: 'Comilla', phone: '01700-100007', type: 'Counter', status: 'Unverified' },
      { name: 'Begumganj Counter', location: 'Begumganj Bus Stand', district: 'Noakhali', phone: '01700-100008', type: 'Counter', status: 'Active' },
      { name: 'Noakhali (Maijdee)', location: 'Maijdee Bus Stand', district: 'Noakhali', phone: '01700-000007', type: 'Last Stop', status: 'Active' },
    ],
  },
  {
    id: 'r6',
    from: 'Dhaka',
    to: 'Chandpur',
    counters: [
      { name: 'Dhaka (Fakirapul)', location: 'Fakirapul, Motijheel', district: 'Dhaka', phone: '01700-000001', type: 'Starting Point', status: 'Active' },
      { name: 'Daudkandi Counter', location: 'Daudkandi Highway', district: 'Comilla', phone: '01700-100001', type: 'Counter', status: 'Active' },
      { name: 'Chandpur', location: 'Chandpur Bus Stand', district: 'Chandpur', phone: '01700-000010', type: 'Last Stop', status: 'Unconfirmed' },
    ],
  },
];

// ─── Route Connections (Terminal → Routes) ─────
export const routeConnections: RouteConnection[] = [
  // From Dhaka
  { from: 'Dhaka', to: 'Chattogram', routeId: 'r1' },
  { from: 'Dhaka', to: "Cox's Bazar", routeId: 'r2' },
  { from: 'Dhaka', to: 'Sylhet', routeId: 'r3' },
  { from: 'Dhaka', to: 'Noakhali', routeId: 'r5' },
  { from: 'Dhaka', to: 'Chandpur', routeId: 'r6' },
  { from: 'Dhaka', to: 'Rajshahi', routeId: null },
  { from: 'Dhaka', to: 'Khulna', routeId: null },
  // From Chattogram
  { from: 'Chattogram', to: "Cox's Bazar", routeId: 'r4' },
  { from: 'Chattogram', to: 'Dhaka', routeId: null },
  // From Cox's Bazar
  { from: "Cox's Bazar", to: 'Dhaka', routeId: null },
  { from: "Cox's Bazar", to: 'Chattogram', routeId: null },
  // From Sylhet
  { from: 'Sylhet', to: 'Dhaka', routeId: null },
];
