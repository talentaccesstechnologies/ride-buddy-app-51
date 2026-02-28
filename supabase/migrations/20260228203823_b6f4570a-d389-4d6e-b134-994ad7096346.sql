-- Drop the existing restrictive SELECT policy that only checks auth.uid() = id
-- and replace it with one that also blocks anonymous access explicitly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);