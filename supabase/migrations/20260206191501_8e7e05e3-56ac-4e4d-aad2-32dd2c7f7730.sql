-- ============================================
-- CABY DISPATCH ENGINE - TABLES COMPLÈTES
-- ============================================

-- Extension pour calculs géographiques
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ============================================
-- TABLE : dispatch_queue
-- File d'attente intelligente du dispatch
-- ============================================
CREATE TABLE public.dispatch_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  
  vehicle_type_required TEXT DEFAULT 'standard',
  max_search_radius_km NUMERIC(5,2) DEFAULT 5.0,
  current_search_radius_km NUMERIC(5,2) DEFAULT 2.0,
  
  priority INTEGER DEFAULT 0,
  
  source TEXT DEFAULT 'caby_app' CHECK (source IN (
    'caby_app', 'qr_code', 'whatsapp_parsed', 'private_dispatch', 'phone', 'scheduled'
  )),
  affiliated_driver_id UUID REFERENCES public.profiles(id),
  
  status TEXT DEFAULT 'queued' CHECK (status IN (
    'queued', 'dispatching', 'offered', 'accepted', 'no_driver', 'cancelled', 'expired'
  )),
  
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 10,
  drivers_contacted UUID[] DEFAULT '{}',
  drivers_declined UUID[] DEFAULT '{}',
  current_offered_to UUID REFERENCES public.profiles(id),
  offered_at TIMESTAMPTZ,
  offer_expires_at TIMESTAMPTZ,
  
  assigned_driver_id UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ,
  
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_dispatch_queue_status ON public.dispatch_queue(status);
CREATE INDEX idx_dispatch_queue_ride ON public.dispatch_queue(ride_id);

ALTER TABLE public.dispatch_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view dispatch offers to them"
  ON public.dispatch_queue FOR SELECT
  USING (
    current_offered_to = auth.uid() OR 
    assigned_driver_id = auth.uid() OR
    EXISTS (SELECT 1 FROM rides WHERE rides.id = dispatch_queue.ride_id AND rides.rider_id = auth.uid())
  );

-- ============================================
-- TABLE : driver_zones
-- ============================================
CREATE TABLE public.driver_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  zone_name TEXT NOT NULL,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  radius_km NUMERIC(5,2) DEFAULT 3.0,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.driver_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can manage their zones"
  ON public.driver_zones FOR ALL
  USING (driver_id = auth.uid());

-- ============================================
-- TABLE : surge_zones
-- ============================================
CREATE TABLE public.surge_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name TEXT NOT NULL,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  radius_km NUMERIC(5,2) DEFAULT 2.0,
  surge_multiplier NUMERIC(3,2) DEFAULT 1.00,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.surge_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active surge zones"
  ON public.surge_zones FOR SELECT
  USING (is_active = true);

-- ============================================
-- TABLE : pricing_rules
-- ============================================
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type TEXT NOT NULL UNIQUE CHECK (vehicle_type IN ('standard', 'premium', 'xl', 'moto')),
  base_fare NUMERIC(10,2) NOT NULL,
  per_km_rate NUMERIC(10,2) NOT NULL,
  per_minute_rate NUMERIC(10,2) NOT NULL,
  minimum_fare NUMERIC(10,2) NOT NULL,
  cancellation_fee NUMERIC(10,2) DEFAULT 5.00,
  waiting_per_minute NUMERIC(10,2) DEFAULT 0.50,
  night_surcharge NUMERIC(3,2) DEFAULT 1.20,
  weekend_surcharge NUMERIC(3,2) DEFAULT 1.10,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing rules"
  ON public.pricing_rules FOR SELECT
  USING (is_active = true);

-- ============================================
-- TABLE : private_dispatch
-- ============================================
CREATE TABLE public.private_dispatch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES public.rides(id),
  
  sender_driver_id UUID NOT NULL REFERENCES public.profiles(id),
  receiver_driver_id UUID REFERENCES public.profiles(id),
  
  pickup_address TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION,
  scheduled_time TIMESTAMPTZ,
  estimated_price NUMERIC(10,2),
  vehicle_type_required TEXT DEFAULT 'standard',
  notes TEXT,
  
  client_display_name TEXT,
  
  status TEXT DEFAULT 'posted' CHECK (status IN ('posted', 'claimed', 'confirmed', 'completed', 'cancelled', 'expired')),
  
  netting_rate NUMERIC(5,4) DEFAULT 0.10,
  netting_amount NUMERIC(10,2),
  netting_settled BOOLEAN DEFAULT false,
  
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 minutes'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.private_dispatch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view dispatches"
  ON public.private_dispatch FOR SELECT
  USING (
    status = 'posted' OR
    sender_driver_id = auth.uid() OR
    receiver_driver_id = auth.uid()
  );

