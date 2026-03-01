
-- Driver levels table (quarterly evaluations)
CREATE TABLE public.driver_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'certified', -- 'super_gold', 'super', 'certified', 'probation', 'suspended'
  quarter TEXT NOT NULL, -- e.g. '2026-Q1'
  avg_rating NUMERIC NOT NULL DEFAULT 5.0,
  acceptance_rate NUMERIC NOT NULL DEFAULT 100,
  cancellation_rate NUMERIC NOT NULL DEFAULT 0,
  punctuality_rate NUMERIC NOT NULL DEFAULT 100,
  total_rides INTEGER NOT NULL DEFAULT 0,
  composite_score NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC NOT NULL DEFAULT 0.12,
  evaluated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(driver_id, quarter)
);

-- Driver of the Month table
CREATE TABLE public.driver_of_month (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- e.g. '2026-03'
  composite_score NUMERIC NOT NULL DEFAULT 0,
  avg_rating NUMERIC NOT NULL DEFAULT 5.0,
  total_rides INTEGER NOT NULL DEFAULT 0,
  acceptance_rate NUMERIC NOT NULL DEFAULT 100,
  punctuality_rate NUMERIC NOT NULL DEFAULT 100,
  club_redistributions INTEGER NOT NULL DEFAULT 0,
  bonus_amount NUMERIC NOT NULL DEFAULT 500,
  commission_rate NUMERIC NOT NULL DEFAULT 0.05,
  badge_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(month)
);

-- Monthly leaderboard
CREATE TABLE public.driver_monthly_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- e.g. '2026-03'
  composite_score NUMERIC NOT NULL DEFAULT 0,
  avg_rating NUMERIC NOT NULL DEFAULT 5.0,
  total_rides INTEGER NOT NULL DEFAULT 0,
  acceptance_rate NUMERIC NOT NULL DEFAULT 100,
  punctuality_rate NUMERIC NOT NULL DEFAULT 100,
  club_redistributions INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(driver_id, month)
);

-- Enable RLS
ALTER TABLE public.driver_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_of_month ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_monthly_scores ENABLE ROW LEVEL SECURITY;

-- RLS: Driver levels - drivers see their own
CREATE POLICY "Drivers can view their levels"
  ON public.driver_levels FOR SELECT
  TO authenticated
  USING (driver_id = auth.uid());

-- RLS: Driver of month - everyone can see
CREATE POLICY "Anyone can view driver of month"
  ON public.driver_of_month FOR SELECT
  TO authenticated
  USING (true);

-- RLS: Monthly scores - everyone can see leaderboard
CREATE POLICY "Anyone can view monthly scores"
  ON public.driver_monthly_scores FOR SELECT
  TO authenticated
  USING (true);

-- Enable realtime for driver_of_month
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_of_month;
