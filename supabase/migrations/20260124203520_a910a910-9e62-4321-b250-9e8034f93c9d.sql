-- =============================================
-- MATRÍCULA DIGITAL - SCHEMA COMPLETO
-- =============================================

-- Enum para tipo de documento
CREATE TYPE public.document_type AS ENUM (
  'BI',
  'NUIT', 
  'CERTIDAO_NASCIMENTO',
  'CERTIFICADO_HABILITACOES',
  'DECLARACAO_ESCOLA_ANTERIOR',
  'ATESTADO_MEDICO',
  'FOTO',
  'OUTRO'
);

-- Enum para status de matrícula
CREATE TYPE public.enrollment_status AS ENUM (
  'PENDENTE',
  'EM_ANALISE',
  'APROVADA',
  'REJEITADA',
  'CANCELADA'
);

-- Enum para gênero
CREATE TYPE public.gender_type AS ENUM (
  'MASCULINO',
  'FEMININO'
);

-- Tabela de Ano Letivo
CREATE TABLE IF NOT EXISTS public.academic_years (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL, -- Ex: "2024", "2024/2025"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Educandos (Alunos) - Estrutura completa
ALTER TABLE public.students 
  ADD COLUMN IF NOT EXISTS bi_number TEXT,
  ADD COLUMN IF NOT EXISTS nuit TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS gender gender_type,
  ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Moçambicana',
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS health_notes TEXT,
  ADD COLUMN IF NOT EXISTS previous_school TEXT,
  ADD COLUMN IF NOT EXISTS enrollment_status enrollment_status DEFAULT 'PENDENTE',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Tabela de Encarregados de Educação
CREATE TABLE IF NOT EXISTS public.guardians (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL, -- Pai, Mãe, Tio, Avó, etc.
  bi_number TEXT,
  nuit TEXT,
  phone TEXT NOT NULL,
  phone_alt TEXT,
  email TEXT,
  occupation TEXT,
  workplace TEXT,
  address TEXT,
  province TEXT,
  district TEXT,
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relação Aluno-Encarregado (N:N)
CREATE TABLE IF NOT EXISTS public.student_guardians (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_id BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  guardian_id BIGINT NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, guardian_id)
);

-- Tabela de Documentos do Aluno
CREATE TABLE IF NOT EXISTS public.student_documents (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_id BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Matrículas
CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_id BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year_id BIGINT NOT NULL REFERENCES public.academic_years(id),
  class_id BIGINT REFERENCES public.classes(id),
  enrollment_number TEXT UNIQUE, -- Número de matrícula gerado
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status enrollment_status DEFAULT 'PENDENTE',
  monthly_fee NUMERIC(10,2) DEFAULT 0,
  enrollment_fee NUMERIC(10,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_guardians_updated_at ON public.guardians;
CREATE TRIGGER update_guardians_updated_at
  BEFORE UPDATE ON public.guardians
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_documents_updated_at ON public.student_documents;
CREATE TRIGGER update_student_documents_updated_at
  BEFORE UPDATE ON public.student_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_enrollments_updated_at ON public.student_enrollments;
CREATE TRIGGER update_student_enrollments_updated_at
  BEFORE UPDATE ON public.student_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar número de matrícula
CREATE OR REPLACE FUNCTION public.generate_enrollment_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT;
  next_number INT;
BEGIN
  SELECT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT INTO year_suffix;
  
  SELECT COALESCE(MAX(
    NULLIF(REGEXP_REPLACE(enrollment_number, '[^0-9]', '', 'g'), '')::INT
  ), 0) + 1
  INTO next_number
  FROM public.student_enrollments
  WHERE enrollment_number LIKE 'MAT-' || year_suffix || '-%';
  
  NEW.enrollment_number := 'MAT-' || year_suffix || '-' || LPAD(next_number::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_enrollment_number_trigger ON public.student_enrollments;
CREATE TRIGGER generate_enrollment_number_trigger
  BEFORE INSERT ON public.student_enrollments
  FOR EACH ROW
  WHEN (NEW.enrollment_number IS NULL)
  EXECUTE FUNCTION public.generate_enrollment_number();

-- Storage bucket para documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-documents',
  'student-documents', 
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- RLS Policies para novas tabelas
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- Políticas para academic_years (público leitura, admin escrita)
CREATE POLICY "Anyone can view academic_years" ON public.academic_years
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage academic_years" ON public.academic_years
  FOR ALL USING (public.has_role(auth.uid(), 'DIRETORIA') OR public.has_role(auth.uid(), 'SECRETARIA'));

-- Políticas para guardians
CREATE POLICY "Staff can view guardians" ON public.guardians
  FOR SELECT USING (
    public.has_role(auth.uid(), 'DIRETORIA') OR 
    public.has_role(auth.uid(), 'SECRETARIA')
  );

CREATE POLICY "Staff can manage guardians" ON public.guardians
  FOR ALL USING (
    public.has_role(auth.uid(), 'DIRETORIA') OR 
    public.has_role(auth.uid(), 'SECRETARIA')
  );

-- Políticas para student_guardians
CREATE POLICY "Staff can view student_guardians" ON public.student_guardians
  FOR SELECT USING (
    public.has_role(auth.uid(), 'DIRETORIA') OR 
    public.has_role(auth.uid(), 'SECRETARIA')
  );

CREATE POLICY "Staff can manage student_guardians" ON public.student_guardians
  FOR ALL USING (
    public.has_role(auth.uid(), 'DIRETORIA') OR 
    public.has_role(auth.uid(), 'SECRETARIA')
  );

-- Políticas para student_documents
CREATE POLICY "Staff can view documents" ON public.student_documents
  FOR SELECT USING (
    public.has_role(auth.uid(), 'DIRETORIA') OR 
    public.has_role(auth.uid(), 'SECRETARIA')
  );

CREATE POLICY "Staff can manage documents" ON public.student_documents
  FOR ALL USING (
    public.has_role(auth.uid(), 'DIRETORIA') OR 
    public.has_role(auth.uid(), 'SECRETARIA')
  );

-- Políticas para student_enrollments
CREATE POLICY "Staff can view enrollments" ON public.student_enrollments
  FOR SELECT USING (
    public.has_role(auth.uid(), 'DIRETORIA') OR 
    public.has_role(auth.uid(), 'SECRETARIA') OR
    public.has_role(auth.uid(), 'FINANCEIRO')
  );

CREATE POLICY "Staff can manage enrollments" ON public.student_enrollments
  FOR ALL USING (
    public.has_role(auth.uid(), 'DIRETORIA') OR 
    public.has_role(auth.uid(), 'SECRETARIA')
  );

-- Políticas de Storage para documentos
CREATE POLICY "Staff can view student documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'student-documents' AND (
      public.has_role(auth.uid(), 'DIRETORIA') OR 
      public.has_role(auth.uid(), 'SECRETARIA')
    )
  );

CREATE POLICY "Staff can upload student documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'student-documents' AND (
      public.has_role(auth.uid(), 'DIRETORIA') OR 
      public.has_role(auth.uid(), 'SECRETARIA')
    )
  );

CREATE POLICY "Staff can delete student documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'student-documents' AND (
      public.has_role(auth.uid(), 'DIRETORIA') OR 
      public.has_role(auth.uid(), 'SECRETARIA')
    )
  );

-- Inserir ano letivo atual
INSERT INTO public.academic_years (name, start_date, end_date, is_current)
VALUES ('2025', '2025-02-01', '2025-12-15', true)
ON CONFLICT DO NOTHING;