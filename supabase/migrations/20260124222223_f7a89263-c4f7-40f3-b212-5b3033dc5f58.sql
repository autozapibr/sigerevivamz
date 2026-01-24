-- Add new fields to teachers table for HR management
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS bi_number TEXT,
ADD COLUMN IF NOT EXISTS nuit TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD COLUMN IF NOT EXISTS contract_number TEXT,
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'Efectivo',
ADD COLUMN IF NOT EXISTS contract_start DATE,
ADD COLUMN IF NOT EXISTS contract_end DATE,
ADD COLUMN IF NOT EXISTS salary NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create employees table for non-teaching staff
CREATE TABLE IF NOT EXISTS public.employees (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bi_number TEXT,
  nuit TEXT,
  photo_url TEXT,
  role TEXT NOT NULL, -- 'Administrativo', 'Segurança', 'Limpeza', 'Motorista', etc.
  department TEXT,
  hire_date DATE,
  contract_number TEXT,
  contract_type TEXT DEFAULT 'Efectivo',
  contract_start DATE,
  contract_end DATE,
  salary NUMERIC(12, 2),
  address TEXT,
  province TEXT,
  district TEXT,
  birth_date DATE,
  gender TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  bank_name TEXT,
  bank_account TEXT,
  status TEXT DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- RLS policies for employees
CREATE POLICY "Admin can manage employees" ON public.employees
FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'SECRETARIA'::app_role]));

CREATE POLICY "Staff can view employees" ON public.employees
FOR SELECT USING (is_staff(auth.uid()));

-- Create staff_documents table for HR documents
CREATE TABLE IF NOT EXISTS public.staff_documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  staff_type TEXT NOT NULL, -- 'teacher' or 'employee'
  staff_id BIGINT NOT NULL,
  document_type TEXT NOT NULL, -- 'BI', 'NUIT', 'CONTRACT', 'CV', 'CERTIFICATE', 'MEDICAL', 'OTHER'
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on staff_documents
ALTER TABLE public.staff_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for staff_documents
CREATE POLICY "Admin can manage staff_documents" ON public.staff_documents
FOR ALL USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'SECRETARIA'::app_role]));

CREATE POLICY "Staff can view staff_documents" ON public.staff_documents
FOR SELECT USING (is_staff(auth.uid()));

-- Create storage bucket for staff photos and documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('staff-files', 'staff-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for staff-files bucket
CREATE POLICY "Staff files are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'staff-files');

CREATE POLICY "Admin can upload staff files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'staff-files' AND has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'SECRETARIA'::app_role]));

CREATE POLICY "Admin can update staff files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'staff-files' AND has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'SECRETARIA'::app_role]));

CREATE POLICY "Admin can delete staff files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'staff-files' AND has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'SECRETARIA'::app_role]));

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_documents_updated_at ON public.staff_documents;
CREATE TRIGGER update_staff_documents_updated_at
  BEFORE UPDATE ON public.staff_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_teachers_updated_at ON public.teachers;
CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();