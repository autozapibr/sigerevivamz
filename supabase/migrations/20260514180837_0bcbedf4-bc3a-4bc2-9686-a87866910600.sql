-- Add linking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS teacher_id BIGINT REFERENCES public.teachers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS student_id BIGINT REFERENCES public.students(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS employee_id BIGINT REFERENCES public.employees(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_teacher_id ON public.profiles(teacher_id);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id);

-- Update RLS policies to ensure users can still view/update their own profiles
-- (Assuming they already exist, but making sure)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" 
        ON public.profiles 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;
