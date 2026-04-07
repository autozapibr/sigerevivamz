
CREATE TABLE public.role_module_access (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role text NOT NULL,
  module_key text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE(role, module_key)
);

ALTER TABLE public.role_module_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage role_module_access"
ON public.role_module_access
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Authenticated can view role_module_access"
ON public.role_module_access
FOR SELECT
TO authenticated
USING (true);

-- Seed default access for all roles and modules
INSERT INTO public.role_module_access (role, module_key, is_enabled) VALUES
  ('ADMIN', 'gestao_escolar', true),
  ('ADMIN', 'gestao_pedagogica', true),
  ('ADMIN', 'gestao_financeira', true),
  ('ADMIN', 'gestao_rh', true),
  ('ADMIN', 'configuracoes', true),
  ('DIRETORIA', 'gestao_escolar', true),
  ('DIRETORIA', 'gestao_pedagogica', true),
  ('DIRETORIA', 'gestao_financeira', true),
  ('DIRETORIA', 'gestao_rh', true),
  ('DIRETORIA', 'configuracoes', true),
  ('SECRETARIA', 'gestao_escolar', true),
  ('SECRETARIA', 'gestao_pedagogica', false),
  ('SECRETARIA', 'gestao_financeira', false),
  ('SECRETARIA', 'gestao_rh', true),
  ('SECRETARIA', 'configuracoes', false),
  ('FINANCEIRO', 'gestao_escolar', false),
  ('FINANCEIRO', 'gestao_pedagogica', false),
  ('FINANCEIRO', 'gestao_financeira', true),
  ('FINANCEIRO', 'gestao_rh', false),
  ('FINANCEIRO', 'configuracoes', false),
  ('PROFESSOR', 'gestao_escolar', false),
  ('PROFESSOR', 'gestao_pedagogica', true),
  ('PROFESSOR', 'gestao_financeira', false),
  ('PROFESSOR', 'gestao_rh', false),
  ('PROFESSOR', 'configuracoes', false),
  ('PEDAGOGICO', 'gestao_escolar', false),
  ('PEDAGOGICO', 'gestao_pedagogica', true),
  ('PEDAGOGICO', 'gestao_financeira', false),
  ('PEDAGOGICO', 'gestao_rh', false),
  ('PEDAGOGICO', 'configuracoes', false),
  ('ENCARREGADO', 'gestao_escolar', false),
  ('ENCARREGADO', 'gestao_pedagogica', false),
  ('ENCARREGADO', 'gestao_financeira', false),
  ('ENCARREGADO', 'gestao_rh', false),
  ('ENCARREGADO', 'configuracoes', false),
  ('ALUNO', 'gestao_escolar', false),
  ('ALUNO', 'gestao_pedagogica', false),
  ('ALUNO', 'gestao_financeira', false),
  ('ALUNO', 'gestao_rh', false),
  ('ALUNO', 'configuracoes', false);

CREATE TRIGGER update_role_module_access_updated_at
  BEFORE UPDATE ON public.role_module_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
