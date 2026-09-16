ALTER TABLE public.student_enrollments
  ADD COLUMN IF NOT EXISTS education_level_id BIGINT
  REFERENCES public.education_levels(id);

CREATE INDEX IF NOT EXISTS idx_student_enrollments_education_level_id
  ON public.student_enrollments(education_level_id);