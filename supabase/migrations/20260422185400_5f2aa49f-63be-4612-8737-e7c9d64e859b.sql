DROP POLICY IF EXISTS "van_slots_write_auth" ON public.van_slots;

CREATE POLICY "van_slots_insert_auth" ON public.van_slots
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "van_slots_update_driver" ON public.van_slots
  FOR UPDATE TO authenticated
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "van_slots_delete_driver" ON public.van_slots
  FOR DELETE TO authenticated
  USING (driver_id = auth.uid());