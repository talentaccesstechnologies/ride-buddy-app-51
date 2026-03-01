import React, { createContext, useContext, useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';

const LIBRARIES: ('places')[] = ['places'];

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
  apiKey: string;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: undefined,
  apiKey: '',
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

// Inner component that actually calls useJsApiLoader (only rendered when key is available)
const GoogleMapsLoaderInner: React.FC<{ apiKey: string; children: React.ReactNode }> = ({ apiKey, children }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError, apiKey }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
  const [fetching, setFetching] = useState(!apiKey);

  useEffect(() => {
    if (apiKey) return; // Already have it from env
    
    const fetchKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('google-maps-key');
        if (!error && data?.key) {
          setApiKey(data.key);
        }
      } catch {
        // silent fail
      } finally {
        setFetching(false);
      }
    };
    fetchKey();
  }, [apiKey]);

  if (!apiKey && fetching) {
    // Still fetching — render children without maps
    return (
      <GoogleMapsContext.Provider value={{ isLoaded: false, loadError: undefined, apiKey: '' }}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  if (!apiKey) {
    // No key available at all
    return (
      <GoogleMapsContext.Provider value={{ isLoaded: false, loadError: new Error('Google Maps API key not configured'), apiKey: '' }}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  return (
    <GoogleMapsLoaderInner apiKey={apiKey}>
      {children}
    </GoogleMapsLoaderInner>
  );
};
