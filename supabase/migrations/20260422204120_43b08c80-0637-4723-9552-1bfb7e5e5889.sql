ALTER PUBLICATION supabase_realtime ADD TABLE public.van_slots;
ALTER TABLE public.van_slots REPLICA IDENTITY FULL;