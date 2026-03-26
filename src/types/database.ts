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
      };
      buses: {
        Row: {
          id: string;
          name: string;
          type: 'AC' | 'Non-AC' | 'Sleeper';
          total_seats: number;
          amenities: Json;
          registration_number: string;
          status: 'active' | 'maintenance' | 'retired';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'AC' | 'Non-AC' | 'Sleeper';
          total_seats: number;
          amenities?: Json;
          registration_number: string;
          status?: 'active' | 'maintenance' | 'retired';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'AC' | 'Non-AC' | 'Sleeper';
          total_seats?: number;
          amenities?: Json;
          registration_number?: string;
          status?: 'active' | 'maintenance' | 'retired';
          created_at?: string;
        };
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
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'passenger' | 'admin';
      bus_type: 'AC' | 'Non-AC' | 'Sleeper';
      bus_status: 'active' | 'maintenance' | 'retired';
      route_status: 'active' | 'inactive';
      schedule_status: 'active' | 'cancelled' | 'completed';
      seat_type: 'standard' | 'premium' | 'ladies';
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      payment_method: 'bkash' | 'nagad' | 'rocket' | 'card';
      payment_status: 'pending' | 'success' | 'failed';
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