CREATE POLICY "Drivers can create dispatches"
  ON public.private_dispatch FOR INSERT
  WITH CHECK (sender_driver_id = auth.uid());

CREATE POLICY "Drivers can update their dispatches"
  ON public.private_dispatch FOR UPDATE
  USING (sender_driver_id = auth.uid() OR receiver_driver_id = auth.uid());

-- ============================================
-- TABLE : netting_ledger
-- ============================================
CREATE TABLE public.netting_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id UUID NOT NULL REFERENCES public.private_dispatch(id),
  ride_id UUID REFERENCES public.rides(id),
  
  creditor_driver_id UUID NOT NULL REFERENCES public.profiles(id),
  debtor_driver_id UUID NOT NULL REFERENCES public.profiles(id),
  
  ride_amount NUMERIC(10,2) NOT NULL,
  netting_rate NUMERIC(5,4) NOT NULL,
  netting_amount NUMERIC(10,2) NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'settled', 'disputed')),
  settled_at TIMESTAMPTZ,
  settlement_method TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.netting_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their netting entries"
  ON public.netting_ledger FOR SELECT
  USING (creditor_driver_id = auth.uid() OR debtor_driver_id = auth.uid());

-- ============================================
-- TABLE : tatfleet_sync_log
-- ============================================
CREATE TABLE public.tatfleet_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  ride_id UUID NOT NULL REFERENCES public.rides(id),
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  
  payload JSONB NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'failed', 'retrying')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  
  response_status INTEGER,
  response_body JSONB,
  tatfleet_reference_id TEXT,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tatfleet_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their sync logs"
  ON public.tatfleet_sync_log FOR SELECT
  USING (driver_id = auth.uid());

CREATE INDEX idx_tatfleet_sync_pending ON public.tatfleet_sync_log(status) WHERE status IN ('pending', 'retrying');

-- ============================================
-- TABLE : driver_availability_log
-- ============================================
CREATE TABLE public.driver_availability_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  went_online_at TIMESTAMPTZ NOT NULL,
  went_offline_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  rides_during_session INTEGER DEFAULT 0,
  earnings_during_session NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.driver_availability_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their availability logs"
  ON public.driver_availability_log FOR SELECT
  USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert their availability logs"
  ON public.driver_availability_log FOR INSERT
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their availability logs"
  ON public.driver_availability_log FOR UPDATE
  USING (driver_id = auth.uid());

-- ============================================
-- FUNCTION : calculate_distance_km
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_distance_km(
  lat1 DOUBLE PRECISION, lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION, lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
  r DOUBLE PRECISION := 6371;
  dlat DOUBLE PRECISION;
  dlng DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2) * sin(dlng/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- ============================================
-- FUNCTION : find_nearest_drivers
-- ============================================
CREATE OR REPLACE FUNCTION public.find_nearest_drivers(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION DEFAULT 5.0,
  p_vehicle_type TEXT DEFAULT 'standard',
  p_limit INTEGER DEFAULT 10,
  p_exclude_drivers UUID[] DEFAULT '{}'
) RETURNS TABLE (
  driver_id UUID,
  user_id UUID,
  driver_name TEXT,
  distance_km DOUBLE PRECISION,
  vehicle_type TEXT,
  rating NUMERIC,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id AS driver_id,
    dp.user_id,
    p.full_name AS driver_name,
    public.calculate_distance_km(p_lat, p_lng, dp.current_lat, dp.current_lng) AS distance_km,
    dp.vehicle_type::TEXT,
    dp.rating,
    dp.current_lat,
    dp.current_lng
  FROM public.driver_profiles dp
  JOIN public.profiles p ON dp.user_id = p.id
  WHERE dp.is_online = true
    AND dp.is_verified = true
    AND dp.vehicle_type::TEXT = p_vehicle_type
    AND dp.current_lat IS NOT NULL
    AND dp.current_lng IS NOT NULL
    AND dp.user_id != ALL(p_exclude_drivers)
    AND public.calculate_distance_km(p_lat, p_lng, dp.current_lat, dp.current_lng) <= p_radius_km
  ORDER BY 
    public.calculate_distance_km(p_lat, p_lng, dp.current_lat, dp.current_lng) ASC,
    dp.rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;