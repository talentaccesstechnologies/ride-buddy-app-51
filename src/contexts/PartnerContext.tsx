import React, { createContext, useContext, useState, useCallback } from 'react';

export interface PartnerRide {
  id: string;
  reference: string;
  pickupAddress: string;
  dropoffAddress: string;
  serviceType: 'ride' | 'van' | 'secure' | 'express' | 'care';
  status: 'searching' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled';
  driverName?: string;
  driverRating?: number;
  driverLat?: number;
  driverLng?: number;
  price?: number;
  duration?: number;
  createdAt: string;
  completedAt?: string;
  scheduledAt?: string;
}

export interface PartnerInvoice {
  id: string;
  month: string;
  totalAmount: number;
  rideCount: number;
  status: 'paid' | 'pending' | 'overdue';
  pdfUrl?: string;
}

interface PartnerProfile {
  id: string;
  name: string;
  logo?: string;
  apiKey: string;
  webhookUrl?: string;
  contactEmail: string;
}

interface PartnerContextType {
  isAuthenticated: boolean;
  partner: PartnerProfile | null;
  rides: PartnerRide[];
  invoices: PartnerInvoice[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  orderRide: (order: {
    pickupAddress: string;
    dropoffAddress: string;
    serviceType: string;
    reference: string;
    scheduledAt?: string;
  }) => void;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const usePartner = () => {
  const ctx = useContext(PartnerContext);
  if (!ctx) throw new Error('usePartner must be used within PartnerProvider');
  return ctx;
};

// Mock data
const MOCK_PARTNER: PartnerProfile = {
  id: 'partner-sixt-001',
  name: 'SIXT Genève',
  apiKey: 'caby_pk_live_7f3a9c2e1b4d8f6a0c5e3b7d9a1f4c6e',
  contactEmail: 'operations@sixt-geneve.ch',
  webhookUrl: 'https://api.sixt-geneve.ch/caby/webhook',
};

const MOCK_RIDES: PartnerRide[] = [
  {
    id: 'pr-001', reference: 'SIXT-2026-0412', pickupAddress: 'SIXT Aéroport GVA, Route de l\'Aéroport 21',
    dropoffAddress: 'Four Seasons Hôtel des Bergues, Quai des Bergues 33', serviceType: 'ride',
    status: 'completed', driverName: 'Ahmed B.', driverRating: 4.9, price: 45.50, duration: 22,
    createdAt: '2026-02-28T14:30:00Z', completedAt: '2026-02-28T14:52:00Z',
  },
  {
    id: 'pr-002', reference: 'SIXT-2026-0413', pickupAddress: 'Gare Cornavin, Place de Cornavin',
    dropoffAddress: 'CERN, Esplanade des Particules 1, Meyrin', serviceType: 'ride',
    status: 'in_progress', driverName: 'Marie L.', driverRating: 4.8,
    driverLat: 46.2120, driverLng: 6.1430, createdAt: '2026-03-01T09:15:00Z',
  },
  {
    id: 'pr-003', reference: 'SIXT-2026-0414', pickupAddress: 'Hôtel Métropole, Quai Général-Guisan 34',
    dropoffAddress: 'Palexpo, Route François-Peyrot 30', serviceType: 'van',
    status: 'driver_arriving', driverName: 'Jean-Pierre M.', driverRating: 4.7,
    driverLat: 46.2050, driverLng: 6.1500, createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'pr-004', reference: 'SIXT-2026-0415', pickupAddress: 'Mandarin Oriental, Quai Turrettini 1',
    dropoffAddress: 'Clinique des Grangettes, Ch. des Grangettes 7', serviceType: 'care',
    status: 'searching', createdAt: '2026-03-01T10:30:00Z',
  },
  // Historical
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `pr-h${i}`, reference: `SIXT-2026-0${400 - i}`,
    pickupAddress: ['Gare Cornavin', 'Aéroport GVA', 'Hôtel Kempinski', 'Nations Unies'][i % 4],
    dropoffAddress: ['CERN Meyrin', 'Carouge Centre', 'Eaux-Vives', 'Plainpalais'][i % 4],
    serviceType: (['ride', 'van', 'secure', 'express', 'care'] as const)[i % 5],
    status: 'completed' as const, driverName: ['Ahmed B.', 'Marie L.', 'Jean-Pierre M.', 'Sofia K.'][i % 4],
    driverRating: [4.9, 4.8, 4.7, 5.0][i % 4], price: 25 + Math.floor(Math.random() * 60),
    duration: 12 + Math.floor(Math.random() * 30),
    createdAt: new Date(2026, 1, 20 - i, 8 + (i % 10), i * 7 % 60).toISOString(),
    completedAt: new Date(2026, 1, 20 - i, 8 + (i % 10) + 1, i * 3 % 60).toISOString(),
  })),
];

const MOCK_INVOICES: PartnerInvoice[] = [
  { id: 'inv-001', month: '2026-02', totalAmount: 4250.50, rideCount: 87, status: 'pending' },
  { id: 'inv-002', month: '2026-01', totalAmount: 3890.00, rideCount: 72, status: 'paid' },
  { id: 'inv-003', month: '2025-12', totalAmount: 5120.75, rideCount: 98, status: 'paid' },
  { id: 'inv-004', month: '2025-11', totalAmount: 3650.00, rideCount: 65, status: 'paid' },
];

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [rides, setRides] = useState<PartnerRide[]>(MOCK_RIDES);
  const [invoices] = useState<PartnerInvoice[]>(MOCK_INVOICES);

  const login = useCallback(async (email: string, _password: string) => {
    // Simulated login — accept any credentials for demo
    await new Promise(r => setTimeout(r, 800));
    if (email) {
      setIsAuthenticated(true);
      setPartner(MOCK_PARTNER);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setPartner(null);
  }, []);

  const orderRide = useCallback((order: {
    pickupAddress: string; dropoffAddress: string; serviceType: string; reference: string; scheduledAt?: string;
  }) => {
    const newRide: PartnerRide = {
      id: `pr-new-${Date.now()}`,
      reference: order.reference || `SIXT-${Date.now()}`,
      pickupAddress: order.pickupAddress,
      dropoffAddress: order.dropoffAddress,
      serviceType: order.serviceType as PartnerRide['serviceType'],
      status: 'searching',
      createdAt: new Date().toISOString(),
      scheduledAt: order.scheduledAt,
    };
    setRides(prev => [newRide, ...prev]);

    // Simulate driver assignment after 3s
    setTimeout(() => {
      setRides(prev => prev.map(r => r.id === newRide.id ? {
        ...r, status: 'driver_arriving' as const,
        driverName: 'Sofia K.', driverRating: 5.0,
        driverLat: 46.2044 + (Math.random() - 0.5) * 0.01,
        driverLng: 6.1432 + (Math.random() - 0.5) * 0.01,
      } : r));
    }, 3000);
  }, []);

  return (
    <PartnerContext.Provider value={{ isAuthenticated, partner, rides, invoices, login, logout, orderRide }}>
      {children}
    </PartnerContext.Provider>
  );
};
