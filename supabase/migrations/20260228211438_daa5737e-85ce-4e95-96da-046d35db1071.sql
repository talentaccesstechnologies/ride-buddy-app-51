
-- Allow email to be NULL for phone-based signups
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Update the trigger to handle phone signups (email may be null)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    NEW.phone
  );
  RETURN NEW;
END;
$function$;
