export interface Route {
  id: string;
  from: string;
  to: string;
  distance: string;
  duration: string;
  basePrice: number;
  popularity: number;
}

export interface BusResult {
  id: string;
  routeId: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  coachType: string;
  coachName: string;
  amenities: string[];
  availableSeats: number;
  totalSeats: number;
  fare: number;
  boardingPoints: string[];
  droppingPoints: string[];
  date: string;
}

export interface Booking {
  id: string;
  bookingId: string;
  busId: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  passengerName: string;
  phone: string;
  email: string;
  seats: string[];
  totalFare: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  coachType: string;
  coachName: string;
  boardingPoint: string;
  droppingPoint: string;
  paymentMethod: string;
}

export const cities = [
  'Dhaka', 'Chattogram', "Cox's Bazar", 'Feni', 'Sylhet', 'Rajshahi', 
  'Khulna', 'Comilla', 'Rangpur', 'Mymensingh', 'Bogura', 'Gazipur'
];

export const popularRoutes: Route[] = [
  { id: 'r1', from: 'Dhaka', to: 'Chattogram', distance: '264 km', duration: '5h 30m', basePrice: 850, popularity: 98 },
  { id: 'r2', from: 'Dhaka', to: "Cox's Bazar", distance: '392 km', duration: '8h 00m', basePrice: 1400, popularity: 95 },
  { id: 'r3', from: 'Dhaka', to: 'Sylhet', distance: '240 km', duration: '5h 00m', basePrice: 800, popularity: 90 },
  { id: 'r4', from: 'Dhaka', to: 'Rajshahi', distance: '254 km', duration: '5h 30m', basePrice: 750, popularity: 85 },
  { id: 'r5', from: 'Dhaka', to: 'Khulna', distance: '280 km', duration: '6h 00m', basePrice: 900, popularity: 82 },
  { id: 'r6', from: 'Chattogram', to: "Cox's Bazar", distance: '152 km', duration: '3h 30m', basePrice: 600, popularity: 88 },
  { id: 'r7', from: 'Dhaka', to: 'Feni', distance: '157 km', duration: '3h 30m', basePrice: 550, popularity: 78 },
  { id: 'r8', from: 'Dhaka', to: 'Comilla', distance: '97 km', duration: '2h 30m', basePrice: 400, popularity: 80 },
];

export const coachTypes = [
  { name: 'Starline Platinum', type: 'AC', seats: 36, amenities: ['AC', 'WiFi', 'USB Charging', 'Blanket', 'Snacks', 'Entertainment'] },
  { name: 'Starline Gold', type: 'AC', seats: 36, amenities: ['AC', 'USB Charging', 'Reclining Seats', 'Water'] },
  { name: 'Starline Silver', type: 'AC', seats: 40, amenities: ['AC', 'USB Charging', 'Water'] },
  { name: 'Starline Express', type: 'Non-AC', seats: 44, amenities: ['Fan', 'Water'] },
];

export function generateBusResults(from: string, to: string, date: string): BusResult[] {
  const departures = ['06:00', '07:30', '08:00', '09:30', '10:00', '11:30', '14:00', '16:00', '18:00', '20:00', '22:00', '23:30'];
  const route = popularRoutes.find(r => r.from === from && r.to === to) || popularRoutes.find(r => r.to === from && r.from === to);
  const baseFare = route?.basePrice || 700;
  const baseDuration = route?.duration || '5h 00m';
  
  return departures.map((dep, i) => {
    const coach = coachTypes[i % coachTypes.length];
    const depHour = parseInt(dep.split(':')[0]);
    const durationHours = parseInt(baseDuration.split('h')[0]);
    const durationMins = parseInt(baseDuration.split(' ')[1]?.replace('m', '') || '0');
    const arrHour = (depHour + durationHours) % 24;
    const arrMin = durationMins;
    const fareMultiplier = coach.type === 'Non-AC' ? 1 : 1.5;
    
    return {
      id: `bus-${i}`,
      routeId: route?.id || 'r1',
      from,
      to,
      departureTime: dep,
      arrivalTime: `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`,
      duration: baseDuration,
      coachType: coach.type,
      coachName: coach.name,
      amenities: coach.amenities,
      availableSeats: Math.floor(Math.random() * 20) + 5,
      totalSeats: coach.seats,
      fare: Math.round(baseFare * fareMultiplier),
      boardingPoints: [`${from} Terminal`, `${from} Bypass`, `${from} Central`],
      droppingPoints: [`${to} Terminal`, `${to} Main Stand`, `${to} City Center`],
      date,
    };
  });
}

export const sampleBooking: Booking = {
  id: '1',
  bookingId: 'STR-2026-48291',
  busId: 'bus-0',
  from: 'Dhaka',
  to: 'Chattogram',
  date: '2026-03-25',
  departureTime: '22:00',
  arrivalTime: '03:30',
  passengerName: 'Rahim Uddin',
  phone: '+8801712345678',
  email: 'rahim@email.com',
  seats: ['A1', 'A2'],
  totalFare: 3740,
  status: 'confirmed',
  coachType: 'AC',
  coachName: 'Starline Platinum',
  boardingPoint: 'Dhaka Terminal',
  droppingPoint: 'Chattogram Terminal',
  paymentMethod: 'bKash',
};

export const adminStats = {
  todayTrips: 42,
  activeTrips: 12,
  totalPassengers: 1847,
  revenue: 1256000,
  occupancyRate: 78,
  onTimeRate: 94,
  supportTickets: 7,
  delayedTrips: 2,
  departures: [
    { id: 'd1', route: 'Dhaka → Chattogram', time: '06:00', coach: 'Platinum-01', status: 'On Time', occupancy: 92, passengers: 22 },
    { id: 'd2', route: 'Dhaka → Cox\'s Bazar', time: '07:30', coach: 'Gold-03', status: 'On Time', occupancy: 88, passengers: 32 },
    { id: 'd3', route: 'Dhaka → Sylhet', time: '08:00', coach: 'Silver-05', status: 'Delayed 15m', occupancy: 72, passengers: 29 },
    { id: 'd4', route: 'Dhaka → Rajshahi', time: '09:30', coach: 'Gold-02', status: 'On Time', occupancy: 65, passengers: 23 },
    { id: 'd5', route: 'Chattogram → Cox\'s Bazar', time: '10:00', coach: 'Platinum-04', status: 'Boarding', occupancy: 96, passengers: 23 },
    { id: 'd6', route: 'Dhaka → Feni', time: '11:30', coach: 'Express-08', status: 'Departed', occupancy: 80, passengers: 35 },
  ],
  revenueChart: [
    { day: 'Mon', revenue: 185000 },
    { day: 'Tue', revenue: 210000 },
    { day: 'Wed', revenue: 178000 },
    { day: 'Thu', revenue: 195000 },
    { day: 'Fri', revenue: 245000 },
    { day: 'Sat', revenue: 280000 },
    { day: 'Sun', revenue: 163000 },
  ],
};
