// User & Profile Types
export type UserRole = 'rider' | 'driver' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Driver Types
export type VehicleType = 'standard' | 'premium' | 'xl' | 'moto';

export interface DriverProfile {
  id: string;
  user_id: string;
  license_number: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number | null;
  vehicle_color: string | null;
  vehicle_plate: string;
  vehicle_type: VehicleType;
  insurance_number: string | null;
  is_verified: boolean;
  is_online: boolean;
  current_lat: number | null;
  current_lng: number | null;
  rating: number;
  total_rides: number;
  created_at: string;
  updated_at: string;
}

// Ride Types
export type RideStatus = 
  | 'searching' 
  | 'accepted' 
  | 'driver_arriving' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Ride {
  id: string;
  rider_id: string;
  driver_id: string | null;
  status: RideStatus;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  vehicle_type: VehicleType;
  estimated_price: number | null;
  final_price: number | null;
  estimated_duration: number | null;
  estimated_distance: number | null;
  actual_duration: number | null;
  actual_distance: number | null;
  surge_multiplier: number;
  payment_method: string;
  payment_status: PaymentStatus;
  rider_rating: number | null;
  driver_rating: number | null;
  cancellation_reason: string | null;
  cancelled_by: 'rider' | 'driver' | 'system' | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Location Types
export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface SavedPlace {
  id: string;
  user_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  icon: string;
  created_at: string;
}

// Vehicle Options for UI
export interface VehicleOption {
  type: VehicleType;
  name: string;
  description: string;
  icon: string;
  multiplier: number;
  capacity: number;
  eta: number;
}

// Simulated Driver for Demo
export interface SimulatedDriver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  vehicle: {
    make: string;
    model: string;
    color: string;
    plate: string;
  };
  position: {
    lat: number;
    lng: number;
  };
  eta: number;
}
