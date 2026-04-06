
-- Rides table indexes
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON public.rides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_rider_id ON public.rides(rider_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON public.rides(driver_id);

-- Dispatch queue indexes
CREATE INDEX IF NOT EXISTS idx_dispatch_queue_status ON public.dispatch_queue(status);
CREATE INDEX IF NOT EXISTS idx_dispatch_queue_offered_to ON public.dispatch_queue(current_offered_to) WHERE current_offered_to IS NOT NULL;

-- Early access indexes
CREATE INDEX IF NOT EXISTS idx_early_access_referred_by ON public.early_access_signups(referred_by) WHERE referred_by IS NOT NULL;

-- Incidents indexes
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_by ON public.incidents(reported_by);

-- Trip ratings indexes
CREATE INDEX IF NOT EXISTS idx_trip_ratings_ratee ON public.trip_ratings(ratee_id);
CREATE INDEX IF NOT EXISTS idx_trip_ratings_trip ON public.trip_ratings(trip_id);

-- Driver profiles - online drivers for dispatch
CREATE INDEX IF NOT EXISTS idx_driver_profiles_online ON public.driver_profiles(is_online) WHERE is_online = true;

-- Deliveries indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON public.deliveries(driver_id) WHERE driver_id IS NOT NULL;
