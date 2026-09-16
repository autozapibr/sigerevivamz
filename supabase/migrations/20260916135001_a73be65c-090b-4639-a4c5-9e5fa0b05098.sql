-- Reforço: o utilizador não pode auto-atribuir ligações do próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND teacher_id IS NULL
  AND student_id IS NULL
  AND employee_id IS NULL
);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.profiles cur
    WHERE cur.user_id = auth.uid()
      AND cur.teacher_id IS NOT DISTINCT FROM profiles.teacher_id
      AND cur.student_id IS NOT DISTINCT FROM profiles.student_id
      AND cur.employee_id IS NOT DISTINCT FROM profiles.employee_id
  )
);