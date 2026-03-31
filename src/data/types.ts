// ==================== Counter Types ====================
export type CounterType = 'Main Terminal' | 'Counter' | 'Pickup Point' | 'Drop Point' | 'Break Point' | 'Restaurant Point';
export type CounterStatus = 'active' | 'hold' | 'inactive' | 'removed';

export interface Counter {
  id: string;
  code: string;
  name: string;
  type: CounterType;
  district: string;
  address: string;
  phone: string;
  notes: string;
  mapLocation: string;
  status: CounterStatus;
  isMainTerminal: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Route Types ====================
export type RouteStatus = 'draft' | 'active' | 'hold' | 'archived';
export type RoutePointType = 'Origin Terminal' | 'Counter' | 'Pickup Point' | 'Drop Point' | 'Intermediate Stop' | 'Break Point' | 'Restaurant Break' | 'Destination Terminal';
export type RoutePointStatus = 'active' | 'hold';

export interface RoutePoint {
  id: string;
  routeId: string;
  orderIndex: number;
  pointType: RoutePointType;
  counterId: string | null;
  customPointName: string | null;
  haltMinutes: number;
  breakMinutes: number;
  isBoardingAllowed: boolean;
  isDroppingAllowed: boolean;
  isVisibleToCustomer: boolean;
  status: RoutePointStatus;
  notes: string;
}

export interface RouteData {
  id: string;
  code: string;
  name: string;
  from: string;
  to: string;
  direction: string;
  estimatedDuration: string;
  baseFare: number;
  status: RouteStatus;
  notes: string;
  points: RoutePoint[];
  createdAt: string;
  updatedAt: string;
}
