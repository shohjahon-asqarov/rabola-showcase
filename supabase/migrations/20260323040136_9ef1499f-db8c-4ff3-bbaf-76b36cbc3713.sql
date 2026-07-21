
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assigned_role app_role;
BEGIN
  -- spectr@gmail.com always gets admin
  IF NEW.email = 'spectr@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    -- First user gets admin, rest get student
    IF (SELECT COUNT(*) FROM public.profiles) = 0 THEN
      assigned_role := 'admin';
    ELSE
      assigned_role := 'student';
    END IF;
  END IF;

  INSERT INTO public.profiles (user_id, firstname, lastname, gender, birthdate, region, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstname', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastname', ''),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),
    COALESCE(NEW.raw_user_meta_data->>'birthdate', ''),
    COALESCE(NEW.raw_user_meta_data->>'region', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);
  RETURN NEW;
END;
$function$;

-- Also update any existing user with this email to admin
UPDATE public.user_roles SET role = 'admin' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'spectr@gmail.com' LIMIT 1)
AND EXISTS (SELECT 1 FROM auth.users WHERE email = 'spectr@gmail.com');
