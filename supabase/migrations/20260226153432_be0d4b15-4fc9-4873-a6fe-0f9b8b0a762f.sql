
-- Create storage bucket for AEP training documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('aep-training-docs', 'aep-training-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Create table to track uploaded training documents
CREATE TABLE IF NOT EXISTS public.lesson_plan_training_docs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  description TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.lesson_plan_training_docs ENABLE ROW LEVEL SECURITY;

-- Admin/Diretoria can manage training docs
CREATE POLICY "Admin can manage training docs"
  ON public.lesson_plan_training_docs FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

-- Staff can view training docs
CREATE POLICY "Staff can view training docs"
  ON public.lesson_plan_training_docs FOR SELECT
  USING (is_staff(auth.uid()));

-- Anon demo policies
CREATE POLICY "Anon can manage training_docs for demo"
  ON public.lesson_plan_training_docs FOR ALL
  USING (true) WITH CHECK (true);

-- Storage policies for aep-training-docs bucket
CREATE POLICY "Admin can upload training docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'aep-training-docs' AND has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

CREATE POLICY "Admin can update training docs"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'aep-training-docs' AND has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

CREATE POLICY "Admin can delete training docs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'aep-training-docs' AND has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

CREATE POLICY "Staff can read training docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'aep-training-docs' AND is_staff(auth.uid()));

-- Anon storage demo policies
CREATE POLICY "Anon can manage aep-training-docs for demo"
  ON storage.objects FOR ALL
  USING (bucket_id = 'aep-training-docs') WITH CHECK (bucket_id = 'aep-training-docs');
