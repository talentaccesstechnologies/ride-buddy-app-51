-- ── 1. VAN_SLOTS
CREATE TABLE IF NOT EXISTS public.van_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id INTEGER NOT NULL,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,
  seats_total INTEGER NOT NULL DEFAULT 7,
  seats_sold INTEGER NOT NULL DEFAULT 0,
  segment TEXT NOT NULL DEFAULT 'business',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','full','cancelled','completed')),
  driver_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_van_slots_departure ON public.van_slots(departure_time);
CREATE INDEX IF NOT EXISTS idx_van_slots_route ON public.van_slots(from_city, to_city, departure_time);
CREATE INDEX IF NOT EXISTS idx_van_slots_driver ON public.van_slots(driver_id);

-- ── 2. VAN_BOOKINGS
CREATE TABLE IF NOT EXISTS public.van_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES public.van_slots(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES public.profiles(id),
  seat_number INTEGER,
  price_paid NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2) NOT NULL,
  discount_pct INTEGER DEFAULT 0,
  is_last_minute BOOLEAN DEFAULT false,
  seat_tier TEXT CHECK (seat_tier IN ('earlybird','standard','peak','lastseat')),
  ancillaries JSONB DEFAULT '{}',
  ancillary_total NUMERIC(10,2) DEFAULT 0,
  insurance_fee NUMERIC(10,2) DEFAULT 2.50,
  pickup_label TEXT,
  pickup_address TEXT,
  dropoff_label TEXT,
  dropoff_address TEXT,
  passenger_name TEXT,
  passenger_email TEXT,
  passenger_phone TEXT,
  passenger_flight_no TEXT,
  bag_count INTEGER DEFAULT 1,
  payment_method TEXT DEFAULT 'card' CHECK (payment_method IN ('card','twint','applepay')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded','failed')),
  stripe_payment_id TEXT,
  qr_code TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','completed','no_show')),
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  refund_amount NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_van_bookings_slot ON public.van_bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_van_bookings_rider ON public.van_bookings(rider_id);
CREATE INDEX IF NOT EXISTS idx_van_bookings_status ON public.van_bookings(status, payment_status);

-- ── 3. VAN_DRIVER_MISSIONS
CREATE TABLE IF NOT EXISTS public.van_driver_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES public.van_slots(id),
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  segment TEXT NOT NULL DEFAULT 'business',
  base_price NUMERIC(10,2) NOT NULL,
  seats_sold INTEGER DEFAULT 0,
  seats_total INTEGER DEFAULT 7,
  gross_revenue NUMERIC(10,2) DEFAULT 0,
  caby_commission NUMERIC(10,2) DEFAULT 0,
  driver_net NUMERIC(10,2) DEFAULT 0,
  driver_guarantee NUMERIC(10,2) DEFAULT 0,
  caby_subsidy NUMERIC(10,2) DEFAULT 0,
  punctuality_bonus NUMERIC(10,2) DEFAULT 0,
  final_payout NUMERIC(10,2) DEFAULT 0,
  is_punctual BOOLEAN DEFAULT true,
  departure_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_van_missions_driver ON public.van_driver_missions(driver_id, departure_time);
CREATE INDEX IF NOT EXISTS idx_van_missions_slot ON public.van_driver_missions(slot_id);

-- ── 4. CABY_PASS_SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.caby_pass_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id UUID NOT NULL REFERENCES public.profiles(id),
  plan TEXT NOT NULL CHECK (plan IN ('essentiel','flex','premium')),
  price_chf NUMERIC(10,2) NOT NULL,
  route_restriction TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  renewal_date TIMESTAMPTZ,
  stripe_sub_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','expired','paused')),
  trips_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_caby_pass_rider ON public.caby_pass_subscriptions(rider_id, status);

-- ── 5. VAN_PUSH_NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.van_push_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id),
  slot_id UUID REFERENCES public.van_slots(id),
  type TEXT NOT NULL CHECK (type IN ('van_under_threshold','last_minute_promo','departure_reminder','payout_ready')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_van_notifs_driver ON public.van_push_notifications(driver_id, sent_at);

-- ── 6. TRIGGER updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_van_slots_updated_at BEFORE UPDATE ON public.van_slots
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN
  CREATE TRIGGER trg_van_bookings_updated_at BEFORE UPDATE ON public.van_bookings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

DO $$ BEGIN
  CREATE TRIGGER trg_van_missions_updated_at BEFORE UPDATE ON public.van_driver_missions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

-- ── 7. TRIGGER seats_sold sync
CREATE OR REPLACE FUNCTION public.sync_van_seats_sold()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_slot UUID;
BEGIN
  v_slot := COALESCE(NEW.slot_id, OLD.slot_id);
  SELECT COUNT(*) INTO v_count
  FROM public.van_bookings
  WHERE slot_id = v_slot AND status NOT IN ('cancelled');

  UPDATE public.van_slots
  SET seats_sold = v_count,
      status = CASE WHEN v_count >= seats_total THEN 'full' ELSE 'open' END
  WHERE id = v_slot;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_sync_seats_on_booking
  AFTER INSERT OR UPDATE OR DELETE ON public.van_bookings
  FOR EACH ROW EXECUTE FUNCTION public.sync_van_seats_sold();
EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

-- ── 8. RLS
ALTER TABLE public.van_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.van_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.van_driver_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caby_pass_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.van_push_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "van_slots_read_all" ON public.van_slots FOR SELECT USING (true);
CREATE POLICY "van_slots_write_auth" ON public.van_slots FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "van_bookings_own" ON public.van_bookings FOR ALL USING (auth.uid() = rider_id);
CREATE POLICY "van_bookings_driver_read" ON public.van_bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.van_slots s WHERE s.id = slot_id AND s.driver_id = auth.uid())
);

