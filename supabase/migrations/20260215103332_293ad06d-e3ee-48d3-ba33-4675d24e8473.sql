
-- Create map_alerts table for Waze-style driver alerts (police, construction)
CREATE TABLE public.map_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('police', 'construction')),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 minutes'),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.map_alerts ENABLE ROW LEVEL SECURITY;

-- Everyone can read active alerts
CREATE POLICY "Anyone can view active alerts"
ON public.map_alerts FOR SELECT
USING (is_active = true AND expires_at > now());

-- Authenticated users can create alerts
CREATE POLICY "Authenticated users can create alerts"
ON public.map_alerts FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Users can delete their own alerts
CREATE POLICY "Users can delete own alerts"
ON public.map_alerts FOR DELETE
USING (auth.uid() = reporter_id);
