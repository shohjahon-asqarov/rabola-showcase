
-- Remove admin role from Aslbek Urazkulov and set to student
UPDATE public.user_roles SET role = 'student' WHERE user_id IN (
  SELECT user_id FROM public.profiles WHERE firstname = 'Aslbek' AND lastname = 'Urazkulov'
);

-- Ensure spectr@gmail.com user has admin role (if already registered)
UPDATE public.user_roles SET role = 'admin' WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'spectr@gmail.com'
);
