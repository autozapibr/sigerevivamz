-- Link Abubacar to his profile
UPDATE public.profiles 
SET teacher_id = 44 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'prof.abubacar@escolareviva.com');

-- Also update the email in teachers table for legacy logic
UPDATE public.teachers
SET email = 'prof.abubacar@escolareviva.com'
WHERE id = 44;
