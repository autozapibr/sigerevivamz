
-- Table for admin-configurable form fields
CREATE TABLE public.lesson_plan_fields (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL DEFAULT 'select', -- 'select', 'text', 'textarea'
  options text[] DEFAULT '{}',
  is_required boolean DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table for admin AI configuration (prompt template, sections, etc.)
CREATE TABLE public.lesson_plan_config (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  config_key text NOT NULL UNIQUE,
  config_value text NOT NULL,
  description text,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table for generated lesson plans (history)
CREATE TABLE public.lesson_plans (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  teacher_id uuid NOT NULL,
  teacher_name text,
  class_id bigint REFERENCES public.classes(id),
  subject_id bigint REFERENCES public.subjects(id),
  title text NOT NULL,
  form_data jsonb NOT NULL DEFAULT '{}',
  generated_content text NOT NULL,
  status text NOT NULL DEFAULT 'rascunho', -- rascunho, finalizado, arquivado
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_plan_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plan_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

-- RLS for lesson_plan_fields (admin manages, all staff reads)
CREATE POLICY "Admin can manage lesson_plan_fields"
ON public.lesson_plan_fields FOR ALL
USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

CREATE POLICY "Staff can view lesson_plan_fields"
ON public.lesson_plan_fields FOR SELECT
USING (is_staff(auth.uid()));

CREATE POLICY "Anon can view lesson_plan_fields for demo"
ON public.lesson_plan_fields FOR SELECT
USING (true);

CREATE POLICY "Anon can manage lesson_plan_fields for demo"
ON public.lesson_plan_fields FOR ALL
USING (true) WITH CHECK (true);

-- RLS for lesson_plan_config
CREATE POLICY "Admin can manage lesson_plan_config"
ON public.lesson_plan_config FOR ALL
USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role]));

CREATE POLICY "Staff can view lesson_plan_config"
ON public.lesson_plan_config FOR SELECT
USING (is_staff(auth.uid()));

CREATE POLICY "Anon can view lesson_plan_config for demo"
ON public.lesson_plan_config FOR SELECT
USING (true);

CREATE POLICY "Anon can manage lesson_plan_config for demo"
ON public.lesson_plan_config FOR ALL
USING (true) WITH CHECK (true);

-- RLS for lesson_plans
CREATE POLICY "Teachers can manage own lesson_plans"
ON public.lesson_plans FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Admin can view all lesson_plans"
ON public.lesson_plans FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'PEDAGOGICO'::app_role]));

CREATE POLICY "Anon can manage lesson_plans for demo"
ON public.lesson_plans FOR ALL
USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_lesson_plan_fields_updated_at
BEFORE UPDATE ON public.lesson_plan_fields
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_plan_config_updated_at
BEFORE UPDATE ON public.lesson_plan_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_plans_updated_at
BEFORE UPDATE ON public.lesson_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default AEP fields
INSERT INTO public.lesson_plan_fields (field_name, field_label, field_type, options, is_required, display_order) VALUES
('principio', 'Princípio a ser trabalhado', 'select', ARRAY['Mordomia', 'Caráter', 'Semeadura e Colheita', 'Autogoverno', 'Soberania', 'Individualidade', 'União', 'Aliança'], true, 1),
('ideia_guia', 'Ideia-Guia', 'textarea', '{}', true, 2),
('ferramentas_aep', 'Ferramentas AEP a utilizar', 'multiselect', ARRAY['4 Passos (ERPF)', 'Fichamento', 'Caderno de Registro', 'Linha do Tempo', 'Pesquisa Bíblica', 'Raciocínio e Registro', 'Dissertação'], true, 3),
('periodo_ensino', 'Período de ensino (dias)', 'text', '{}', true, 4),
('tema_aula', 'Tema da Aula', 'text', '{}', true, 5);

-- Seed default AI config
INSERT INTO public.lesson_plan_config (config_key, config_value, description) VALUES
('system_prompt', 'É um especialista pedagógico na Abordagem Educacional por Princípios (AEP). Crie planos de aula estruturados seguindo rigorosamente a metodologia AEP, utilizando os 4 Passos (Pesquisar, Raciocinar, Relacionar, Registrar) e integrando princípios bíblicos ao conteúdo académico.

ESTRUTURA OBRIGATÓRIA DO PLANO DE AULA:
1. CABEÇALHO (Escola, Professor, Classe/Turma, Disciplina, Tema, Data)
2. PRINCÍPIO NORTEADOR (Princípio escolhido e sua definição)
3. IDEIA-GUIA (Conceito central que conecta o princípio ao conteúdo)
4. OBJETIVOS DE APRENDIZAGEM (Geral e Específicos)
5. DESENVOLVIMENTO DA AULA:
   a) PESQUISAR - O aluno investiga e busca conhecimento
   b) RACIOCINAR - O aluno analisa e processa a informação
   c) RELACIONAR - O aluno conecta com o princípio e a vida
   d) REGISTRAR - O aluno documenta conclusões
6. RECURSOS E MATERIAIS
7. AVALIAÇÃO
8. REFERÊNCIAS

Use linguagem formal em Português de Moçambique. Formate em HTML limpo para impressão.', 'Prompt do sistema para geração de planos de aula AEP'),
('model', 'google/gemini-2.5-flash', 'Modelo de IA a utilizar'),
('temperature', '0.4', 'Temperatura da geração (0-1)'),
('max_tokens', '4000', 'Máximo de tokens na resposta');
