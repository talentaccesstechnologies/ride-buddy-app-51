
-- Delivery batches (tournées) for driver logistics mode
CREATE TABLE public.delivery_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  total_deliveries INTEGER DEFAULT 0,
  completed_deliveries INTEGER DEFAULT 0,
  optimized_route JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add batch reference to deliveries
ALTER TABLE public.deliveries ADD COLUMN batch_id UUID REFERENCES public.delivery_batches(id);
ALTER TABLE public.deliveries ADD COLUMN barcode TEXT;
ALTER TABLE public.deliveries ADD COLUMN barcode_scanned_pickup BOOLEAN DEFAULT false;
ALTER TABLE public.deliveries ADD COLUMN barcode_scanned_delivery BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.delivery_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their batches"
  ON public.delivery_batches FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can create batches"
  ON public.delivery_batches FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their batches"
  ON public.delivery_batches FOR UPDATE
  USING (auth.uid() = driver_id);

-- Trigger
CREATE TRIGGER update_delivery_batches_updated_at
  BEFORE UPDATE ON public.delivery_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_batches;
