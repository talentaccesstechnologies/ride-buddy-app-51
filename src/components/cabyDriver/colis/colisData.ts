// Demo data & types for Mode Colis flow

export type ColisStatus = 'pending' | 'assigned' | 'collected' | 'in_transit' | 'delivered' | 'failed' | 'returned';

export interface ColisItem {
  id: string;
  barcode: string;
  qrCode: string; // CABY-[TOUR]-[COLIS]-[TS]
  recipientName: string;
  recipientPhone: string; // masked proxy
  address: string;
  lat: number;
  lng: number;
  serviceType: 'health' | 'express' | 'laundry';
  status: ColisStatus;
  partnerName: string;
  partnerContact: string;
  packageSize: 'small' | 'medium' | 'large';
  price: number;
  scannedPickup: boolean;
  scannedDelivery: boolean;
  photoPickup: boolean;
  photoDelivery: boolean;
  signature: boolean;
  collectedAt?: number;
  deliveredAt?: number;
}

export interface TourProposal {
  id: string;
  items: ColisItem[];
  totalPrice: number;
  estimatedDuration: string;
  totalDistance: number;
}

export type ColisFlowPhase = 
  | 'proposal'
  | 'tour_active'
  | 'at_pickup'
  | 'delivering'
  | 'at_delivery'
  | 'completed';

const TS = Date.now();

export const generateDemoTour = (): TourProposal => ({
  id: `TOUR-${TS}`,
  totalPrice: 82,
  estimatedDuration: '~2h',
  totalDistance: 12.4,
  items: [
    {
      id: 'd1', barcode: 'PKG-2026-001', qrCode: `CABY-TOUR-D1-${TS}`,
      recipientName: 'Sophie M.', recipientPhone: '+41 78 *** ** 47',
      address: 'Rue du Rhône 48, Genève', lat: 46.2020, lng: 6.1480,
      serviceType: 'health', status: 'assigned',
      partnerName: 'Laboratoire Unilabs', partnerContact: '+41 22 310 00 00',
      packageSize: 'small', price: 18,
      scannedPickup: false, scannedDelivery: false, photoPickup: false, photoDelivery: false, signature: false,
    },
    {
      id: 'd2', barcode: 'PKG-2026-002', qrCode: `CABY-TOUR-D2-${TS}`,
      recipientName: 'Marc D.', recipientPhone: '+41 79 *** ** 52',
      address: 'Route de Chêne 12, Genève', lat: 46.1980, lng: 6.1620,
      serviceType: 'express', status: 'assigned',
      partnerName: 'Digitec Galaxus', partnerContact: '+41 44 575 95 00',
      packageSize: 'medium', price: 16,
      scannedPickup: false, scannedDelivery: false, photoPickup: false, photoDelivery: false, signature: false,
    },
    {
      id: 'd3', barcode: 'PKG-2026-003', qrCode: `CABY-TOUR-D3-${TS}`,
      recipientName: 'Laura K.', recipientPhone: '+41 76 *** ** 91',
      address: 'Av. de Champel 31, Genève', lat: 46.1930, lng: 6.1450,
      serviceType: 'express', status: 'assigned',
      partnerName: 'Digitec Galaxus', partnerContact: '+41 44 575 95 00',
      packageSize: 'large', price: 20,
      scannedPickup: false, scannedDelivery: false, photoPickup: false, photoDelivery: false, signature: false,
    },
    {
      id: 'd4', barcode: 'PKG-2026-004', qrCode: `CABY-TOUR-D4-${TS}`,
      recipientName: 'Thomas B.', recipientPhone: '+41 78 *** ** 33',
      address: 'Quai du Mont-Blanc 7, Genève', lat: 46.2100, lng: 6.1500,
      serviceType: 'laundry', status: 'assigned',
      partnerName: 'Blanchisserie Prestige', partnerContact: '+41 22 731 00 00',
      packageSize: 'medium', price: 14,
      scannedPickup: false, scannedDelivery: false, photoPickup: false, photoDelivery: false, signature: false,
    },
    {
      id: 'd5', barcode: 'PKG-2026-005', qrCode: `CABY-TOUR-D5-${TS}`,
      recipientName: 'Amélie F.', recipientPhone: '+41 77 *** ** 65',
      address: 'Rue de Lausanne 80, Genève', lat: 46.2150, lng: 6.1420,
      serviceType: 'health', status: 'assigned',
      partnerName: 'HUG Pharmacie', partnerContact: '+41 22 372 33 11',
      packageSize: 'small', price: 14,
      scannedPickup: false, scannedDelivery: false, photoPickup: false, photoDelivery: false, signature: false,
    },
  ],
});

export const serviceLabel = (t: ColisItem['serviceType']) => {
  switch (t) {
    case 'health': return { label: 'Health Logistix', color: 'text-red-500', bg: 'bg-red-500/15', icon: '🏥' };
    case 'express': return { label: 'Caby Express', color: 'text-orange-500', bg: 'bg-orange-500/15', icon: '📦' };
    case 'laundry': return { label: 'Caby Laundry', color: 'text-blue-500', bg: 'bg-blue-500/15', icon: '👕' };
  }
};

export const statusLabel = (s: ColisStatus) => {
  const map: Record<ColisStatus, string> = {
    pending: 'En attente', assigned: 'Assigné', collected: 'Collecté',
    in_transit: 'En transit', delivered: 'Livré', failed: 'Tentative échouée', returned: 'Retourné',
  };
  return map[s];
};
