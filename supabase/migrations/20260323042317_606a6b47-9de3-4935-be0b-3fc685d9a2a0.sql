
-- Add numeric_id column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS numeric_id integer UNIQUE;

-- Generate unique 4-digit IDs for existing profiles
DO $$
DECLARE
  rec RECORD;
  new_id integer;
BEGIN
  FOR rec IN SELECT id FROM public.profiles WHERE numeric_id IS NULL LOOP
    LOOP
      new_id := floor(random() * 9000 + 1000)::integer;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE numeric_id = new_id);
    END LOOP;
    UPDATE public.profiles SET numeric_id = new_id WHERE id = rec.id;
  END LOOP;
END $$;

-- Make it NOT NULL after populating
ALTER TABLE public.profiles ALTER COLUMN numeric_id SET NOT NULL;

-- Update handle_new_user to assign numeric_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assigned_role app_role;
  new_numeric_id integer;
BEGIN
  -- spectr@gmail.com always gets admin
  IF NEW.email = 'spectr@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    IF (SELECT COUNT(*) FROM public.profiles) = 0 THEN
      assigned_role := 'admin';
    ELSE
      assigned_role := 'student';
    END IF;
  END IF;

  -- Generate unique 4-digit numeric ID
  LOOP
    new_numeric_id := floor(random() * 9000 + 1000)::integer;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE numeric_id = new_numeric_id);
  END LOOP;

  INSERT INTO public.profiles (user_id, firstname, lastname, gender, birthdate, region, username, numeric_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstname', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastname', ''),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),
    COALESCE(NEW.raw_user_meta_data->>'birthdate', ''),
    COALESCE(NEW.raw_user_meta_data->>'region', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    new_numeric_id
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);
  RETURN NEW;
END;
$function$;
