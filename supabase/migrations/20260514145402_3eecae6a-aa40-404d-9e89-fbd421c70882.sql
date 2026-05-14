
-- Enrich class_curriculum with id PK, weekly_hours, shift, timestamps
ALTER TABLE public.class_curriculum DROP CONSTRAINT IF EXISTS class_curriculum_pkey;
ALTER TABLE public.class_curriculum ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
ALTER TABLE public.class_curriculum ADD COLUMN IF NOT EXISTS weekly_hours INTEGER DEFAULT 0;
ALTER TABLE public.class_curriculum ADD COLUMN IF NOT EXISTS shift TEXT DEFAULT 'Manhã';
ALTER TABLE public.class_curriculum ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.class_curriculum ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Allow only one (class, subject) combination
DO $$ BEGIN
  ALTER TABLE public.class_curriculum
    ADD CONSTRAINT class_curriculum_class_subject_unique UNIQUE (class_id, subject_id);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_class_curriculum_teacher ON public.class_curriculum(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_curriculum_class ON public.class_curriculum(class_id);

-- Seed missing ESG classes for 2026 (9ª, 10ª, 11ª, 12ª)
INSERT INTO public.classes (name, year)
SELECT v.name, 2026 FROM (VALUES ('9ª Classe'), ('10ª Classe'), ('11ª Classe'), ('12ª Classe')) v(name)
WHERE NOT EXISTS (SELECT 1 FROM public.classes c WHERE c.name = v.name AND c.year = 2026);

-- Seed Filosofia subject if missing (10ª-12ª)
INSERT INTO public.subjects (name, code, workload)
SELECT 'Filosofia', 'FIL', 2
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE code='FIL' OR name ILIKE 'filosofia');
