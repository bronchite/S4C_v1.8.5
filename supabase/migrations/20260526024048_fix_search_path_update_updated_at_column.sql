/*
  # Fix mutable search_path on update_updated_at_column function

  Sets a fixed search_path on the trigger function to prevent search_path injection attacks.
  This resolves the Supabase security advisor warning about mutable search_path.
*/

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
