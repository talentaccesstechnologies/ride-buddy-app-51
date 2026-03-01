
-- Table for client-driver affiliations (private clients)
CREATE TABLE public.client_driver_affiliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT,
  source TEXT NOT NULL DEFAULT 'manual', -- 'invite_link', 'qr_code', 'manual', 'favorite'
  total_rides INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  last_ride_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, driver_id)
);

-- Table for driver invite codes
CREATE TABLE public.driver_invite_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  uses_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_driver_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_invite_codes ENABLE ROW LEVEL SECURITY;

-- RLS: Affiliations
CREATE POLICY "Users can view their affiliations"
  ON public.client_driver_affiliations FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() OR driver_id = auth.uid());

CREATE POLICY "Users can create affiliations"
  ON public.client_driver_affiliations FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid() OR driver_id = auth.uid());

CREATE POLICY "Users can delete their affiliations"
  ON public.client_driver_affiliations FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());

-- RLS: Invite codes
CREATE POLICY "Drivers can manage their invite codes"
  ON public.driver_invite_codes FOR ALL
  TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Anyone authenticated can view active codes"
  ON public.driver_invite_codes FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Enable realtime for affiliations
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_driver_affiliations;
