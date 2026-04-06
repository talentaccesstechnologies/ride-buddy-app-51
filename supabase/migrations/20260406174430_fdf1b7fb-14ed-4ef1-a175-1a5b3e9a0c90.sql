-- Incidents table
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL, -- driver_sick, vehicle_breakdown, client_noshow, accident, border_delay, driver_late, client_behaviour
  status TEXT NOT NULL DEFAULT 'open', -- open, resolving, resolved, cancelled
  trip_id TEXT, -- reference to booking/trip (can be Van or Ride)
  driver_id UUID REFERENCES public.profiles(id),
  client_id UUID REFERENCES public.profiles(id),
  reported_by UUID NOT NULL REFERENCES public.profiles(id),
  description TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  compensation_amount NUMERIC DEFAULT 0,
  compensation_type TEXT, -- refund, voucher, credit
  resolution TEXT,
  replacement_driver_id UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view incidents they are involved in"
  ON public.incidents FOR SELECT TO authenticated
  USING (reported_by = auth.uid() OR driver_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Users can create incidents"
  ON public.incidents FOR INSERT TO authenticated
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Users can update their incidents"
  ON public.incidents FOR UPDATE TO authenticated
  USING (reported_by = auth.uid() OR driver_id = auth.uid());

-- Incident compensations
CREATE TABLE public.incident_compensations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC NOT NULL DEFAULT 0,
  compensation_type TEXT NOT NULL DEFAULT 'credit', -- refund, voucher, credit
  description TEXT,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '12 months'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.incident_compensations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their compensations"
  ON public.incident_compensations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- User warnings & suspensions
CREATE TABLE public.user_warnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  warning_type TEXT NOT NULL, -- noshow, behaviour, low_rating, suspension
  reason TEXT,
  incident_id UUID REFERENCES public.incidents(id),
  is_active BOOLEAN DEFAULT true,
  suspended_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own warnings"
  ON public.user_warnings FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Bidirectional trip ratings (Airbnb-style)
CREATE TABLE public.trip_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id TEXT NOT NULL,
  trip_type TEXT NOT NULL DEFAULT 'ride', -- ride, van, crossborder
  rater_id UUID NOT NULL REFERENCES public.profiles(id),
  ratee_id UUID NOT NULL REFERENCES public.profiles(id),
  rater_role TEXT NOT NULL, -- client, driver
  overall_score INTEGER NOT NULL CHECK (overall_score >= 1 AND overall_score <= 5),
  criteria_scores JSONB DEFAULT '{}', -- {punctuality: 5, comfort: 4, ...}
  comment TEXT,
  badges TEXT[] DEFAULT '{}', -- ['recommend', 'punctual', 'clean', etc.]
  is_revealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trip_id, rater_id)
);

ALTER TABLE public.trip_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings they are involved in"
  ON public.trip_ratings FOR SELECT TO authenticated
  USING (rater_id = auth.uid() OR (ratee_id = auth.uid() AND is_revealed = true));

CREATE POLICY "Users can create their own ratings"
  ON public.trip_ratings FOR INSERT TO authenticated
  WITH CHECK (rater_id = auth.uid());

CREATE POLICY "Users can update their own ratings before reveal"
  ON public.trip_ratings FOR UPDATE TO authenticated
  USING (rater_id = auth.uid() AND is_revealed = false);

-- Enable realtime on incidents
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Indexes
CREATE INDEX idx_incidents_driver ON public.incidents(driver_id);
CREATE INDEX idx_incidents_client ON public.incidents(client_id);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_trip_ratings_trip ON public.trip_ratings(trip_id);
CREATE INDEX idx_trip_ratings_ratee ON public.trip_ratings(ratee_id);
CREATE INDEX idx_user_warnings_user ON public.user_warnings(user_id);
CREATE INDEX idx_compensations_user ON public.incident_compensations(user_id);