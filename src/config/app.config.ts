export const APP_CONFIG = {
  IS_TEST_MODE: false,
  APP_NAME: 'Caby',
  COMPANY_NAME: 'Talent Access Technologies SA',
  DEFAULT_CITY: 'Genève',
  DEFAULT_COUNTRY: 'Suisse',
  DEFAULT_CURRENCY: 'CHF',
  DEFAULT_LOCALE: 'fr-CH',
  DEFAULT_CENTER: { lat: 46.2044, lng: 6.1432 },
  DEFAULT_ZOOM: 14,
  COMMISSION_RATE: 0.15,
  NETTING_RATE: 0.10,
  TATFLEET_WEBHOOK_URL: '/api/tatfleet-sync',
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  STRIPE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  
  // Timers
  CABY_DIRECT_TIMEOUT_SECONDS: 15,
  PRIVATE_CLIENT_TIMEOUT_SECONDS: 30,
  NETWORK_DISPATCH_TIMEOUT_MINUTES: 5,
  
  // Rayons de recherche
  SEARCH_RADIUS_KM: 15,
  
  // GPS update interval
  GPS_UPDATE_INTERVAL_MS: 10000,
} as const;

export type AppConfig = typeof APP_CONFIG;
