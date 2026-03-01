// Course Types
export type CourseType = 'private_client' | 'network_dispatch' | 'caby_direct' | 'livraison' | 'uber_sync';
export type CourseSource = 'caby_app' | 'qr_code' | 'whatsapp_parsed' | 'private_dispatch' | 'phone';
export type VehicleType = 'standard' | 'premium' | 'van' | 'moto';
export type LegalStatus = 'green' | 'red';

// Radar Course Interface
export interface RadarCourse {
  id: string;
  type: CourseType;
  source: CourseSource;
  
  // Client (peut être masqué par firewall)
  clientDisplayName: string;
  clientIsProtected: boolean;
  clientAvatarUrl?: string;
  clientRating?: number;
  clientNote?: string;
  
  // Trajet
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  
  // Estimation
  estimatedPrice: number;
  estimatedDistance: number;
  estimatedDuration: number;
  vehicleTypeRequired: VehicleType;
  
  // Netting (si network_dispatch)
  networkCommission?: number;
  netPriceForDriver?: number;
  senderDriverName?: string;
  
  // Timing
  expiresAt: Date;
  createdAt: Date;
  scheduledFor?: Date;
  
  // Métadonnées Caby Driver
  meta: {
    date: string;
    source: CourseSource;
    sujet: string;
    lien: string;
    description: string;
    eligible: boolean;
  };
}

// Driver Radar State
export interface DriverRadarState {
  isOnline: boolean;
  legalStatus: LegalStatus;
  courses: RadarCourse[];
  isLoading: boolean;
  currentPosition: { lat: number; lng: number; heading: number } | null;
  stats: {
    todayRides: number;
    todayEarnings: number;
    onlineMinutes: number;
  };
}

// Private Dispatch
export interface PrivateDispatch {
  id: string;
  rideId?: string;
  senderDriverId: string;
  senderDriverName: string;
  receiverDriverId?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat?: number;
  dropoffLng?: number;
  scheduledTime?: Date;
  estimatedPrice: number;
  vehicleTypeRequired: VehicleType;
  notes?: string;
  clientDisplayName: string;
  status: 'posted' | 'claimed' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  nettingRate: number;
  nettingAmount?: number;
  expiresAt: Date;
  createdAt: Date;
}

// Driver Profile Extended
export interface DriverProfileExtended {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  
  // Legal
  licenseNumber: string;
  vtcCardNumber?: string;
  vtcCardExpiry?: Date;
  lseStatus: 'pending' | 'valid' | 'expired' | 'suspended';
  ltvtcStatus: 'pending' | 'valid' | 'expired' | 'suspended';
  legalStatus: LegalStatus;
  
  // Vehicle
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: number;
  vehicleColor?: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  
  // Status
  isVerified: boolean;
  isOnline: boolean;
  isOnRide: boolean;
  currentLat?: number;
  currentLng?: number;
  currentHeading?: number;
  
  // Stats
  rating: number;
  totalRides: number;
  totalEarnings: number;
  
  // QR Code
  qrCode: string;
  privateNetworkEnabled: boolean;
}

// Netting Ledger Entry
export interface NettingEntry {
  id: string;
  dispatchId: string;
  rideId?: string;
  creditorDriverId: string;
  creditorDriverName: string;
  debtorDriverId: string;
  debtorDriverName: string;
  rideAmount: number;
  nettingRate: number;
  nettingAmount: number;
  status: 'pending' | 'confirmed' | 'settled' | 'disputed';
  settledAt?: Date;
  settlementMethod?: string;
  createdAt: Date;
}
