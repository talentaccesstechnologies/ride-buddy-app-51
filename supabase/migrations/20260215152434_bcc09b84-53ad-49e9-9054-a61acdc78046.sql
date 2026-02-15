
-- Deliveries table for Caby Express
CREATE TABLE public.deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id UUID NOT NULL,
  driver_id UUID,
  
  -- Pickup & dropoff
  pickup_address TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_lat DOUBLE PRECISION NOT NULL,
  dropoff_lng DOUBLE PRECISION NOT NULL,
  
  -- Scheduling
  scheduled_slot_start TIMESTAMP WITH TIME ZONE,
  scheduled_slot_end TIMESTAMP WITH TIME ZONE,
  is_scheduled BOOLEAN DEFAULT false,
  
  -- Package info
  package_description TEXT,
  package_size TEXT DEFAULT 'medium',
  
  -- PIN verification
  pin_code TEXT,
  pin_verified BOOLEAN DEFAULT false,
  
  -- Photo proof
  allow_door_drop BOOLEAN DEFAULT false,
  proof_photo_url TEXT,
  
  -- Merchant integration
  merchant_id UUID,
  merchant_order_ref TEXT,
  
  -- Status & pricing
  status TEXT DEFAULT 'pending',
  estimated_price NUMERIC,
  final_price NUMERIC,
  
  -- Timestamps
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Merchants table for API partners
CREATE TABLE public.merchants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- Deliveries policies
CREATE POLICY "Riders can view their deliveries"
  ON public.deliveries FOR SELECT
  USING (auth.uid() = rider_id OR auth.uid() = driver_id);

CREATE POLICY "Riders can create deliveries"
  ON public.deliveries FOR INSERT
  WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Users can update their deliveries"
  ON public.deliveries FOR UPDATE
  USING (auth.uid() = rider_id OR auth.uid() = driver_id);

-- Merchants: read-only for authenticated (admin manages via edge function)
CREATE POLICY "Authenticated can view active merchants"
  ON public.merchants FOR SELECT
  USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for delivery tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
