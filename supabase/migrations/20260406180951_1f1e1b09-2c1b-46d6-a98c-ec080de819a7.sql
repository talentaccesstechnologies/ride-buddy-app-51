
-- Table for early access waitlist
CREATE TABLE public.early_access_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  city text,
  main_route text,
  referral_code text NOT NULL UNIQUE,
  referred_by text REFERENCES public.early_access_signups(referral_code),
  referral_count integer NOT NULL DEFAULT 0,
  is_founder boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.early_access_signups ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public signup)
CREATE POLICY "Anyone can sign up for early access"
  ON public.early_access_signups FOR INSERT
  TO public
  WITH CHECK (true);

-- Anyone can read aggregate counts (for waitlist counter)
CREATE POLICY "Anyone can view early access signups"
  ON public.early_access_signups FOR SELECT
  TO public
  USING (true);

-- Allow updating referral_count
CREATE POLICY "System can update referral counts"
  ON public.early_access_signups FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to auto-increment referral count and set founder status
CREATE OR REPLACE FUNCTION public.handle_early_access_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  signup_position integer;
BEGIN
  -- Set founder status for first 500
  SELECT COUNT(*) + 1 INTO signup_position FROM public.early_access_signups WHERE id != NEW.id;
  IF signup_position <= 500 THEN
    NEW.is_founder := true;
  END IF;

  -- Increment referrer's count
  IF NEW.referred_by IS NOT NULL THEN
    UPDATE public.early_access_signups
    SET referral_count = referral_count + 1
    WHERE referral_code = NEW.referred_by;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_early_access_signup
  BEFORE INSERT ON public.early_access_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_early_access_signup();
