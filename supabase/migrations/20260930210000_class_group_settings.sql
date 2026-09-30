-- Configuração de grupos/níveis de turmas (PEPE, Primária, Secundária...).
-- Linha única (id = 1) com a lista de grupos em JSON. Aplicado no Supabase.
-- Cada grupo: { "name": texto, "pattern": texto|null, "min": int|null, "max": int|null }
--  - pattern: se o nome da turma contém este texto → pertence ao grupo (ex.: "PEPE").
--  - min/max: intervalo do número da classe extraído do nome (ex.: "3ª Classe" → 3).

CREATE TABLE IF NOT EXISTS public.class_group_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  groups JSONB NOT NULL DEFAULT '[
    {"name":"PEPE","pattern":"PEPE","min":null,"max":null},
    {"name":"Primária","pattern":null,"min":1,"max":6},
    {"name":"Secundária","pattern":null,"min":7,"max":9}
  ]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT class_group_settings_singleton CHECK (id = 1)
);

INSERT INTO public.class_group_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.class_group_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "class_group_settings_select" ON public.class_group_settings;
CREATE POLICY "class_group_settings_select" ON public.class_group_settings
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "class_group_settings_manage" ON public.class_group_settings;
CREATE POLICY "class_group_settings_manage" ON public.class_group_settings
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'ADMIN'::public.app_role)
    OR public.has_role(auth.uid(), 'DIRETORIA'::public.app_role)
    OR public.has_role(auth.uid(), 'SECRETARIA'::public.app_role)
    OR public.has_role(auth.uid(), 'FINANCEIRO'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'ADMIN'::public.app_role)
    OR public.has_role(auth.uid(), 'DIRETORIA'::public.app_role)
    OR public.has_role(auth.uid(), 'SECRETARIA'::public.app_role)
    OR public.has_role(auth.uid(), 'FINANCEIRO'::public.app_role)
  );

NOTIFY pgrst, 'reload schema';
