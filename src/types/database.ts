export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          role: 'passenger' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          role?: 'passenger' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          role?: 'passenger' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      routes: {
        Row: {
          id: string;
          origin: string;
          destination: string;
          distance_km: number;
          duration_minutes: number;
          base_fare: number;
          status: 'active' | 'inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          origin: string;
          destination: string;
          distance_km: number;
          duration_minutes: number;
          base_fare: number;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          origin?: string;
          destination?: string;
          distance_km?: number;
          duration_minutes?: number;
          base_fare?: number;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
        Relationships: [];
      };
      buses: {
        Row: {
          id: string;
          name: string;
          type: 'AC' | 'Non-AC';
          total_seats: number;
          amenities: Json;
          registration_number: string;
          status: 'active' | 'maintenance' | 'retired';
          fuel_type: string | null;
          assigned_driver_id: string | null;
          assigned_staff_id: string | null;
          assigned_supervisor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'AC' | 'Non-AC';
          total_seats: number;
          amenities?: Json;
          registration_number: string;
          status?: 'active' | 'maintenance' | 'retired';
          fuel_type?: string;
          assigned_driver_id?: string | null;
          assigned_staff_id?: string | null;
          assigned_supervisor_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'AC' | 'Non-AC';
          total_seats?: number;
          amenities?: Json;
          registration_number?: string;
          status?: 'active' | 'maintenance' | 'retired';
          fuel_type?: string;
          assigned_driver_id?: string | null;
          assigned_staff_id?: string | null;
          assigned_supervisor_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      schedules: {
        Row: {
          id: string;
          route_id: string;
          bus_id: string;
          departure_time: string;
          arrival_time: string;
          fare_override: number | null;
          days_of_week: number[];
          status: 'active' | 'cancelled' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          bus_id: string;
          departure_time: string;
          arrival_time: string;
          fare_override?: number | null;
          days_of_week: number[];
          status?: 'active' | 'cancelled' | 'completed';
          created_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          bus_id?: string;
          departure_time?: string;
          arrival_time?: string;
          fare_override?: number | null;
          days_of_week?: number[];
          status?: 'active' | 'cancelled' | 'completed';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'schedules_route_id_fkey';
            columns: ['route_id'];
            isOneToOne: false;
            referencedRelation: 'routes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'schedules_bus_id_fkey';
            columns: ['bus_id'];
            isOneToOne: false;
            referencedRelation: 'buses';
            referencedColumns: ['id'];
          },
        ];
      };
      seats: {
        Row: {
          id: string;
          bus_id: string;
          seat_number: string;
          row_label: string;
          seat_type: 'standard' | 'premium' | 'ladies';
          is_active: boolean;
        };
        Insert: {
          id?: string;
          bus_id: string;
          seat_number: string;
          row_label: string;
          seat_type?: 'standard' | 'premium' | 'ladies';
          is_active?: boolean;
        };
        Update: {
          id?: string;
          bus_id?: string;
          seat_number?: string;
          row_label?: string;
          seat_type?: 'standard' | 'premium' | 'ladies';
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'seats_bus_id_fkey';
            columns: ['bus_id'];
            isOneToOne: false;
            referencedRelation: 'buses';
            referencedColumns: ['id'];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          schedule_id: string;
          booking_date: string;
          travel_date: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_fare: number;
          boarding_point: string;
          dropping_point: string;
          passenger_name: string;
          passenger_phone: string;
          passenger_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          schedule_id: string;
          booking_date?: string;
          travel_date: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_fare: number;
          boarding_point: string;
          dropping_point: string;
          passenger_name: string;
          passenger_phone: string;
          passenger_email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          schedule_id?: string;
          booking_date?: string;
          travel_date?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_fare?: number;
          boarding_point?: string;
          dropping_point?: string;
          passenger_name?: string;
          passenger_phone?: string;
          passenger_email?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_schedule_id_fkey';
            columns: ['schedule_id'];
            isOneToOne: false;
            referencedRelation: 'schedules';
            referencedColumns: ['id'];
          },
        ];
      };
      booking_seats: {
        Row: {
          id: string;
          booking_id: string;
          seat_id: string;
          fare: number;
        };
        Insert: {
          id?: string;
          booking_id: string;
          seat_id: string;
          fare: number;
        };
        Update: {
          id?: string;
          booking_id?: string;
          seat_id?: string;
          fare?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'booking_seats_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'booking_seats_seat_id_fkey';
            columns: ['seat_id'];
            isOneToOne: false;
            referencedRelation: 'seats';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          method: 'bkash' | 'nagad' | 'rocket' | 'card';
          transaction_id: string | null;
          status: 'pending' | 'success' | 'failed';
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          amount: number;
          method: 'bkash' | 'nagad' | 'rocket' | 'card';
          transaction_id?: string | null;
          status?: 'pending' | 'success' | 'failed';
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          amount?: number;
          method?: 'bkash' | 'nagad' | 'rocket' | 'card';
          transaction_id?: string | null;
          status?: 'pending' | 'success' | 'failed';
          paid_at?: string | null;
          created_at?: string;
        };
         Relationships: [
          {
            foreignKeyName: 'payments_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
        ];
      };
      trip_tracking: {
        Row: {
          id: string;
          schedule_id: string;
          travel_date: string;
          current_stop: string;
          next_stop: string | null;
          stops_completed: number;
          total_stops: number;
          progress_percent: number;
          status: 'scheduled' | 'boarding' | 'in_transit' | 'delayed' | 'arrived' | 'cancelled';
          eta: string | null;
          last_updated: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          travel_date?: string;
          current_stop?: string;
          next_stop?: string | null;
          stops_completed?: number;
          total_stops?: number;
          progress_percent?: number;
          status?: 'scheduled' | 'boarding' | 'in_transit' | 'delayed' | 'arrived' | 'cancelled';
          eta?: string | null;
          last_updated?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          travel_date?: string;
          current_stop?: string;
          next_stop?: string | null;
          stops_completed?: number;
          total_stops?: number;
          progress_percent?: number;
          status?: 'scheduled' | 'boarding' | 'in_transit' | 'delayed' | 'arrived' | 'cancelled';
          eta?: string | null;
          last_updated?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'trip_tracking_schedule_id_fkey';
            columns: ['schedule_id'];
            isOneToOne: false;
            referencedRelation: 'schedules';
            referencedColumns: ['id'];
          },
        ];
      };
      terminals: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          location: string;
          district: string;
          phone: string;
          is_main_terminal: boolean;
          counter_type: string;
          notes: string;
          map_location: string;
          status: 'active' | 'inactive' | 'hold' | 'removed';
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          location: string;
          district: string;
          phone?: string;
          is_main_terminal?: boolean;
          counter_type?: string;
          notes?: string;
          map_location?: string;
          status?: 'active' | 'inactive' | 'hold' | 'removed';
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          location?: string;
          district?: string;
          phone?: string;
          is_main_terminal?: boolean;
          counter_type?: string;
          notes?: string;
          map_location?: string;
          status?: 'active' | 'inactive' | 'hold' | 'removed';
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      route_counters: {
        Row: {
          id: string;
          route_id: string;
          name: string;
          location: string;
          district: string;
          phone: string;
          counter_type: string;
          status: string;
          sort_order: number;
          terminal_id: string | null;
          custom_point_name: string;
          halt_minutes: number;
          break_minutes: number;
          is_boarding_allowed: boolean;
          is_dropping_allowed: boolean;
          is_visible_to_customer: boolean;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          name: string;
          location: string;
          district: string;
          phone?: string;
          counter_type?: string;
          status?: string;
          sort_order?: number;
          terminal_id?: string | null;
          custom_point_name?: string;
          halt_minutes?: number;
          break_minutes?: number;
          is_boarding_allowed?: boolean;
          is_dropping_allowed?: boolean;
          is_visible_to_customer?: boolean;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          name?: string;
          location?: string;
          district?: string;
          phone?: string;
          counter_type?: string;
          status?: string;
          sort_order?: number;
          terminal_id?: string | null;
          custom_point_name?: string;
          halt_minutes?: number;
          break_minutes?: number;
          is_boarding_allowed?: boolean;
          is_dropping_allowed?: boolean;
          is_visible_to_customer?: boolean;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'route_counters_route_id_fkey';
            columns: ['route_id'];
            isOneToOne: false;
            referencedRelation: 'routes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'route_counters_terminal_id_fkey';
            columns: ['terminal_id'];
            isOneToOne: false;
            referencedRelation: 'terminals';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'passenger' | 'admin';
      bus_type: 'AC' | 'Non-AC' | 'Sleeper';
      bus_status: 'active' | 'maintenance' | 'retired';
      route_status: 'active' | 'inactive' | 'draft' | 'hold' | 'archived';
      schedule_status: 'active' | 'cancelled' | 'completed';
      seat_type: 'standard' | 'premium' | 'ladies';
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      payment_method: 'bkash' | 'nagad' | 'rocket' | 'card';
      payment_status: 'pending' | 'success' | 'failed';
      trip_status: 'scheduled' | 'boarding' | 'in_transit' | 'delayed' | 'arrived' | 'cancelled';
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Route = Database['public']['Tables']['routes']['Row'];
export type Bus = Database['public']['Tables']['buses']['Row'];
export type Schedule = Database['public']['Tables']['schedules']['Row'];
export type Seat = Database['public']['Tables']['seats']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingSeat = Database['public']['Tables']['booking_seats']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type TripTracking = Database['public']['Tables']['trip_tracking']['Row'];
