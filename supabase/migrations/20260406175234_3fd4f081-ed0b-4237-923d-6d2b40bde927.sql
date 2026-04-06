-- Allow authenticated users to insert compensations (for auto-compensation on incidents)
CREATE POLICY "Authenticated users can insert compensations"
ON public.incident_compensations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
