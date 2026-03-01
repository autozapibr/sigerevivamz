
-- Tabela de convites de registo de uso único
CREATE TABLE public.registration_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  email text,
  intended_role app_role NOT NULL DEFAULT 'PROFESSOR',
  intended_name text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  used_by uuid,
  is_used boolean NOT NULL DEFAULT false,
  notes text
);

-- Índice para pesquisa por token
CREATE INDEX idx_invitations_token ON public.registration_invitations(token);

-- RLS
ALTER TABLE public.registration_invitations ENABLE ROW LEVEL SECURITY;

-- Apenas ADMIN, DIRETORIA e SECRETARIA podem gerir convites
CREATE POLICY "Staff can manage invitations"
  ON public.registration_invitations
  FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['ADMIN'::app_role, 'DIRETORIA'::app_role, 'SECRETARIA'::app_role]));

-- Função para validar convite (SECURITY DEFINER para acesso público)
CREATE OR REPLACE FUNCTION public.validate_invitation(_token uuid)
RETURNS TABLE(id uuid, email text, intended_role app_role, intended_name text, is_valid boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ri.id,
    ri.email,
    ri.intended_role,
    ri.intended_name,
    (ri.is_used = false AND ri.expires_at > now()) as is_valid
  FROM public.registration_invitations ri
  WHERE ri.token = _token
  LIMIT 1;
$$;

-- Função para marcar convite como utilizado
CREATE OR REPLACE FUNCTION public.consume_invitation(_token uuid, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.registration_invitations
  SET is_used = true, used_at = now(), used_by = _user_id
  WHERE token = _token AND is_used = false AND expires_at > now();
  
  RETURN FOUND;
END;
$$;