CREATE POLICY "van_missions_own" ON public.van_driver_missions FOR ALL USING (auth.uid() = driver_id);
CREATE POLICY "caby_pass_own" ON public.caby_pass_subscriptions FOR ALL USING (auth.uid() = rider_id);
CREATE POLICY "van_notifs_own" ON public.van_push_notifications FOR ALL USING (auth.uid() = driver_id);

-- ── 9. SEED slots de démo (7 jours)
DO $$
DECLARE d DATE;
BEGIN
  FOR d IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + 6, '1 day'::interval)::date LOOP
    INSERT INTO public.van_slots (route_id, from_city, to_city, departure_time, arrival_time, base_price, seats_total, seats_sold, segment)
    VALUES (11, 'Genève', 'Zurich', (d + '07:00:00'::time)::TIMESTAMPTZ, (d + '10:00:00'::time)::TIMESTAMPTZ, 77, 7, floor(random()*5)::int, 'business')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.van_slots (route_id, from_city, to_city, departure_time, arrival_time, base_price, seats_total, seats_sold, segment)
    VALUES (11, 'Genève', 'Zurich', (d + '17:00:00'::time)::TIMESTAMPTZ, (d + '20:00:00'::time)::TIMESTAMPTZ, 77, 7, floor(random()*4)::int, 'business')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.van_slots (route_id, from_city, to_city, departure_time, arrival_time, base_price, seats_total, seats_sold, segment)
    VALUES (40, 'Genève', 'Annecy', (d + '07:30:00'::time)::TIMESTAMPTZ, (d + '08:15:00'::time)::TIMESTAMPTZ, 25, 7, floor(random()*6)::int, 'frontalier')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.van_slots (route_id, from_city, to_city, departure_time, arrival_time, base_price, seats_total, seats_sold, segment)
    VALUES (22, 'Genève', 'Verbier', (d + '08:00:00'::time)::TIMESTAMPTZ, (d + '10:00:00'::time)::TIMESTAMPTZ, 49, 7, floor(random()*4)::int, 'ski')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.van_slots (route_id, from_city, to_city, departure_time, arrival_time, base_price, seats_total, seats_sold, segment)
    VALUES (34, 'Genève', 'Lyon', (d + '09:00:00'::time)::TIMESTAMPTZ, (d + '10:45:00'::time)::TIMESTAMPTZ, 49, 7, floor(random()*5)::int, 'premium')
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;